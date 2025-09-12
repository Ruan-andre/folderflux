import { create } from "zustand";

interface UpdateState {
  isUpdateAvailable: boolean;
  setUpdateAvailable: (status: boolean) => void;
}
export const useUpdateStore = create<UpdateState>((set) => ({
  isUpdateAvailable: false,
  setUpdateAvailable: (status) => set({ isUpdateAvailable: status }),
}));
