import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
  const setActive = useModalReviewStore((state) => state.setBusiness);

  useEffect(() => {
    businessesApi.getById(announcement.businessid).then((business) => {
      setBusinessName(business?.name ?? "");
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
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 18,
              backgroundColor: "#6B7280",
              marginRight: 8,
            }}
          />
          <Text className="text-lg font-bold" style={{ fontFamily: "Rubik" }}>
            {businessName}
          </Text>
        </View>
        <Text
          className="text-xs font-semibold text-gray-600 mt-1"
          style={{ fontFamily: "Rubik" }}
        >
          {postTypeLabels[announcement.type] ?? "📢 Announcement"}
        </Text>
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
