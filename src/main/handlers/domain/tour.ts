import { ipcMain } from "electron";
import { deleteRulesFromTour } from "../../services/ruleService";
import { deleteFoldersFromTour } from "../../services/folderService";
import { deleteProfilesFromTour } from "../../services/profileService";
import { db } from "../../../db";

export function registerTourHandlers() {
  ipcMain.handle("delete-data-from-tour", async () => {
    await deleteRulesFromTour(db);
    await deleteFoldersFromTour(db);
    await deleteProfilesFromTour(db);
  });
}
