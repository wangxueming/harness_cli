Page({
  data: {
    elapsedText: "00:00",
    hintUsed: false,
    levelNumber: 1,
    cardsLabel: "",
  },
  onContinue() {},
  onShareAppMessage() {
    return { title: "来挑战这关24点！", path: "" };
  },
});
