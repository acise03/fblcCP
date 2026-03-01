import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable } from "react-native";

import {
    businessesApi,
    BusinessWithInfo,
    ReviewWithUser,
    usersApi,
} from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { useReviewStore } from "@/store/useReviewStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ScrollView, Text, View } from "react-native";
import "../../global.css";
import AnnouncementItemCustomer from "../components/announcementItemCustomer";
import ProfilePicture from "../components/profilePicture";
import ReviewItemCustomer from "../components/reviewItemCustomer";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function BusinessDetails() {
  const setMode = useModalSettingsStore((state) => state.setMode);
  const fetchBusiness = useBusinessStore((state) => state.fetchBusinessById);
  const fetchReviews = useReviewStore((state) => state.fetchReviewsForBusiness);
  const deleteReview = useReviewStore((state) => state.deleteReview);
  const activeBusiness = useModalReviewStore((state) => state.activeBusiness);
  const [business, setBusiness] = useState<BusinessWithInfo | null>();
  const [reviews, setReviews] = useState<ReviewWithUser[] | null>();
  const dbReviews = useReviewStore((state) => state.reviews);
  const [usernameById, setUsernameById] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const setVisible = useModalReviewStore((state) => state.setVisible);
  const setEdit = useModalReviewStore((state) => state.setEdit);
  const userId = useAuthStore((state) => state.user!!.id);
  const favs = useAuthStore((state) => state.favBusinesses);
  const setFavs = useAuthStore((state) => state.setFavs);

  useEffect(() => {
    if (!activeBusiness) {
      router.back();
      return;
    }
    let cancelled = false;
    (async () => {
      const b = await fetchBusiness(activeBusiness);
      if (!b || cancelled) return;
      setBusiness(b);
      const r = await fetchReviews(b.id);
      console.log(r);
      setReviews(r);
      const p = await businessesApi.getPostsByBusiness(b.id);
      setPosts(p);
    })();
    return () => {
      cancelled = true;
    };
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

  useFocusEffect(() => {
    setMode("customer");
    return () => {};
  });

  if (!activeBusiness) return null;
  if (!business) return <Text>Loading</Text>;

  // Sort posts by date descending (latest first), show max 2
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const visiblePosts = sortedPosts.slice(0, 2);

  // Sort reviews: user's own first, then by date descending, show max 2
  const sortedReviews =
    reviews != null && reviews.length > 0
      ? [...reviews].sort((a, b) => {
          const aPinned = a.reviewerid === userId ? 1 : 0;
          const bPinned = b.reviewerid === userId ? 1 : 0;
          if (bPinned !== aPinned) return bPinned - aPinned;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
      : [];
  const visibleReviews = sortedReviews.slice(0, 2);

  return (
    <View className="h-full w-full bg-[#FFF8F0]">
      <View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0]">
        <View className="flex flex-row items-center justify-between mb-2">
          <Text className="font-bold text-3xl text-black">{business.name}</Text>
          <ProfilePicture />
        </View>

        <ScrollView
          className="flex-1 w-full"
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <View className="relative mb-4">
            <Image
              source={{ uri: business.business_information?.banner!! }}
              className="w-full h-40 rounded-3xl"
            />
            <Pressable
              onPress={async () => {
                if (!favs || !favs.includes(business.id)) {
                  await usersApi.addFavorite(userId, business.id);
                } else {
                  await usersApi.removeFavorite(userId, business.id);
                }
                const updated = await usersApi.getFavorite(userId);
                setFavs(updated);
              }}
              className="absolute top-3 right-3 p-1"
            >
              {!favs || !favs.includes(business.id) ? (
                <FontAwesome name="heart-o" size={20} color="white" />
              ) : (
                <FontAwesome name="heart" size={20} color="white" />
              )}
            </Pressable>
          </View>

          {/* About */}
          <View className="flex flex-col items-start mb-4 gap-2">
            <Text className="text-2xl font-semibold text-black">About</Text>
            <Text className="text-base text-black w-full">
              {business.business_information?.description}
            </Text>
          </View>

          {/* Announcements */}
          <View className="flex flex-col items-start mb-4 gap-2 w-full">
            <Pressable
              onPress={() => router.push("/(customer)/allAnnouncements")}
            >
              <Text className="text-2xl font-semibold text-black">
                Announcements
              </Text>
            </Pressable>

            {visiblePosts.length > 0 ? (
              visiblePosts.map((item, index) => (
                <View
                  key={item.id}
                  className={index > 0 ? "mt-2 w-full" : "w-full"}
                >
                  <AnnouncementItemCustomer announcement={item} />
                </View>
              ))
            ) : (
              <Text className="text-base text-gray-400">
                No announcements yet
              </Text>
            )}
          </View>

          {/* Reviews */}
          <View className="flex flex-col items-start mb-4 gap-2">
            <Pressable onPress={() => router.push("/(customer)/allReviews")}>
              <Text className="text-2xl font-semibold text-black">Reviews</Text>
            </Pressable>

            <View className="w-full">
              {visibleReviews.length > 0 ? (
                visibleReviews.map((review) => (
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
                          fetchReviews(activeBusiness).then((res) => {
                            setReviews(res);
                          });
                        },
                      })}
                    />
                  </View>
                ))
              ) : (
                <Text className="text-base text-gray-400">No reviews yet</Text>
              )}
            </View>

            <Pressable
              onPress={() => setVisible(true)}
              className="w-full bg-[#FFB627] rounded-xl py-3 items-center justify-center mt-1 active:opacity-50"
            >
              <Text className="text-black font-semibold text-base">
                Leave a review
              </Text>
            </Pressable>
          </View>

          {/* Working Hours */}
          {business?.business_hours && business.business_hours.length > 0 && (
            <View className="flex flex-col items-start mb-4 gap-2">
              <Text className="text-2xl font-semibold text-black">
                Working Hours
              </Text>
              <View className="w-full border border-zinc-300 rounded-xl overflow-hidden">
                {[6, 0, 1, 2, 3, 4, 5].map((dayIndex, i) => {
                  const entry = business.business_hours?.find(
                    (h) => h.day === dayIndex,
                  );
                  return (
                    <View
                      key={dayIndex}
                      className={`flex flex-row justify-between px-4 py-3 ${
                        i !== 6 ? "border-b border-zinc-200" : ""
                      }`}
                    >
                      <Text className="text-zinc-700 text-base font-medium">
                        {DAY_NAMES[dayIndex]}
                      </Text>
                      <Text className="text-zinc-500 text-base">
                        {!entry || entry.is_closed === 1
                          ? "Closed"
                          : `${entry.open_time} - ${entry.close_time}`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-4" />
        </ScrollView>
      </View>
    </View>
  );
}
