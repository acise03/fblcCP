import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { Image, Pressable } from "react-native";
import "../../global.css";

export default function ProfilePicture() {
	const modalSettings = useModalSettingsStore((state) => state.visible);
	const setVisible = useModalSettingsStore((state) => state.setVisible);

	return (
		<Pressable onPress={() => setVisible(!modalSettings)}>
			<Image
				resizeMode="contain"
				className="rounded-full w-14 h-14 bg-gray-500"
			/>
		</Pressable>
	);
}
