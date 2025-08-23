import { Menu, Tray, nativeImage, BrowserWindow } from "electron";
import path from "path";
import RuleEngine from "../core/ruleEngine";

export function createTray(window: BrowserWindow) {
  const appIcon = path.join(__dirname, "resources", "icon.png");
  const icon = nativeImage.createFromPath(appIcon);

  const tray = new Tray(icon);

  const menu = Menu.buildFromTemplate([
    { label: "FolderFlux - Organização Inteligente", enabled: false },
    { type: "separator" },
    { label: "Abrir", enabled: true, click: () => window.show() },
    { label: "Forçar verificação", click: async () => await RuleEngine.processAll() },
    { label: "Sair", enabled: true, role: "quit" },
  ]);

  tray.setToolTip("O FolderFlux está sendo executado em segundo plano");
  tray.addListener("click", () => tray.popUpContextMenu());
  tray.addListener("right-click", () => tray.popUpContextMenu());
  tray.setContextMenu(menu);
}
