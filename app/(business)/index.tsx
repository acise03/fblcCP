/**
 * Business Dashboard (Home Tab)
 *
 * Displays an overview of the business owner’s profile:
 * - Banner image and business name
 * - Stats cards (average star rating, total reviews)
 * - Review feed rendered via FlatList
 *
 * Fetches reviews when the owned-business changes.
 */
import { ReviewWithUser } from "@/db/api/reviews";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import "../../global.css";
import ActivityItem from "../components/activityItem";
import ProfilePicture from "../components/profilePicture";

export default function BusinessHome() {
  // ---- Store selectors ----
  const setMode = useModalSettingsStore((state) => state.setMode);
  const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
  const refreshBusiness = useAuthStore((state) => state.refreshOwnedBusiness);
  const fetchReviews = useReviewStore((state) => state.fetchReviewsForBusiness);
  const fetchedReviews = useReviewStore((state) => state.reviews);
  const [reviews, setReviews] = useState<ReviewWithUser[]>();
  const userId = useAuthStore((state) => state.user!!.id);

  /** Compute average rating across all reviews, or "N/A" if empty */
  const averageBusinessRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
        ).toFixed(1)
      : "N/A";

  useFocusEffect(() => {
    setMode("business");
    return () => {};
  });

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      // if (!ownedBusiness) {
      // 	const oB = await refreshBusiness();
      // 	if (!mounted) return;
      // 	setOwnedBusiness(oB ?? undefined);
      // 	return;
      // }

      if (!ownedBusiness) return;

      const reviews = await fetchReviews(ownedBusiness.id);
      if (!mounted) return;
      setReviews(reviews ?? []);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [ownedBusiness]);

  const ListHeader = () => (
    <>
      <View className="flex flex-row items-center justify-between">
        <Text className="font-bold text-4xl text-black ">Dashboard</Text>
        <ProfilePicture />
      </View>
      <View className="relative w-full h-48 mt-8">
        <Image
          className="bg-gray-500 w-full h-full rounded-3xl"
          source={
            ownedBusiness?.business_information?.banner
              ? { uri: ownedBusiness.business_information.banner }
              : { uri: "" }
          }
        />
        <Text className="bottom-11 left-4 text-white font-bold text-2xl">
          {ownedBusiness?.name}
        </Text>
      </View>

      <View>
        <Text className="text-zinc-700 font-semibold text-2xl mt-4">Stats</Text>

        <View className="flex-row mt-2 gap-3">
          <View className="bg-[#FFE4A3] rounded-xl px-4 py-2 flex-1">
            <Text className="text-black font-bold text-3xl">
              {averageBusinessRating}
            </Text>
            <Text className="text-black text-lg">Star Rating</Text>
          </View>

          <View className="bg-[#FFE4A3] rounded-xl px-4 py-2 flex-1">
            <Text className="text-black font-bold text-3xl">
              {reviews?.length}
            </Text>
            <Text className="text-black text-lg">Total Reviews</Text>
          </View>
        </View>
      </View>

      <View className="flex flex-row items-center justify-between mt-6">
        <Text className="text-zinc-700 font-semibold text-2xl">Feed</Text>
      </View>
    </>
  );

  return (
    <View className="h-full w-full bg-[#FFF8F0]">
      <FlatList
        className="mx-8 mt-8"
        data={reviews}
        renderItem={({ item }) => {
          const name = item.users
            ? `${item.users.firstname ?? ""} ${item.users.lastname ?? ""}`.trim()
            : "Unknown";
          return (
            <ActivityItem
              rating={item.rating!!}
              comment={item.review ?? ""}
              username={name}
              profilePicture={item.users?.profile_picture}
            />
          );
        }}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
