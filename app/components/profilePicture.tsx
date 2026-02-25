import { useModalSettingsStore } from "@/store/useModalSettingsStore";
import { Image, Pressable } from "react-native";
import "../../global.css";
import Ionicons from '@expo/vector-icons/Ionicons';


export default function ProfilePicture() {
	const modalSettings = useModalSettingsStore((state) => state.visible);
	const setVisible = useModalSettingsStore((state) => state.setVisible);

	return (
		<Pressable onPress={() => setVisible(!modalSettings)}>
			<Ionicons name="person-circle-outline" size={40} color="black" />
		</Pressable>
	);
}
