import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable } from "react-native";

import { BusinessWithInfo, ReviewWithUser, usersApi } from "@/db/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { useReviewStore } from "@/store/useReviewStore";
import { ScrollView, Text, View } from "react-native";
import "../../global.css";
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
	const setVisible = useModalReviewStore((state) => state.setVisible);
	const setEdit = useModalReviewStore((state) => state.setEdit);
	const userId = useAuthStore((state) => state.user!!.id);
	// TODO allow editing and your own review should be pinned

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
		})();
		return () => {
			cancelled = true;
		};
	}, [activeBusiness]);

	useEffect(() => {
		if (!business || !reviews?.length) return;
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
		return () => {};
	});

	if (!activeBusiness) return null;
	if (!business) return <Text>Loading</Text>;

	return (
		<View className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-1 flex-col bg-white">
				<View className="flex flex-row items-center justify-between mb-2">
					<Text className="font-bold text-2xl text-black dark:text-white">
						{business.name}
					</Text>
					<ProfilePicture />
				</View>

				<Image
					// source={{ uri: testBusiness.getBanner() }}
					className="w-full h-40 rounded-3xl mb-4"
				/>

				<ScrollView className="flex-1 w-full px-4">
					<View className="flex flex-col items-start mb-2 px-4 gap-2">
						<Text className="text-xl font-semibold text-black dark:text-white">
							About
						</Text>

						<Text className="text-base text-black dark:text-white w-full">
							{business.business_information?.description}
						</Text>
					</View>
					<View className="flex flex-col items-start mb-2 px-4 gap-2">
						<Text className="text-xl font-semibold text-black dark:text-white">
							Announcements
						</Text>

						{/* {testBusiness.getEvents().map((event) => {
							return (
								<View className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 mb-2">
									<View className="flex-row justify-between mb-1">
										<Text className="font-semibold text-black dark:text-white">
											{event.getName()}
										</Text>
									</View>

									<Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
										{event.getDescription()}
									</Text>

									<Text className="text-xs text-gray-500">
										{event.getStart().toDateString()} to{" "}
										{event.getEnd().toDateString()}
									</Text>
								</View>
							);
						})} */}
					</View>
					<View className="flex flex-col items-start mb-2 px-4 gap-2">
						<Text className="text-xl font-semibold text-black dark:text-white">
							AI Summary of Reviews:
						</Text>
						<Text className="italic text-base text-black dark:text-white w-full">
							{AISummary}
						</Text>
					</View>

					<View className="flex flex-col items-start mb-2 px-4 gap-2">
						<Text className="text-xl font-semibold text-black dark:text-white">
							Reviews
						</Text>
						<Text className="text-base text-black dark:text-white w-full">
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
											<View className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 mb-2">
												<View className="flex-row justify-between mb-1">
													<Text className="font-semibold text-black dark:text-white">
														{usernameById[review.reviewerid!!]}
													</Text>
													<Text className="text-yellow-500">
														⭐ {review.rating}/5
													</Text>
												</View>

												<Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
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
						</Text>
					</View>
					<Pressable onPress={() => setVisible(true)}>
						<Text>Leave a review</Text>
					</Pressable>
				</ScrollView>
			</View>
		</View>
	);
}
