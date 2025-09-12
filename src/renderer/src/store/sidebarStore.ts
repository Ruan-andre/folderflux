import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  setIsOpen: (status: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  setIsOpen: (status) => set({ isOpen: status }),
}));
