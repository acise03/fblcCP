import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function AccountSettings() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <ScrollView
      className="h-screen w-screen"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="h-full w-full bg-[#FFF8F0]">
        <View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0] justify-center">
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
