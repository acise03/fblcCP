import { businessesApi } from "@/db/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import "../../global.css";
import AnnouncementItem from "../components/announcementItem";
import ProfilePicture from "../components/profilePicture";

export default function BusinessSocial() {
  const posts = useBusinessStore((state) => state.posts);
  const setPosts = useBusinessStore((state) => state.setPosts);
  const setMode = useModalSettingsStore((state) => state.setMode);
  const router = useRouter();
  const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
  useFocusEffect(() => {
    setMode("business");
    return () => {};
  });

  useEffect(() => {
    const fetchPosts = async () => {
      if (!ownedBusiness?.id) return;
      businessesApi.getPostsByBusiness(ownedBusiness.id).then((posts) => {
        setPosts(posts);
      });
    };
    fetchPosts();
  }, [ownedBusiness?.id]);

  return (
    <View className="h-full w-full bg-[#FFF8F0]">
      <View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0]">
        <View className="flex flex-row items-center justify-between">
          <Text className="font-bold text-4xl text-black dark:text-white">
            Community
          </Text>
          <ProfilePicture />
        </View>

        <View className="flex flex-col flex-1 mt-6">
          <View className="flex flex-row items-center justify-between">
            <Text className="dark:text-gray-300 text-zinc-700 font-semibold text-3xl mb-2">
              Events
            </Text>
            <Pressable onPress={() => router.push("/post")}>
              <Ionicons name="add-circle-sharp" size={30} color="orange" />
            </Pressable>
          </View>
          <FlatList
            className="mt-2"
            data={posts}
            renderItem={({ item }) => {
              if (item.type == "announcement") {
                return <AnnouncementItem announcement={item} />;
              } else {
                // const pollObject = item.getPoll();
                // return (
                // 	<PollItem
                // 		text={pollObject.text}
                // 		date={pollObject.date}
                // 		votes={pollObject.votes}
                // 		comments={pollObject.comments}
                // 	/>
                // );
                return <></>;
              }
            }}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="h-2" />}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 8, paddingHorizontal: 0 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}
