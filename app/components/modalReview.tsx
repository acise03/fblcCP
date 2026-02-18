import { useAuthStore } from "@/store/useAuthStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useState } from "react";
import {
    Modal,
    Pressable,
    Text,
    TextInput,
    ToastAndroid,
    View,
} from "react-native";

export default function ModalReviews() {
	const modalVisible = useModalReviewStore((state) => state.visible);
	const setVisible = useModalReviewStore((state) => state.setVisible);
	const activeBusiness = useModalReviewStore((state) => state.activeBusiness);
	const createReview = useReviewStore((state) => state.createReview);
	const fetchPrev = useReviewStore((state) => state.fetchUserReviewForBusiness);
	const userReview = useReviewStore((state) => state.userReview);
	const user = useAuthStore((state) => state.user);
	const [review, setReview] = useState("");
	const [rating, setRating] = useState(0);
	const [error, setError] = useState("");
	if (!user) return null;
	const userId = user?.id;

	return (
		<Modal transparent visible={modalVisible} animationType="slide">
			<Pressable className="h-full w-full" onPress={() => setVisible(false)}>
				<View className="flex justify-center items-center h-full">
					<View
						className="flex w-2/3 h-[22.5rem] shadow-md bg-white rounded-2xl p-4 items-center"
						onStartShouldSetResponder={() => true}
					>
						<View style={{ flexDirection: "row", marginBottom: 8 }}>
							{[1, 2, 3, 4, 5].map((star) => (
								<Pressable key={star} onPress={() => setRating(star)}>
									<Text>{star <= rating ? "★" : "☆"}</Text>
								</Pressable>
							))}
						</View>
						<TextInput
							onChangeText={setReview}
							value={review}
							placeholder="Leave a review"
						/>
						<Pressable
							onPress={async () => {
								// This check could be redundant as it checks on DB end
								const userReviewNew = await fetchPrev(userId, activeBusiness);

								if (userReviewNew === null) {
									createReview({
										businessid: activeBusiness,
										reviewerid: userId,
										rating: rating,
										review: review,
									});
									ToastAndroid.show("Review created", ToastAndroid.SHORT);
									setVisible(false);
								} else {
									setError(
										"You already have a review on this business, edit it instead.",
									);
								}

								// fetchPrev(userId, activeBusiness).then(() => {

								// });
							}}
						>
							<Text>Submit Review</Text>
						</Pressable>
						<Text>{error}</Text>
					</View>
				</View>
			</Pressable>
		</Modal>
	);
}
