import { BusinessWithInfo } from "@/db/api";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, ToastAndroid, View } from "react-native";

type BusinessItemProps = {
	business: BusinessWithInfo;
};

const getFormattedAddressFromPlaceId = async (
	placeId: string,
): Promise<string | null> => {
	try {
		const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
			placeId,
		)}?fields=formattedAddress&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;

		const res = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const json = await res.json();

		if (res.ok) {
			return json?.formattedAddress ?? null;
		}

		console.log("Places v1 error:", json);
		ToastAndroid.show("Places error", ToastAndroid.SHORT);
		return null;
	} catch (err) {
		ToastAndroid.show("Failed to fetch address", ToastAndroid.SHORT);
		return null;
	}
};

const formatCategory = (value?: string | null) => {
	if (!value) return "";
	if (value === "misc") return "Miscellaneous";
	return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function BusinessItem({ business }: BusinessItemProps) {
	const setVisible = useModalReviewStore((state) => state.setVisible);
	const setActiveBusiness = useModalReviewStore((state) => state.setBusiness);
	const [address, setAddress] = useState("");

	if (!business)
		return (
			<View className="p-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full">
				<Text>Loading</Text>
			</View>
		);

	useEffect(() => {
		const hydrate = async () => {
			const resolvedAddress = business.business_addresses!!.address!!
				? ((await getFormattedAddressFromPlaceId(
						business.business_addresses!!.address!!,
					)) ?? "")
				: "";
			setAddress(resolvedAddress);
		};

		void hydrate();
	}, [business]);

	return (
		<Pressable
			className="p-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full"
			onPress={() => {
				setActiveBusiness(business.id);
				router.navigate("/(customer)/businessDetails");
			}}
			android_ripple={{ color: "transparent" }}
			style={() => ({ opacity: 1 })}
		>
			<Image className="rounded-full w-14 h-14 bg-gray-500" />
			<View className="px-4 flex flex-col flex-1">
				<Text className="text-md font-medium">{business?.name}</Text>
				<Text className="text-sm text-gray-500">
					{business?.business_information?.description}
				</Text>
				<Text className="text-sm text-gray-500">{address}</Text>
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
				<Text className="text-sm text-gray-500">
					{formatCategory(business?.category)}
				</Text>
				<Pressable
					onPress={() => {
						setVisible(true);
						setActiveBusiness(business.id);
					}}
				>
					<Text className="text-md font-medium">Leave Review</Text>
				</Pressable>
			</View>
		</Pressable>
	);
}
