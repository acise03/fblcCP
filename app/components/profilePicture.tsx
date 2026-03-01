import { useAuthStore } from "@/store/useAuthStore";
import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable } from "react-native";
import "../../global.css";

type ProfilePictureProps = {
	uri?: string | null;
	size?: number;
};

export default function ProfilePicture({ uri, size = 40 }: ProfilePictureProps) {
	const modalSettings = useModalSettingsStore((state) => state.visible);
	const setVisible = useModalSettingsStore((state) => state.setVisible);
	const profilePicture = useAuthStore((state) => state.profile?.profile_picture);

	const imageUri = uri ?? profilePicture;

	return (
		<Pressable onPress={() => setVisible(!modalSettings)}>
			{imageUri ? (
				<Image
					source={{ uri: imageUri }}
					style={{
						width: size,
						height: size,
						borderRadius: size / 2,
						backgroundColor: "#d1d5db",
					}}
				/>
			) : (
				<Ionicons name="person-circle-outline" size={size} color="black" />
			)}
		</Pressable>
	);
}
