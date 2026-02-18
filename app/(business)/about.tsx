import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
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

type EditableInfoField =
	| "description"
	| "address"
	| "phone"
	| "email"
	| "website";

const fieldLabels: Record<EditableInfoField, string> = {
	description: "About Us",
	address: "Address",
	phone: "Phone Number",
	email: "Email",
	website: "Website",
};

const fieldPlaceholders: Record<EditableInfoField, string> = {
	description: "Business description",
	address: "Business address",
	phone: "Phone number",
	email: "Email",
	website: "Website URL",
};

export default function BusinessAbout() {
	const setMode = useModalSettingsStore((state) => state.setMode);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);
	const updateBusiness = useBusinessStore((state) => state.updateBusiness);
	const updateBusinessAddress = useBusinessStore(
		(state) => state.updateBusinessAddress,
	);
	const updateBusinessInfo = useBusinessStore(
		(state) => state.updateBusinessInfo,
	);
	const [editingName, setEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const refreshBusiness = useAuthStore((state) => state.refreshOwnedBusiness);

	useFocusEffect(() => {
		setMode("business");
		return () => {};
	});

	if (dummyImages.length % 2 !== 0) {
		dummyImages = [...dummyImages, { id: "empty", uri: "" }];
	}

	const [editingField, setEditingField] = useState<EditableInfoField | null>(
		null,
	);
	const [draftValues, setDraftValues] = useState<
		Record<EditableInfoField, string>
	>({
		description: "",
		address: "",
		phone: "",
		email: "",
		website: "",
	});
	const [fieldErrors, setFieldErrors] = useState<
		Partial<Record<EditableInfoField, string>>
	>({});

	useEffect(() => {
		setDraftValues({
			description: ownedBusiness?.business_information?.description ?? "",
			address: ownedBusiness?.business_addresses?.address ?? "",
			phone: ownedBusiness?.business_information?.phone ?? "",
			email: ownedBusiness?.business_information?.email ?? "",
			website: ownedBusiness?.business_information?.website ?? "",
		});
	}, [ownedBusiness]);

	const validateField = (
		field: EditableInfoField,
		value: string,
	): string | null => {
		const v = value.trim();

		if (v.length === 0) return null;

		if (field === "email") {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(v)) return "Invalid email format.";
		}

		if (field === "phone") {
			const digits = v.replace(/\D/g, "");
			if (digits.length < 7 || digits.length > 15) {
				return "Phone number must be 7-15 digits.";
			}
		}

		if (field === "website") {
			const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
			try {
				const url = new URL(candidate);
				if (!url.hostname || !url.hostname.includes(".")) {
					return "Invalid website URL.";
				}
			} catch {
				return "Invalid website URL.";
			}
		}

		return null;
	};

	const startEditing = (field: EditableInfoField) => {
		setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
		setEditingField(field);
	};

	const saveField = async (field: EditableInfoField) => {
		if (!ownedBusiness) return;

		const nextValue = (draftValues[field] ?? "").trim();
		const error = validateField(field, nextValue);

		if (error) {
			setFieldErrors((prev) => ({ ...prev, [field]: error }));
			return;
		}

		if (field === "address") {
			await updateBusinessAddress(ownedBusiness.id, nextValue);
		} else {
			await updateBusinessInfo(ownedBusiness.id, {
				[field]: nextValue,
			} as Partial<
				Record<"description" | "phone" | "email" | "website", string>
			>);
		}

		setEditingField(null);
		setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
		await refreshBusiness();
	};

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
									refreshBusiness();
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
					<Pressable
						className="absolute top-4 right-2"
						onPress={() => setDropdownVisible((prev) => !prev)}
					>
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
									width: 150,
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
					<View className="flex flex-col mt-6">
						{(
							[
								"description",
								"address",
								"phone",
								"email",
								"website",
							] as EditableInfoField[]
						).map((field) => {
							const isEditing = editingField === field;
							const currentValue =
								field === "address"
									? (ownedBusiness?.business_addresses?.address ?? "")
									: ((ownedBusiness?.business_information?.[field] ??
											"") as string);
							const isMultiline = field === "description";

							return (
								<View key={field} className="mb-5">
									<View className="flex flex-row items-center justify-between">
										<Text className="dark:text-gray-300 text-zinc-700 font-semibold text-xl">
											{fieldLabels[field]}
										</Text>
										<Pressable onPress={() => startEditing(field)}>
											<Feather name="edit-3" size={22} color="black" />
										</Pressable>
									</View>

									{isEditing ? (
										<View style={{ flexDirection: "column", marginTop: 8 }}>
											<TextInput
												value={draftValues[field]}
												onChangeText={(text) =>
													setDraftValues((prev) => ({ ...prev, [field]: text }))
												}
												placeholder={fieldPlaceholders[field]}
												style={{
													backgroundColor: "white",
													borderRadius: 6,
													paddingHorizontal: 8,
													paddingVertical: 8,
													borderWidth: 1,
													borderColor: "#e5e7eb",
													minHeight: isMultiline ? 90 : 40,
													textAlignVertical: isMultiline ? "top" : "center",
												}}
												multiline={isMultiline}
												autoCapitalize={
													field === "email" || field === "website"
														? "none"
														: "sentences"
												}
												keyboardType={
													field === "email"
														? "email-address"
														: field === "phone"
															? "phone-pad"
															: "default"
												}
											/>
											{fieldErrors[field] ? (
												<Text style={{ color: "#dc2626", marginTop: 6 }}>
													{fieldErrors[field]}
												</Text>
											) : null}
											<View style={{ flexDirection: "row", marginTop: 8 }}>
												<Pressable onPress={() => saveField(field)}>
													<Text style={{ marginRight: 12 }}>Save</Text>
												</Pressable>
												<Pressable onPress={() => setEditingField(null)}>
													<Text>Cancel</Text>
												</Pressable>
											</View>
										</View>
									) : (
										<Text className="dark:text-gray-300 text-zinc-700 font-normal text-lg mt-1">
											{currentValue.trim().length > 0
												? currentValue
												: "Not provided"}
										</Text>
									)}
								</View>
							);
						})}
					</View>
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
