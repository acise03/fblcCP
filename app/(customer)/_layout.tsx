import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import Feather from "@expo/vector-icons/Feather";
import { Redirect, Tabs } from "expo-router";

import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const colorScheme = useColorScheme();
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
				name="localMap"
				options={{
					title: "Map",
					tabBarIcon: ({ color }) => (
						<Feather name="map-pin" size={24} color="black" />
					),
				}}
			/>
			<Tabs.Screen
				name="schedule"
				options={{
					title: "Schedule",
					tabBarIcon: ({ color }) => (
						<Feather name="calendar" size={24} color="black" />
					),
				}}
			/>
			<Tabs.Screen name="businessDetails" options={{ href: null }} />
			<Tabs.Screen name="createBusiness" options={{ href: null }} />
			<Tabs.Screen name="allAnnouncements" options={{ href: null }} />
			<Tabs.Screen name="allReviews" options={{ href: null }} />
		</Tabs>
	);
}
