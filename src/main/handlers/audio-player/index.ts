import { BrowserWindow, ipcMain } from "electron";

export function registerAudioPlayerHandlers(audioWindow: BrowserWindow | null) {
  ipcMain.on("request-play-audio", (_event, text: string) => {
    audioWindow?.webContents.send("play-audio", text);
  });

  ipcMain.on("request-stop-audio", () => {
    audioWindow?.webContents.send("stop-audio");
  });
}
