import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, View } from "react-native";
import "../../global.css";
import ExpandableText from "./expandableText";

type ActivityItemProps = {
  rating: number;
  comment: string;
  username: string;
  profilePicture?: string | null;
};

export default function ActivityItem({
  rating,
  comment,
  username,
  profilePicture,
}: ActivityItemProps) {
  const reviewText = comment
    ? `Left a review: ${rating}/5; ${comment}`
    : `Left a review: ${rating}/5`;

  return (
    <View className="flex flex-row items-center rounded-2xl bg-[#FFE4A3] w-full px-4 py-3">
      {profilePicture ? (
        <Image
          source={{ uri: profilePicture }}
          className="rounded-full w-12 h-12 bg-gray-300"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
          <Ionicons name="person-outline" size={28} color="#222" />
        </View>
      )}
      <View className="ml-4 flex-1 flex-col">
        <Text className="text-xl font-bold" style={{ fontFamily: "Rubik" }}>
          {username}
        </Text>
        <ExpandableText
          className="text-base font-medium"
          style={{ fontFamily: "Rubik" }}
          numberOfLines={4}
        >
          {reviewText}
        </ExpandableText>
      </View>
    </View>
  );
}
