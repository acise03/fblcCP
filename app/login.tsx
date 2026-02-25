import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

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
			className="h-screen w-screen bg-white"
			contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
		>
			<View className="w-full bg-white ">
				<View className="flex-row self-center bg-[#DCD5CC] rounded-full p-1 mb-10">
					<Pressable
						onPress={() => setLogin(true)}
						className={`px-6 py-2 rounded-full ${login ? "bg-[#E8B24E]" : ""
							}`}
					>
						<Text
							className={`font-semibold ${login ? "text-black" : "text-gray-600"
								}`}
						>
							Sign In
						</Text>
					</Pressable>

					<Pressable
						onPress={() => setLogin(false)}
						className={`px-6 py-2 rounded-full ${!login ? "bg-[#E8B24E]" : ""
							}`}
					>
						<Text
							className={`font-semibold ${!login ? "text-black" : "text-gray-600"
								}`}
						>
							Sign Up
						</Text>
					</Pressable>
				</View>

				<Text className="text-4xl font-extrabold text-[#2B1E1B] mb-2 text-center">
					Welcome Back!
				</Text>
				<Text className="text-2xl text-[#3E342F] mb-8 text-center">
					Log in to continue to Radius
				</Text>

				<View className="mx-8 mt-8 flex flex-col bg-white">
					{login ? (
						<>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">								<Ionicons name="mail-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setEmail}
									value={email}
									placeholder="Email"
									inputMode="email"
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setPassword}
									value={password}
									placeholder="Password"
									secureTextEntry={true}
								/>
							</View>
						</>
					) : (
						<>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setEmail}
									value={email}
									placeholder="Email"
									inputMode="email"
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setPassword}
									value={password}
									placeholder="Password"
									secureTextEntry={true}
								/></View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setConfirmPassword}
									value={confirmPassword}
									placeholder="Confirm Password"
									secureTextEntry={true}
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setFirstName}
									value={firstName}
									placeholder="First Name"
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setLastName}
									value={lastName}
									placeholder="Last Name"
								/>
							</View>
						</>
					)}
					<Text className="mt-3">Error text: {error}</Text>
					<Pressable
						className="mt-5 bg-[#E8B24E] rounded-xl py-4 items-center mb-6 "
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
								: "Sign up"}
						</Text>
					</Pressable>
					<Text>
						{login
							? ""
							: "After signing up check your email and log in again"}
					</Text>

				</View>
			</View>
		</ScrollView>
	);
}
