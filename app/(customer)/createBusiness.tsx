import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { router } from "expo-router";
import { useState } from "react";
import {
    Keyboard,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function CreateBusiness() {
	const [businessName, setBusinessName] = useState("");
	const [description, setDescription] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [placeId, setPlaceId] = useState<string | null>(null);
	const [website, setWebsite] = useState("");
	const [address, setAddress] = useState("");
	const createBusiness = useBusinessStore((state) => state.createBusiness);
	const updateBusinessInfo = useBusinessStore(
		(state) => state.updateBusinessInfo,
	);
	const updateBusinessAddress = useBusinessStore(
		(state) => state.updateBusinessAddress,
	);
	const refreshBusiness = useAuthStore((state) => state.refreshOwnedBusiness);
	const loading = useAuthStore((state) => state.loading);
	const userId = useAuthStore((state) => state.user!!.id);
	const isValidEmail = (value: string) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	const isValidPhone = (value: string) => /^\+?[0-9().\-\s]{7,20}$/.test(value);
	const isValidWebsite = (value: string) =>
		/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(value);
	const error = useBusinessStore((state) => state.error);
	if (loading) return null;

	return (
		<TouchableWithoutFeedback
			onPress={() => {
				Keyboard.dismiss();
			}}
			accessible={false}
			className="h-screen w-screen"
		>
			<View className="h-full w-full bg-white">
				<View className="mx-8 mt-8 flex flex-1 flex-col bg-white justify-center">
					<TextInput
						onChangeText={setBusinessName}
						value={businessName}
						placeholder="Business Name"
					/>
					<GooglePlacesAutocomplete
						placeholder="Address"
						fetchDetails={true}
						onPress={(data, details = null) => {
							console.log(data);
							setAddress(details?.formatted_address!!);
							setPlaceId(data.place_id);
						}}
						query={{
							key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
							language: "en",
						}}
					/>
					<TextInput
						onChangeText={setDescription}
						value={description}
						placeholder="Description"
					/>
					<TextInput
						onChangeText={setEmail}
						value={email}
						placeholder="Email"
						inputMode="email"
					/>
					<TextInput
						onChangeText={setPhone}
						value={phone}
						placeholder="Phone"
						inputMode="tel"
					/>
					<TextInput
						onChangeText={setWebsite}
						value={website}
						placeholder="Website"
						inputMode="url"
					/>
					<Pressable
						onPress={async () => {
							const b = businessName.trim();
							const d = description.trim();
							const e = email.trim().toLowerCase();
							const p = phone.trim();
							const w = website.trim();
							console.log("business create pressed");

							if (!b) return;
							if (e && !isValidEmail(e)) return;
							if (p && !isValidPhone(p)) return;
							if (w && !isValidWebsite(w)) return;
							// TODO deal with guards later

							if (!placeId) return;
							console.log("guards passed");

							await createBusiness(b, userId).then((business) => {
								updateBusinessAddress(business.id, address).then((res) => {
									updateBusinessInfo(business.id, {
										description: d,
										email: e,
										phone: p,
										website: w,
									});
								});
							});

							refreshBusiness();
							if (!error) router.replace("/(business)");
						}}
					>
						<Text>Create Business</Text>
						<Text>Error text: {error}</Text>
					</Pressable>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}
