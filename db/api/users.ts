import { supabase } from "@/lib/supabase";
import type { User, NewUser } from "../schema";

export const usersApi = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  },

  async update(id: string, updates: Partial<Omit<User, "id">>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAddress(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("addresses")
      .select("address")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data?.address || null;
  },

  async upsertAddress(userId: string, address: string): Promise<void> {
    const { error } = await supabase
      .from("addresses")
      .upsert({ id: userId, address });

    if (error) throw error;
  },
};
