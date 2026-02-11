import { create } from "zustand";

type Mode = "business" | "customer";

type ModalSettingsStore = {
	visible: boolean;
	mode: Mode;
	setVisible: (visible: boolean) => void;
	setMode: (mode: Mode) => void;
	toggleMode: () => void;
};

export const useModalSettingsStore = create<ModalSettingsStore>((set) => ({
	visible: false,
	mode: "business",
	setVisible: (visible) => set({ visible }),
	setMode: (mode) => set({ mode }),
	toggleMode: () =>
		set((state) => ({
			mode: state.mode === "business" ? "customer" : "business",
		})),
}));
