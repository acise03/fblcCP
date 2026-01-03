import { Image, Text, View } from "react-native";
import "../../global.css";

type ActivityItemProps = {
    id: string;
    rating: number;
    comment: string;
    date: Date;
    customer: string;
};

export default function ActivityItem({ id, rating, comment, date, customer }: ActivityItemProps) {
    return (
        <View className="px-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full h-20">
            <Image className="rounded-full w-12 h-12 bg-gray-500" />
            <View className="px-4 flex flex-col">
                <Text className="text-xl font-bold">Customer Name</Text>
                <Text className="text-md font-medium">Description</Text>
            </View>
        </View>
    )
}