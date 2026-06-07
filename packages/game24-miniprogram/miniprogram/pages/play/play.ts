Page({
  data: {
    elapsedText: "00:00",
    showExploreProgress: false,
    exploreX: 0,
    exploreY: 0,
    cardViews: [] as unknown[],
    operators: ["+", "-", "×", "÷"],
    historyLabels: [] as unknown[],
    feedback: "",
  },
  onCardTap() {},
  onOperatorTap() {},
  onHistoryTap() {},
  onHint() {},
  onEndExplore() {},
});
