import { useAuthStore } from "@/store/useAuthStore";
import { useModalReviewStore } from "@/store/useModalReviewStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useEffect, useState } from "react";
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
	const editing = useModalReviewStore((state) => state.editing);
	const setEdit = useModalReviewStore((state) => state.setEdit);
	const activeBusiness = useModalReviewStore((state) => state.activeBusiness);
	const createReview = useReviewStore((state) => state.createReview);
	const editReview = useReviewStore((state) => state.updateReview);
	const fetchReviews = useReviewStore((state) => state.fetchReviewsForBusiness);
	const fetchPrev = useReviewStore((state) => state.fetchUserReviewForBusiness);
	const user = useAuthStore((state) => state.user);
	const [review, setReview] = useState("");
	const [rating, setRating] = useState(0);
	const [error, setError] = useState("");
	const userId = user?.id;

	useEffect(() => {
		setError("");
		if (!userId) return;
		if (!modalVisible) return;

		let cancelled = false;

		const hydrateForEdit = async () => {
			if (!editing || !activeBusiness) return;

			const prev = await fetchPrev(userId, activeBusiness);
			if (cancelled) return;

			setReview(prev?.review ?? "");
			setRating(prev?.rating ?? 0);
		};

		if (!editing) {
			setReview("");
			setRating(0);
		}

		if (editing) {
			void hydrateForEdit();
		}

		return () => {
			cancelled = true;
		};
	}, [modalVisible, editing, activeBusiness, userId]);

	if (!user) return null;
	if (!userId) return null;

	return (
		<Modal transparent visible={modalVisible} animationType="slide">
			<Pressable
				className="h-full w-full"
				onPress={() => {
					setVisible(false);
					setEdit(false);
				}}
			>
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
						{editing ? (
							<>
								<TextInput
									onChangeText={setReview}
									value={review}
									placeholder="Edit your review"
								/>
								<Pressable
									onPress={async () => {
										console.log("editing");
										setEdit(false);
										const userReviewNew = await fetchPrev(
											userId,
											activeBusiness,
										);

										await editReview(userReviewNew!!.id, {
											rating: rating,
											review: review,
										});
										fetchReviews(activeBusiness);
										setVisible(false);
									}}
								>
									<Text>Edit Review</Text>
								</Pressable>
							</>
						) : (
							<>
								<TextInput
									onChangeText={setReview}
									value={review}
									placeholder="Leave a review"
								/>
								<Pressable
									onPress={async () => {
										// This check could be redundant as it checks on DB end
										const userReviewNew = await fetchPrev(
											userId,
											activeBusiness,
										);

										if (userReviewNew === null) {
											if (rating === 0) {
												ToastAndroid.show("Set a rating", ToastAndroid.SHORT);
												return;
											}
											await createReview({
												businessid: activeBusiness,
												reviewerid: userId,
												rating: rating,
												review: review,
											});
											ToastAndroid.show("Review created", ToastAndroid.SHORT);
											fetchReviews(activeBusiness);
											setVisible(false);
										} else {
											setError(
												"You already have a review on this business, edit it instead.",
											);
										}
									}}
								>
									<Text>Submit Review</Text>
								</Pressable>
							</>
						)}
						<Text>{error}</Text>
					</View>
				</View>
			</Pressable>
		</Modal>
	);
}
