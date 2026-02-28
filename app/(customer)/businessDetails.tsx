import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable } from "react-native";

import {
	businessesApi,
	BusinessWithInfo,
	ReviewWithUser,
	usersApi,
} from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { useReviewStore } from "@/store/useReviewStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FlatList, ScrollView, Text, View } from "react-native";
import "../../global.css";
import AnnouncementItemCustomer from "../components/announcementItemCustomer";
import ProfilePicture from "../components/profilePicture";

export default function BusinessDetails() {
	const setMode = useModalSettingsStore((state) => state.setMode);
	const fetchBusiness = useBusinessStore((state) => state.fetchBusinessById);
	const fetchReviews = useReviewStore((state) => state.fetchReviewsForBusiness);
	const deleteReview = useReviewStore((state) => state.deleteReview);
	const activeBusiness = useModalReviewStore((state) => state.activeBusiness);
	const [AISummary, setAISummary] = useState("... loading ...");
	const [business, setBusiness] = useState<BusinessWithInfo | null>();
	const [reviews, setReviews] = useState<ReviewWithUser[] | null>();
	const dbReviews = useReviewStore((state) => state.reviews);
	const [usernameById, setUsernameById] = useState<Record<string, string>>({});
	const [posts, setPosts] = useState<BusinessPost[]>([]);
	const setVisible = useModalReviewStore((state) => state.setVisible);
	const setEdit = useModalReviewStore((state) => state.setEdit);
	const userId = useAuthStore((state) => state.user!!.id);
	const favs = useAuthStore((state) => state.favBusinesses);
	const setFavs = useAuthStore((state) => state.setFavs);

	useEffect(() => {
		if (!activeBusiness) {
			router.back();
			return;
		}
		let cancelled = false;
		(async () => {
			const b = await fetchBusiness(activeBusiness);
			if (!b || cancelled) return;
			setBusiness(b);
			const r = await fetchReviews(b.id);
			console.log(r);
			setReviews(r);
			const p = await businessesApi.getPostsByBusiness(b.id);
			setPosts(p);
		})();
		return () => {
			cancelled = true;
		};
	}, [activeBusiness]);

	useEffect(() => {
		if (!business || !reviews?.length) {
			setAISummary("Not enough reviews");
			return;
		}
		const generateAISummary = async () => {
			const prompt = `You are tasked with creating a brief 3-4 sentence a summary of the business ${business.name} using the following reviews: ${reviews.join("\n")}. Give specific suggestions if relevant. For example, if several reviews say that the apple pie tastes good, recommend it, saying that many people like it. If you believe there are not enough reviews to generate a summary, simply output "Not enough reviews"`;

			const summary = await fetch(
				"https://api.groq.com/openai/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
					},
					body: JSON.stringify({
						model: "openai/gpt-oss-120b",
						messages: [{ role: "user", content: prompt }],
						temperature: 1,
						max_tokens: 512,
						top_p: 1,
					}),
				},
			);

			const results = await summary.json();
			setAISummary(results.choices[0].message.content);
		};
		void generateAISummary();
	}, [business, reviews]);

	useEffect(() => {
		setReviews(dbReviews);
	}, [dbReviews]);

	useEffect(() => {
		if (!reviews?.length) {
			setUsernameById({});
			return;
		}

		let cancelled = false;

		(async () => {
			const ids = [
				...new Set(reviews.map((r) => r.reviewerid).filter(Boolean)),
			];

			const pairs = await Promise.all(
				ids.map(async (id) => {
					const user = await usersApi.getById(id!!);
					const fullName = user
						? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
						: "";
					return [id, fullName || id] as const;
				}),
			);

			if (!cancelled) {
				setUsernameById(Object.fromEntries(pairs));
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [reviews]);

	useFocusEffect(() => {
		setMode("customer");
		return () => { };
	});

	if (!activeBusiness) return null;
	if (!business) return <Text>Loading</Text>;

	return (
		<View className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-1 flex-col bg-white">
				<View className="flex flex-row items-center justify-between mb-2">
					<Text className="font-bold text-2xl text-black ">
						{business.name}
					</Text>
					<ProfilePicture />
				</View>



				<ScrollView className="flex-1 w-full">
					<Image
						source={{ uri: business.business_information?.banner!! }}
						className="w-full h-40 rounded-3xl mb-4"
					/>
					<View className="flex flex-col items-start mb-2 px-4 gap-2">
						<View className="flex-row items-center justify-between w-full mb-2">
							<Text className="text-2xl font-semibold text-black">
								About
							</Text>

							<Pressable
								onPress={async () => {
									if (!favs || !favs.includes(business.id)) {
										await usersApi.addFavorite(userId, business.id);
									} else {
										await usersApi.removeFavorite(userId, business.id);
									}

									const updated = await usersApi.getFavorite(userId);
									setFavs(updated);
								}}
								className="p-1"
							>
								{!favs || !favs.includes(business.id) ? (
									<FontAwesome name="star-o" size={22} color="black" />
								) : (
									<FontAwesome name="star" size={22} color="#FFB627" />
								)}
							</Pressable>
						</View>
						<Text className="text-base text-black  w-full">
							{business.business_information?.description}
						</Text>
					</View>
					<View className="flex flex-col items-start mb-2 px-4 gap-2 w-full">
						<Text className="text-2xl font-semibold text-black ">
							Announcements
						</Text>

						<FlatList
							data={posts}
							renderItem={({ item }) => (
								<AnnouncementItemCustomer announcement={item} />
							)}
							keyExtractor={(item) => item.id}
							ItemSeparatorComponent={() => <View className="h-2" />}
							scrollEnabled={true}
							contentContainerStyle={{ paddingBottom: 8 }}
							showsVerticalScrollIndicator={false}
							className="w-full"
						/>
					</View>
					<View className="flex flex-col items-start mb-2 px-4 gap-2">
						<Text className="text-2xl font-semibold text-black ">
							AI Summary of Reviews:
						</Text>
						<Text className="italic text-base text-black  w-full">
							{AISummary}
						</Text>
					</View>

					<View className="flex flex-col items-start mb-2 px-4 gap-2">
						<Text className="text-2xl font-semibold text-black ">Reviews</Text>
						<View className="w-full">
							{reviews != null &&
								reviews.length > 0 &&
								[...reviews]
									.sort((a, b) => {
										const aPinned = a.reviewerid === userId ? 1 : 0;
										const bPinned = b.reviewerid === userId ? 1 : 0;
										return bPinned - aPinned;
									})
									.map((review) => {
										const d = new Date(review.date);
										const dateLabel = Number.isNaN(d.getTime())
											? ""
											: d.toLocaleDateString();

										return (
											<View className="w-full bg-gray-100 rounded-xl p-3 mb-4">
												<View className="flex-row justify-between mb-1">
													<Text className="font-semibold text-black ">
														{usernameById[review.reviewerid!!]}
													</Text>
													<Text className="text-yellow-500">
														⭐ {review.rating}/5
													</Text>
												</View>

												<Text className="text-sm text-gray-700 mb-1">
													{review.review}
												</Text>

												<Text className="text-xs text-gray-500">
													{dateLabel}
												</Text>
												{review.reviewerid == userId && (
													<Pressable
														onPress={() => {
															setVisible(true);
															setEdit(true);
														}}
													>
														<Text>Edit Review</Text>
													</Pressable>
												)}
												{review.reviewerid == userId && (
													<Pressable
														onPress={() => {
															deleteReview(review.id);
															fetchReviews(activeBusiness).then((res) => {
																setReviews(res);
															});
														}}
													>
														<Text>Delete Review</Text>
													</Pressable>
												)}
											</View>
										);
									})}
						</View>
						<Pressable
							onPress={() => setVisible(true)}
							className="w-full bg-[#FFB627] rounded-xl py-3 items-center justify-center mt-1 active:opacity-50"
						>
							<Text className="text-black font-semibold text-base">
								Leave a review
							</Text>
						</Pressable>					</View>
				</ScrollView>
			</View>
		</View>
	);
}
