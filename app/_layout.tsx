import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import ModalReviews from "./components/modalReview";
import ModalSettings from "./components/modalSettings";

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const Container = Platform.OS === "web" ? View : SafeAreaView;
  const modalSettings = useModalSettingsStore((state) => state.visible);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Container className="flex-1">
          <Stack>
            <Stack.Screen name="(customer)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(business)" options={{ headerShown: false }} />
          </Stack>
          <ModalSettings />
          <ModalReviews />
          <StatusBar
            style="dark"
            backgroundColor="#FFF8F0"
            translucent={false}
          />
        </Container>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
