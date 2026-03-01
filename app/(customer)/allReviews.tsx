import { ReviewWithUser, usersApi } from "@/db/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { useReviewStore } from "@/store/useReviewStore";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import "../../global.css";
import ReviewItemCustomer from "../components/reviewItemCustomer";

export default function AllReviews() {
  const activeBusiness = useModalReviewStore((state) => state.activeBusiness);
  const fetchReviews = useReviewStore((state) => state.fetchReviewsForBusiness);
  const deleteReview = useReviewStore((state) => state.deleteReview);
  const dbReviews = useReviewStore((state) => state.reviews);
  const setVisible = useModalReviewStore((state) => state.setVisible);
  const setEdit = useModalReviewStore((state) => state.setEdit);
  const userId = useAuthStore((state) => state.user!!.id);

  const [reviews, setReviews] = useState<ReviewWithUser[] | null>(null);
  const [usernameById, setUsernameById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!activeBusiness) {
      router.back();
      return;
    }
    fetchReviews(activeBusiness).then(setReviews);
  }, [activeBusiness]);

  useEffect(() => {
    setReviews(dbReviews);
  }, [dbReviews]);

  useEffect(() => {
    if (!reviews?.length) {
      setUsernameById({});
      return;
    }

    let cancelled = false;

    (async () => {
      const ids = [
        ...new Set(reviews.map((r) => r.reviewerid).filter(Boolean)),
      ];

      const pairs = await Promise.all(
        ids.map(async (id) => {
          const user = await usersApi.getById(id!!);
          const fullName = user
            ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
            : "";
          return [id, fullName || id] as const;
        }),
      );

      if (!cancelled) {
        setUsernameById(Object.fromEntries(pairs));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reviews]);

  const sortedReviews =
    reviews != null && reviews.length > 0
      ? [...reviews].sort((a, b) => {
          const aPinned = a.reviewerid === userId ? 1 : 0;
          const bPinned = b.reviewerid === userId ? 1 : 0;
          if (bPinned !== aPinned) return bPinned - aPinned;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
      : [];

  return (
    <View className="h-full w-full bg-[#FFF8F0]">
      <View className="mx-8 mt-8 flex flex-1 flex-col">
        <View className="flex-row items-center mb-4 gap-3">
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="black" />
          </Pressable>
          <Text className="font-bold text-3xl text-black">Reviews</Text>
        </View>

        <ScrollView
          className="flex-1 w-full"
          showsVerticalScrollIndicator={false}
        >
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <View key={review.id} className="mb-3 w-full">
                <ReviewItemCustomer
                  review={review}
                  username={usernameById[review.reviewerid!!] ?? ""}
                  {...(review.reviewerid == userId && {
                    onEdit: () => {
                      setVisible(true);
                      setEdit(true);
                    },
                    onDelete: () => {
                      deleteReview(review.id);
                      fetchReviews(activeBusiness!).then(setReviews);
                    },
                  })}
                />
              </View>
            ))
          ) : (
            <Text className="text-base text-gray-400">No reviews yet</Text>
          )}

          <Pressable
            onPress={() => setVisible(true)}
            className="w-full bg-[#FFB627] rounded-xl py-3 items-center justify-center mt-1 active:opacity-50"
          >
            <Text className="text-black font-semibold text-base">
              Leave a review
            </Text>
          </Pressable>

          <View className="h-8" />
        </ScrollView>
      </View>
    </View>
  );
}
