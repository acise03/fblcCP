import { Image, Text, View } from "react-native";
import "../../global.css";

type ActivityItemProps = {
	id: string;
	rating: number;
	comment: string;
	date: Date;
	customer: string;
};

export default function ActivityItem({
	id,
	rating,
	comment,
	date,
	customer,
}: ActivityItemProps) {
	// TODO need to add way to access other users in database to get full name
	// const username = useAuthStore((state) => state)

	return (
		<View className="px-4 flex flex-row items-center rounded-2xl bg-orange-50 w-full h-20">
			<Image className="rounded-full w-12 h-12 bg-gray-500" />
			<View className="px-4 flex flex-col">
				<Text className="text-xl font-bold">{customer}</Text>
				<Text className="text-md font-medium">{comment}</Text>
				<Text className="text-md font-medium">{date.toDateString()}</Text>
				<View style={{ flexDirection: "row" }}>
					{[1, 2, 3, 4, 5].map((star) => (
						<Text key={star}>{star <= rating ? "★" : "☆"}</Text>
					))}
				</View>
			</View>
		</View>
	);
}
