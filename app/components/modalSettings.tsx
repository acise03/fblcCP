import { useAuthStore } from "@/store/useAuthStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { Link, useRouter } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";
import "../../global.css";

export default function ModalSettings() {
  const modalVisible = useModalSettingsStore((state) => state.visible);
  const modalMode = useModalSettingsStore((state) => state.mode);
  const setVisible = useModalSettingsStore((state) => state.setVisible);
  const toggleMode = useModalSettingsStore((state) => state.toggleMode);
  const router = useRouter();
  const isBusiness = useAuthStore((state) => state.ownedBusiness !== null);

  return (
    <Modal transparent visible={modalVisible} animationType="none">
      <Pressable className="h-full w-full" onPress={() => setVisible(false)}>
        <View className="flex items-end pt-24 pr-8 h-full">
          <View
            className="flex w-56 shadow-md bg-[#FFF8F0] rounded-2xl p-4 items-center"
            onStartShouldSetResponder={() => true}
          >
            <Link
              href="/accountSettings"
              className="my-3 font-medium"
              onPress={() => setVisible(false)}
            >
              Account Settings
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
              className="w-full mt-3 justify-center items-center rounded-xl py-3"
              style={{ backgroundColor: "rgba(255, 182, 39, 0.6)" }}
            >
              <Text className="font-medium">
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
