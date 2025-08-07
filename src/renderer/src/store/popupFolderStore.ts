import { create } from "zustand";
import { FolderSchema } from "~/src/db/schema";

type FolderPopupState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  folderToEdit?: FolderSchema;
  openPopup: (mode: 'create' | 'edit', folder?: FolderSchema) => void;
  closePopup: () => void;
};

export const useFolderPopupStore = create<FolderPopupState>((set) => ({
  isOpen: false,
  mode: 'create',
  folderToEdit: undefined,
  openPopup: (mode, folder) => set({ isOpen: true, mode, folderToEdit: folder }),
  closePopup: () => set({ isOpen: false, folderToEdit: undefined }),
}));