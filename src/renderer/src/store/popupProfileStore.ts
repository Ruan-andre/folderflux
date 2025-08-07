import { create } from "zustand";
import { FullProfile } from "../../../shared/types/ProfileWithDetails";

type PopupProfileState = {
  isOpen: boolean;
  mode: "create" | "edit";
  profileToEdit?: FullProfile;
  openPopup: (mode: "create" | "edit", profile?: FullProfile) => void;
  closePopup: () => void;
};

export const useProfilePopupStore = create<PopupProfileState>((set) => ({
  isOpen: false,
  mode: "create",
  profileToEdit: undefined,
  openPopup: (mode, profile) => set({ isOpen: true, mode, profileToEdit: profile }),
  closePopup: () => set({ isOpen: false, profileToEdit: undefined }),
}));
