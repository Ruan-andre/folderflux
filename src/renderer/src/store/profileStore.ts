import { create } from "zustand";
import { DbResponse } from "../../../shared/types/DbResponse";
import { FullProfile, NewFullProfile } from "../../../shared/types/ProfileWithDetails";

type ProfileState = {
  profiles: FullProfile[];
  getProfiles: () => Promise<void>;
  addProfile: (data: NewFullProfile, isTourActive?: boolean) => Promise<DbResponse<FullProfile>>;
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

  addProfile: async (data, isTourActive): Promise<DbResponse<FullProfile>> => {
    const response = await window.api.profile.createFullProfile(data, isTourActive);
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
