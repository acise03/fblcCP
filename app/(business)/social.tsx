/**
 * Business Social / Post Management (Social Tab)
 *
 * Allows business owners to create, edit, and view posts (announcements,
 * sales, coupons). Features a gesture-driven bottom sheet for the
 * post editor with:
 * - Post type selector dropdown (Announcement / Sale / Coupon)
 * - Highlight field (promo code for coupons, percentage for sales)
 * - Date range picker for sales and coupons
 * - Description text input
 *
 * Posts are persisted via the businesses API and refreshed on submit.
 */
import { businessesApi } from "@/db/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Keyboard,
    Pressable,
    Text,
    TextInput,
    ToastAndroid,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import "../../global.css";
import AnnouncementItem from "../components/announcementItem";
import ProfilePicture from "../components/profilePicture";

/** Allowed post categories */
type PostType = "announcement" | "sale" | "coupon";

/** Human-readable labels for each post type */
const postTypeLabels: Record<PostType, string> = {
	announcement: "Announcement",
	sale: "Sale",
	coupon: "Coupon",
};

/** Feather icon name for each post type */
const postTypeIcons: Record<PostType, "volume-2" | "tag" | "gift"> = {
	announcement: "volume-2",
	sale: "tag",
	coupon: "gift",
};

export default function BusinessSocial() {
	// ---- Store selectors ----
	const posts = useBusinessStore((state) => state.posts);
	const setPosts = useBusinessStore((state) => state.setPosts);
	const setModalMode = useModalSettingsStore((state) => state.setMode);
	const router = useRouter();
	const screenHeight = Dimensions.get("window").height;
	const sheetHeight = Math.round(screenHeight * 0.725);
	const collapsedY = sheetHeight * 0.935;
	const translateY = useSharedValue(collapsedY);
	const [message, setMessage] = useState("");
	const [dateConfigOpen, setDateConfigOpen] = useState(false);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
	const [postType, setPostType] = useState<PostType>("announcement");
	const [postTypeMenuOpen, setPostTypeMenuOpen] = useState(false);
	const [highlight, setHighlight] = useState("");
	const [showPicker, setShowPicker] = useState<null | "start" | "end">(null);
	const [showSheet, setShowSheet] = useState(false);
	const [editingId, setEditingId] = useState<string | null>();
	useFocusEffect(() => {
		setModalMode("business");
		return () => {};
	});

	const resetDateConfig = useCallback(() => {
		setDateConfigOpen(false);
		setStartDate(null);
		setEndDate(null);
		setShowPicker(null);
	}, []);

	const panGesture = Gesture.Pan()
		.runOnJS(true)
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
				resetDateConfig();
				Keyboard.dismiss();
			}
		});

	const animatedSheetStyle = useAnimatedStyle(() => ({
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: sheetHeight,
		backgroundColor: "#FFF8F0",
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

	useEffect(() => {
		const fetchPosts = async () => {
			if (!ownedBusiness?.id) return;
			businessesApi.getPostsByBusiness(ownedBusiness.id).then((posts) => {
				setPosts(posts);
			});
		};
		fetchPosts();
	}, [ownedBusiness?.id]);

	useEffect(() => {
		if (editingId != null) {
			if (editingId == "hide") {
				translateY.value = withSpring(collapsedY);
				setShowSheet(false);
				return;
			}
			setShowSheet(true);
			translateY.value = withSpring(0);
			businessesApi.getPostById(editingId).then((post) => {
				setMessage(post.text);
				setHighlight(post.highlight ?? "");
				setPostType(post.type);
				setEndDate(post.end_date);
				setStartDate(new Date(post.start_date!!));
				setEndDate(new Date(post.end_date!!));
			});
		}
	}, [editingId]);

	return (
		<View className="h-full w-full bg-[#FFF8F0]">
			<View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0]">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-4xl text-black">Community</Text>
					<ProfilePicture />
				</View>

				<View className="flex flex-col flex-1 mt-6">
					<View className="flex flex-row items-center justify-between">
						<Text className="text-zinc-700 font-semibold text-3xl mb-2">
							Events
						</Text>
						<Pressable
							onPress={() => {
								setShowSheet(true);
								translateY.value = withSpring(0);
								setEditingId(null);
								setMessage("");
								setHighlight("");
								setPostType("announcement");
							}}
						>
							<Ionicons name="add-circle-sharp" size={30} color="orange" />
						</Pressable>
					</View>
					<FlatList
						className="mt-2 mb-12"
						data={posts}
						renderItem={({ item }) => {
							return (
								<AnnouncementItem
									announcement={item}
									setEditing={setEditingId}
								/>
							);
						}}
						keyExtractor={(item) => item.id}
						ItemSeparatorComponent={() => <View className="h-2" />}
						scrollEnabled={true}
						contentContainerStyle={{ paddingBottom: 8, paddingHorizontal: 0 }}
						showsVerticalScrollIndicator={false}
					/>
				</View>
			</View>
			{showSheet && (
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
						<View className="flex-1 mt-2" style={{ zIndex: 1 }}>
							{/* Post Type Dropdown */}
							<View style={{ zIndex: 20 }}>
								<Pressable
									className="flex-row items-center justify-between border border-black rounded-lg px-3 py-2 mb-5"
									onPress={() => setPostTypeMenuOpen((prev) => !prev)}
								>
									<View className="flex-row items-center">
										<Feather
											name={postTypeIcons[postType]}
											size={25}
											color="black"
										/>
										<Text className="text-black text-xl ml-2">
											{postTypeLabels[postType]}
										</Text>
									</View>
									<Feather
										name="chevron-down"
										className="pt-1"
										size={18}
										color="black"
									/>
								</Pressable>

								{postTypeMenuOpen && (
									<View
										className="border border-gray-300 rounded-md bg-white"
										style={{
											position: "absolute",
											top: 48,
											left: 0,
											right: 0,
											zIndex: 30,
											elevation: 10,
										}}
									>
										{(["announcement", "sale", "coupon"] as PostType[]).map(
											(option) => (
												<Pressable
													key={option}
													onPress={() => {
														setPostType(option);
														setHighlight("");
														setPostTypeMenuOpen(false);
														setDateConfigOpen(false);
														setStartDate(null);
														setEndDate(null);
														setShowPicker(null);
													}}
													className={`px-3 py-3 border-b border-gray-200 flex-row items-center ${
														postType === option ? "bg-[#FFE4A3]" : ""
													}`}
												>
													<Feather
														name={postTypeIcons[option]}
														size={18}
														color="black"
														style={{ marginRight: 8 }}
													/>
													<Text className="text-black text-lg">
														{postTypeLabels[option]}
													</Text>
												</Pressable>
											),
										)}
									</View>
								)}
							</View>

							{/* Highlight field for Coupon / Sale */}
							{postType === "coupon" && (
								<View className="border border-black rounded-lg items-center justify-center px-4 py-6 mb-4">
									<TextInput
										placeholder="CODE"
										value={highlight}
										onChangeText={(text) =>
											setHighlight(text.toUpperCase().slice(0, 8))
										}
										maxLength={8}
										autoCapitalize="characters"
										className="text-black text-3xl font-bold text-center w-full"
										placeholderTextColor="#ccc"
									/>
									<Text className="text-gray-400 text-sm mt-1">
										Max 8 characters
									</Text>
								</View>
							)}

							{postType === "sale" && (
								<View className="border border-black rounded-lg items-center justify-center px-4 py-6 mb-4">
									<View className="flex-row items-baseline" style={{ gap: -4 }}>
										<TextInput
											placeholder="00"
											value={highlight}
											onChangeText={(text) =>
												setHighlight(text.replace(/[^0-9]/g, "").slice(0, 3))
											}
											maxLength={3}
											keyboardType="numeric"
											className="text-black text-3xl font-bold text-center"
											placeholderTextColor="#ccc"
											style={{ minWidth: 60, paddingRight: 0 }}
										/>
										<Text
											className="text-black text-3xl font-bold"
											style={{ marginLeft: -8 }}
										>
											%
										</Text>
									</View>
								</View>
							)}

							<TextInput
								placeholder="Description..."
								value={message}
								onChangeText={setMessage}
								multiline={true}
								scrollEnabled={true}
								textAlignVertical="top"
								className="flex-1 text-black text-base border border-black rounded-lg p-3"
							/>

							{(postType === "sale" || postType === "coupon") &&
								!dateConfigOpen && (
									<Pressable
										className="mt-4 py-3 rounded-xl items-center border border-black"
										onPress={() => setDateConfigOpen(true)}
									>
										<Text className="text-black text-lg">Configure Date</Text>
									</Pressable>
								)}

							{(postType === "sale" || postType === "coupon") &&
								dateConfigOpen && (
									<View className="mt-4">
										<View className="flex-row gap-2">
											<Pressable
												className="flex-1 px-3 py-3 rounded-xl items-center border border-black bg-[#FFF8F0]"
												onPress={() => setShowPicker("start")}
											>
												<Text className="text-black text-lg">
													{startDate
														? startDate.toLocaleDateString()
														: "Start date"}
												</Text>
											</Pressable>
											<Pressable
												className="flex-1 px-3 py-3 rounded-xl items-center border border-black bg-[#FFF8F0]"
												onPress={() => setShowPicker("end")}
											>
												<Text className="text-black text-lg">
													{endDate ? endDate.toLocaleDateString() : "End date"}
												</Text>
											</Pressable>
										</View>

										{showPicker && (
											<DateTimePicker
												value={
													showPicker === "start"
														? (startDate ?? new Date())
														: (endDate ?? new Date())
												}
												mode="date"
												display="default"
												minimumDate={
													showPicker === "end" && startDate
														? startDate
														: undefined
												}
												maximumDate={
													showPicker === "start" && endDate
														? endDate
														: undefined
												}
												onChange={(_, selectedDate) => {
													setShowPicker(null);
													if (!selectedDate) return;
													if (showPicker === "start")
														setStartDate(selectedDate);
													if (showPicker === "end") setEndDate(selectedDate);
												}}
											/>
										)}
									</View>
								)}

							<Pressable
								className="mt-4 bg-[#FFB703] py-3 rounded-xl items-center"
								onPress={async () => {
									// Validation guard
									const isSaleOrCoupon =
										postType === "sale" || postType === "coupon";
									if (
										!message.trim() ||
										(isSaleOrCoupon &&
											(!highlight.trim() || !startDate || !endDate))
									) {
										ToastAndroid.show(
											"You need to fill in all fields",
											ToastAndroid.SHORT,
										);
										setEditingId("hide");
										return;
									}
									if (editingId != null && editingId != "hide") {
										await businessesApi.editPost(editingId, {
											type: postType,
											highlight:
												postType === "coupon"
													? highlight
													: postType === "sale"
														? `${highlight}`
														: undefined,
											text: message,
											start_date: startDate
												? (startDate.toISOString() as any)
												: null,
											end_date: endDate ? (endDate.toISOString() as any) : null,
										});
										ToastAndroid.show("Post edited", ToastAndroid.SHORT);
									} else {
										await businessesApi.upsertPost({
											businessId: ownedBusiness!!.id,
											type: postType,
											highlight:
												postType === "coupon"
													? highlight
													: postType === "sale"
														? `${highlight}`
														: undefined,
											text: message,
											date: new Date().toISOString(),
											start_date: startDate ? startDate.toISOString() : null,
											end_date: endDate ? endDate.toISOString() : null,
										});
										ToastAndroid.show("Post created", ToastAndroid.SHORT);
									}

									businessesApi
										.getPostsByBusiness(ownedBusiness!!.id)
										.then((posts) => {
											setPosts(posts);
											setEditingId("hide");
											setShowSheet(false);
											translateY.value = withSpring(collapsedY);
										});
								}}
							>
								<Text className="text-black font-semibold text-lg">Post</Text>
							</Pressable>
						</View>
					</Animated.View>
				</GestureDetector>
			)}
		</View>
	);
}
