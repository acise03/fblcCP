import { businessesApi, BusinessWithInfo } from "@/db/api/businesses";
import { create } from "zustand";

type BusinessStore = {
  businesses: BusinessWithInfo[];
  selectedBusiness: BusinessWithInfo | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchBusinesses: () => Promise<void>;
  fetchBusinessById: (id: string) => Promise<void>;
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
  clearSelectedBusiness: () => void;
  setError: (error: string | null) => void;
};

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  businesses: [],
  selectedBusiness: null,
  loading: false,
  error: null,

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
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
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

  updateBusiness: async (id: string, updates: { name?: string }) => {
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
      await businessesApi.upsertInfo(businessId, info);

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

  clearSelectedBusiness: () => set({ selectedBusiness: null }),

  setError: (error) => set({ error }),
}));
