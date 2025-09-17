import chokidar, { FSWatcher } from "chokidar";
import RuleEngine from "./ruleEngine";
import { getSettingByType } from "../services/domain/settingsService";
import {
  getAllProfiles,
  getCountProfilesWithFolder,
  getProfileById,
} from "../services/domain/profileService";
import path from "path";
import { getStats } from "../services/system/fileService";
import { DbOrTx } from "~/src/db";
import { mainProcessEmitter } from "../emitter/mainProcessEmitter";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";

const temporaryFilePatterns = [/(^|[/\\])\../, "**/*.tmp", "**/*.part", "**/*.crdownload", "**/*.opdownload"];
// Pastas protegidas do Windows que devem ser ignoradas
const protectedFolders = [
  "System Volume Information",
  "$RECYCLE.BIN",
  "RECYCLE.BIN",
  "pagefile.sys",
  "hiberfil.sys",
  "swapfile.sys",
];
function isProtectedFolder(folderPath: string) {
  return protectedFolders.some((name) =>
    folderPath.replace(/\\/g, "/").toLowerCase().includes(`/${name.toLowerCase()}`)
  );
}

class FolderMonitorService {
  private monitor: FSWatcher;
  private debounceTimer: NodeJS.Timeout | null = null;
  private changedFiles: Set<string> = new Set();
  private watchedFolders: Set<string> = new Set();
  private debounceSeconds: number = 2 * 1000; // 2000ms = 2 segundos
  private processingRequest: Set<string> = new Set();
  private db!: DbOrTx;

  constructor() {
    this.monitor = chokidar.watch([], {
      ignored: [
        ...temporaryFilePatterns,
        // Ignora explicitamente pastas protegidas do Windows
        "**/System Volume Information/**",
        "**/$RECYCLE.BIN/**",
        "**/RECYCLE.BIN/**",
        "**/pagefile.sys",
        "**/hiberfil.sys",
        "**/swapfile.sys",
      ],
      persistent: true,
      ignoreInitial: true,
      depth: 0,
    });
    this.monitor.on("add", (filePath) => this.handleFileEvent(filePath));
  }

  public async start(db: DbOrTx) {
    this.db = db;
    const realTimeSetting = await getSettingByType(this.db, "realTime");
    if (!realTimeSetting?.isActive) return;
    this.initialLoad();
  }

  private onLogAdded = (logs: LogMetadata | LogMetadata[]) => {
    mainProcessEmitter.emit("log-added", logs);
  };

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
      if (isProtectedFolder(dir)) continue;
      if (!this.watchedFolders.has(dir)) {
        this.watchedFolders.add(dir);
      }
      this.monitor.add(dir);
    }
  }

  public async startMonitoringProfileFolders(profileId: number, startVerification: boolean = false) {
    const responseFolders = (await getProfileById(this.db, profileId)).items?.folders;
    const foldersToWatch = new Set<string>();

    if (responseFolders && responseFolders.length > 0) {
      for (const folder of responseFolders) {
        if (this.watchedFolders.has(folder.fullPath)) {
          continue;
        }
        foldersToWatch.add(folder.fullPath);
      }
      if (foldersToWatch.size > 0) this.startMonitoring(Array.from(foldersToWatch), startVerification);
    }
  }

  public async stopMonitoringProfileFolders(profileId: number) {
    const responseFolders = (await getProfileById(this.db, profileId)).items?.folders;
    const foldersToUnwatch = new Set<string>();

    if (responseFolders && responseFolders.length > 0) {
      for (const folder of responseFolders) {
        const count = await getCountProfilesWithFolder(this.db, folder.id);
        if (count <= 1) {
          foldersToUnwatch.add(folder.fullPath);
          this.watchedFolders.delete(folder.fullPath);
        }
      }
      if (foldersToUnwatch.size > 0) this.stopMonitoring(Array.from(foldersToUnwatch));
    }
  }

  private async initialLoad() {
    const response = await getAllProfiles(this.db);
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
        const activeProfiles = (await getAllProfiles(this.db)).items?.filter((p) => p.isActive);
        if (activeProfiles) {
          const filteredPaths = (await getStats(filePaths)).filter((f) => !f.isDirectory).map((f) => f.path);
          const dirnames = new Set(filteredPaths.map((x) => path.dirname(x)));
          const associatedProfiles = activeProfiles.filter((p) =>
            p.folders.some((f) => dirnames.has(f.fullPath))
          );
          for (const profile of associatedProfiles) {
            const activeRules = profile.rules.filter((r) => r.isActive);

            await RuleEngine.process(
              this.db,
              activeRules,
              Array.from(dirnames),
              profile.name,
              this.onLogAdded
            );
          }
        }
      }
    };

    const handleFolders = async (dirnames: string[]) => {
      const activeProfiles = (await getAllProfiles(this.db)).items?.filter((p) => p.isActive);
      if (activeProfiles) {
        const associatedProfiles = activeProfiles.filter((p) =>
          p.folders.some((f) => dirnames.includes(f.fullPath))
        );
        for (const profile of associatedProfiles) {
          const activeRules = profile.rules.filter((r) => r.isActive);
          const associatedFolders = profile.folders.map((f) => f.fullPath);
          await RuleEngine.process(this.db, activeRules, associatedFolders, profile.name, this.onLogAdded);
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

  public stopMonitoringAll() {
    this.monitor.close();
  }

  public startMonitoring(paths: string[] | string, startVerification: boolean = false) {
    const addPath = (p: string) => {
      if (isProtectedFolder(p)) return;
      this.watchedFolders.add(p);
      this.monitor.add(p);
    };
    if (typeof paths === "string") {
      addPath(paths);
    } else if (typeof paths === "object") {
      paths.forEach(addPath);
    }

    if (startVerification) {
      RuleEngine.processAll(this.db, this.onLogAdded);
    }
  }
}

export const folderMonitorService = new FolderMonitorService();
