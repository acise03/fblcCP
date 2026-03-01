import { ReviewWithUser } from "@/db/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, View } from "react-native";
import ExpandableText from "./expandableText";

type ReviewItemCustomerProps = {
  review: ReviewWithUser;
  username: string;
};

export default function ReviewItemCustomer({
  review,
  username,
}: ReviewItemCustomerProps) {
  const profilePicture = review.users?.profile_picture ?? null;

  return (
    <View className="p-4 flex flex-row items-center rounded-2xl bg-[#FFB62799] w-full">
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
              <Ionicons name="person-outline" size={14} color="black" />
            </View>
          )}
          <Text className="text-lg font-bold" style={{ fontFamily: "Rubik" }}>
            {username}
          </Text>
        </View>
        <ExpandableText
          className="text-base font-normal mt-2"
          style={{ fontFamily: "Rubik" }}
          numberOfLines={4}
        >
          {`${review.rating}/5; ${review.review ?? ""}`}
        </ExpandableText>
      </View>
    </View>
  );
}
