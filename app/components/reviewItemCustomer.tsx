import { ReviewWithUser } from "@/db/api";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, Text, View } from "react-native";
import ExpandableText from "./expandableText";

type ReviewItemCustomerProps = {
  review: ReviewWithUser;
  username: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ReviewItemCustomer({
  review,
  username,
  onEdit,
  onDelete,
}: ReviewItemCustomerProps) {
  const profilePicture = review.users?.profile_picture ?? null;

  return (
    <View className="p-4 flex flex-row items-start rounded-2xl bg-[#FFB62799] w-full">
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
      {(onEdit || onDelete) && (
        <View className="flex-row items-center gap-4 ml-3">
          {onEdit && (
            <Pressable onPress={onEdit} hitSlop={8}>
              <Feather name="edit-2" size={18} color="#000" />
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} hitSlop={8}>
              <Feather name="trash-2" size={18} color="#ef4444" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
