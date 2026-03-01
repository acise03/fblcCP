import { businessesApi, BusinessWithInfo } from "@/db/api/businesses";
import { BusinessPost } from "@/db/schema";
import { create } from "zustand";

type BusinessStore = {
  businesses: BusinessWithInfo[];
  selectedBusiness: BusinessWithInfo | null;
  loading: boolean;
  error: string | null;
  posts: BusinessPost[];

  // Actions
  fetchBusinesses: () => Promise<void>;
  fetchBusinessById: (id: string) => Promise<BusinessWithInfo | null>;
  createBusiness: (
    name: string,
    ownerId: string,
    category?: string,
  ) => Promise<BusinessWithInfo>;
  updateBusiness: (
    id: string,
    updates: { name?: string; category?: string },
  ) => Promise<void>;
  updateBusinessInfo: (
    businessId: string,
    info: {
      description?: string;
      email?: string;
      phone?: string;
      website?: string;
      banner?: string;
    },
  ) => Promise<void>;
  updateBusinessAddress: (businessId: string, address: string) => Promise<void>;
  updateBusinessHours: (
    businessId: string,
    hours: {
      day: number;
      open_time: string | null;
      close_time: string | null;
      is_closed: number;
    }[],
  ) => Promise<void>;
  uploadBusinessBanner: (
    businessId: string,
    fileUri: string,
  ) => Promise<string>;
  clearSelectedBusiness: () => void;
  setPosts: (posts: BusinessPost[]) => void;
  setError: (error: string | null) => void;
};

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  businesses: [],
  selectedBusiness: null,
  loading: false,
  error: null,
  posts: [],

  fetchBusinesses: async () => {
    try {
      set({ loading: true, error: null });
      const businesses = await businessesApi.getAll();
      set({ businesses, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchBusinessById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const business = await businessesApi.getById(id);
      set({ selectedBusiness: business, loading: false });
      return business;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  createBusiness: async (name: string, ownerId: string, category?: string) => {
    try {
      set({ loading: true, error: null });
      const newBusiness = await businessesApi.create({
        name,
        ownerid: ownerId,
        category,
      });

      const fullBusiness = await businessesApi.getById(newBusiness.id);

      set((state) => ({
        businesses: fullBusiness
          ? [fullBusiness, ...state.businesses]
          : state.businesses,
        loading: false,
      }));

      return fullBusiness!;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateBusiness: async (
    id: string,
    updates: { name?: string; category?: string },
  ) => {
    try {
      set({ loading: true, error: null });
      await businessesApi.update(id, updates);

      // Refresh the business list
      const businesses = await businessesApi.getAll();
      const selectedBusiness = get().selectedBusiness;

      set({
        businesses,
        selectedBusiness:
          selectedBusiness?.id === id
            ? businesses.find((b) => b.id === id) || null
            : selectedBusiness,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateBusinessInfo: async (businessId: string, info) => {
    try {
      set({ loading: true, error: null });
      const currentBusiness = await businessesApi.getById(businessId);
      const existingInfo = currentBusiness?.business_information;

      await businessesApi.upsertInfo(businessId, {
        description: info.description ?? existingInfo?.description ?? null,
        email: info.email ?? existingInfo?.email ?? null,
        phone: info.phone ?? existingInfo?.phone ?? null,
        website: info.website ?? existingInfo?.website ?? null,
        banner: info.banner ?? existingInfo?.banner ?? null,
      });

      // Refresh the selected business if it matches
      const selectedBusiness = get().selectedBusiness;
      if (selectedBusiness?.id === businessId) {
        const refreshed = await businessesApi.getById(businessId);
        set({ selectedBusiness: refreshed, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  uploadBusinessBanner: async (businessId: string, fileUri: string) => {
    try {
      set({ loading: true, error: null });
      const bannerUrl = await businessesApi.uploadBanner(businessId, fileUri);
      await get().updateBusinessInfo(businessId, { banner: bannerUrl });
      set({ loading: false });
      return bannerUrl;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateBusinessAddress: async (businessId: string, address: string) => {
    try {
      set({ loading: true, error: null });
      await businessesApi.upsertAddress(businessId, address);

      // Refresh the selected business if it matches
      const selectedBusiness = get().selectedBusiness;
      if (selectedBusiness?.id === businessId) {
        const refreshed = await businessesApi.getById(businessId);
        set({ selectedBusiness: refreshed, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateBusinessHours: async (businessId, hours) => {
    try {
      set({ loading: true, error: null });
      await businessesApi.upsertHours(businessId, hours);

      // Refresh business data
      const businesses = await businessesApi.getAll();
      set({ businesses, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  clearSelectedBusiness: () => set({ selectedBusiness: null }),

  setPosts: (posts) => {
    set({ posts });
  },

  setError: (error) => set({ error }),
}));
