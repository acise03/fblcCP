import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import "../../global.css";
import { Announcement } from "../../models/announcement";
import { Poll } from "../../models/poll";
import AnnouncementItem from "../components/announcementItem";
import PollItem from "../components/pollItem";
import ProfilePicture from "../components/profilePicture";

export default function Post() {
	const [message, setMessage] = useState("");
	const setMode = useModalSettingsStore((state) => state.setMode);

	useFocusEffect(() => {
		setMode("business");
		return () => { };
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
				<Pressable className="mt-4 bg-[#FFB703] py-3 rounded-xl items-center">
					<Text className="text-black font-semibold text-lg">Post</Text>
				</Pressable>
			</View>
		</View>
	);
}