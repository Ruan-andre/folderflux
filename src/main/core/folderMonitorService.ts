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
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";

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

/** `child` é a própria pasta ou está dentro dela? */
function isInside(child: string, parent: string): boolean {
  return child === parent || child.startsWith(parent + path.sep);
}

class FolderMonitorService {
  private monitor: FSWatcher;
  private fileDebounceTimer: NodeJS.Timeout | null = null;
  private folderDebounceTimer: NodeJS.Timeout | null = null;
  private changedFiles: Set<string> = new Set();
  private changedDirs: Set<string> = new Set();
  private watchedFolders: Set<string> = new Set();
  private readonly debounceMs: number = 2 * 1000;
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
    this.monitor.on("addDir", (dirPath) => this.handleDirEvent(dirPath));
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
    this.process("files", [filePath]);
  }

  private handleDirEvent(dirPath: string): void {
    // Ignora a própria pasta monitorada (chokidar emite addDir para ela mesma)
    if (this.watchedFolders.has(dirPath)) return;

    const parentDir = path.dirname(dirPath);
    if (this.watchedFolders.has(parentDir)) {
      this.process("folders", [parentDir]);
    }
  }

  public async addFoldersToMonitor(paths: string[]) {
    const stats = await getStats(paths);
    for (const dir of stats.filter((x) => x.isDirectory).map((x) => x.path)) {
      if (isProtectedFolder(dir)) continue;
      this.watchedFolders.add(dir);
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
        uniqueFolders.forEach((f) => this.watchedFolders.add(f));
      }
    }
  }

  /**
   * Acumula os caminhos alterados e agenda o processamento com debounce.
   * Arquivos e pastas usam filas e timers separados.
   */
  private process(type: "files" | "folders", paths: string[], delayMS?: number): void {
    const delay = delayMS ?? this.debounceMs;

    if (type === "files") {
      paths.forEach((p) => this.changedFiles.add(p));
      if (this.fileDebounceTimer) clearTimeout(this.fileDebounceTimer);
      this.fileDebounceTimer = setTimeout(() => {
        this.fileDebounceTimer = null;
        const batch = Array.from(this.changedFiles);
        this.changedFiles.clear();
        void this.handleFiles(batch);
      }, delay);
      return;
    }

    paths.forEach((p) => this.changedDirs.add(p));
    if (this.folderDebounceTimer) clearTimeout(this.folderDebounceTimer);
    this.folderDebounceTimer = setTimeout(() => {
      this.folderDebounceTimer = null;
      const batch = Array.from(this.changedDirs);
      this.changedDirs.clear();
      void this.handleFolders(batch);
    }, delay);
  }

  private async activeProfiles(): Promise<FullProfile[]> {
    return (await getAllProfiles(this.db)).items?.filter((p) => p.isActive) ?? [];
  }

  private async handleFiles(filePaths: string[]): Promise<void> {
    if (filePaths.length === 0) return;

    const profiles = await this.activeProfiles();
    if (profiles.length === 0) return;

    const stats = await getStats(filePaths);
    const existingFiles = stats.filter((f) => !f.isDirectory).map((f) => f.path);
    if (existingFiles.length === 0) return;

    const dirnames = new Set(existingFiles.map((f) => path.dirname(f)));

    for (const profile of profiles) {
      const profileDirs = new Set(profile.folders.map((f) => f.fullPath));
      const dirsForProfile = Array.from(dirnames).filter((d) => profileDirs.has(d));
      if (dirsForProfile.length === 0) continue;

      const specificPaths = existingFiles.filter((f) => profileDirs.has(path.dirname(f)));

      await RuleEngine.process({
        db: this.db,
        rules: profile.rules.filter((r) => r.isActive),
        folderPaths: dirsForProfile,
        profileName: profile.name,
        onLogAdded: this.onLogAdded,
        specificPaths,
      });
    }
  }

  private async handleFolders(dirnames: string[]): Promise<void> {
    if (dirnames.length === 0) return;

    const profiles = await this.activeProfiles();
    if (profiles.length === 0) return;

    for (const profile of profiles) {
      const profileDirs = profile.folders.map((f) => f.fullPath);
      const specificPaths = dirnames.filter((d) => profileDirs.some((root) => isInside(d, root)));
      if (specificPaths.length === 0) continue;

      await RuleEngine.process({
        db: this.db,
        rules: profile.rules.filter((r) => r.isActive),
        folderPaths: profileDirs,
        profileName: profile.name,
        onLogAdded: this.onLogAdded,
        specificPaths,
      });
    }
  }

  public stopMonitoring(paths: string[] | string) {
    if (typeof paths === "string") {
      this.watchedFolders.delete(paths);
    } else {
      paths.forEach((p) => this.watchedFolders.delete(p));
    }
    this.monitor.unwatch(paths);
  }

  public stopMonitoringAll() {
    if (this.fileDebounceTimer) clearTimeout(this.fileDebounceTimer);
    if (this.folderDebounceTimer) clearTimeout(this.folderDebounceTimer);
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
    } else {
      paths.forEach(addPath);
    }

    if (startVerification) {
      RuleEngine.processAll(this.db, this.onLogAdded);
    }
  }
}

export const folderMonitorService = new FolderMonitorService();
