import { Announcement } from "@/models/announcement";
import { Poll } from "@/models/poll";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    ToastAndroid,
    View,
} from "react-native";
import "../../global.css";
import AnnouncementItemCustomer from "../components/announcementItemCustomer";
import BusinessItem from "../components/businessItem";
import ProfilePicture from "../components/profilePicture";

type Category = "food" | "retail" | "services" | "misc" | "favourite";
type SortBy = "recent" | "popular" | "ratings" | "distance" | "alphabetical";
type Tab = "announcements" | "businesses";

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

export default function CustomerHome() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>("recent");
	const [showFilters, setShowFilters] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("announcements");
	const inputRef = useRef<TextInput>(null);
	const businesses = useBusinessStore((state) => state.businesses);
	const fetchBusinesses = useBusinessStore((state) => state.fetchBusinesses);
	const setMode = useModalSettingsStore((state) => state.setMode);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(0);
	const [addressByBusinessId, setAddressByBusinessId] = useState<
		Record<string, string>
	>({});

	useFocusEffect(() => {
		setMode("customer");
		fetchBusinesses().then(() => {
			setLoading((prev) => prev + 1);
		});
		return () => {};
	});

	const toggleCategory = (category: Category) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category],
		);
	};

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

	useEffect(() => {
		const loadAddresses = async () => {
			const entries = await Promise.all(
				businesses.map(async (b) => {
					const placeId = b.business_addresses?.address;
					if (!placeId) return [b.id, ""] as const;
					const formatted =
						(await getFormattedAddressFromPlaceId(placeId)) ?? "";
					return [b.id, formatted] as const;
				}),
			);
			setAddressByBusinessId(Object.fromEntries(entries));
		};

		void loadAddresses();
	}, [businesses]);

	const filteredBusinesses = businesses
		.filter((business) => {
			const addr = (addressByBusinessId[business.id] ?? "").toLowerCase();
			const matchesSearch =
				searchQuery.length === 0 ||
				business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				business
					.business_information!!.description!!.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				addr.includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategories.length === 0 ||
				selectedCategories.includes(business.category as Category);
			return matchesSearch && matchesCategory;
		})
		.sort((a, b) => {
			if (sortBy === "ratings") {
				return (b.average_rating ?? 0) - (a.average_rating ?? 0);
			} else if (sortBy === "alphabetical") {
				return a.name.localeCompare(b.name);
			} else if (sortBy === "popular") {
				return (b.review_count ?? 0) - (a.review_count ?? 0);
			}
			return 0;
		});

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			scrollEnabled={false}
			bounces={false}
			overScrollMode="never"
			showsVerticalScrollIndicator={false}
			showsHorizontalScrollIndicator={false}
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
							className={`${selectedCategories.includes("misc") ? "bg-orange-50" : "bg-slate-100"} rounded-xl px-4 py-2 mr-2`}
							onPress={() => toggleCategory("misc")}
						>
							<Text className="font-medium">Miscellaneous</Text>
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
							renderItem={({ item }) => <BusinessItem business={item} />}
							keyExtractor={(item) => item.id}
							ItemSeparatorComponent={() => <View className="h-2" />}
							scrollEnabled={true}
							contentContainerStyle={{ paddingBottom: 8 }}
							showsVerticalScrollIndicator={false}
							refreshing={refreshing}
							onRefresh={async () => {
								setRefreshing(true);
								await fetchBusinesses();
								setRefreshing(false);
							}}
						/>
					)}
				</View>
			</View>
		</ScrollView>
	);
}
