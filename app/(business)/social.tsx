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

type SocialItem = Announcement | Poll;

const dummyData: SocialItem[] = [
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

export default function BusinessSocial() {
	const [message, setMessage] = useState("");
	const setMode = useModalSettingsStore((state) => state.setMode);

	useFocusEffect(() => {
		setMode("business");
		return () => {};
	});

	return (
		<View className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-1 flex-col bg-white">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-2xl text-black">Social</Text>
					<ProfilePicture />
				</View>
				<View className="flex flex-col mt-6">
					<View className="flex flex-col rounded-2xl bg-orange-50 w-full h-56 mt-2 px-2 py-1 pb-3 justify-between">
						<TextInput
							placeholder="Message"
							value={message}
							onChangeText={setMessage}
							className="text-black h-44"
							multiline={true}
							scrollEnabled={true}
							textAlignVertical="top"
						/>
						<View className="flex flex-row mx-1 justify-between">
							<View className="flex flex-row">
								<Pressable className="flex flex-row items-center">
									<Text className="text-black">Announcement</Text>
									<Feather
										name="chevron-down"
										className="pt-1"
										size={18}
										color="black"
									/>
								</Pressable>
								<Pressable className="flex flex-row items-center ml-3">
									<Text className="text-black">Votes</Text>
								</Pressable>
							</View>
							<Pressable>
								<Feather name="send" size={18} color="black" />
							</Pressable>
						</View>
					</View>
				</View>
				<View className="flex flex-col flex-1 mt-6">
					<Text className=" text-zinc-700 font-semibold text-xl">Recent</Text>
					<FlatList
						className="mt-2"
						data={dummyData}
						renderItem={({ item }) => {
							if (item instanceof Announcement) {
								const announcementObject = item.getAnnouncement();
								return (
									<AnnouncementItem
										text={announcementObject.text}
										date={announcementObject.date}
									/>
								);
							} else {
								const pollObject = item.getPoll();
								return (
									<PollItem
										text={pollObject.text}
										date={pollObject.date}
										votes={pollObject.votes}
										comments={pollObject.comments}
									/>
								);
							}
						}}
						keyExtractor={(item) =>
							item instanceof Announcement
								? item.getAnnouncement().id
								: item.getPoll().id
						}
						ItemSeparatorComponent={() => <View className="h-2" />}
						scrollEnabled={true}
						contentContainerStyle={{ paddingBottom: 8 }}
						showsVerticalScrollIndicator={false}
					/>
				</View>
			</View>
		</View>
	);
}
