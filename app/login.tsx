import { useAuthStore } from "@/store/useAuthStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing,
} from "react-native-reanimated";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [login, setLogin] = useState(true);
	const [signUpStep, setSignUpStep] = useState(1);
	const [validationError, setValidationError] = useState("");
	const isAuth = useAuthStore((state) => state.session !== null);
	const error = useAuthStore((state) => state.error);
	const signIn = useAuthStore((state) => state.signIn);
	const signUp = useAuthStore((state) => state.signUp);
	const emailPattern =
		/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;

	// Animated indicator position for the tab switcher
	const tabIndicatorX = useSharedValue(0);
	const TAB_WIDTH = 100;

	useEffect(() => {
		tabIndicatorX.value = withTiming(login ? 0 : TAB_WIDTH, {
			duration: 250,
			easing: Easing.out(Easing.cubic),
		});
	}, [login]);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: tabIndicatorX.value }],
	}));

	useEffect(() => {
		if (isAuth) {
			console.log("isAuth");
			router.replace("/(customer)");
		}
	}, [isAuth]);

	return (
		<ScrollView
			className="h-screen w-screen bg-white"
			contentContainerStyle={{ flexGrow: 1, paddingTop: 120 }}
		>
			<View className="w-full bg-white">
				{/* Tab Switcher */}
				<View className="self-center mb-10">
					<View className="flex-row bg-[#DCD5CC] rounded-full p-1 relative">
						{/* Animated sliding indicator */}
						<Animated.View
							style={[
								{
									position: "absolute",
									top: 4,
									bottom: 4,
									left: 4,
									width: TAB_WIDTH,
									borderRadius: 9999,
									backgroundColor: "#E8B24E",
								},
								indicatorStyle,
							]}
						/>
						<Pressable
							onPress={() => { setLogin(true); setSignUpStep(1); setValidationError(""); }}
							style={{ width: TAB_WIDTH, paddingVertical: 8, alignItems: "center" }}
						>
							<Text
								className={`font-semibold ${
									login ? "text-black" : "text-gray-600"
								}`}
							>
								Sign In
							</Text>
						</Pressable>
						<Pressable
							onPress={() => { setLogin(false); setSignUpStep(1); setValidationError(""); }}
							style={{ width: TAB_WIDTH, paddingVertical: 8, alignItems: "center" }}
						>
							<Text
								className={`font-semibold ${
									!login ? "text-black" : "text-gray-600"
								}`}
							>
								Sign Up
							</Text>
						</Pressable>
					</View>
				</View>

				{/* Header text with crossfade */}
				<Animated.View
					key={login ? "login-header" : "signup-header"}
					entering={FadeIn.duration(300)}
					exiting={FadeOut.duration(200)}
				>
					<Text className="text-4xl font-extrabold text-[#2B1E1B] mb-2 text-center">
						{login ? "Welcome Back!" : "Create Account"}
					</Text>
					<Text className="text-2xl text-[#3E342F] mb-8 text-center">
						{login
							? "Log in to continue to Radius"
							: signUpStep === 1
								? "Enter your credentials"
								: "Tell us your name"}
					</Text>
				</Animated.View>

				{/* Form fields */}
				<View className="mx-8 mt-8 flex flex-col bg-white">
					{/* Login fields */}
					{login && (
						<Animated.View
							key="login-fields"
							entering={FadeIn.duration(250)}
						>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">
								<Ionicons name="mail-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setEmail}
									value={email}
									placeholder="Email"
									inputMode="email"
									autoCapitalize="none"
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">
								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setPassword}
									value={password}
									placeholder="Password"
									secureTextEntry={true}
								/>
							</View>
						</Animated.View>
					)}

					{/* Sign-up step 1: credentials */}
					{!login && signUpStep === 1 && (
						<Animated.View
							key="signup-step-1"
							entering={FadeIn.duration(250)}
						>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">
								<Ionicons name="mail-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setEmail}
									value={email}
									placeholder="Email"
									inputMode="email"
									autoCapitalize="none"
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">
								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setPassword}
									value={password}
									placeholder="Password"
									secureTextEntry={true}
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">
								<Ionicons name="lock-closed-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setConfirmPassword}
									value={confirmPassword}
									placeholder="Confirm Password"
									secureTextEntry={true}
								/>
							</View>
						</Animated.View>
					)}

					{/* Sign-up step 2: name */}
					{!login && signUpStep === 2 && (
						<Animated.View
							key="signup-step-2"
							entering={FadeIn.duration(250)}
						>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">
								<Ionicons name="person-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setFirstName}
									value={firstName}
									placeholder="First Name"
								/>
							</View>
							<View className="flex-row items-center bg-white border border-black rounded-xl px-4 py-4 mb-4">
								<Ionicons name="person-outline" size={20} color="black" />
								<TextInput
									className="ml-3 flex-1 text-base text-black"
									onChangeText={setLastName}
									value={lastName}
									placeholder="Last Name"
								/>
							</View>
						</Animated.View>
					)}

					{(error || validationError) ? (
						<Text className="mt-1 mb-3 text-red-500 text-center">
							{validationError || error}
						</Text>
					) : null}

					{/* Back button for sign-up step 2 */}
					{!login && signUpStep === 2 && (
						<Pressable
							className="mt-3 py-3 items-center"
							onPress={() => setSignUpStep(1)}
						>
							<Text className="text-gray-500 font-semibold text-base">Back</Text>
						</Pressable>
					)}

					{/* Submit / Next button */}
					<Pressable
						className="mt-2 bg-[#E8B24E] rounded-xl py-4 items-center mb-6"
						onPress={() => {
							setValidationError("");
							if (login) {
								signIn(email, password);
							} else if (signUpStep === 1) {
								if (!emailPattern.test(email.trim())) {
									setValidationError("Please enter a valid email address");
								} else if (password.length < 6) {
									setValidationError("Password must be at least 6 characters");
								} else if (password !== confirmPassword) {
									setValidationError("Passwords do not match");
								} else {
									setSignUpStep(2);
								}
							} else {
								if (firstName.trim().length < 2) {
									setValidationError("First name must be at least 2 characters");
								} else if (lastName.trim().length < 2) {
									setValidationError("Last name must be at least 2 characters");
								} else {
									signUp(email, password, firstName, lastName);
								}
							}
						}}
					>
						<Text className="font-semibold text-base">
							{login ? "Log in" : signUpStep === 1 ? "Next" : "Sign up"}
						</Text>
					</Pressable>

					{!login && signUpStep === 2 && (
						<Text className="text-center text-gray-500">
							After signing up check your email and log in again
						</Text>
					)}
				</View>
			</View>
		</ScrollView>
	);
}
