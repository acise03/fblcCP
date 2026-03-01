import { businessesApi, BusinessWithInfo } from "@/db/api/businesses";
import { usersApi } from "@/db/api/users";
import type { User } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { User as AuthUser, Session } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthStore = {
  session: Session | null;
  user: AuthUser | null;
  profile: User | null;
  ownedBusiness: BusinessWithInfo | null;
  loading: boolean;
  error: string | null;
  favBusinesses: string[] | null;

  // Computed
  isAuthenticated: boolean;
  isBusinessOwner: boolean;

  // Actions
  setFavs: (favs: string[]) => void;
  initialize: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstname?: string,
    lastname?: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<User, "id">>) => Promise<void>;
  uploadProfilePicture: (fileUri: string) => Promise<string>;
  refreshOwnedBusiness: () => Promise<BusinessWithInfo | null>;
  setError: (error: string | null) => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  ownedBusiness: null,
  loading: true,
  error: null,
  favBusinesses: null,

  get isAuthenticated() {
    console.log(`setting isauth ${get().session}`);
    return get().session !== null;
  },

  get isBusinessOwner() {
    return get().ownedBusiness !== null;
  },

  setFavs: (favs: string[]) => {
    set({ favBusinesses: favs });
  },

  initialize: async () => {
    try {
      set({ loading: true, error: null });

      const session = await auth.getSession();
      if (!session) {
        set({
          session: null,
          user: null,
          profile: null,
          ownedBusiness: null,
          loading: false,
        });
        return;
      }

      const user = session.user;
      const profile = await usersApi.getById(user.id);
      const ownedBusiness = await businessesApi.getByOwner(user.id);

      set({
        session,
        user,
        profile,
        ownedBusiness,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  signUp: async (email, password, firstname, lastname) => {
    try {
      set({ loading: true, error: null });
      await auth.signUp(email, password, firstname, lastname);
      // Note: User needs to verify email before they can sign in (depending on Supabase settings)
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { session, user } = await auth.signIn(email, password);

      const profile = await usersApi.getById(user.id);
      const ownedBusiness = await businessesApi.getByOwner(user.id);

      set({
        session,
        user,
        profile,
        ownedBusiness,
        loading: false,
      });

      console.log(`did this work ${session} ${get().session}`);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await auth.signOut();
      set({
        session: null,
        user: null,
        profile: null,
        ownedBusiness: null,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user || !profile) throw new Error("Not authenticated");

    try {
      set({ loading: true, error: null });
      const updatedProfile = await usersApi.update(user.id, updates);
      set({ profile: updatedProfile, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  uploadProfilePicture: async (fileUri: string) => {
    const { user, profile } = get();
    if (!user || !profile) throw new Error("Not authenticated");

    try {
      set({ loading: true, error: null });
      const url = await usersApi.uploadProfilePicture(user.id, fileUri);
      set({
        profile: { ...profile, profile_picture: url },
        loading: false,
      });
      return url;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  refreshOwnedBusiness: async () => {
    const { user } = get();
    if (!user) return null;

    try {
      const ownedBusiness = await businessesApi.getByOwner(user.id);
      set({ ownedBusiness });
      return ownedBusiness;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  setError: (error) => set({ error }),
}));
