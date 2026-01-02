import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
	anchor: "(business)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
    const Container = Platform.OS === "web" ? View : SafeAreaView;

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Container style={{ flex: 1 }}>
                <Stack>
					<Stack.Screen name="(business)" options={{ headerShown: false }} />
					<Stack.Screen
						name="modal"
						options={{ presentation: "modal", title: "Modal" }}
					/>
				</Stack>
                <StatusBar style="auto" />
            </Container>
		</ThemeProvider>
	);
}
