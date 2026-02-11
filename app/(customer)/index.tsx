import { Announcement } from "@/models/announcement";
import { Poll } from "@/models/poll";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import "../../global.css";
import AnnouncementItemCustomer from "../components/announcementItemCustomer";
import BusinessItem from "../components/businessItem";
import ProfilePicture from "../components/profilePicture";

type Category = "food" | "retail" | "services" | "favourite" | "local";
type SortBy = "recent" | "popular" | "ratings" | "distance" | "alphabetical";
type Tab = "announcements" | "businesses";

const mockAnnouncements = [
	new Announcement(
		"Grand Opening! Here is a very long text asdiojfiodfjgiojeriogjioj",
		new Date(),
		"martin's grill",
	),
	new Announcement("Holiday Hours", new Date(), "martin's grill"),
	new Poll(
		"The new chocolate cake was a hit at our North York location! What did you think of it?",
		new Date(),
		"Business1",
		["🍁", "🥀", "💀"],
	),
	new Poll("Which day works best for you?", new Date(), "Business1", [
		"Monday",
		"Wednesday",
		"Friday",
	]),
];

const mockBusinesses = [
	{
		id: "1",
		name: "McDonalds",
		description:
			"Famous for hamburgers, fries, and breakfast items like the Big Mac and Egg McMuffin",
		category: "food",
		rating: 4.5,
		reviews: 1243,
		distance: "0.5 mi",
	},
	{
		id: "2",
		name: "Best Buy",
		description:
			"Electronics retailer with TVs, laptops, cell phones, cameras and more",
		category: "retail",
		rating: 4.2,
		reviews: 856,
		distance: "1.2 mi",
	},
	{
		id: "3",
		name: "Yoga Studio",
		description:
			"Professional yoga classes for all levels. Experienced instructors.",
		category: "services",
		rating: 4.7,
		reviews: 432,
		distance: "0.8 mi",
	},
];

