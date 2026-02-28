import { useAuthStore } from "@/store/useAuthStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import { Link, useRouter } from "expo-router";
import { Image, Modal, Pressable, Text, View } from "react-native";
import "../../global.css";

export default function ModalSettings() {
  const modalVisible = useModalSettingsStore((state) => state.visible);
  const modalMode = useModalSettingsStore((state) => state.mode);
  const setVisible = useModalSettingsStore((state) => state.setVisible);
  const toggleMode = useModalSettingsStore((state) => state.toggleMode);
  const router = useRouter();
  const isBusiness = useAuthStore((state) => state.ownedBusiness !== null);

  return (
    <Modal transparent visible={modalVisible} animationType="slide">
      <Pressable className="h-full w-full" onPress={() => setVisible(false)}>
        <View className="flex justify-center items-center h-full">
          <View
            className="flex w-2/3 h-[22.5rem] shadow-md bg-[#FFF8F0] rounded-2xl p-4 items-center"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex flex-row justify-between items-center w-full">
              <Pressable onPress={() => setVisible(false)}>
                <Feather name="x" size={24} color="gray" />
              </Pressable>
              <Text className="text-lg">Menu</Text>
              <Image
                resizeMode="contain"
                className="rounded-full w-10 h-10 bg-gray-500"
              />
            </View>
            <Link
              href="/accountSettings"
              className="my-4"
              onPress={() => setVisible(false)}
            >
              Account Settings
            </Link>
            <Link href="/" className="my-4">
              Preferences
            </Link>
            <Link href="/" className="my-4">
              Theme
            </Link>
            <Link href="/" className="mt-4 mb-6">
              Language
            </Link>
            <Pressable
              onPress={() => {
                setVisible(false);
                toggleMode();
                isBusiness
                  ? modalMode === "business"
                    ? router.navigate("/(customer)")
                    : router.navigate("/(business)")
                  : router.navigate("/(customer)/createBusiness");
              }}
              className="flex-1 w-full bg-purple-100 justify-center items-center rounded-xl"
            >
              <Text>
                {isBusiness
                  ? modalMode === "business"
                    ? "Switch to Customer"
                    : "Switch to Business"
                  : "Create a Business"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
