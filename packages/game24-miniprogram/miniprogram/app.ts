// App routing resolved at build/runtime; see src/runtime/app-router.ts
App({
  onLaunch(options) {
    const query = (options?.query ?? {}) as Record<string, string | undefined>;
    if (query.mode === "challenge") {
      const params = new URLSearchParams();
      if (query.level) params.set("level", query.level);
      if (query.label) params.set("label", query.label);
      wx.redirectTo({
        url: `/pages/challenge/challenge?${params.toString()}`,
      });
    }
  },
});
