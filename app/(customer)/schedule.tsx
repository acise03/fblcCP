import React, { useEffect, useMemo, useState } from "react";
import ProfilePicture from "../components/profilePicture";

import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { ScrollView, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

const formatDate = (date: Date) => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

const getDatesInRange = (start: Date, end: Date) => {
	const dates: string[] = [];
	const current = new Date(start);

	while (current <= end) {
		dates.push(formatDate(current));
		current.setDate(current.getDate() + 1);
	}

	return dates;
};
const eventColors: Record<string, string> = {
	coupon: "#a970ba",
	sale: "#379959",
};
export default function Schedule() {
	const [selectedDate, setSelectedDate] = useState<string>("");
	const [posts, setPosts] = useState<BusinessPost[]>([]);

	useEffect(() => {
		(async () => {
			const allPosts = await businessesApi.getAllPosts();
			const eventPosts = allPosts.filter((p) => p.start_date);

			const businessIds = [...new Set(eventPosts.map((p) => p.businessid))];

			const businessData = await Promise.all(
				businessIds.map(async (id) => {
					const b = await businessesApi.getById(id);
					return [id, b?.name ?? "Unknown Business"] as const;
				}),
			);

			setBusinesses(Object.fromEntries(businessData));
			setPosts(eventPosts);
		})();
	}, []);
	const [businesses, setBusinesses] = useState<Record<string, string>>({});
	const selectedDayEvents = posts.filter((post) => {
		if (!selectedDate) return false;

		const start = new Date(post.start_date!);
		const end = post.end_date ? new Date(post.end_date) : start;
		const selected = new Date(selectedDate + "T00:00:00");
		const startDay = new Date(formatDate(start) + "T00:00:00");
		const endDay = new Date(formatDate(end) + "T00:00:00");

		return selected >= startDay && selected <= endDay;
	});

	const markedDates = useMemo(() => {
		const marks: any = {};

		posts.forEach((post, index) => {
			const start = new Date(post.start_date!);
			const end = post.end_date ? new Date(post.end_date) : start;

			const range = getDatesInRange(start, end);

			range.forEach((dateKey) => {
				if (!marks[dateKey]) {
					marks[dateKey] = { dots: [] };
				}

				marks[dateKey].dots.push({
					key: `post-${index}`,
					color: eventColors[post.type],
				});
			});
		});

		if (selectedDate) {
			marks[selectedDate] = {
				...(marks[selectedDate] || {}),
				selected: true,
				selectedColor: "#555555",
			};
		}

		return marks;
	}, [posts, selectedDate]);

	return (
		<View className="h-full w-full bg-[#FFF8F0]">
			<View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0]">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-4xl text-black">Calendar</Text>
					<ProfilePicture />
				</View>

				<Calendar
					markingType="multi-dot"
					markedDates={markedDates}
					onDayPress={(day: DateData) => {
						setSelectedDate(day.dateString);
					}}
					style={{ backgroundColor: "#FFF8F0" }}
					theme={{
						calendarBackground: "#FFF8F0",
					}}
				/>

				<View className="mt-5 mb-2">
					<Text className="font-bold text-3xl text-black">
						Events on {selectedDate}
					</Text>
				</View>

				<ScrollView
					className="flex-1"
					contentContainerStyle={{ paddingBottom: 32 }}
					showsVerticalScrollIndicator={false}
				>
					{selectedDayEvents.length === 0 ? (
						<View className="bg-[#FFE4A3] rounded-xl px-4 py-4 mt-3">
							<Text className="text-xl">No events.</Text>
						</View>
					) : (
						selectedDayEvents.map((post) => (
							<View
								key={post.id}
								className="bg-[#FFE4A3] rounded-xl px-4 py-4 mt-3"
							>
								<Text className="text-2xl font-bold text-gray-700 mb-1">
									{businesses[post.businessid]}
								</Text>
								<Text className="text-xl font-semi-bold">{post.highlight}</Text>
								<Text className="text-lg">{post.text}</Text>
							</View>
						))
					)}
				</ScrollView>
			</View>
		</View>
	);
}
