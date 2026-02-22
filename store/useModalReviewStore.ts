import { create } from "zustand";

type ModalReviewStore = {
	visible: boolean;
	activeBusiness: string;
	editing: boolean;
	setVisible: (visible: boolean) => void;
	setBusiness: (business: string) => void;
	setEdit: (editing: boolean) => void;
};

export const useModalReviewStore = create<ModalReviewStore>((set) => ({
	visible: false,
	activeBusiness: "",
	editing: false,
	setVisible: (visible) => set({ visible }),
	setBusiness: (business) => set({ activeBusiness: business }),
	setEdit: (editing) => set({ editing: editing }),
}));
