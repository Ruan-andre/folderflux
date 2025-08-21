import { ipcMain } from "electron";
import { folderMonitorService } from "../../core/folderMonitorService";

export function registerChokidarHandlers() {
  ipcMain.handle("unwatch-profile-folders", (_e, profileId) => {
    folderMonitorService.stopMonitoringProfileFolders(profileId);
  });

  ipcMain.handle("watch-profile-folders", (_e, profileId) => {
    folderMonitorService.startMonitoringProfileFolders(profileId);
  });

  ipcMain.handle("watch", (_e, paths) => {
    folderMonitorService.startMonitoring(paths);
  });

  ipcMain.handle("unwatch", (_e, paths) => {
    folderMonitorService.stopMonitoring(paths);
  });
}
