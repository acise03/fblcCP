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
        className="flex-1"
        onPress={() => {
          setVisible(false);
          setEdit(false);
        }}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="w-full bg-[#FFF8F0] rounded-t-3xl p-6 h-[38%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-row justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)}>
                  <Text
                    className="text-5xl text-[#FFB627]"
                    style={{ fontFamily: "Rubik" }}
                  >
                    {star <= rating ? "★" : "☆"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={{ fontFamily: "Rubik" }}
              onChangeText={setReview}
              value={review}
              placeholder="Leave a review..."
              className="border border-gray-300 text-xl rounded-xl p-3 h-80 text-base text-black"
              multiline
            />

            {editing ? (
              <Pressable
                className="mt-4 bg-[#FFB627] rounded-xl py-3 items-center"
                onPress={async () => {
                  const prev = await fetchPrev(userId, activeBusiness);
                  await editReview(prev!!.id, { rating, review });
                  fetchReviews(activeBusiness);
                  setVisible(false);
                  setEdit(false);
                }}
              >
                <Text
                  className="text-black font-semibold"
                  style={{ fontFamily: "Rubik" }}
                >
                  Update Review
                </Text>
              </Pressable>
            ) : (
              <Pressable
                className="mt-4 bg-[#FFB627] rounded-xl h-16 items-center justify-center"
                onPress={async () => {
                  // This check could be redundant as it checks on DB end
                  const userReviewNew = await fetchPrev(userId, activeBusiness);

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
                <Text
                  className="text-black text-xl font-semibold justify-center"
                  style={{ fontFamily: "Rubik" }}
                >
                  Submit Review
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
