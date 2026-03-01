import { BusinessWithInfo, usersApi } from "@/db/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

type BusinessItemProps = {
	business: BusinessWithInfo;
	distance?: number;
};

export default function BusinessItem({
	business,
	distance,
}: BusinessItemProps) {
	const setActiveBusiness = useModalReviewStore((state) => state.setBusiness);
	const userId = useAuthStore((state) => state.user!!.id);
	const favs = useAuthStore((state) => state.favBusinesses);
	const setFavs = useAuthStore((state) => state.setFavs);

	const isFav = favs?.includes(business.id);

	if (!business)
		return (
			<View className="p-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full">
				<Text>Loading</Text>
			</View>
		);

	return (
		<Pressable
			className="rounded-2xl overflow-hidden bg-[#FFE4A3] w-full"
			onPress={() => {
				setActiveBusiness(business.id);
				router.push("/(customer)/businessDetails");
			}}
			android_ripple={{ color: "transparent" }}
			style={() => ({ opacity: 1 })}
		>
			{/* Banner image section */}
			<View className="w-full h-28 bg-gray-400">
				{business?.business_information?.banner ? (
					<Image
						className="w-full h-full"
						source={{ uri: business.business_information.banner }}
						resizeMode="cover"
					/>
				) : business?.business_information?.profile_picture ? (
					<Image
						className="w-full h-full"
						source={{ uri: business.business_information.profile_picture }}
						resizeMode="cover"
					/>
				) : null}

				{/* Vignette overlay */}
				<LinearGradient
					colors={["transparent", "rgba(0,0,0,0.35)"]}
					locations={[0.3, 1]}
					className="absolute inset-0"
				/>

				{/* Business name overlay */}
				<Text
					className="absolute bottom-2 left-4 text-white text-2xl font-bold"
					style={{ fontFamily: "Rubik" }}
				>
					{business?.name}
				</Text>

				{/* Heart / favourite icon */}
				<Pressable
					className="absolute top-3 right-3 bg-black/30 rounded-full p-2"
					onPress={async () => {
						if (!isFav) {
							await usersApi.addFavorite(userId, business.id);
						} else {
							await usersApi.removeFavorite(userId, business.id);
						}
						usersApi.getFavorite(userId).then((favs) => {
							setFavs(favs);
						});
					}}
				>
					<Ionicons
						name={isFav ? "heart" : "heart-outline"}
						size={24}
						color="white"
					/>
				</Pressable>
			</View>

			{/* Info section */}
			<View className="px-4 py-3">
				{business?.average_rating != null && (
					<Text
						className="text-sm font-medium text-black mb-1"
						style={{ fontFamily: "Rubik" }}
					>
						{business.average_rating.toFixed(1)} / 5 Rating
					</Text>
				)}
				{distance !== undefined && (
					<Text
						className="text-sm font-medium text-black mb-1"
						style={{ fontFamily: "Rubik" }}
					>
						{distance.toFixed(2)} km away
					</Text>
				)}
				{business?.business_information?.description ? (
					<Text
						className="text-base text-black font-semibold leading-6"
						style={{ fontFamily: "Rubik" }}
					>
						{business.business_information.description.trim()}
					</Text>
				) : null}
			</View>
		</Pressable>
	);
}
