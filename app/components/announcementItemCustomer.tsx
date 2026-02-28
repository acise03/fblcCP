import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

type AnnouncementItemCustomerProps = {
	announcement: BusinessPost;
};

export default function AnnouncementItemCustomer({
	announcement,
}: AnnouncementItemCustomerProps) {
	const [businessName, setBusinessName] = useState("");
	const setActive = useModalReviewStore((state) => state.setBusiness);

	useEffect(() => {
		businessesApi.getById(announcement.businessid).then((business) => {
			setBusinessName(business?.name ?? "");
		});
	}, [announcement.businessid]);

	return (
		<Pressable
			className="p-4 flex flex-row items-center rounded-2xl bg-[#FFE4A3] w-full"
			onPress={() => {
				router.push("/(customer)/businessDetails");
				setActive(announcement.businessid);
			}}
		>
			<View className="px-4 flex flex-col flex-1">
				<Text className="text-md font-medium">{businessName}</Text>
				<Text className="text-md font-medium">{announcement.text}</Text>
				<Text className="text-sm text-gray-500">
					{new Date(announcement.date).toLocaleDateString()}
				</Text>
			</View>
		</Pressable>
	);
}
