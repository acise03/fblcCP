import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import "../../global.css";
import ImageUploadItem from "../components/imageUploadItem";

let dummyImages = [
	{ id: "1", uri: "https://reactnative.dev/img/tiny_logo.png" },
	{ id: "2", uri: "https://reactnative.dev/img/tiny_logo.png" },
	{ id: "add", uri: "hi" },
];

export default function BusinessAbout() {
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
					<Image
						resizeMode="contain"
						className="rounded-full w-14 h-14 bg-gray-500"
					/>
				</View>
				<View className="relative w-full h-48 mt-8">
					<Image className="bg-gray-500 w-full h-full rounded-3xl" />
					<Text className="bottom-11 left-4 text-white font-bold text-2xl">
						Upload Banner
					</Text>
					<Pressable className="absolute top-4 right-2">
						<Entypo name="dots-three-vertical" size={24} color="white" />
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
						<Pressable className="">
							<Feather name="edit-3" size={22} color="black" />
						</Pressable>
					</View>
					<Text className="dark:text-gray-300 text-zinc-700 font-normal text-lg">
						Description here
					</Text>
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
