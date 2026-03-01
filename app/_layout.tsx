import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      Rubik: require("../assets/fonts/Rubik-VariableFont_wght.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      <ThemeProvider value={DefaultTheme}>
        <Container style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
          <Stack>
            <Stack.Screen name="(customer)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(business)" options={{ headerShown: false }} />
            <Stack.Screen
              name="accountSettings"
              options={{ headerShown: false }}
            />
          </Stack>
          <ModalSettings />
          <ModalReviews />
          <StatusBar
            style="dark"
            backgroundColor="#FFF8F0"
            translucent={true}
          />
        </Container>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
