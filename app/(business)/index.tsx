import Entypo from "@expo/vector-icons/Entypo";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import "../../global.css";
import ActivityItem from "../components/activityItem";
import { Review } from "../models/review";

const dummyData: Review[] = [
	new Review(5, "Great service!", new Date("2024-01-01"), "asdfjioj23of"),
	new Review(4, "Nice ambiance.", new Date("2024-01-02"), "asdklfjlk23"),
	new Review(3, "Average experience.", new Date("2024-01-03"), "asduihfiuh123"),
];

export default function BusinessHome() {
	return (
		// Make this scrollable maybe
		<View className="h-full w-full bg-white">
			<View className="mx-8 mt-8 flex flex-1 flex-col bg-white">
				<View className="flex flex-row items-center justify-between">
					<Text className="font-bold text-2xl text-black dark:text-white">
						Dashboard
					</Text>
					<Image
						resizeMode="contain"
						className="rounded-full w-14 h-14 bg-gray-500"
					/>
				</View>
				<View className="relative w-full h-48 mt-8">
					<Image className="bg-gray-500 w-full h-full rounded-3xl" />
					<Text className="bottom-11 left-4 text-white font-bold text-2xl">
						My Business
					</Text>
					<Pressable className="absolute top-4 right-2">
						<Entypo name="dots-three-vertical" size={24} color="white" />
					</Pressable>
				</View>
				<View className="flex flex-col mt-6">
					<Text className="dark:text-gray-300 text-zinc-700 font-semibold text-xl">
						Activity
					</Text>
					<FlatList
						className="mt-2"
						data={dummyData}
						renderItem={({ item }) => {
							const reviewObject = item.getReview();
							return (
								<ActivityItem
									id={reviewObject.id}
									rating={reviewObject.rating}
									comment={reviewObject.comment}
									customer={reviewObject.customer}
									date={reviewObject.date}
								/>
							);
						}}
						keyExtractor={(item) => item.getReview().id}
						ItemSeparatorComponent={() => <View className="h-2" />}
					/>
				</View>
			</View>
		</View>
	);
}
