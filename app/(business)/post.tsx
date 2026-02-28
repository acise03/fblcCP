import { businessesApi } from "@/db/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import "../../global.css";
import ProfilePicture from "../components/profilePicture";

export default function Post() {
	const [message, setMessage] = useState("");
	const setModalMode = useModalSettingsStore((state) => state.setMode);
	const [dateEnabled, setDateEnabled] = useState(false);
	const [mode, setMode] = useState<"single" | "range">("single");
	const [singleDate, setSingleDate] = useState<Date | null>(null);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
	const setPosts = useBusinessStore((state) => state.setPosts);
	const [showPicker, setShowPicker] = useState<
		null | "single" | "start" | "end"
	>(null);

	useFocusEffect(() => {
		setModalMode("business");
		return () => {};
	});

	return (
		<View className="flex-1 bg-white px-6 pt-10">
			<View className="flex flex-row items-center justify-between mb-1">
				<Text className="text-3xl font-bold text-black">Community</Text>
				<ProfilePicture />
			</View>

			<View className="flex-1 mt-2">
				<Pressable className="flex-row items-center justify-between border border-black rounded-lg px-3 py-2 mb-3">
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

				{/* Date toggle */}
				<View className="mb-2 flex-row">
					<Pressable
						className={`flex-1 py-2 rounded-lg mr-2 ${dateEnabled ? "bg-[#FFB703]" : "bg-gray-200"}`}
						onPress={() => setDateEnabled(true)}
					>
						<Text className="text-center text-black font-semibold">
							Include Date
						</Text>
					</Pressable>
					<Pressable
						className={`flex-1 py-2 rounded-lg ${!dateEnabled ? "bg-[#FFB703]" : "bg-gray-200"}`}
						onPress={() => setDateEnabled(false)}
					>
						<Text className="text-center text-black font-semibold">
							No Date
						</Text>
					</Pressable>
				</View>

				{/* Date picker UI, only if enabled */}
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
								className="px-3 py-2 rounded-lg border border-black bg-white"
								onPress={() => setShowPicker("single")}
							>
								<Text className="text-black">
									{singleDate ? singleDate.toDateString() : "Choose a date"}
								</Text>
							</Pressable>
						) : (
							<View className="flex-row gap-2">
								<Pressable
									className="flex-1 px-3 py-2 rounded-lg border border-black bg-white"
									onPress={() => setShowPicker("start")}
								>
									<Text className="text-black">
										{startDate ? startDate.toDateString() : "Start date"}
									</Text>
								</Pressable>
								<Pressable
									className="flex-1 px-3 py-2 rounded-lg border border-black bg-white"
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
								router.navigate("/(business)/social");
							});
					}}
				>
					<Text className="text-black font-semibold text-lg">Post</Text>
				</Pressable>
			</View>
		</View>
	);
}
