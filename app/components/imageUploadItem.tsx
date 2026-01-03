import Feather from "@expo/vector-icons/Feather";
import { Image, Pressable, View } from "react-native";
import "../../global.css";

type ImageUploadItemProps = {
	id: string;
	uri: string;
};

export default function ImageUploadItem({ id, uri }: ImageUploadItemProps) {
	return (
		<View className="flex-1 justify-center items-center">
			<Pressable className="w-full h-28 justify-center items-center">
				{id === "add" ? (
					<View className="w-full h-full rounded-2xl bg-gray-100 justify-center items-center">
						<Feather name="upload" size={24} color="black" />
					</View>
				) : id === "empty" ? (
					<View className="w-full h-28" />
				) : (
					<Image
						className="w-full rounded-2xl h-full bg-gray-300"
						source={{ uri: uri }}
						resizeMode="cover"
					/>
				)}
			</Pressable>
		</View>
	);
}
