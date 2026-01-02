import Entypo from '@expo/vector-icons/Entypo';
import { Image, Pressable, Text, View } from "react-native";
import "../../global.css";
import ActivityItem from '../components/activityItem';

export default function BusinessHome() {
	return (
        // Make this scrollable later
		<View className="mx-8 mt-8 flex flex-1 flex-col"> 
		    <View className="flex flex-row items-center justify-between">
		        <Text className="font-bold text-2xl text-black dark:text-white">Dashboard</Text>
		        <Image resizeMode="contain" className="rounded-full w-14 h-14 bg-gray-500" />
		    </View>
            <View className="relative w-full h-48 mt-8">
                <Image className="bg-gray-500 w-full h-full rounded-3xl" />
                <Text className="bottom-11 left-4 text-white font-bold text-2xl">My Business</Text>
                <Pressable className="absolute top-4 right-2">
                    <Entypo name="dots-three-vertical" size={24} color="white" />
                </Pressable>
            </View>
            <View className="flex flex-col mt-6">
                <Text className="dark:text-gray-300 text-gray-500 font-semibold text-xl">Activity</Text>
                <ActivityItem></ActivityItem>
                {/* <FlatList>

                </FlatList> */}
            </View>
		</View>
	);
}
