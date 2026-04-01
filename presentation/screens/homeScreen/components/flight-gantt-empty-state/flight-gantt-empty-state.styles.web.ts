export const styles = {
  container: {
    borderRadius: 0,
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    flexDirection: "column",
    alignSelf: "stretch",
    width: "100%",
  },
  imageWrapper: {
    display: "flex",
    width: "min(380px, 60vw)",
    height: "min(380px, 40vh)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
} as const;
