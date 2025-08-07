import { create } from "zustand";
import { DbResponse } from "../../../shared/types/DbResponse";
// import { ProfileSchema } from "~/src/db/schema";
import { FullProfile } from "../../../shared/types/ProfileWithDetails";

type ProfileState = {
  profiles: FullProfile[];
  getProfiles: () => Promise<void>;
  addProfile: (data: FullProfile) => Promise<DbResponse<FullProfile>>;
  duplicateProfile: (profile: FullProfile) => Promise<DbResponse<FullProfile>>;
  updateProfile: (profile: FullProfile) => Promise<DbResponse>;
  deleteProfile: (id: number) => Promise<DbResponse>;
  toggleActive: (id: number) => Promise<DbResponse>;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],

  getProfiles: async () => {
    const result = await window.api.profile.getAllProfiles();
    if (result.status && result.items) {
      set({ profiles: result.items });
    }
  },

  addProfile: async (data): Promise<DbResponse<FullProfile>> => {
    const response = await window.api.profile.createFullProfile(data);
    if (response.status && response.items) {
      const newFullProfile = response.items;
      set((state) => ({
        profiles: [...state.profiles, newFullProfile],
      }));
    }
    return response;
  },

  duplicateProfile: async (profile): Promise<DbResponse<FullProfile>> => {
    const response = await window.api.profile.duplicateProfile(profile);
    if (response.status && response.items) {
      const newFullProfile = response.items;
      set((state) => ({
        profiles: [...state.profiles, newFullProfile],
      }));
    }
    return response;
  },

  updateProfile: async (profileData): Promise<DbResponse> => {
    const response = await window.api.profile.updateProfile(profileData);
    if (response.status) {
      set((state) => ({
        profiles: state.profiles.map((r) => (r.id === profileData.id ? { ...r, ...profileData } : r)),
      }));
    }
    return response;
  },

  deleteProfile: async (id): Promise<DbResponse> => {
    const response = await window.api.profile.deleteProfile(id);
    if (response.status) {
      set((state) => ({
        profiles: state.profiles.filter((r) => r.id !== id),
      }));
    }
    return response;
  },

  toggleActive: async (id) => {
    const response = await window.api.profile.toggleStatus(id);
    if (response.status) {
      set((state) => ({
        profiles: state.profiles.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
      }));
    }
    return response;
  },
}));
