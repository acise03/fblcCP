import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import Feather from "@expo/vector-icons/Feather";
import { Dispatch, SetStateAction } from "react";
import { Pressable, Text, View } from "react-native";
import "../../global.css";

type AnnouncementItemProps = {
	announcement: BusinessPost;
	setEditing: Dispatch<SetStateAction<string | null | undefined>>;
};

const postTypeLabels: Record<string, string> = {
	announcement: "Announcement",
	sale: "Sale",
	coupon: "Coupon",
};

const postTypeIcons: Record<string, "volume-2" | "tag" | "gift"> = {
	announcement: "volume-2",
	sale: "tag",
	coupon: "gift",
};

export default function AnnouncementItem({
	announcement,
	setEditing,
}: AnnouncementItemProps) {
	const setPosts = useBusinessStore((state) => state.setPosts);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);

	const typeLabel = postTypeLabels[announcement.type] ?? "Announcement";
	const icon = postTypeIcons[announcement.type] ?? "volume-2";

	const titleDetail = announcement.highlight
		? announcement.highlight
		: announcement.text.length > 20
			? announcement.text.slice(0, 20).trim() + "..."
			: announcement.text;

	return (
		<View className="py-4 px-5 rounded-2xl bg-[#FFE4A3] w-full">
			<View className="flex flex-row items-start">
				{/* Icon */}
				<View className="w-12 h-12 rounded-full bg-[#F7E7D1] items-center justify-center mr-4 mt-1">
					<Feather name={icon} size={24} color="#333" />
				</View>

				{/* Content */}
				<View className="flex-1">
					<Text
						className="text-xl font-bold text-black"
						style={{ fontFamily: "Rubik" }}
						numberOfLines={1}
					>
						{typeLabel}: {titleDetail}
					</Text>
					<Text
						className="text-sm text-black mt-1"
						style={{ fontFamily: "Rubik" }}
						numberOfLines={3}
					>
						{announcement.text}
					</Text>
				</View>
			</View>

			{/* Buttons */}
			<View className="flex flex-row justify-end mt-3 gap-2">
				<Pressable
					className="px-5 py-1.5 bg-[#F7E7D1] rounded-lg"
					onPress={() => setEditing(announcement.id)}
				>
					<Text
						className="text-black text-sm font-medium"
						style={{ fontFamily: "Rubik" }}
					>
						Edit
					</Text>
				</Pressable>
				<Pressable
					className="px-5 py-1.5 bg-[#E07850] rounded-lg"
					onPress={async () => {
						setEditing("hide");
						await businessesApi.deletePost(announcement.id);
						businessesApi
							.getPostsByBusiness(ownedBusiness!!.id)
							.then((posts) => {
								setPosts(posts);
							});
					}}
				>
					<Text
						className="text-white text-sm font-medium"
						style={{ fontFamily: "Rubik" }}
					>
						Cancel
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
