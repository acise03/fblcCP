/**
 * Business Tab Layout
 *
 * Defines the bottom-tab navigator for business-owner mode.
 * Tabs: Home (dashboard), Social (post management), About (business config).
 * Redirects unauthenticated users back to the login screen.
 */
import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import Feather from "@expo/vector-icons/Feather";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	/** Auth guard – redirect to login if no active session */
	const isAuth = useAuthStore((state) => state.session !== null);
	if (!isAuth) return <Redirect href="/login" />;
	const insets = useSafeAreaInsets();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors["light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarShowLabel: false,
				tabBarItemStyle: {
					paddingTop: 8,
				},
				tabBarStyle: {
					paddingTop: 8,
					backgroundColor: "#FFF8F0",
					height:
						56 + (Platform.OS === "ios" ? Math.min(insets.bottom, 10) : 0),
					paddingBottom: Platform.OS === "ios" ? Math.min(insets.bottom, 8) : 6,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<Feather name="home" size={24} color="black" />
					),
				}}
			/>
			<Tabs.Screen
				name="social"
				options={{
					title: "Social",
					tabBarIcon: ({ color }) => (
						<Feather name="edit-3" size={24} color="black" />
					),
				}}
			/>
			<Tabs.Screen
				name="about"
				options={{
					title: "About",
					tabBarIcon: ({ color }) => (
						<Feather name="briefcase" size={24} color="black" />
					),
				}}
			/>
			<Tabs.Screen
				name="post"
				options={{
					href: null,
				}}
			/>
		</Tabs>
	);
}
