import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";
import type {
    Business,
    BusinessAddress,
    BusinessHoursRow,
    BusinessInfo,
    BusinessPost,
} from "../schema";

export type BusinessWithInfo = Business & {
  business_information: BusinessInfo | null;
  business_addresses: BusinessAddress | null;
  business_hours?: BusinessHoursRow[];
  average_rating?: number;
  review_count?: number;
};

export const businessesApi = {
  async uploadBanner(businessId: string, fileUri: string): Promise<string> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Auth session before upload:", session?.user?.id);

    const response = await fetch(fileUri);
    const blob = await response.blob();

    const cleanUri = fileUri.split("?")[0];
    const extension = (cleanUri.split(".").pop() || "jpg").toLowerCase();
    const filePath = `${businessId}/banner-${Date.now()}.${extension}`;

    const file = new File(fileUri);
    const fileBytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("business-banners")
      .upload(filePath, fileBytes, {
        upsert: true,
        contentType: `image/${extension}`,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("business-banners")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadProfilePicture(
    businessId: string,
    fileUri: string,
  ): Promise<string> {
    const cleanUri = fileUri.split("?")[0];
    const extension = (cleanUri.split(".").pop() || "jpg").toLowerCase();
    const filePath = `${businessId}/profile-${Date.now()}.${extension}`;

    const file = new File(fileUri);
    const fileBytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("business-banners")
      .upload(filePath, fileBytes, {
        upsert: true,
        contentType: `image/${extension}`,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("business-banners")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async getAll(): Promise<BusinessWithInfo[]> {
    const { data, error } = await supabase
      .from("businesses")
      .select(
        `
        *,
        business_information (*),
        business_addresses (*),
        business_hours (*),
        reviews (rating)
      `,
      )
      .order("name");

    if (error) throw error;

    // Calculate average rating and review count
    return data.map((business: any) => ({
      ...business,
      average_rating: business.reviews?.length
        ? business.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          business.reviews.length
        : null,
      review_count: business.reviews?.length || 0,
      reviews: undefined, // Remove raw reviews array
    }));
  },

  async getById(id: string): Promise<BusinessWithInfo | null> {
    const { data, error } = await supabase
      .from("businesses")
      .select(
        `
        *,
        business_information (*),
        business_addresses (*),
        business_hours (*),
        reviews (rating)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      ...data,
      average_rating: data.reviews?.length
        ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          data.reviews.length
        : null,
      review_count: data.reviews?.length || 0,
      reviews: undefined,
    };
  },

  async getByOwner(ownerId: string): Promise<BusinessWithInfo | null> {
    const { data, error } = await supabase
      .from("businesses")
      .select(
        `
        *,
        business_information (*),
        business_addresses (*),
        business_hours (*)
      `,
      )
      .eq("ownerid", ownerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  },

  async create(business: {
    name: string;
    ownerid: string;
    category?: string;
  }): Promise<Business> {
    const { data, error } = await supabase
      .from("businesses")
      .insert(business)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<Omit<Business, "id" | "ownerid">>,
  ): Promise<Business> {
    const { data, error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("businesses").delete().eq("id", id);

    if (error) throw error;
  },

  // Business Information
  async upsertInfo(
    businessId: string,
    info: Omit<BusinessInfo, "id">,
  ): Promise<BusinessInfo> {
    const { data, error } = await supabase
      .from("business_information")
      .upsert({ id: businessId, ...info })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Business Address
  async upsertAddress(
    businessId: string,
    address: string,
  ): Promise<BusinessAddress> {
    const { data, error } = await supabase
      .from("business_addresses")
      .upsert({ id: businessId, address })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsertPost(post: {
    businessId: string;
    type: string;
    highlight?: string;
    text: string;
    date: string;
    start_date?: string | null;
    end_date?: string | null;
  }): Promise<void> {
    const { error } = await supabase.from("business_posts").upsert({
      businessid: post.businessId,
      type: post.type,
      highlight: post.highlight ?? null,
      text: post.text,
      date: post.date,
      start_date: post.start_date ?? null,
      end_date: post.end_date ?? null,
    });

    if (error) throw error;
  },

  async editPost(
    postId: string,
    updates: Partial<Omit<BusinessPost, "id" | "businessid">>,
  ): Promise<BusinessPost> {
    const { data, error } = await supabase
      .from("business_posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from("business_posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;
  },

  async getPostsByBusiness(businessId: string): Promise<BusinessPost[]> {
    const { data, error } = await supabase
      .from("business_posts")
      .select("*")
      .eq("businessid", businessId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async upsertHours(
    businessId: string,
    hours: {
      day: number;
      open_time: string | null;
      close_time: string | null;
      is_closed: number;
    }[],
  ): Promise<BusinessHoursRow[]> {
    const rows = hours.map((h) => ({
      id: businessId,
      day: h.day,
      open_time: h.open_time,
      close_time: h.close_time,
      is_closed: h.is_closed,
    }));

    const { data, error } = await supabase
      .from("business_hours")
      .upsert(rows, { onConflict: "id,day" })
      .select();

    if (error) throw error;
    return data;
  },

  async getHours(businessId: string): Promise<BusinessHoursRow[]> {
    const { data, error } = await supabase
      .from("business_hours")
      .select("*")
      .eq("id", businessId)
      .order("day");

    if (error) throw error;
    return data;
  },

  async getAllPosts(): Promise<BusinessPost[]> {
    const { data, error } = await supabase
      .from("business_posts")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },
};
