import { useAuthStore } from "@/store/useAuthStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";

export default function AccountSettings() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const signOut = useAuthStore((state) => state.signOut);
  const profile = useAuthStore((state) => state.profile);
  const uploadProfilePicture = useAuthStore(
    (state) => state.uploadProfilePicture,
  );
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    try {
      setUploading(true);
      await uploadProfilePicture(result.assets[0].uri);
      ToastAndroid.show("Profile picture updated", ToastAndroid.SHORT);
    } catch {
      ToastAndroid.show("Failed to upload picture", ToastAndroid.SHORT);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      className="h-screen w-screen"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="h-full w-full bg-[#FFF8F0]">
        <View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0] justify-center">
          {/* Profile Picture Section */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold mb-4">Profile Picture</Text>
            <Pressable onPress={handlePickImage} disabled={uploading}>
              {profile?.profile_picture ? (
                <Image
                  source={{ uri: profile.profile_picture }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: "#d1d5db",
                  }}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={120}
                  color="black"
                />
              )}
            </Pressable>
            <Pressable
              onPress={handlePickImage}
              disabled={uploading}
              className="mt-3 bg-[#FFB627] rounded-xl px-6 py-2"
            >
              <Text className="font-semibold">
                {uploading ? "Uploading..." : "Change Picture"}
              </Text>
            </Pressable>
          </View>

          <TextInput
            onChangeText={setPassword}
            value={password}
            placeholder="New Password"
            secureTextEntry={true}
          />
          <TextInput
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            placeholder="Confirm New Password"
            secureTextEntry={true}
          />
          {/* TODO need to add updatePassword function in auth.ts */}
          <Pressable onPress={() => {}}>
            <Text>Set</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              signOut();
              router.replace("/login");
            }}
          >
            <Text>Sign out</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
