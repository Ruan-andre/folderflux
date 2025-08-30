import { Menu, Tray, nativeImage, BrowserWindow, dialog } from "electron";
import path from "path";
import { runTaskInWorker } from "../handlers/workers";

export function createTray(window: BrowserWindow) {
  const appIcon = path.join(__dirname, "resources", "icon.png");
  const icon = nativeImage.createFromPath(appIcon);

  const tray = new Tray(icon);

  const menu = Menu.buildFromTemplate([
    { label: "FolderFlux - Organização Inteligente", enabled: false },
    { type: "separator" },
    { label: "Abrir", enabled: true, click: () => window.show() },
    {
      label: "Forçar verificação",
      click: async () => {
        try {
          const response = await runTaskInWorker("processAll");
          dialog.showMessageBox({
            type: "info",
            title: "Operação Concluída",
            message: response.message,
          });
        } catch (error) {
          console.error("Falha ao executar a tarefa de verificação via Tray:", error);
          dialog.showErrorBox("Erro", "Ocorreu um erro ao forçar a verificação.");
        }
      },
    },
    { label: "Sair", enabled: true, click: () => window.destroy() },
  ]);

  tray.setToolTip("O FolderFlux está sendo executado em segundo plano");
  tray.addListener("click", () => tray.popUpContextMenu());
  tray.addListener("right-click", () => tray.popUpContextMenu());
  tray.setContextMenu(menu);
}
