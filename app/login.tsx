import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [login, setLogin] = useState(true);
	const isAuth = useAuthStore((state) => state.session !== null);
	const error = useAuthStore((state) => state.error);
	const signIn = useAuthStore((state) => state.signIn);
	const signUp = useAuthStore((state) => state.signUp);
	const emailPattern =
		/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;

	useEffect(() => {
		if (isAuth) {
			console.log("isAuth");
			router.replace("/(customer)");
		}
	}, [isAuth]);
	// TODO add all the warnings when the things are wrong
	return (
		<ScrollView
			className="h-screen w-screen"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className="h-full w-full bg-white">
				<View className="mx-8 mt-8 flex flex-1 flex-col bg-white justify-center">
					{login ? (
						<>
							<TextInput
								onChangeText={setEmail}
								value={email}
								placeholder="Email"
								inputMode="email"
							/>
							<TextInput
								onChangeText={setPassword}
								value={password}
								placeholder="Password"
								secureTextEntry={true}
							/>
						</>
					) : (
						<>
							<TextInput
								onChangeText={setEmail}
								value={email}
								placeholder="Email"
								inputMode="email"
							/>
							<TextInput
								onChangeText={setPassword}
								value={password}
								placeholder="Password"
								secureTextEntry={true}
							/>
							<TextInput
								onChangeText={setConfirmPassword}
								value={confirmPassword}
								placeholder="Confirm Password"
								secureTextEntry={true}
							/>
							<TextInput
								onChangeText={setFirstName}
								value={firstName}
								placeholder="First Name"
							/>
							<TextInput
								onChangeText={setLastName}
								value={lastName}
								placeholder="Last Name"
							/>
						</>
					)}
					<Text>Error text: {error}</Text>
					<Pressable
						className="mt-5"
						onPress={() => {
							console.log("pressed");
							if (login) {
								console.log(`${isAuth} working`);
								signIn(email, password);
							} else {
								if (
									emailPattern.test(email.trim()) &&
									password.length >= 6 &&
									firstName.trim().length > 1 &&
									lastName.trim().length > 1 &&
									password == confirmPassword
								) {
									console.log("signed");
									signUp(email, password, firstName, lastName);
								}
							}
						}}
					>
						<Text>
							{login
								? "Log in"
								: "Sign up\nAfter signing up check your email and log in again"}
						</Text>
					</Pressable>
					<Pressable
						className="mt-10"
						onPress={() => setLogin((prev) => !prev)}
					>
						<Text>Switch to {login ? "sign up" : "log in"}</Text>
					</Pressable>
				</View>
			</View>
		</ScrollView>
	);
}
