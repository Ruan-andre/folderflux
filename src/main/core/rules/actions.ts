import path from "path";
import FileInfo from "~/src/shared/types/FileInfo";
import DirInfo from "~/src/shared/types/DirInfo";
import { ActionSchema } from "~/src/db/schema";
import { copyFile, deleteFile, moveFile } from "../../services/system/fileService";
import { copyDir, deleteDir, moveDir } from "../../services/system/dirService";

type FileActionFunc = (file: FileInfo, actionValue: string) => Promise<void | string>;
type DirActionFunc = (dir: DirInfo, actionValue: string) => Promise<void | string>;

const fileActionHandlers: Record<string, FileActionFunc> = {
  move: async (file, destinationFolder) => {
    const newPath = path.join(file.parentDirectory, destinationFolder, file.nameWithExtension);
    await moveFile(file.fullPath, newPath);
    return newPath;
  },
  copy: async (file, destinationFolder) => {
    const newPath = path.join(file.parentDirectory, destinationFolder, file.nameWithExtension);
    await copyFile(file.fullPath, newPath);
    return newPath;
  },
  delete: async (file) => {
    await deleteFile(file.fullPath);
  },
  rename: async (file, newName) => {
    const newPath = path.join(file.parentDirectory, `${newName}${file.extension}`);
    await moveFile(file.fullPath, newPath);
    return newPath;
  },
};

const dirActionHandlers: Record<string, DirActionFunc> = {
  move: async (dir, destinationFolder) => {
    const newPath = path.join(dir.parentDirectory, destinationFolder, dir.name);
    await moveDir(dir.fullPath, newPath);
    return newPath;
  },
  copy: async (dir, destinationFolder) => {
    const newPath = path.join(dir.parentDirectory, destinationFolder, dir.name);
    await copyDir(dir.fullPath, newPath);
    return newPath;
  },
  delete: async (dir) => {
    await deleteDir(dir.fullPath);
  },
  rename: async (dir, newName) => {
    const newPath = path.join(dir.parentDirectory, newName);
    await moveDir(dir.fullPath, newPath);
    return newPath;
  },
};

/** Nomes de pasta que ações de `move`/`copy` criam dentro da pasta monitorada. */
export function destinationFolderNames(actions: ActionSchema[]): Set<string> {
  const names = new Set<string>();
  for (const { type, value } of actions) {
    if ((type !== "move" && type !== "copy") || !value) continue;
    const firstSegment = value.split(/[\\/]/).find((segment) => segment.length > 0);
    if (firstSegment) names.add(firstSegment.toLowerCase());
  }
  return names;
}

export function executeAction(
  item: FileInfo | DirInfo,
  isDir: boolean,
  action: ActionSchema
): Promise<void | string> {
  const handler = isDir ? dirActionHandlers[action.type] : fileActionHandlers[action.type];
  if (!handler) {
    return Promise.reject(new Error(`Ação '${action.type}' não reconhecida.`));
  }

  const value = action.value ?? "";
  return isDir
    ? (handler as DirActionFunc)(item as DirInfo, value)
    : (handler as FileActionFunc)(item as FileInfo, value);
}
