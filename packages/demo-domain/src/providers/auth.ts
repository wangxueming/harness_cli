import type { User } from "../types/user.js";

export function canViewUser(actor: string, user: User): boolean {
  return actor.length > 0 && Boolean(user.id);
}
