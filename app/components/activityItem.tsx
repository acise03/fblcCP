import { usersApi } from "@/db/api/users";
import { useEffect, useState } from "react";
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
	const [username, setUsername] = useState(customer);
	const d = new Date(date);
	const dateLabel = Number.isNaN(d.getTime()) ? "" : d.toDateString();

	useEffect(() => {
		let mounted = true;
		usersApi.getById(customer).then((user) => {
			if (!mounted || !user) return;
			console.log("getting username");
			setUsername(`${user.firstname} ${user.lastname}`.trim());
		});
		return () => {
			mounted = false;
		};
	}, [id]);

	console.log(date);

	return (
		<View className="flex flex-row items-center rounded-2xl bg-[#FFE4A3] w-full px-4 py-2">
			<Image className="rounded-full w-12 h-12 bg-gray-500" />
			<View className="px-4 flex flex-col pr-12">
				<Text className="text-xl font-bold">{username}</Text>
				<Text className="text-md font-medium">{comment}</Text>
				<Text className="text-md font-medium">{dateLabel}</Text>
				<View style={{ flexDirection: "row" }}>
					{[1, 2, 3, 4, 5].map((star) => (
						<Text key={star}>{star <= rating ? "★" : "☆"}</Text>
					))}
				</View>
			</View>
		</View>
	);
}
