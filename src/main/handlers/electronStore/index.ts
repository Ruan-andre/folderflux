import { ipcMain } from "electron";
import Store from "electron-store";

const store = new Store();

export function registerElectronStoreHandlers() {
  ipcMain.handle("electron-store-get", async (event, key) => {
    return store.get(key);
  });

  ipcMain.handle("electron-store-set", async (event, key, value) => {
    store.set(key, value);
  });
}