export default function CustomerHome() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>("recent");
	const [showFilters, setShowFilters] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("announcements");
	const inputRef = useRef<TextInput>(null);
	const setMode = useModalSettingsStore((state) => state.setMode);

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

	// TODO implement categories for businesses but I need backend for that

	const filteredAnnouncements = mockAnnouncements.filter((item) => {
		if (item instanceof Announcement) {
			const announcement = item.getAnnouncement();
			const matchesSearch =
				announcement.business
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				announcement.text.toLowerCase().includes(searchQuery.toLowerCase());
			// const matchesCategory =
			// 	selectedCategories.length === 0 ||
			// 	selectedCategories.includes(announcement.category as Category);
			// return matchesSearch && matchesCategory;
			return matchesSearch;
		} else {
			const announcement = item.getPoll();
			const matchesSearch =
				announcement.business
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				announcement.text.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSearch;
		}
	});

	const filteredBusinesses = mockBusinesses.filter((business) => {
		const matchesSearch =
			business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			business.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategories.length === 0 ||
			selectedCategories.includes(business.category as Category);
		return matchesSearch && matchesCategory;
	});

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
					<View className="flex flex-row items-center justify-between">
						<Text className="font-bold text-2xl text-black dark:text-white">
							Dashboard
						</Text>
						<ProfilePicture />
					</View>
					<View className="mb-4 mt-8 flex flex-row bg-orange-50 rounded-xl w-full items-center p-2 ps-4">
						<Feather name="search" size={20} color="black" />
						<TextInput
							ref={inputRef}
							placeholder="Search businesses"
							value={searchQuery}
							onChangeText={setSearchQuery}
							className="flex-1 ms-2 text-md"
						/>
						<Pressable
							onPress={() => setShowFilters(!showFilters)}
							className="ml-auto mx-2"
						>
							<Feather name="sliders" size={20} color="black" />
						</Pressable>
					</View>
					{/* TODO add colour transition animations */}
					<ScrollView
						className="mb-4 flex flex-row w-full max-h-10"
						horizontal={true}
						showsHorizontalScrollIndicator={false}
					>
						<Pressable
							className={`${selectedCategories.includes("food") ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
							onPress={() => toggleCategory("food")}
						>
							<Text className="font-medium">Food</Text>
						</Pressable>
						<Pressable
							className={`${selectedCategories.includes("services") ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
							onPress={() => toggleCategory("services")}
						>
							<Text className="font-medium">Services</Text>
						</Pressable>
						<Pressable
							className={`${selectedCategories.includes("retail") ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
							onPress={() => toggleCategory("retail")}
						>
							<Text className="font-medium">Retail</Text>
						</Pressable>
						<Pressable
							className={`${selectedCategories.includes("local") ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
							onPress={() => toggleCategory("local")}
						>
							<Text className="font-medium">Local</Text>
						</Pressable>
						<Pressable
							className={`${selectedCategories.includes("favourite") ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2`}
							onPress={() => toggleCategory("favourite")}
						>
							<Text className="font-medium">Favourites</Text>
						</Pressable>
					</ScrollView>
					{showFilters && (
						<View className="w-full flex flex-col bg-orange-50 p-4 rounded-xl">
							<Text className="font-semibold">Sort By</Text>
							<Pressable
								className="absolute top-4 right-4"
								onPress={() => setShowFilters(false)}
							>
								<Feather name="x" size={18} color="gray" />
							</Pressable>
							<ScrollView
								className="mt-2 flex flex-row w-full"
								horizontal={true}
								showsHorizontalScrollIndicator={false}
							>
								{activeTab === "announcements" ? (
									<>
										<Pressable
											className={`${sortBy === "recent" ? "bg-slate-500" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
											onPress={() => setSortBy("recent")}
										>
											<Text
												className={`${sortBy === "recent" ? "text-white" : ""} font-medium`}
											>
												Recent
											</Text>
										</Pressable>
										<Pressable
											className={`${sortBy === "popular" ? "bg-slate-500" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
											onPress={() => setSortBy("popular")}
										>
											<Text
												className={`${sortBy === "popular" ? "text-white" : ""} font-medium`}
											>
												Most Popular
											</Text>
										</Pressable>
									</>
								) : (
									<>
										<Pressable
											className={`${sortBy === "alphabetical" ? "bg-slate-500" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
											onPress={() => setSortBy("alphabetical")}
										>
											<Text
												className={`${sortBy === "alphabetical" ? "text-white" : ""} font-medium`}
											>
												Alphabetical
											</Text>
										</Pressable>
										<Pressable
											className={`${sortBy === "popular" ? "bg-slate-500" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
											onPress={() => setSortBy("popular")}
										>
											<Text
												className={`${sortBy === "popular" ? "text-white" : ""} font-medium`}
											>
												Most Popular
											</Text>
										</Pressable>
										<Pressable
											className={`${sortBy === "distance" ? "bg-slate-500" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
											onPress={() => setSortBy("distance")}
										>
											<Text
												className={`${sortBy === "distance" ? "text-white" : ""} font-medium`}
											>
												Distance
											</Text>
										</Pressable>
										<Pressable
											className={`${sortBy === "ratings" ? "bg-slate-500" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
											onPress={() => setSortBy("ratings")}
										>
											<Text
												className={`${sortBy === "ratings" ? "text-white" : ""} font-medium`}
											>
												Ratings
											</Text>
										</Pressable>
									</>
								)}
							</ScrollView>
						</View>
					)}
					<View className="mb-4 mt-2 flex flex-row w-full items-center justify-items-start">
						<Pressable
							className={`${activeTab === "announcements" ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
							onPress={() => {
								setActiveTab("announcements");
								setSortBy("recent");
							}}
						>
							<Text className="font-medium">Announcements</Text>
						</Pressable>
						<Pressable
							className={`${activeTab === "businesses" ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
							onPress={() => {
								setActiveTab("businesses");
								setSortBy("alphabetical");
							}}
						>
							<Text className="font-medium">Find a Business</Text>
						</Pressable>
					</View>
					{activeTab === "announcements" ? (
						<FlatList
							data={filteredAnnouncements}
							renderItem={({ item }) => <AnnouncementItemCustomer />}
							keyExtractor={(item) => item.id}
							ItemSeparatorComponent={() => <View className="h-2" />}
							scrollEnabled={true}
							contentContainerStyle={{ paddingBottom: 8 }}
							showsVerticalScrollIndicator={false}
						/>
					) : (
						<FlatList
							data={filteredBusinesses}
							renderItem={({ item }) => <BusinessItem />}
							keyExtractor={(item) => item.id}
							ItemSeparatorComponent={() => <View className="h-2" />}
							scrollEnabled={true}
							contentContainerStyle={{ paddingBottom: 8 }}
							showsVerticalScrollIndicator={false}
						/>
					)}
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}
