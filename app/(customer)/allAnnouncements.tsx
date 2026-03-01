import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import "../../global.css";
import AnnouncementItemCustomer from "../components/announcementItemCustomer";
import Feather from "@expo/vector-icons/Feather";

export default function AllAnnouncements() {
  const activeBusiness = useModalReviewStore((state) => state.activeBusiness);
  const [posts, setPosts] = useState<BusinessPost[]>([]);

  useEffect(() => {
    if (!activeBusiness) {
      router.back();
      return;
    }
    businessesApi.getPostsByBusiness(activeBusiness).then(setPosts);
  }, [activeBusiness]);

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <View className="h-full w-full bg-[#FFF8F0]">
      <View className="mx-8 mt-8 flex flex-1 flex-col">
        <View className="flex-row items-center mb-4 gap-3">
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="black" />
          </Pressable>
          <Text className="font-bold text-3xl text-black">Announcements</Text>
        </View>

        <ScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false}>
          {sortedPosts.length > 0 ? (
            sortedPosts.map((item, index) => (
              <View key={item.id} className={index > 0 ? "mt-3 w-full" : "w-full"}>
                <AnnouncementItemCustomer announcement={item} />
              </View>
            ))
          ) : (
            <Text className="text-base text-gray-400">No announcements yet</Text>
          )}
          <View className="h-8" />
        </ScrollView>
      </View>
    </View>
  );
}
