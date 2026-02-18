import { reviewsApi, ReviewWithUser } from "@/db/api/reviews";
import type { Review } from "@/db/schema";
import { create } from "zustand";

type ReviewStore = {
	reviews: ReviewWithUser[];
	userReview: Review | null;
	loading: boolean;
	error: string | null;

	// Actions
	fetchReviewsForBusiness: (
		businessId: string,
	) => Promise<ReviewWithUser[] | null>;
	fetchUserReviewForBusiness: (
		userId: string,
		businessId: string,
	) => Promise<Review | null>;
	createReview: (review: {
		businessid: string;
		reviewerid: string;
		rating: number;
		review?: string;
	}) => Promise<Review>;
	updateReview: (
		id: string,
		updates: { rating?: number; review?: string },
	) => Promise<void>;
	deleteReview: (id: string) => Promise<void>;
	clearReviews: () => void;
	setError: (error: string | null) => void;
};

export const useReviewStore = create<ReviewStore>((set, get) => ({
	reviews: [],
	userReview: null,
	loading: false,
	error: null,

	fetchReviewsForBusiness: async (businessId: string) => {
		try {
			set({ loading: true, error: null });
			const reviews = await reviewsApi.getByBusiness(businessId);
			set({ reviews, loading: false });
			return reviews;
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
			return null;
		}
	},

	fetchUserReviewForBusiness: async (userId: string, businessId: string) => {
		try {
			set({ loading: true, error: null });
			const userReview = await reviewsApi.getUserReviewForBusiness(
				userId,
				businessId,
			);
			set({ userReview, loading: false });
			return userReview ?? null;
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
			return null;
		}
	},

	createReview: async (review) => {
		try {
			set({ loading: true, error: null });
			const newReview = await reviewsApi.create(review);

			// Refresh reviews for this business
			const reviews = await reviewsApi.getByBusiness(review.businessid);

			set({
				reviews,
				userReview: newReview,
				loading: false,
			});

			return newReview;
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
			throw error;
		}
	},

	updateReview: async (id: string, updates) => {
		try {
			set({ loading: true, error: null });
			const updatedReview = await reviewsApi.update(id, updates);

			set((state) => ({
				reviews: state.reviews.map((r) =>
					r.id === id ? { ...r, ...updatedReview } : r,
				),
				userReview:
					state.userReview?.id === id
						? { ...state.userReview, ...updatedReview }
						: state.userReview,
				loading: false,
			}));
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
			throw error;
		}
	},

	deleteReview: async (id: string) => {
		try {
			set({ loading: true, error: null });
			await reviewsApi.delete(id);

			set((state) => ({
				reviews: state.reviews.filter((r) => r.id !== id),
				userReview: state.userReview?.id === id ? null : state.userReview,
				loading: false,
			}));
		} catch (error) {
			set({ error: (error as Error).message, loading: false });
			throw error;
		}
	},

	clearReviews: () => set({ reviews: [], userReview: null }),

	setError: (error) => set({ error }),
}));
