import { Image, View } from "react-native";
import "../../global.css";

export default function ActivityItem() {
    return (
        <View className="px-4 flex flex-row items-center justify-between rounded-2xl bg-orange-50 w-full h-20">
            <Image className="rounded-full w-12 h-12 bg-gray-500" />
        </View>
    )
}