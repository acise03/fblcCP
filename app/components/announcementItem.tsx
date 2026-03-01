import { businessesApi } from "@/db/api";
import { BusinessPost } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { Dispatch, SetStateAction } from "react";
import { Text, View } from "react-native";
import "../../global.css";

type AnnouncementItemProps = {
	announcement: BusinessPost;
	setEditing: Dispatch<SetStateAction<string | null | undefined>>;
};

const postTypeLabels: Record<string, string> = {
	announcement: "📢 Announcement",
	sale: "🏷️ Sale",
	coupon: "🎟️ Coupon",
};

export default function AnnouncementItem({
	announcement,
	setEditing,
}: AnnouncementItemProps) {
	const setPosts = useBusinessStore((state) => state.setPosts);
	const ownedBusiness = useAuthStore((state) => state.ownedBusiness);

	const typeLabel = postTypeLabels[announcement.type] ?? "📢 Announcement";

	return (
		<View className="py-4 px-4 flex flex-row items-center rounded-2xl bg-[#FFE4A3] w-full">
			<View className="flex flex-col flex-1">
				<Text
					className="text-xs font-semibold text-gray-600 mb-1"
					style={{ fontFamily: "Rubik" }}
				>
					{typeLabel}
				</Text>
				<Text className="text-md font-medium" style={{ fontFamily: "Rubik" }}>
					{announcement.text}
				</Text>
				<Text className="text-sm text-gray-500" style={{ fontFamily: "Rubik" }}>
					{new Date(announcement.date).toLocaleDateString()}
				</Text>
				<View className="flex flex-row mt-2 space-x-2">
					<Text
						className="px-2 py-1 bg-[#FFF8F0] text-black rounded mr-3"
						onPress={() => setEditing(announcement.id)}
					>
						Edit
					</Text>
					<Text
						className="px-2 py-1 bg-red-500 text-white rounded"
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
						Delete
					</Text>
				</View>
			</View>
		</View>
	);
}
