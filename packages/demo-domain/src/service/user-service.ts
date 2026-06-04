import { getUser } from "../repo/user-repo.js";
import type { User } from "../types/user.js";

export function loadUser(id: string): User {
  const user = getUser(id);
  if (!user) throw new Error(`User not found: ${id}`);
  return user;
}
