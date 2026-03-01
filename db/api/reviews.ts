import { supabase } from "@/lib/supabase";
import type { Review, User } from "../schema";

export type ReviewWithUser = Review & {
  users: Pick<User, "firstname" | "lastname" | "profile_picture"> | null;
};

export const reviewsApi = {
  async getByBusiness(businessId: string): Promise<ReviewWithUser[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users (firstname, lastname, profile_picture)
      `,
      )
      .eq("businessid", businessId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByUser(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("reviewerid", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserReviewForBusiness(
    userId: string,
    businessId: string,
  ): Promise<Review | null> {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("reviewerid", userId)
      .eq("businessid", businessId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async create(review: {
    businessid: string;
    reviewerid: string;
    rating: number;
    review?: string;
  }): Promise<Review> {
    const { data, error } = await supabase
      .from("reviews")
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: { rating?: number; review?: string },
  ): Promise<Review> {
    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) throw error;
  },

  async getAverageRating(
    businessId: string,
  ): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("businessid", businessId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = data.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: total / data.length,
      count: data.length,
    };
  },
};
