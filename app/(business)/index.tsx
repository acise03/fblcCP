import { ReviewWithUser } from "@/db/api/reviews";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { useReviewStore } from "@/store/useReviewStore";
import Entypo from "@expo/vector-icons/Entypo";
import { useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import "../../global.css";
import ActivityItem from "../components/activityItem";
import ProfilePicture from "../components/profilePicture";

export default function BusinessHome() {
	const setMode = useModalSettingsStore((state) => state.setMode);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
	const fetchReviews = useReviewStore((state) => state.fetchReviewsForBusiness);
	const fetchedReviews = useReviewStore((state) => state.reviews);
	const [reviews, setReviews] = useState<ReviewWithUser[]>();

	useFocusEffect(() => {
		setMode("business");
		return () => {};
	});

	useEffect(() => {
		fetchReviews(ownedBusiness!!.id).then(() => {
			setReviews(fetchedReviews);
		});
	}, [ownedBusiness]);

	return (
		// TODO Make this scrollable maybe
		<View className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-1 flex-col bg-white">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-2xl text-black dark:text-white">
						Dashboard
					</Text>
					<ProfilePicture />
				</View>
				<View className="relative w-full h-48 mt-8">
					<Image className="bg-gray-500 w-full h-full rounded-3xl" />
					<Text className="bottom-11 left-4 text-white font-bold text-2xl">
						{ownedBusiness?.name}
					</Text>
					<Pressable className="absolute top-4 right-2">
						<Entypo name="dots-three-vertical" size={24} color="white" />
					</Pressable>
				</View>
				<View className="flex flex-col mt-6">
					<Text className="dark:text-gray-300 text-zinc-700 font-semibold text-xl">
						Activity
					</Text>
					<FlatList
						className="mt-2"
						data={reviews}
						renderItem={({ item }) => {
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
