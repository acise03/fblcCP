import { BusinessWithInfo } from "@/db/api";
import { ReviewWithUser } from "@/db/api/reviews";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import "../../global.css";
import ActivityItem from "../components/activityItem";
import ProfilePicture from "../components/profilePicture";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function BusinessHome() {
	const setMode = useModalSettingsStore((state) => state.setMode);
	const [ownedBusiness, setOwnedBusiness] = useState<BusinessWithInfo>();
	const refreshBusiness = useAuthStore((state) => state.refreshOwnedBusiness);
	const fetchReviews = useReviewStore((state) => state.fetchReviewsForBusiness);
	const fetchedReviews = useReviewStore((state) => state.reviews);
	const [reviews, setReviews] = useState<ReviewWithUser[]>();
	const userId = useAuthStore((state) => state.user!!.id);

	useFocusEffect(() => {
		setMode("business");
		return () => { };
	});

	useEffect(() => {
		let mounted = true;
		const run = async () => {
			if (!ownedBusiness) {
				const oB = await refreshBusiness();
				if (!mounted) return;
				setOwnedBusiness(oB ?? undefined);
				return;
			}

			const reviews = await fetchReviews(ownedBusiness.id);
			if (!mounted) return;
			setReviews(reviews ?? []);
		};
		run();
		return () => {
			mounted = false;
		};
	}, [ownedBusiness]);
	const averageBusinessRating = ownedBusiness?.average_rating
		? ownedBusiness.average_rating.toFixed(1)
		: "0.0";

	const reviewCount = ownedBusiness?.review_count ?? 0;

	return (
		<View className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-col bg-white">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-2xl text-black ">Dashboard</Text>
					<ProfilePicture />
				</View>
				<View className="relative w-full h-48 mt-8">
					<Image className="bg-gray-500 w-full h-full rounded-3xl" />
					<Text className="bottom-11 left-4 text-white font-bold text-2xl">
						{ownedBusiness?.name}
					</Text>
				</View>

				<View>

					<Text className="text-zinc-700 font-semibold text-2xl mt-4">
						Stats
					</Text>

					<View className="flex-row mt-2 gap-3">
						<View className="bg-[#FFE4A3] rounded-xl px-4 py-2 flex-1">
							<Text className="text-black font-bold text-3xl">
								{averageBusinessRating}
							</Text>
							<Text className="text-black text-lg">
								Star Rating
							</Text>
						</View>

						<View className="bg-[#FFE4A3] rounded-xl px-4 py-2 flex-1">
							<Text className="text-black font-bold text-3xl">
								{reviewCount}
							</Text>
							<Text className="text-black text-lg">
								Total Reviews
							</Text>
						</View>
					</View>
				</View>
				<View className="flex flex-col mt-6">
					<View className="flex flex-row items-center justify-between">
						<Text className="text-zinc-700 font-semibold text-2xl">
							Feed
						</Text>
					</View>
					<FlatList
						className="mt-2"
						data={reviews}
						renderItem={({ item }) => {
							console.log(item);
							return (
								<ActivityItem
									id={item.id}
									rating={item.rating!!}
									comment={item.review ?? ""}
									customer={item.reviewerid!!}
									date={item.date}
								/>
							);
						}}
						keyExtractor={(item) => item.id}
						ItemSeparatorComponent={() => <View className="h-2" />}
					/>
				</View>

			</View>
		</View>
	);
}
