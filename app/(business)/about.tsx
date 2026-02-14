import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import "../../global.css";
import ImageUploadItem from "../components/imageUploadItem";
import ProfilePicture from "../components/profilePicture";

let dummyImages = [
	{ id: "1", uri: "https://reactnative.dev/img/tiny_logo.png" },
	{ id: "2", uri: "https://reactnative.dev/img/tiny_logo.png" },
	{ id: "add", uri: "hi" },
];

export default function BusinessAbout() {
	const setMode = useModalSettingsStore((state) => state.setMode);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
	const updateBusiness = useBusinessStore((state) => state.updateBusiness);
	const updateBusinessInfo = useBusinessStore(
		(state) => state.updateBusinessInfo,
	);
	const [editingName, setEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const [editingDescription, setEditingDescription] = useState(false);
	const [newDescription, setNewDescription] = useState("");

	useFocusEffect(() => {
		setMode("business");
		return () => {};
	});

	if (dummyImages.length % 2 !== 0) {
		dummyImages = [...dummyImages, { id: "empty", uri: "" }];
	}

	return (
		<ScrollView className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-1 flex-col">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-2xl text-black dark:text-white">
						Business
					</Text>
					<ProfilePicture />
				</View>
				<View className="relative w-full h-48 mt-8">
					<Image className="bg-gray-500 w-full h-full rounded-3xl" />
					{editingName ? (
						<View
							style={{
								position: "absolute",
								bottom: 44,
								left: 16,
								right: 100,
								flexDirection: "row",
								alignItems: "center",
							}}
						>
							<TextInput
								value={newName}
								onChangeText={setNewName}
								placeholder="New business name"
								style={{
									backgroundColor: "white",
									borderRadius: 6,
									paddingHorizontal: 8,
									paddingVertical: 4,
									flex: 1,
								}}
							/>
							<Pressable
								onPress={async () => {
									if (newName.trim().length > 1) {
										await updateBusiness(ownedBusiness!!.id, {
											name: newName.trim(),
										});
									}
									setEditingName(false);
								}}
							>
								<Text style={{ marginLeft: 8 }}>Save</Text>
							</Pressable>
							<Pressable onPress={() => setEditingName(false)}>
								<Text style={{ marginLeft: 8 }}>Cancel</Text>
							</Pressable>
						</View>
					) : (
						<Text className="bottom-11 left-4 text-white font-bold text-2xl">
							{ownedBusiness?.name}
						</Text>
					)}
					<Pressable className="absolute top-4 right-2">
						<Entypo name="dots-three-vertical" size={24} color="white" />
						{/* TODO fix the ui also in a lot of other places */}
						{dropdownVisible && (
							<View
								style={{
									position: "absolute",
									top: 28,
									right: 0,
									backgroundColor: "white",
									borderRadius: 8,
									elevation: 4,
									padding: 8,
									zIndex: 10,
								}}
							>
								<Pressable
									onPress={() => {
										setDropdownVisible(false);
									}}
								>
									<Text>Upload Image</Text>
								</Pressable>
								<Pressable
									onPress={() => {
										setEditingName(true);
										setNewName(ownedBusiness!!.name);
										setDropdownVisible(false);
									}}
								>
									<Text>Change Name</Text>
								</Pressable>
							</View>
						)}
					</Pressable>
				</View>
				<View className="flex flex-col mt-6">
					<View className="flex flex-row items-center justify-between">
						<Text className="dark:text-gray-300 text-zinc-700 font-semibold text-xl">
							Working Hours
						</Text>
						<Pressable className="">
							<Feather name="edit-3" size={22} color="black" />
						</Pressable>
					</View>
					<View className="flex flex-col">
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-md">
							Saturday Closed
						</Text>
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-md">
							Sunday Closed
						</Text>
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-md">
							Monday Closed
						</Text>
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-md">
							Tuesday Closed
						</Text>
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-md">
							Wednesday Closed
						</Text>
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-md">
							Thursday Closed
						</Text>
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-md">
							Friday Closed
						</Text>
					</View>
				</View>
				<View className="flex flex-col mt-6">
					<View className="flex flex-row items-center justify-between">
						<Text className="dark:text-gray-300 text-zinc-700 font-semibold text-xl">
							About Us
						</Text>
						<Pressable
							className=""
							onPress={() => {
								setEditingDescription(true);
								setNewDescription(
									ownedBusiness?.business_information?.description ?? "",
								);
							}}
						>
							<Feather name="edit-3" size={22} color="black" />
						</Pressable>
					</View>
					{editingDescription ? (
						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<TextInput
								value={newDescription}
								onChangeText={setNewDescription}
								placeholder="New description"
								style={{
									backgroundColor: "white",
									borderRadius: 6,
									paddingHorizontal: 8,
									paddingVertical: 4,
									flex: 1,
								}}
								multiline
							/>
							<Pressable
								onPress={async () => {
									if (newDescription.trim().length > 1) {
										// TODO add edits for address and other stuff
										await updateBusinessInfo(ownedBusiness!!.id, {
											description: newDescription.trim(),
										});
									}
									setEditingDescription(false);
								}}
							>
								<Text style={{ marginLeft: 8 }}>Save</Text>
							</Pressable>
							<Pressable onPress={() => setEditingDescription(false)}>
								<Text style={{ marginLeft: 8 }}>Cancel</Text>
							</Pressable>
						</View>
					) : (
						<Text className="dark:text-gray-300 text-zinc-700 font-normal text-lg">
							{ownedBusiness?.business_information?.description ||
								"Description here"}
						</Text>
					)}
				</View>
				<View className="flex flex-col mt-6">
					<Text className="dark:text-gray-300 text-zinc-700 font-semibold text-xl">
						Upload Pictures
					</Text>
					<FlatList
						className="my-2"
						data={dummyImages}
						keyExtractor={(item) => item.id}
						numColumns={2}
						renderItem={({ item }) => (
							<ImageUploadItem id={item.id} uri={item.uri} />
						)}
						scrollEnabled={false}
						columnWrapperStyle={{ gap: 12 }}
						contentContainerStyle={{ gap: 12 }}
					/>
				</View>
			</View>
		</ScrollView>
	);
}
