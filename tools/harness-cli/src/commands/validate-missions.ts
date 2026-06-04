import fs from "node:fs";
import { fromRoot } from "../../../compile/lib/paths.js";
import { loadAgentsRegistry } from "../../../compile/lib/registry.js";

function fileExists(relPath: string): boolean {
  return fs.existsSync(fromRoot(relPath));
}

export function runValidateMissions(): void {
  const registry = loadAgentsRegistry();
  const errors: string[] = [];

  let compileReady = 0;
  let missionStaged = 0;

  for (const [key, role] of Object.entries(registry.roles)) {
    const hasAgent = Boolean(role.agent_file);
    const hasMission = Boolean(role.mission_template);

    if (hasAgent) compileReady++;
    if (hasMission && !hasAgent) missionStaged++;

    if (hasMission && !fileExists(role.mission_template!)) {
      errors.push(
        `Missing mission file for ${key}: ${role.mission_template}`
      );
    }

    if (hasAgent && !hasMission) {
      errors.push(
        `Role ${key} has agent_file but no mission_template`
      );
    }

    if (role.claude_file && !fileExists(role.claude_file)) {
      errors.push(
        `Missing claude_file for ${key}: ${role.claude_file}`
      );
    }
  }

  if (errors.length > 0) {
    console.error("validate-missions failed:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `validate-missions OK (${compileReady} compile-ready, ${missionStaged} mission-only P2)`
  );
}
