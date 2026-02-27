import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import Feather from "@expo/vector-icons/Feather";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const isAuth = useAuthStore((state) => state.session !== null);
	if (!isAuth) return <Redirect href="/login" />;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors["light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarShowLabel: false,
				tabBarStyle: {
					paddingTop: 8,
					height: 64,
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
		</Tabs>
	);
}
