import { BusinessPost } from "@/db/schema";
import { Text, View } from "react-native";

type AnnouncementItemCustomerProps = {
	announcement: BusinessPost;
};

export default function AnnouncementItemCustomer({
	announcement,
}: AnnouncementItemCustomerProps) {
	return (
		<View className="p-4 flex flex-row items-center rounded-2xl bg-[#FFE4A3] w-full">
			<View className="px-4 flex flex-col flex-1">
				<Text className="text-md font-medium">{announcement.text}</Text>
				<Text className="text-sm text-gray-500">
					{new Date(announcement.date).toLocaleDateString()}
				</Text>
			</View>
		</View>
	);
}
