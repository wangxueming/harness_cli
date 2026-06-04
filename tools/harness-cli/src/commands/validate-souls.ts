import fs from "node:fs";
import path from "node:path";
import { fromRoot } from "../../../compile/lib/paths.js";
import { loadAgentsRegistry } from "../../../compile/lib/registry.js";

const MAX_SOUL_CHARS = 8000;

export function runValidateSouls(): void {
  const registry = loadAgentsRegistry();
  const errors: string[] = [];

  let checked = 0;
  for (const [key, role] of Object.entries(registry.roles)) {
    if (!role.soul_dir) continue;
    checked++;
    const soulFile = fromRoot(path.join(role.soul_dir, "SOUL.md"));
    if (!fs.existsSync(soulFile)) {
      errors.push(`Missing SOUL for role ${key}: ${soulFile}`);
      continue;
    }
    const text = fs.readFileSync(soulFile, "utf8");
    if (text.length > MAX_SOUL_CHARS) {
      errors.push(`SOUL too long for ${key} (${text.length} chars)`);
    }
    if (!text.includes("## Identity")) {
      errors.push(`SOUL missing ## Identity for ${key}`);
    }
    if (!text.includes("## Hard constraints")) {
      errors.push(`SOUL missing ## Hard constraints for ${key}`);
    }
  }

  if (errors.length > 0) {
    console.error("validate-souls failed:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`validate-souls OK (${checked} roles)`);
}
