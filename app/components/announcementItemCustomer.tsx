import { Image, Text, View } from "react-native";

type AnnouncementItemCustomerProps = {
	text: string;
	date: Date;
};

export default function AnnouncementItemCustomer() {
	return (
		<View className="p-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full">
			<Image className="rounded-full w-14 h-14 bg-gray-500" />
			<View className="px-4 flex flex-col flex-1">
				<Text className="text-md font-medium">Hi</Text>
				<Text className="text-sm text-gray-500">Date here</Text>
			</View>
		</View>
	);
}
