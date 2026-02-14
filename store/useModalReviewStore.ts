import { create } from "zustand";

type ModalReviewStore = {
	visible: boolean;
	activeBusiness: string;
	setVisible: (visible: boolean) => void;
	setBusiness: (business: string) => void;
};

export const useModalReviewStore = create<ModalReviewStore>((set) => ({
	visible: false,
	activeBusiness: "",
	setVisible: (visible) => set({ visible }),
	setBusiness: (business) => set({ activeBusiness: business }),
}));
