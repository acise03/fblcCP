import { Business } from "@/models/business";
import { Event } from "@/models/event";
import { Review } from "@/models/review";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image } from "react-native";

import {
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import "../../global.css";
import ProfilePicture from "../components/profilePicture";
type Category = "food" | "retail" | "services" | "favourite" | "local";
type SortBy = "recent" | "popular" | "ratings" | "distance" | "alphabetical";
type Tab = "announcements" | "businesses";

const testBusiness = new Business(
	"McDonalds",
	"Fast Food",
	"McDonald's is the world's leading global foodservice retailer with over 40,000 locations in more than 100 countries, serving burgers, fries, chicken, and breakfast items.",
	"https://creativereview.imgix.net/uploads/2020/03/mcds-banner.jpg",
	43.815,
	-79.418,
); // fix this later to make it not test

const testreview1 = new Review(
	4,
	"Food was served hot and the service was quick despite the staff shortage",
	new Date(),
	"Johnny",
);

const testreview2 = new Review(
	3,
	"I was waiting in the hour drivethru for about 10 minutes which wasn't the worst thing.  I ordered a fillet of fish combo with a strawberry milkshake.  What seemed like an eternity later I got to the window and was told they didn't have strawberry...  So I I said what do you have? They said chocolate and vanilla...  Fair enough I chose Villa although they could have told me that earlier.  I received my food and checked to ensure it was correct and realized my fries were about half full...  Probably a mistake but left a sour taste since I had waited so long for the food and they didn't even have e everything I ordered.  I took a picture and showed my friends and it wasnt an exaggeration by any means as they all reacted as I did.  Please see picture posted.  I rate this experience a 1 star and think they can at least apologize for the wait when someone comes to the window...  Especially went you can't fulfill the order.  Thanks",
	new Date(),
	"Tommy",
);

const testreview3 = new Review(
	1,
	"They make the drive through customer wait for way too long, 20+mins",
	new Date(),
	"Bobby",
);

testBusiness.addReview(testreview1);
testBusiness.addReview(testreview2);
testBusiness.addReview(testreview3);

const testevent1 = new Event(
	"Family Day Sale",
	"Purchase our Happy Meal and Big Mac Combo for just $15.99",
	new Date(),
	new Date(),
);

const testevent2 = new Event(
	"Sunday Morning Sale",
	"All menu items 5% off.",
	new Date(),
	new Date(),
);
testBusiness.addEvent(testevent1);
testBusiness.addEvent(testevent2);

export default function CustomerHome() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>("recent");
	const [showFilters, setShowFilters] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("announcements");
	const inputRef = useRef<TextInput>(null);
	const setMode = useModalSettingsStore((state) => state.setMode);

	const [AISummary, setAISummary] = useState("... loading ...");

	const generateAISummary = async () => {
		const reviews = testBusiness.getReviews().map((rev) => {
			const review = rev.getReview();
			return `A rating of ${review.rating} was given with the comment: ${review.comment}`;
		});

		const prompt = `You are tasked with creating a brief 3-4 sentence a summary of the business ${testBusiness.getName()} using the following reviews: ${reviews.join("\n")}`;

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
	useEffect(() => {
		generateAISummary();
	}, []);

	useFocusEffect(() => {
		setMode("customer");
		return () => {};
	});

	const toggleCategory = (category: Category) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category],
		);
	};

	return (
		<TouchableWithoutFeedback
			onPress={() => {
				inputRef.current?.blur();
			}}
			accessible={false}
			className="h-screen w-screen"
		>
			<View className="h-full w-full bg-white">
				<View className="mx-8 mt-8 flex flex-1 flex-col bg-white">
					<View className="flex flex-row items-center justify-between mb-2">
						<Text className="font-bold text-2xl text-black dark:text-white">
							{testBusiness.getName()}
						</Text>
						<ProfilePicture />
					</View>

					<Image
						source={{ uri: testBusiness.getBanner() }}
						className="w-full h-40 rounded-3xl mb-4"
					/>

					<ScrollView className="flex-1 w-full px-4">
						<View className="flex flex-col items-start mb-2 px-4 gap-2">
							<Text className="text-xl font-semibold text-black dark:text-white">
								About
							</Text>

							<Text className="text-base text-black dark:text-white w-full">
								{testBusiness.getDescription()}
							</Text>
						</View>
						<View className="flex flex-col items-start mb-2 px-4 gap-2">
							<Text className="text-xl font-semibold text-black dark:text-white">
								Special Deals
							</Text>

							<Text className="text-base text-black dark:text-white w-full">
								{testBusiness.getEvents().map((event) => {
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
								})}
							</Text>
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
								{testBusiness.getReviews().map((review) => {
									const r = review.getReview();

									return (
										<View className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 mb-2">
											<View className="flex-row justify-between mb-1">
												<Text className="font-semibold text-black dark:text-white">
													{r.customer}
												</Text>

												<Text className="text-yellow-500">⭐ {r.rating}/5</Text>
											</View>

											<Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
												{r.comment}
											</Text>

											<Text className="text-xs text-gray-500">
												{r.date.toDateString()}
											</Text>
										</View>
									);
								})}
							</Text>
						</View>
					</ScrollView>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}
