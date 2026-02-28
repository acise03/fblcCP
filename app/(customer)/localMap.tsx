import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
	Dimensions,
	FlatList,
	Pressable,
	Text,
	TextInput,
	ToastAndroid,
	View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import BusinessItem from "../components/businessItem";
import ProfilePicture from "../components/profilePicture";

type Category = "food" | "retail" | "services" | "misc" | "favourite";

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

const formatCategory = (value?: string | null) => {
	if (!value) return "";
	if (value === "misc") return "Miscellaneous";
	return value.charAt(0).toUpperCase() + value.slice(1);
};

const getCoordinatesFromPlaceId = async (placeId: string) => {
	const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
	const res = await fetch(url);
	const json = await res.json();
	if (json.result && json.result.geometry && json.result.geometry.location) {
		return {
			latitude: json.result.geometry.location.lat,
			longitude: json.result.geometry.location.lng,
		};
	}
	return null;
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
	const toRad = (value: number) => (value * Math.PI) / 180;
	const R = 6371; // km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
		Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) *
		Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export default function LocalMap() {
	// Bottom sheet state
	const [showBottomSheet, setShowBottomSheet] = useState(false);
	// Set sheet height to 75% of screen
	const screenHeight = Dimensions.get("window").height; // You can use Dimensions.get('window').height for dynamic
	const sheetHeight = Math.round(screenHeight * 0.55);
	const collapsedY = sheetHeight * 0.6;
	const translateY = useSharedValue(collapsedY);
	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	// Show sheet when search is submitted
	const handleSearchSubmit = () => {
		setShowBottomSheet(true);
		// Show near bottom (collapsed)
		translateY.value = withSpring(collapsedY);
	};

	// New gesture handler using Gesture API
	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			let newY = translateY.value + event.translationY;
			newY = Math.max(0, Math.min(newY, collapsedY));
			translateY.value = newY;
		})
		.onEnd(() => {
			if (translateY.value < collapsedY / 2) {
				translateY.value = withSpring(0);
			} else {
				translateY.value = withSpring(collapsedY);
			}
		});

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return;
			let location = await Location.getCurrentPositionAsync({});
			setUserLocation({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});
		})();
	}, []);

	const animatedSheetStyle = useAnimatedStyle(() => ({
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: sheetHeight,
		backgroundColor: "#fff",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
		padding: 16,
		transform: [{ translateY: translateY.value }],
	}));
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
	const businesses = useBusinessStore((state) => state.businesses);
	const favs = useAuthStore((state) => state.favBusinesses);
	const [addressByBusinessId, setAddressByBusinessId] = useState<
		Record<string, string>
	>({});
	const [coordinatesByBusinessId, setCoordinatesByBusinessId] = useState<
		Record<string, { latitude: number; longitude: number } | null>
	>({});

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

	const toggleCategory = (category: Category) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category],
		);
	};

	useEffect(() => {
		const loadAddressesAndCoords = async () => {
			const addressEntries = await Promise.all(
				businesses.map(async (b) => {
					const placeId = b.business_addresses?.address;
					if (!placeId) return [b.id, ""] as const;
					const formatted =
						(await getFormattedAddressFromPlaceId(placeId)) ?? "";
					return [b.id, formatted] as const;
				}),
			);
			setAddressByBusinessId(Object.fromEntries(addressEntries));

			const coordEntries = await Promise.all(
				businesses.map(async (b) => {
					const placeId = b.business_addresses?.address;
					if (!placeId) return [b.id, null] as const;
					const coords = await getCoordinatesFromPlaceId(placeId);
					return [b.id, coords] as const;
				}),
			);
			setCoordinatesByBusinessId(Object.fromEntries(coordEntries));
		};

		void loadAddressesAndCoords();
	}, [businesses]);

	const filteredBusinesses = businesses.filter((business) => {
		const addr = (addressByBusinessId[business.id] ?? "").toLowerCase();
		const matchesSearch =
			searchQuery.length === 0 ||
			business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			business
				.business_information!!.description!!.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			addr.includes(searchQuery.toLowerCase());
		let f = true;
		if (selectedCategories.includes("favourite")) {
			if (!favs?.includes(business!!.id)) f = false;
		}
		const matchesCategory =
			selectedCategories.length === 0 ||
			selectedCategories.includes(business?.category as Category) ||
			(f && selectedCategories.includes("favourite"));
		return matchesSearch && matchesCategory;
	});

	const sortedBusinesses = useMemo(() => {
		if (!userLocation) return filteredBusinesses;
		return [...filteredBusinesses].sort((a, b) => {
			const coordsA = coordinatesByBusinessId[a.id];
			const coordsB = coordinatesByBusinessId[b.id];
			if (!coordsA || !coordsB) return 0;
			const distA = getDistance(
				userLocation.latitude,
				userLocation.longitude,
				coordsA.latitude,
				coordsA.longitude,
			);
			const distB = getDistance(
				userLocation.latitude,
				userLocation.longitude,
				coordsB.latitude,
				coordsB.longitude,
			);
			return distA - distB;
		});
	}, [filteredBusinesses, userLocation, coordinatesByBusinessId]);

	return (
		<View style={{ flex: 1 }}>
			<MapView
				style={{ flex: 1 }}
				initialRegion={{
					latitude: 43.811,
					longitude: -79.413,
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				}}
			>
				{sortedBusinesses.map((business, index) => {
					const coords = coordinatesByBusinessId[business.id];
					if (!coords) return null;
					return (
						<Marker
							key={index}
							coordinate={coords}
							title={business.name}
							description={formatCategory(business.category)}
						/>
					);
				})}
			</MapView>
			<Text
				style={{
					position: "absolute",
					top: 20,
					left: 18,
					fontSize: 34,
					fontWeight: "bold",
					padding: 6,
					borderRadius: 6,
				}}
			>
				Map
			</Text>
			<View
				style={{
					position: "absolute",
					top: 20,
					right: 18,
				}}
			>
				<ProfilePicture />
			</View>
			<View
				style={{
					position: "absolute",
					top: 80,
					left: 18,
					right: 18,
					height: 50,
					backgroundColor: "#FFE4A3",
					borderRadius: 12,
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 12,
					paddingVertical: 6,
				}}
			>
				<Ionicons name="search" size={20} color="black" />
				<TextInput
					style={{
						flex: 1,
						marginLeft: 8,
						fontSize: 16,
					}}
					placeholder="Search businesses"
					value={searchQuery}
					onChangeText={setSearchQuery}
					onSubmitEditing={handleSearchSubmit}
				/>
			</View>
			<View
				style={{
					position: "absolute",
					top: 120,
					left: 25,
					right: 25,
					flexDirection: "row",
					marginTop: 25,
				}}
			>
				<Pressable
					style={{
						backgroundColor: selectedCategories.includes("food")
							? "#FFB627"
							: "#FFE4A3",
						borderRadius: 12,
						width: 60,
						height: 60,
						justifyContent: "center",
						alignItems: "center",
						marginRight: 15,
					}}
					onPress={() => toggleCategory("food")}
				>
					<Ionicons name="fast-food-outline" size={32} color="black" />
				</Pressable>
				<Pressable
					style={{
						backgroundColor: selectedCategories.includes("services")
							? "#FFB627"
							: "#FFE4A3",
						borderRadius: 12,
						width: 60,
						height: 60,
						justifyContent: "center",
						alignItems: "center",
						marginRight: 15,
					}}
					onPress={() => toggleCategory("services")}
				>
					<Ionicons name="hammer-outline" size={32} color="black" />
				</Pressable>
				<Pressable
					style={{
						backgroundColor: selectedCategories.includes("retail")
							? "#FFB627"
							: "#FFE4A3",
						borderRadius: 12,
						width: 60,
						height: 60,
						justifyContent: "center",
						alignItems: "center",
						marginRight: 15,
					}}
					onPress={() => toggleCategory("retail")}
				>
					<Ionicons name="storefront-outline" size={32} color="black" />
				</Pressable>
				<Pressable
					style={{
						backgroundColor: selectedCategories.includes("misc")
							? "#FFB627"
							: "#FFE4A3",
						borderRadius: 12,
						width: 60,
						height: 60,
						justifyContent: "center",
						alignItems: "center",
						marginRight: 15,
					}}
					onPress={() => toggleCategory("misc")}
				>
					<Ionicons name="cog-outline" size={32} color="black" />
				</Pressable>
				<Pressable
					style={{
						backgroundColor: selectedCategories.includes("favourite")
							? "#FFB627"
							: "#FFE4A3",
						borderRadius: 12,
						width: 60,
						height: 60,
						justifyContent: "center",
						alignItems: "center",
					}}
					onPress={() => toggleCategory("favourite")}
				>
					<Ionicons name="star-outline" size={32} color="black" />
				</Pressable>
			</View>
			{/* Draggable Bottom Sheet - moved outside search/filter bar */}
			{showBottomSheet && (
				<GestureDetector gesture={panGesture}>
					<Animated.View style={animatedSheetStyle}>
						<View
							style={{
								width: 48,
								height: 6,
								backgroundColor: "#ccc",
								borderRadius: 3,
								alignSelf: "center",
								marginBottom: 12,
							}}
						/>
						<FlatList
							data={sortedBusinesses}
							renderItem={({ item }) => {
								const coords = coordinatesByBusinessId[item.id];
								let distance;
								if (coords && userLocation) {
									distance = getDistance(
										userLocation.latitude,
										userLocation.longitude,
										coords.latitude,
										coords.longitude,
									);
								}
								return <BusinessItem business={item} distance={distance} />;
							}}
							keyExtractor={(item) => item.id}
							ItemSeparatorComponent={() => <View className="h-2" />}
							scrollEnabled={true}
							contentContainerStyle={{ paddingBottom: 8 }}
							showsVerticalScrollIndicator={false}
						/>
					</Animated.View>
				</GestureDetector>
			)}
		</View>
	);
}
