"use client";

import { create } from "zustand";
import {
  getProfileRequest,
  updateProfileRequest,
  uploadProfileImageRequest,
  deleteProfileImageRequest,
} from "@/lib/api/endpoints/profile.endpoints";
import type {
  UserProfile,
  ProfileStatus,
  UpdateProfileInput,
} from "@/features/profile/types";

interface ProfileState {
  profile: UserProfile | null;
  status: ProfileStatus;
  error: string | null;
  saving: boolean;
  uploading: boolean;
  notice: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>;
  uploadImage: (file: File) => Promise<boolean>;
  deleteImage: () => Promise<boolean>;
  clearError: () => void;
  clearNotice: () => void;
}

const FA_MESSAGES = {
  fetchFailed: "دریافت اطلاعات پروفایل ممکن نشد.",
  updateFailed: "ذخیره تغییرات انجام نشد.",
  uploadFailed: "آپلود تصویر انجام نشد.",
  deleteFailed: "حذف تصویر انجام نشد.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
  updated: "پروفایل با موفقیت به‌روزرسانی شد.",
  imageUpdated: "تصویر پروفایل با موفقیت به‌روزرسانی شد.",
  imageDeleted: "تصویر پروفایل حذف شد.",
} as const;

async function readError(res: Response, fallback: string): Promise<string> {
  // Prefer the backend's own message when it is short and readable.
  try {
    const text = (await res.text()).trim().replace(/^"|"$/g, "");
    if (text && text.length < 200) return text;
  } catch {
    // fall through to fallback
  }
  if (typeof navigator !== "undefined" && !navigator.onLine)
    return FA_MESSAGES.network;
  return fallback;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  status: "idle",
  error: null,
  saving: false,
  uploading: false,
  notice: null,

  clearError: () => set({ error: null }),
  clearNotice: () => set({ notice: null }),

  fetchProfile: async () => {
    set({ status: "loading", error: null });
    try {
      const res = await getProfileRequest();
      if (res.status === 401) {
        // apiClient already redirected to /login on dead session.
        set({ status: "error", error: FA_MESSAGES.fetchFailed });
        return;
      }
      if (!res.ok) {
        set({ status: "error", error: await readError(res, FA_MESSAGES.fetchFailed) });
        return;
      }
      const data: UserProfile = await res.json();
      set({ profile: data, status: "loaded", error: null });
    } catch {
      set({ status: "error", error: FA_MESSAGES.network });
    }
  },

  updateProfile: async (input) => {
    set({ saving: true, error: null, notice: null });
    try {
      const res = await updateProfileRequest(input);
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.updateFailed) });
        return false;
      }
      const data: UserProfile = await res.json();
      set({ profile: data, error: null, notice: FA_MESSAGES.updated });

      // Keep the auth chip (sidebar) in sync — best effort, same person.
      try {
        const { useAuthStore } = await import("@/features/auth/store/auth-store");
        const authUser = useAuthStore.getState().user;
        if (authUser && data.fullName !== authUser.name) {
          useAuthStore.setState({ user: { ...authUser, name: data.fullName } });
          if (typeof window !== "undefined") {
            const raw = window.localStorage.getItem("bf_session");
            if (raw) {
              const session = JSON.parse(raw);
              session.user = { ...session.user, name: data.fullName };
              window.localStorage.setItem("bf_session", JSON.stringify(session));
            }
          }
        }
      } catch {
        // Auth sync is cosmetic — profile already saved.
      }
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  uploadImage: async (file) => {
    set({ uploading: true, error: null, notice: null });
    try {
      const res = await uploadProfileImageRequest(file);
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.uploadFailed) });
        return false;
      }
      const body = (await res.json()) as {
        profileImageUrl?: string;
        profileimageUrl?: string;
      };
      const url = body.profileImageUrl ?? body.profileimageUrl ?? null;
      const current = get().profile;
      if (current && url) set({ profile: { ...current, profileImageUrl: url } });
      else await get().fetchProfile();
      set({ notice: FA_MESSAGES.imageUpdated });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ uploading: false });
    }
  },

  deleteImage: async () => {
    set({ uploading: true, error: null, notice: null });
    try {
      const res = await deleteProfileImageRequest();
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.deleteFailed) });
        return false;
      }
      const current = get().profile;
      if (current) set({ profile: { ...current, profileImageUrl: null } });
      set({ notice: FA_MESSAGES.imageDeleted });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ uploading: false });
    }
  },
}));
