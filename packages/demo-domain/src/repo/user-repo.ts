import { defaultUser } from "../config/app-config.js";
import type { User } from "../types/user.js";

export function getUser(id: string): User | undefined {
  if (id === defaultUser.id) return defaultUser;
  return undefined;
}
