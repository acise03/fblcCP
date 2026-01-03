import { Image, Text, View } from "react-native";
import "../../global.css";

type AnnouncementItemProps = {
    text: string;
    date: Date;
};

export default function AnnouncementItem({ text, date }: AnnouncementItemProps) {
    return (
        <View className="p-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full">
            <Image className="rounded-full w-16 h-16 bg-gray-500" />
            <View className="px-4 flex flex-col flex-1">
                <Text className="text-md font-medium">{text}</Text>
            </View>
        </View>
    )
}