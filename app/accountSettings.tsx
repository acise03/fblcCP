import { useAuthStore } from "@/store/useAuthStore";
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

export default function AccountSettings() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const signOut = useAuthStore((state) => state.signOut);

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
						onChangeText={setPassword}
						value={password}
						placeholder="New Password"
						secureTextEntry={true}
					/>
					<TextInput
						onChangeText={setConfirmPassword}
						value={confirmPassword}
						placeholder="Confirm New Password"
						secureTextEntry={true}
					/>
					{/* TODO need to add updatePassword function in auth.ts */}
					<Pressable onPress={() => {}}>
						<Text>Set</Text>
					</Pressable>
					<Pressable
						onPress={() => {
							signOut();
							router.replace("/login");
						}}
					>
						<Text>Sign out</Text>
					</Pressable>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}
