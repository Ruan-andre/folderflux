import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import { registerElectronUpdaterHandlers } from "~/src/main/handlers/electron/electron-updater";

vi.mock("electron", () => ({
  ipcMain: { on: vi.fn() },
  BrowserWindow: vi.fn(),
}));

vi.mock("~/src/main/services/domain/settingsService", () => ({
  getSettingStatusByType: vi.fn(),
}));

vi.mock("~/src/db", () => ({ db: {} }));

import { getSettingStatusByType } from "~/src/main/services/domain/settingsService";

const mockGetSetting = vi.mocked(getSettingStatusByType);

function makeWindow(opts = {}) {
  const { visible = false, loading = false, destroyed = false, minimized = false } = opts;
  let _visible = visible;
  let _destroyed = destroyed;
  const onceCallbacks = {};
  const webContents = {
    send: vi.fn(),
    isLoading: vi.fn(() => loading),
    once: vi.fn((event, cb) => {
      onceCallbacks[event] = onceCallbacks[event] ?? [];
      onceCallbacks[event].push(cb);
    }),
    _finishLoad: () => onceCallbacks["did-finish-load"]?.forEach((cb) => cb()),
  };
  return {
    webContents,
    show: vi.fn(() => {
      _visible = true;
    }),
    hide: vi.fn(),
    close: vi.fn(),
    restore: vi.fn(),
    focus: vi.fn(),
    destroy: vi.fn(() => {
      _destroyed = true;
    }),
    isVisible: vi.fn(() => _visible),
    isDestroyed: vi.fn(() => _destroyed),
    isMinimized: vi.fn(() => minimized),
  };
}

function makeUpdater() {
  const emitter = new EventEmitter();
  return {
    on: emitter.on.bind(emitter),
    emit: emitter.emit.bind(emitter),
    quitAndInstall: vi.fn(),
    checkForUpdates: vi.fn().mockResolvedValue(null),
    downloadUpdate: vi.fn(),
  };
}

const makeLog = () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() });
const tick = () => new Promise((r) => setTimeout(r, 0));

// ─── update-downloaded ────────────────────────────────────────────────────────

describe("update-downloaded", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fecha a updateWindow ANTES de notificar o renderer", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ loading: false });
    const updateWindow = makeWindow();
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, updateWindow, makeLog());
    const order = [];
    updateWindow.close.mockImplementation(() => order.push("close"));
    mainWindow.webContents.send.mockImplementation(() => order.push("send"));
    await updater.emit("update-downloaded", { releaseNotes: "" });
    await tick();
    expect(order.indexOf("close")).toBeLessThan(order.indexOf("send"));
  });

  it("exibe a mainWindow oculta antes de enviar o evento (regressão)", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ visible: false, loading: false });
    const updateWindow = makeWindow();
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, updateWindow, makeLog());
    await updater.emit("update-downloaded", { releaseNotes: "" });
    await tick();
    expect(mainWindow.show).toHaveBeenCalled();
    expect(mainWindow.webContents.send).toHaveBeenCalledWith("update-downloaded");
  });

  it("não chama show() se a mainWindow já está visível", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ visible: true, loading: false });
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, null, makeLog());
    await updater.emit("update-downloaded", { releaseNotes: "" });
    await tick();
    expect(mainWindow.show).not.toHaveBeenCalled();
    expect(mainWindow.webContents.send).toHaveBeenCalledWith("update-downloaded");
  });

  it("aguarda did-finish-load quando o renderer está carregando", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ visible: true, loading: true });
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, null, makeLog());
    await updater.emit("update-downloaded", { releaseNotes: "" });
    await tick();
    expect(mainWindow.webContents.send).not.toHaveBeenCalled();
    mainWindow.webContents._finishLoad();
    expect(mainWindow.webContents.send).toHaveBeenCalledWith("update-downloaded");
  });

  it("chama quitAndInstall imediatamente em update crítico", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow();
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, null, makeLog());
    await updater.emit("update-downloaded", { releaseNotes: "fixes [critical] issue" });
    await tick();
    expect(updater.quitAndInstall).toHaveBeenCalledWith(true, true);
    expect(mainWindow.webContents.send).not.toHaveBeenCalled();
  });

  it("chama quitAndInstall quando auto-update está ativado", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ visible: true, loading: false });
    mockGetSetting.mockResolvedValue(true);
    registerElectronUpdaterHandlers(updater, mainWindow, null, makeLog());
    await updater.emit("update-downloaded", { releaseNotes: "" });
    await tick();
    expect(updater.quitAndInstall).toHaveBeenCalledWith(true, true);
    expect(mainWindow.webContents.send).not.toHaveBeenCalled();
  });

  it("não envia evento se a mainWindow foi destruída", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ destroyed: true });
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, null, makeLog());
    await updater.emit("update-downloaded", { releaseNotes: "" });
    await tick();
    expect(mainWindow.webContents.send).not.toHaveBeenCalled();
  });
});

// ─── update-not-available ─────────────────────────────────────────────────────

describe("update-not-available", () => {
  beforeEach(() => vi.clearAllMocks());

  it("startup: fecha updateWindow e exibe mainWindow", () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow();
    const updateWindow = makeWindow();
    registerElectronUpdaterHandlers(updater, mainWindow, updateWindow, makeLog());
    updater.emit("update-not-available");
    expect(updateWindow.close).toHaveBeenCalled();
    expect(mainWindow.show).toHaveBeenCalled();
  });

  it("checagem periódica: não fecha updateWindow nem mostra mainWindow", () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow();
    const updateWindow = makeWindow({ destroyed: true });
    registerElectronUpdaterHandlers(updater, mainWindow, updateWindow, makeLog());
    updater.emit("update-not-available");
    expect(updateWindow.close).not.toHaveBeenCalled();
    expect(mainWindow.show).not.toHaveBeenCalled();
  });
});

// ─── update-available ─────────────────────────────────────────────────────────

describe("update-available", () => {
  beforeEach(() => vi.clearAllMocks());

  it("startup: fecha updateWindow, exibe mainWindow e notifica o renderer", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ loading: false });
    const updateWindow = makeWindow();
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, updateWindow, makeLog());
    await updater.emit("update-available", { version: "1.9.2" });
    await tick();
    expect(updateWindow.close).toHaveBeenCalled();
    expect(mainWindow.show).toHaveBeenCalled();
    expect(mainWindow.webContents.send).toHaveBeenCalledWith("update-available", "1.9.2");
  });

  it("checagem periódica: não fecha updateWindow nem exibe mainWindow", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ loading: false });
    const updateWindow = makeWindow({ destroyed: true });
    mockGetSetting.mockResolvedValue(false);
    registerElectronUpdaterHandlers(updater, mainWindow, updateWindow, makeLog());
    await updater.emit("update-available", { version: "1.9.2" });
    await tick();
    expect(updateWindow.close).not.toHaveBeenCalled();
    expect(mainWindow.show).not.toHaveBeenCalled();
    expect(mainWindow.webContents.send).toHaveBeenCalledWith("update-available", "1.9.2");
  });

  it("auto-update ativado: não notifica o renderer", async () => {
    const updater = makeUpdater();
    const mainWindow = makeWindow({ loading: false });
    const updateWindow = makeWindow();
    mockGetSetting.mockResolvedValue(true);
    registerElectronUpdaterHandlers(updater, mainWindow, updateWindow, makeLog());
    await updater.emit("update-available", { version: "1.9.2" });
    await tick();
    expect(mainWindow.webContents.send).not.toHaveBeenCalled();
  });
});
