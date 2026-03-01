/**
 * Account Settings Screen
 *
 * Allows the authenticated user to:
 * - View and update their profile picture
 * - Edit first name, last name, and email
 * - Change their password
 * - Sign out of the app
 */
import { useAuthStore } from "@/store/useAuthStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    ToastAndroid,
    View,
} from "react-native";

export default function AccountSettings() {
	// ---- Local form state ----
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// ---- Auth store selectors ----
	const signOut = useAuthStore((state) => state.signOut);
	const profile = useAuthStore((state) => state.profile);
	const updateProfile = useAuthStore((state) => state.updateProfile);
	const uploadProfilePicture = useAuthStore(
		(state) => state.uploadProfilePicture,
	);

	// ---- UI / upload state ----
	const [uploading, setUploading] = useState(false);
	const [firstName, setFirstName] = useState(profile?.firstname ?? "");
	const [lastName, setLastName] = useState(profile?.lastname ?? "");
	const [email, setEmail] = useState(profile?.email ?? "");
	const [saving, setSaving] = useState(false);

	/**
	 * Opens the device image picker and uploads the selected image
	 * as the user’s new profile picture.
	 */
	const handlePickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
		});

		if (result.canceled || !result.assets?.length) {
			return;
		}

		try {
			setUploading(true);
			await uploadProfilePicture(result.assets[0].uri);
			ToastAndroid.show("Profile picture updated", ToastAndroid.SHORT);
		} catch {
			ToastAndroid.show("Failed to upload picture", ToastAndroid.SHORT);
		} finally {
			setUploading(false);
		}
	};

	/**
	 * Persists profile field changes (first name, last name, email)
	 * to the backend via the auth store.
	 */
	const handleSave = async () => {
		try {
			setSaving(true);
			await updateProfile({
				firstname: firstName,
				lastname: lastName,
				email,
			});
			ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
		} catch {
			ToastAndroid.show("Failed to update profile", ToastAndroid.SHORT);
		} finally {
			setSaving(false);
		}
	};

	return (
		<ScrollView
			className="h-screen w-screen"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className="h-full w-full bg-[#FFF8F0]">
				<View className="mx-8 mt-8 flex flex-1 flex-col bg-[#FFF8F0] justify-center">
					{/* Profile Picture Section */}
					<View className="items-center mb-8">
						<Text className="text-2xl font-bold mb-4">Profile Picture</Text>
						<Pressable onPress={handlePickImage} disabled={uploading}>
							{profile?.profile_picture ? (
								<Image
									source={{ uri: profile.profile_picture }}
									style={{
										width: 120,
										height: 120,
										borderRadius: 60,
										backgroundColor: "#d1d5db",
									}}
								/>
							) : (
								<Ionicons
									name="person-circle-outline"
									size={120}
									color="black"
								/>
							)}
						</Pressable>
						<Pressable
							onPress={handlePickImage}
							disabled={uploading}
							className="mt-3 bg-[#FFB627] rounded-xl px-6 py-2"
						>
							<Text className="font-semibold">
								{uploading ? "Uploading..." : "Change Picture"}
							</Text>
						</Pressable>
					</View>

					{/* Name Fields */}
					<View className="flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
						<Ionicons name="person-outline" size={20} color="black" />
						<TextInput
							onChangeText={setFirstName}
							value={firstName}
							placeholder="First Name"
							className="ml-3 flex-1 text-base text-black"
						/>
					</View>
					<View className="flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
						<Ionicons name="person-outline" size={20} color="black" />
						<TextInput
							onChangeText={setLastName}
							value={lastName}
							placeholder="Last Name"
							className="ml-3 flex-1 text-base text-black"
						/>
					</View>

					{/* Email Field */}
					<View className="flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
						<Ionicons name="mail-outline" size={20} color="black" />
						<TextInput
							onChangeText={setEmail}
							value={email}
							placeholder="Email"
							keyboardType="email-address"
							autoCapitalize="none"
							className="ml-3 flex-1 text-base text-black"
						/>
					</View>

					{/* Password Fields */}
					<View className="flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
						<Ionicons name="lock-closed-outline" size={20} color="black" />
						<TextInput
							onChangeText={setPassword}
							value={password}
							placeholder="New Password"
							secureTextEntry={true}
							className="ml-3 flex-1 text-base text-black"
						/>
					</View>
					<View className="flex-row items-center bg-[#FFF8F0] border border-black rounded-xl px-4 py-4 mb-4">
						<Ionicons name="lock-closed-outline" size={20} color="black" />
						<TextInput
							onChangeText={setConfirmPassword}
							value={confirmPassword}
							placeholder="Confirm New Password"
							secureTextEntry={true}
							className="ml-3 flex-1 text-base text-black"
						/>
					</View>

					{/* Spacer to push buttons to bottom */}
					<View className="flex-1" />

					{/* Sign Out Button (outlined) */}
					<Pressable
						onPress={async () => {
							await signOut();
							router.replace("/login");
						}}
						className="border border-black rounded-xl px-4 py-4 mb-3 items-center"
					>
						<Text className="font-semibold text-black">Sign Out</Text>
					</Pressable>

					{/* Save Button */}
					<View
						style={{
							backgroundColor: "#E8B24E",
							borderRadius: 8,
							marginBottom: 24,
						}}
					>
						<Pressable
							onPress={handleSave}
							disabled={saving}
							style={{
								height: 40,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Text style={{ textAlign: "center", fontWeight: "600" }}>
								{saving ? "Saving..." : "Save"}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
