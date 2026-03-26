import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_SIZE = Math.min(SCREEN_WIDTH * 0.55, SCREEN_HEIGHT * 0.35, 320);

export const styles = {
  container: {
    borderRadius: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  textBlock: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    color: "#6b7280",
  },
} as const;
