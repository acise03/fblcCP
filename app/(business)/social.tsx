import { businessesApi } from "@/db/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import "../../global.css";
import AnnouncementItem from "../components/announcementItem";
import ProfilePicture from "../components/profilePicture";

export default function BusinessSocial() {
	const posts = useBusinessStore((state) => state.posts);
	const setPosts = useBusinessStore((state) => state.setPosts);
	const setModalMode = useModalSettingsStore((state) => state.setMode);
	const router = useRouter();
	const screenHeight = Dimensions.get("window").height;
	const sheetHeight = Math.round(screenHeight * 0.725);
	const collapsedY = sheetHeight * 0.935;
	const translateY = useSharedValue(collapsedY);
	const [message, setMessage] = useState("");
	const [dateEnabled, setDateEnabled] = useState(false);
	const [mode, setMode] = useState<"single" | "range">("single");
	const [singleDate, setSingleDate] = useState<Date | null>(null);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
	const [showPicker, setShowPicker] = useState<
		null | "single" | "start" | "end"
	>(null);
	useFocusEffect(() => {
		setModalMode("business");
		return () => {};
	});

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
		marginHorizontal: 12,
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
					</View>
					<FlatList
						className="mt-2"
						data={posts}
						renderItem={({ item }) => {
							if (item.type == "announcement") {
								return <AnnouncementItem announcement={item} />;
							} else {
								return <></>;
							}
						}}
						keyExtractor={(item) => item.id}
						ItemSeparatorComponent={() => <View className="h-2" />}
						scrollEnabled={true}
						contentContainerStyle={{ paddingBottom: 8, paddingHorizontal: 0 }}
						showsVerticalScrollIndicator={false}
					/>
				</View>
			</View>
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
					<View className="flex-1 mt-2">
						<Pressable className="flex-row items-center justify-between border border-black rounded-lg px-3 py-2 mb-5">
							<View className="flex-row items-center">
								<Feather name="volume-2" size={25} color="black" />
								<Text className="text-black text-xl"> Announcement</Text>
							</View>
							<Feather
								name="chevron-down"
								className="pt-1"
								size={18}
								color="black"
							/>
						</Pressable>

						<TextInput
							placeholder="Message"
							value={message}
							onChangeText={setMessage}
							multiline={true}
							scrollEnabled={true}
							textAlignVertical="top"
							className="flex-1 text-black text-base border border-black rounded-lg p-3"
						/>

						<View className="mb-2 flex-row">
							<Pressable
								className={`flex-1 h-12 mt-4 mr-4 rounded-lg flex items-center justify-center ${dateEnabled ? "bg-[#FFB703]" : "bg-gray-200"}`}
								onPress={() => setDateEnabled(true)}
							>
								<Text className="text-black text-lg  ">Include Date</Text>
							</Pressable>

							<Pressable
								className={`flex-1 h-12 mt-4 rounded-lg flex items-center justify-center ${!dateEnabled ? "bg-[#FFB703]" : "bg-gray-200"}`}
								onPress={() => setDateEnabled(false)}
							>
								<Text className="text-black  text-lg  ">No Date</Text>
							</Pressable>
						</View>

						{dateEnabled && (
							<View className="mb-4">
								<View className="flex-row mb-2">
									<Pressable
										className={`flex-1 py-2 rounded-lg mr-2 ${mode === "single" ? "bg-[#FFB703]" : "bg-gray-200"}`}
										onPress={() => setMode("single")}
									>
										<Text className="text-center text-black font-semibold">
											Single Day
										</Text>
									</Pressable>
									<Pressable
										className={`flex-1 py-2 rounded-lg ${mode === "range" ? "bg-[#FFB703]" : "bg-gray-200"}`}
										onPress={() => setMode("range")}
									>
										<Text className="text-center text-black font-semibold">
											Day Range
										</Text>
									</Pressable>
								</View>

								{mode === "single" ? (
									<Pressable
										className="px-3 py-2 rounded-lg border border-black bg-[#FFF8F0]"
										onPress={() => setShowPicker("single")}
									>
										<Text className="text-black">
											{singleDate ? singleDate.toDateString() : "Choose a date"}
										</Text>
									</Pressable>
								) : (
									<View className="flex-row gap-2">
										<Pressable
											className="flex-1 px-3 py-2 rounded-lg border border-black bg-[#FFF8F0]"
											onPress={() => setShowPicker("start")}
										>
											<Text className="text-black">
												{startDate ? startDate.toDateString() : "Start date"}
											</Text>
										</Pressable>
										<Pressable
											className="flex-1 px-3 py-2 rounded-lg border border-black bg-[#FFF8F0]"
											onPress={() => setShowPicker("end")}
										>
											<Text className="text-black">
												{endDate ? endDate.toDateString() : "End date"}
											</Text>
										</Pressable>
									</View>
								)}

								{showPicker && (
									<DateTimePicker
										value={
											showPicker === "single"
												? (singleDate ?? new Date())
												: showPicker === "start"
													? (startDate ?? new Date())
													: (endDate ?? new Date())
										}
										mode="date"
										display="default"
										minimumDate={
											showPicker === "end" && startDate ? startDate : undefined
										}
										maximumDate={
											showPicker === "start" && endDate ? endDate : undefined
										}
										onChange={(_, selectedDate) => {
											setShowPicker(null);
											if (!selectedDate) return;
											if (showPicker === "single") setSingleDate(selectedDate);
											if (showPicker === "start") setStartDate(selectedDate);
											if (showPicker === "end") setEndDate(selectedDate);
										}}
									/>
								)}
							</View>
						)}

						<Pressable
							className="mt-4 bg-[#FFB703] py-3 rounded-xl items-center"
							onPress={async () => {
								await businessesApi.upsertPost({
									businessId: ownedBusiness!!.id,
									type: "announcement",
									text: message,
									date: new Date().toISOString(),
								});
								businessesApi
									.getPostsByBusiness(ownedBusiness!!.id)
									.then((posts) => {
										setPosts(posts);
										ToastAndroid.show("Post created", ToastAndroid.SHORT);
										translateY.value = withSpring(collapsedY);
									});
							}}
						>
							<Text className="text-black font-semibold text-lg">Post</Text>
						</Pressable>
					</View>
				</Animated.View>
			</GestureDetector>
		</View>
	);
}
