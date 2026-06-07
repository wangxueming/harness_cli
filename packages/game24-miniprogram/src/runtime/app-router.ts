import {
  isChallengeEntry,
  parseEntryQuery,
  parseLevelNumber,
  type ShareQuery,
} from "../config/share-routes.js";

export type LaunchRoute =
  | { page: "splash" }
  | { page: "challenge"; level: number; label?: string }
  | { page: "home" };

export function resolveLaunchRoute(
  query: Record<string, string | undefined> = {}
): LaunchRoute {
  const parsed: ShareQuery = parseEntryQuery(query);
  if (isChallengeEntry(parsed)) {
    return {
      page: "challenge",
      level: parseLevelNumber(parsed),
      label: parsed.label,
    };
  }
  return { page: "splash" };
}

export function routeToPath(route: LaunchRoute): string {
  switch (route.page) {
    case "splash":
      return "/pages/splash/splash";
    case "home":
      return "/pages/home/home";
    case "challenge": {
      const params = new URLSearchParams({
        level: String(route.level),
      });
      if (route.label) params.set("label", route.label);
      return `/pages/challenge/challenge?${params.toString()}`;
    }
  }
}

export function handleAppLaunch(
  query: Record<string, string | undefined> = {}
): string {
  const route = resolveLaunchRoute(query);
  if (route.page === "splash") {
    return routeToPath({ page: "splash" });
  }
  return routeToPath(route);
}
