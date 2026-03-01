import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

type AnnouncementItemCustomerProps = {
  announcement: BusinessPost;
};

const postTypeLabels: Record<string, string> = {
  announcement: "📢 Announcement",
  sale: "🏷️ Sale",
  coupon: "🎟️ Coupon",
};

export default function AnnouncementItemCustomer({
  announcement,
}: AnnouncementItemCustomerProps) {
  const [businessName, setBusinessName] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const setActive = useModalReviewStore((state) => state.setBusiness);

  useEffect(() => {
    businessesApi.getById(announcement.businessid).then((business) => {
      setBusinessName(business?.name ?? "");
      setProfilePicture(
        business?.business_information?.profile_picture ?? null,
      );
    });
  }, [announcement.businessid]);

  return (
    <Pressable
      className="p-4 flex flex-row items-center rounded-2xl bg-[#FFB62799] w-full"
      onPress={() => {
        router.push("/(customer)/businessDetails");
        setActive(announcement.businessid);
      }}
    >
      {/* Static darker gray circle aligned with businessName */}
      <View className="flex flex-col flex-1">
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#d1d5db",
                marginRight: 8,
              }}
            />
          ) : (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#FFF8F0",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <Ionicons name="briefcase-outline" size={14} color="black" />
            </View>
          )}
          <Text className="text-lg font-bold" style={{ fontFamily: "Rubik" }}>
            {businessName}
          </Text>
        </View>
        <Text
          className="text-base font-normal mt-2"
          style={{ fontFamily: "Rubik" }}
        >
          {announcement.text}
        </Text>
        {/* <Text className="text-sm text-gray-500">
          {new Date(announcement.date).toLocaleDateString()}
        </Text> */}
      </View>
    </Pressable>
  );
}
