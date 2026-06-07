Page({
  data: {
    levelNumber: 1,
    winRate: 0,
    gameMode: "",
    playMode: "",
  },
  onGameModeChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ gameMode: e.detail.value });
  },
  onPlayModeChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ playMode: e.detail.value });
  },
  onStart() {
    // wired via bindings in T16
  },
});
