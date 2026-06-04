import { loadUser } from "../service/user-service.js";
import type { User } from "../types/user.js";

export function handleGetUser(id: string): User {
  return loadUser(id);
}
