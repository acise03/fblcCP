/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#FFF8F0";
const tintColorDark = "#FFF8F0";

export const Colors = {
  light: {
    text: "#2D1E1E",
    background: "#FFF8F0",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#2D1E1E",
    background: "#FFF8F0",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Rubik",
    serif: "Rubik",
    rounded: "Rubik",
    mono: "Rubik",
  },
  default: {
    sans: "Rubik",
    serif: "Rubik",
    rounded: "Rubik",
    mono: "Rubik",
  },
  web: {
    sans: "Rubik, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Rubik, Georgia, 'Times New Roman', serif",
    rounded:
      "Rubik, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "Rubik, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
