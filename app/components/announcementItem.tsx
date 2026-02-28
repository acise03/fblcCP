import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import "../../global.css";

type AnnouncementItemProps = {
  announcement: BusinessPost;
};

export default function AnnouncementItem({
  announcement,
}: AnnouncementItemProps) {
  const setPosts = useBusinessStore((state) => state.setPosts);
  const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(announcement.text);

  return (
    <View className="py-4 px-4 flex flex-row items-center rounded-2xl bg-[#FFE4A3] w-full">
      <View className="flex flex-col flex-1">
        {editing ? (
          <>
            <TextInput
              className="text-md font-medium bg-[#FFF8F0] rounded px-2 py-1"
              value={editText}
              onChangeText={setEditText}
            />
            <View className="flex flex-row mt-2 space-x-2">
              <Text
                className="px-2 py-1 bg-green-500 text-white rounded"
                onPress={async () => {
                  await businessesApi.editPost(announcement.id, {
                    text: editText,
                  });
                  businessesApi
                    .getPostsByBusiness(ownedBusiness!!.id)
                    .then((posts) => {
                      setPosts(posts);
                    });
                  setEditing(false);
                }}
              >
                Done
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text className="text-md font-medium">{announcement.text}</Text>
            <Text className="text-sm text-gray-500">
              {new Date(announcement.date).toLocaleDateString()}
            </Text>
            <View className="flex flex-row mt-2 space-x-2">
              <Text
                className="px-2 py-1 bg-[#FFF8F0] text-black rounded mr-3"
                onPress={() => setEditing(true)}
              >
                Edit
              </Text>
              <Text
                className="px-2 py-1 bg-red-500 text-white rounded"
                onPress={async () => {
                  await businessesApi.deletePost(announcement.id);
                  businessesApi
                    .getPostsByBusiness(ownedBusiness!!.id)
                    .then((posts) => {
                      setPosts(posts);
                    });
                }}
              >
                Delete
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
