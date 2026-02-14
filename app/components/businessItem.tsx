import { BusinessWithInfo } from "@/db/api";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

type BusinessItemProps = {
	businessId: string;
};

export default function BusinessItem({ businessId }: BusinessItemProps) {
	const fetchBusiness = useBusinessStore((state) => state.fetchBusinessById);
	const selectedBusiness = useBusinessStore((state) => state.selectedBusiness);
	const setVisible = useModalReviewStore((state) => state.setVisible);
	const setActiveBusiness = useModalReviewStore((state) => state.setBusiness);
	const [business, setBusiness] = useState<BusinessWithInfo | null>();

	useEffect(() => {
		let mounted = true;
		fetchBusiness(businessId).then((res) => {
			if (!mounted) return;
			setBusiness(selectedBusiness);
		});
		return () => {
			mounted = false;
		};
	}, [businessId]);

	if (!business)
		return (
			<View className="p-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full">
				<Text>Loading</Text>
			</View>
		);

	return (
		<View className="p-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full">
			<Image className="rounded-full w-14 h-14 bg-gray-500" />
			<View className="px-4 flex flex-col flex-1">
				<Text className="text-md font-medium">{business?.name}</Text>
				<Text className="text-sm text-gray-500">
					{business?.business_information?.description}
				</Text>
				<Text className="text-sm text-gray-500">
					{business?.business_addresses?.address}
				</Text>
				<Text className="text-sm text-gray-500">
					{business?.average_rating}
				</Text>
				<Text className="text-sm text-gray-500">
					{business?.review_count} reviews
				</Text>
				<Text className="text-sm text-gray-500">{business?.review_count}</Text>
				<Text className="text-sm text-gray-500">
					{business?.business_information?.website}
				</Text>
				<Text className="text-sm text-gray-500">
					{business?.business_information?.phone}
				</Text>
				<Text className="text-sm text-gray-500">
					{business?.business_information?.email}
				</Text>
				<Pressable
					onPress={() => {
						setVisible(true);
						setActiveBusiness(businessId);
					}}
				>
					<Text className="text-md font-medium">Leave Review</Text>
				</Pressable>
			</View>
		</View>
	);
}
