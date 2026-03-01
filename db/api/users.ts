import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";
import type { User } from "../schema";

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

  async uploadProfilePicture(userId: string, fileUri: string): Promise<string> {
    const cleanUri = fileUri.split("?")[0];
    const extension = (cleanUri.split(".").pop() || "jpg").toLowerCase();
    const filePath = `${userId}/profile-${Date.now()}.${extension}`;

    const file = new File(fileUri);
    const fileBytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, fileBytes, {
        upsert: true,
        contentType: `image/${extension}`,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    // Update the user record with the new profile picture URL
    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_picture: data.publicUrl })
      .eq("id", userId);

    if (updateError) throw updateError;

    return data.publicUrl;
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

  async getFavorite(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("favorite_businesses")
      .select("businessid")
      .eq("userid", userId);

    if (error) throw error;
    return data.map((row) => row.businessid);
  },

  async addFavorite(userId: string, businessId: string): Promise<void> {
    const { error } = await supabase
      .from("favorite_businesses")
      .upsert({ userid: userId, businessid: businessId });
    if (error) throw error;
  },

  async removeFavorite(userId: string, businessId: string): Promise<void> {
    const { error } = await supabase
      .from("favorite_businesses")
      .delete()
      .eq("userid", userId)
      .eq("businessid", businessId);
    if (error) throw error;
  },

  async isFavorite(userId: string, businessId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from("favorite_businesses")
      .select("userid", { count: "exact", head: true })
      .eq("userid", userId)
      .eq("businessid", businessId);

    if (error) throw error;
    return (count ?? 0) > 0;
  },
};
