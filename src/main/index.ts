// Handler para expor a versão do app para o renderer
ipcMain.handle("app:get-version", () => {
  return app.getVersion();
});
import { app, shell, BrowserWindow, globalShortcut, Menu, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path, { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { runMigrations } from "../db";
import { registerRuleHandlers } from "./handlers/domain/rules";
import { registerDialogHandlers } from "./handlers/system/dialog";
import { registerProfileHandlers } from "./handlers/domain/profiles";
import { registerFolderHandlers } from "./handlers/domain/folders";
import { registerSettingsHandlers } from "./handlers/domain/settings";
import { seedDatabase } from "../db/seeds";
import { registerFileHandlers } from "./handlers/system/file";
import { registerOrganizationHandlers } from "./handlers/domain/organization";

import { registerChokidarHandlers } from "./handlers/system/chokidar";
import { folderMonitorService } from "./core/folderMonitorService";
import { createTray } from "./tray";
import { syncAppSettings } from "./services/domain/settingsService";
import { defaultOrganization } from "./core/organizationService";
import { registerWorkerHandlers } from "./handlers/workers";
import { db } from "../db";
import { registerEmitterHandlers } from "./handlers/emitter";
import { registerAudioPlayerHandlers } from "./handlers/audio-player";
import { registerTtsHandlers } from "./handlers/tts";
import { registerTourHandlers } from "./handlers/domain/tour";
import { registerElectronStoreHandlers } from "./handlers/electron/electronStore";
import { registerElectronUpdaterHandlers } from "./handlers/electron/electron-updater";
import fs from "fs";

log.transports.file.level = "info";
autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

let mainWindow: BrowserWindow | null = null;
let audioWindow: BrowserWindow | null = null;
let updateWindow: BrowserWindow | null = null;
let isQuitting = false;

function setupTutorialFiles() {
  if (!app.isPackaged) {
    return;
  }

  const destPath = path.join(app.getPath("userData"), "tutorial-examples");

  if (fs.existsSync(destPath)) {
    console.log(
      "Pasta de tutorial já existe. Apagando e copiando tudo novamente por precaução, processo rápido."
    );
    fs.unlinkSync(destPath);
  }

  const sourcePath = path.join(process.resourcesPath, "tutorial-examples");

  if (fs.existsSync(sourcePath)) {
    try {
      fs.cpSync(sourcePath, destPath, { recursive: true });
    } catch (err) {
      console.error("Falha ao copiar a pasta de tutorial:", err);
    }
  }
}

export function setQuitting(value: boolean) {
  isQuitting = value;
}

export function getQuitting() {
  return isQuitting;
}

// Atalhos globais removidos. Use listener no renderer para F5/CTRL+R e envie IPC para recarregar a janela.
ipcMain.on("window:reload", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.reload();
});

function createMainWindow(): void {
  const favicon = app.isPackaged
    ? path.join(process.resourcesPath, "favicon.ico") // Em produção
    : path.join(app.getAppPath(), "public", "favicon.ico");
  mainWindow = new BrowserWindow({
    type: "mainWindow",
    width: 1200,
    height: 880,
    show: false,
    icon: favicon,

    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // mainWindow.on("ready-to-show", async () => {
  //   mainWindow?.show();
  // });

  createTray(mainWindow);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.on("close", (event) => {
    if (!getQuitting()) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function createAudioWindow() {
  audioWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
    },
  });

  const rendererUrl = process.env["ELECTRON_RENDERER_URL"];
  if (is.dev && rendererUrl) {
    audioWindow.loadURL(`${rendererUrl}/?view=audioPlayer`);
  } else {
    audioWindow.loadFile(path.join(__dirname, "../renderer/index.html"), {
      search: "view=audioPlayer",
    });
  }
  // audioWindow.webContents.openDevTools();
}

function createUpdateWindow(): void {
  const favicon = app.isPackaged
    ? path.join(process.resourcesPath, "favicon.ico") // Em produção
    : path.join(app.getAppPath(), "public", "favicon.ico");
  updateWindow = new BrowserWindow({
    width: 670,
    height: 330,
    show: false,
    icon: favicon,
    frame: false,
    autoHideMenuBar: true,
    center: true,
    resizable: false,
    maximizable: false,
    // ...(process.platform === 'linux' ? { icon } : {}),
  });

  updateWindow.on("ready-to-show", async () => {
    autoUpdater.forceDevUpdateConfig = true; // apenas para testar o electron-updater em dev
    // audioWindow?.webContents.openDevTools({ mode: "detach" });
    updateWindow?.show();

    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.log("Erro ao verificar atualizações:", error);
    }
  });

  updateWindow.on("close", (event) => {
    updateWindow?.destroy();
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    updateWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/update.html`);
  } else {
    updateWindow.loadFile(join(__dirname, "../renderer/update.html"));
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine) => {
    // `commandLine` contém os argumentos, incluindo o caminho da pasta
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      handleFolderPathArgument(commandLine);
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    try {
      setupTutorialFiles();
    } catch (error) {
      console.error("Erro ao configurar arquivos de tutorial:", error);
    }
    try {
      await runMigrations();
    } catch (error) {
      console.error("Falha crítica nas migrations:", error);
      app.quit();
      return;
    }
    await seedDatabase(db);

    if (app.isPackaged) {
      Menu.setApplicationMenu(null);
    }
    if (is.dev) {
      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
      });
    }

    createUpdateWindow();
    createMainWindow();
    try {
      createAudioWindow();
    } catch (error) {
      console.log(error);
    }

    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });

    ipcMain.handle("app:is-packaged", () => {
      return app.isPackaged;
    });
    registerElectronStoreHandlers();
    registerRuleHandlers();
    registerDialogHandlers();
    registerProfileHandlers();
    registerFolderHandlers();
    registerSettingsHandlers();
    registerOrganizationHandlers();
    registerFileHandlers();
    registerChokidarHandlers();
    registerWorkerHandlers();
    await syncAppSettings(db);
    registerEmitterHandlers(mainWindow);
    registerAudioPlayerHandlers(audioWindow);
    registerTtsHandlers();
    registerTourHandlers();
    registerElectronUpdaterHandlers(autoUpdater, mainWindow, updateWindow, log);

    await folderMonitorService.start(db);
    handleFolderPathArgument(process.argv);

    try {
      createAudioWindow();
    } catch (error) {
      console.log(error);
    }
  });

  function handleFolderPathArgument(argv: string[]) {
    // O primeiro argumento é o path do executável. O segundo, se existir,
    // e for um caminho de diretório, é o que queremos.
    // Em produção, o argumento estará em argv[1]. Em dev, pode estar em argv[2].
    const folderPath = argv.find(
      (arg) => arg.includes(path.sep) && !arg.endsWith(".exe") && !arg.includes("--")
    );

    if (folderPath && mainWindow) {
      defaultOrganization(db, [folderPath]);
    }
  }
  app.on("quit", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
