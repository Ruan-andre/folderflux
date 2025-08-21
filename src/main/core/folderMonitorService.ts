import chokidar, { FSWatcher } from "chokidar";
import RuleEngine from "./ruleEngine";
import { getSettingByType } from "../services/settingsService";
import { getAllProfiles, getCountProfilesWithFolder, getProfileById } from "../services/profileService";
import path from "path";
import { getStats } from "../services/fileService";

const temporaryFilePatterns = [/(^|[/\\])\../, "**/*.tmp", "**/*.part", "**/*.crdownload", "**/*.opdownload"];

class FolderMonitorService {
  private monitor: FSWatcher;
  private debounceTimer: NodeJS.Timeout | null = null;
  private changedFiles: Set<string> = new Set();
  private watchedFolders: Set<string> = new Set();
  private debounceSeconds: number = 3 * 1000; // 3000ms = 3 segundos
  private processingRequest: Set<string> = new Set();

  constructor() {
    this.monitor = chokidar.watch([], {
      ignored: temporaryFilePatterns,
      persistent: true,
      ignoreInitial: true,
      depth: 0,
    });
    this.monitor.on("add", (filePath) => this.handleFileEvent(filePath));
  }

  public async start() {
    const realTimeSetting = await getSettingByType("realTime");
    if (!realTimeSetting?.isActive) return;
    this.initialLoad();
  }

  private handleFileEvent(filePath: string): void {
    if (this.processingRequest.has(filePath)) {
      return;
    }
    try {
      this.processingRequest.add(filePath);
      this.changedFiles.add(filePath);
      const filesToProcess = Array.from(this.changedFiles);
      this.process("files", filesToProcess);
    } finally {
      this.processingRequest.delete(filePath);
    }
  }

  public async addFoldersToMonitor(paths: string[]) {
    const directories = await (await getStats(paths)).filter((x) => x.isDirectory).map((x) => x.path);
    for (const dir of directories) {
      if (!this.watchedFolders.has(dir)) {
        this.watchedFolders.add(dir);
      }
      this.monitor.add(dir);
    }
  }

  public async startMonitoringProfileFolders(profileId: number) {
    const responseFolders = (await getProfileById(profileId)).items?.folders;
    const foldersToWatch = new Set<string>();

    if (responseFolders && responseFolders.length > 0) {
      for (const folder of responseFolders) {
        if (this.watchedFolders.has(folder.fullPath)) {
          continue;
        }
        foldersToWatch.add(folder.fullPath);
      }
      if (foldersToWatch.size > 0) this.startMonitoring(Array.from(foldersToWatch));
    }
  }

  public async stopMonitoringProfileFolders(profileId: number) {
    const responseFolders = (await getProfileById(profileId)).items?.folders;
    const foldersToUnwatch = new Set<string>();

    if (responseFolders && responseFolders.length > 0) {
      for (const folder of responseFolders) {
        const count = await getCountProfilesWithFolder(folder.id);
        if (count <= 1) {
          foldersToUnwatch.add(folder.fullPath);
          this.watchedFolders.delete(folder.fullPath);
        }
      }
      if (foldersToUnwatch.size > 0) this.stopMonitoring(Array.from(foldersToUnwatch));
    }
  }

  private async initialLoad() {
    const response = await getAllProfiles();
    if (response.status && response.items) {
      const activeProfiles = response.items.filter((p) => p.isActive);
      const folders = activeProfiles.flatMap((p) => p.folders.map((f) => f.fullPath));
      const foldersToAdd = folders.filter((f) => !this.monitor.getWatched()[f]);
      const uniqueFolders = [...new Set(foldersToAdd)];
      if (uniqueFolders.length > 0) {
        this.process("folders", uniqueFolders);
        this.monitor.add(uniqueFolders);
        this.watchedFolders.intersection(new Set(uniqueFolders));
      }
    }
  }

  private process(type: "files" | "folders", paths: string[], delayMS?: number) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (type === "files") {
      this.debounceTimer = setTimeout(() => {
        const filesToProcess = Array.from(this.changedFiles);
        this.changedFiles.clear();
        handleFiles(filesToProcess);
      }, delayMS ?? this.debounceSeconds);
    } else {
      this.debounceTimer = setTimeout(() => {
        handleFolders(paths);
      }, delayMS ?? this.debounceSeconds);
    }

    /*REFATORAR ESSA FUNÇÃO PARA LIDAR COM O PROCESSAMENTO
     DE SOMENTE OS ARQUIVOS RECEBIDOS COMO PARÂMETRO NO FILEPATHS */
    const handleFiles = async (filePaths: string[]) => {
      if (filePaths.length > 0) {
        const activeProfiles = (await getAllProfiles()).items?.filter((p) => p.isActive);
        if (activeProfiles) {
          const filteredPaths = (await getStats(filePaths)).filter((f) => !f.isDirectory).map((f) => f.path);
          const dirnames = new Set(filteredPaths.map((x) => path.dirname(x)));
          const associatedProfiles = activeProfiles.filter((p) =>
            p.folders.some((f) => dirnames.has(f.fullPath))
          );
          for (const profile of associatedProfiles) {
            const activeRules = profile.rules.filter((r) => r.isActive);
            await RuleEngine.process(activeRules, Array.from(dirnames), profile.name);
          }
        }
      }
    };

    const handleFolders = async (dirnames: string[]) => {
      const activeProfiles = (await getAllProfiles()).items?.filter((p) => p.isActive);
      if (activeProfiles) {
        const associatedProfiles = activeProfiles.filter((p) =>
          p.folders.some((f) => dirnames.includes(f.fullPath))
        );
        for (const profile of associatedProfiles) {
          const activeRules = profile.rules.filter((r) => r.isActive);
          await RuleEngine.process(activeRules, Array.from(dirnames), profile.name);
        }
      }
    };
  }

  public stopMonitoring(paths: string[] | string) {
    if (typeof paths === "string") {
      this.watchedFolders.delete(paths);
    } else if (typeof paths === "object") {
      paths.forEach((p) => this.watchedFolders.delete(p));
    }
    this.monitor.unwatch(paths);
  }

  public startMonitoring(paths: string[] | string) {
    if (typeof paths === "string") {
      this.watchedFolders.add(paths);
    } else if (typeof paths === "object") {
      paths.forEach((p) => this.watchedFolders.add(p));
    }
    this.monitor.add(paths);
  }
}

export const folderMonitorService = new FolderMonitorService();
