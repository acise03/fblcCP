import { businessesApi, usersApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
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

export default function CustomerHome() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>("recent");
	const [showFilters, setShowFilters] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("announcements");
	const userId = useAuthStore((state) => state.user!!.id);
	const setFavs = useAuthStore((state) => state.setFavs);
	const favs = useAuthStore((state) => state.favBusinesses);
	const inputRef = useRef<TextInput>(null);
	const businesses = useBusinessStore((state) => state.businesses);
	const fetchBusinesses = useBusinessStore((state) => state.fetchBusinesses);
	const setMode = useModalSettingsStore((state) => state.setMode);
	const [posts, setPosts] = useState<BusinessPost[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(0);
	const [addressByBusinessId, setAddressByBusinessId] = useState<
		Record<string, string>
	>({});

	useFocusEffect(() => {
		setMode("customer");
		fetchBusinesses().then(() => {
			setLoading((prev) => prev + 1);
			businessesApi.getAllPosts().then((posts) => {
				setPosts(posts);
			});
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

	const filteredAnnouncements = posts.filter((item) => {
		const business = businesses.find((b) => b.id === item.businessid);
		const matchesSearch =
			(business?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
				false) ||
			item.businessid.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.text.toLowerCase().includes(searchQuery.toLowerCase());
		let f = true;
		if (selectedCategories.includes("favourite")) {
			if (!favs?.includes(business!!.id)) f = false;
		}
		const matchesCategory =
			selectedCategories.length === 0 ||
			selectedCategories.includes(business?.category as Category);
		return matchesSearch && matchesCategory;
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
				selectedCategories.includes(business.category as Category) ||
				(selectedCategories.includes("favourite") &&
					favs?.includes(business.id));
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
		<View className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-col bg-white">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-4xl text-black">Home</Text>
					<ProfilePicture />
				</View>
				<View className="mt-4 flex flex-row items-center justify-between">
					<Text className="font-bold text-2xl text-black">Quick Search</Text>
				</View>
				<ScrollView
					className="mt-5 mb-4 flex flex-row w-full"
					horizontal={true}
					showsHorizontalScrollIndicator={false}
				>
					<Pressable
						className={`${selectedCategories.includes("food") ? "bg-[#FFB627]" : "bg-[#FFE4A3]"} rounded-xl w-20 h-20 py-4 px-5 mr-5`}
						onPress={() => toggleCategory("food")}
					>
						<Ionicons name="fast-food-outline" size={35} color="black" />
					</Pressable>
					<Pressable
						className={`${selectedCategories.includes("services") ? "bg-[#FFB627]" : "bg-[#FFE4A3]"} rounded-xl w-20 h-20 py-5 px-5 mr-5`}
						onPress={() => toggleCategory("services")}
					>
						<Ionicons name="hammer-outline" size={35} color="black" />
					</Pressable>
					<Pressable
						className={`${selectedCategories.includes("retail") ? "bg-[#FFB627]" : "bg-[#FFE4A3]"} rounded-xl w-20 h-20 py-4 px-5 mr-5`}
						onPress={() => toggleCategory("retail")}
					>
						<Ionicons name="storefront-outline" size={35} color="black" />
					</Pressable>
					<Pressable
						className={`${selectedCategories.includes("misc") ? "bg-[#FFB627]" : "bg-[#FFE4A3]"}  rounded-xl w-20 h-20 py-5 px-5 mr-5`}
						onPress={() => toggleCategory("misc")}
					>
						<Ionicons name="cog-outline" size={35} color="black" />
					</Pressable>
					<Pressable
						className={`${selectedCategories.includes("favourite") ? "bg-[#FFB627]" : "bg-[#FFE4A3]"}  rounded-xl w-20 h-20 py-5 px-5 mr-5`}
						onPress={() => toggleCategory("favourite")}
					>
						<Ionicons name="star-outline" size={35} color="black" />
					</Pressable>
				</ScrollView>
			</View>
			<View className="flex-1 mx-8">
				<View className="mb-4 mt-4 flex flex-row bg-[#FFE4A3] rounded-xl w-full items-center p-2 ps-4">
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
						className={`${activeTab === "announcements" ? "bg-[#FFB627]" : "bg-[#FFE4A3]"} rounded-xl px-4 py-2 mr-2`}
						onPress={() => {
							setActiveTab("announcements");
							setSortBy("recent");
						}}
					>
						<Text className="text-xl font-bold">Announcements</Text>
					</Pressable>
					<Pressable
						className={`${activeTab === "businesses" ? "bg-[#FFB627]" : "bg-[#FFE4A3]"} rounded-xl px-4 py-2 mr-2`}
						onPress={() => {
							setActiveTab("businesses");
							setSortBy("alphabetical");
						}}
					>
						<Text className="text-xl font-bold">Find a Business</Text>
					</Pressable>
				</View>
				{activeTab === "announcements" ? (
					<FlatList
						data={filteredAnnouncements}
						renderItem={({ item }) => (
							<AnnouncementItemCustomer announcement={item} />
						)}
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
							usersApi.getFavorite(userId).then((favs) => {
								setFavs(favs);
								setRefreshing(false);
							});
						}}
					/>
				)}
			</View>
		</View>
	);
}
