import { BrowserWindow } from "electron";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";
import { mainProcessEmitter } from "../../emitter/mainProcessEmitter";

export function registerEmitterHandlers(mainWindow: BrowserWindow | null) {
  mainProcessEmitter.on("log-added", (log: LogMetadata) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("log-added", log);
    }
  });
}
