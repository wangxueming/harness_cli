import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(toolsDir, "../../..");

export function fromRoot(...segments: string[]): string {
  return path.join(repoRoot, ...segments);
}
