import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useState } from "react";
import {
    Keyboard,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function CreateBusiness() {
	const [businessName, setBusinessName] = useState("");
	const [address, setAddress] = useState("");
	const [description, setDescription] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [website, setWebsite] = useState("");
	const createBusiness = useBusinessStore((state) => state.createBusiness);
	const updateBusinessInfo = useBusinessStore(
		(state) => state.updateBusinessInfo,
	);
	const updateBusinessAddress = useBusinessStore(
		(state) => state.updateBusinessAddress,
	);
	const userId = useAuthStore((state) => state.user!!.id);
	const isValidEmail = (value: string) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	const isValidPhone = (value: string) => /^\+?[0-9().\-\s]{7,20}$/.test(value);
	const isValidWebsite = (value: string) =>
		/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(value);
	const isValidAddress = (value: string) =>
		/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value.trim());
	const error = useBusinessStore((state) => state.error);

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
					<TextInput
						onChangeText={setAddress}
						value={address}
						placeholder="Address"
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
							const a = address.trim();
							const d = description.trim();
							const e = email.trim().toLowerCase();
							const p = phone.trim();
							const w = website.trim();

							if (!b || !a || !d || !e || !p || !w) return;
							if (!isValidEmail(e)) return;
							if (!isValidPhone(p)) return;
							if (!isValidWebsite(w)) return;
							if (!isValidAddress(a)) return;

							const business = await createBusiness(b, userId);
							updateBusinessAddress(business.id, address);
							updateBusinessInfo(business.id, {
								description: d,
								email: e,
								phone: p,
								website: w,
							});
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
