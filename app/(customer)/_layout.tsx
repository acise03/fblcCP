import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import Feather from "@expo/vector-icons/Feather";
import { Redirect, Tabs } from "expo-router";

import React from "react";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const isAuth = useAuthStore((state) => state.session !== null);
	if (!isAuth) return <Redirect href="/login" />;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
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
				name="businessDeals"
				options={{
					title: "View Business",
					tabBarIcon: ({ color }) => (
						<Feather name="table" size={24} color="black" />
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
				name="calendar"
				options={{
					title: "Calendar",
					tabBarIcon: ({ color }) => (
						<Feather name="calendar" size={24} color="black" />
					),
				}}
			/>
		</Tabs>
	);
}
