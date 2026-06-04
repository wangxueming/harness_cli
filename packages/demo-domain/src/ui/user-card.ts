import { handleGetUser } from "../runtime/handlers.js";
import type { User } from "../types/user.js";

export function formatUserCard(id: string): string {
  const user: User = handleGetUser(id);
  return `User: ${user.name} (${user.id})`;
}
