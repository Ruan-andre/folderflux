import { app, ipcMain } from "electron";
import { deleteRulesFromTour } from "../../services/domain/ruleService";
import { deleteFoldersFromTour } from "../../services/domain/folderService";
import { deleteProfilesFromTour } from "../../services/domain/profileService";
import { db } from "../../../db";
import { deleteLogsFromTour } from "../../services/domain/organizationLogsService";
import { moveFile } from "../../services/system/fileService";
import path from "path";

export function registerTourHandlers() {
  ipcMain.handle("delete-data-from-tour", async () => {
    await deleteRulesFromTour(db);
    await deleteFoldersFromTour(db);
    await deleteProfilesFromTour(db);
    await deleteLogsFromTour(db);
  });

  ipcMain.handle("move-data-from-tour", async () => {
    const publicPath = app.isPackaged ? app.getPath("userData") : path.join(app.getAppPath(), "public");

    const pathTutorialExamples = path.join(publicPath, "tutorial-examples");
    const pathDocumentos = path.join(pathTutorialExamples, "DOCUMENTOS");
    const pathImagens = path.join(pathTutorialExamples, "IMAGENS");
    const pathVideos = path.join(pathTutorialExamples, "VÍDEOS");
    const documentTest = "document-test.docx";
    const imageTest = "image-test.jpg";
    const videoTest = "video-test.mp4";
    try {
      moveFile(path.join(pathDocumentos, documentTest), path.join(pathTutorialExamples, documentTest));
      moveFile(path.join(pathImagens, imageTest), path.join(pathTutorialExamples, imageTest));
      moveFile(path.join(pathVideos, videoTest), path.join(pathTutorialExamples, videoTest));
    } catch (error) {
      // Falha silenciosa, sem risco crítico
      console.error("Erro ao mover arquivos do tutorial:", error);
    }
  });
}
