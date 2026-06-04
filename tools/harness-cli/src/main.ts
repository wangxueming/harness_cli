#!/usr/bin/env node
import { runCheck } from "./commands/check.js";
import { runCompile } from "./commands/compile.js";
import { runValidateSouls } from "./commands/validate-souls.js";
import { runValidateMissions } from "./commands/validate-missions.js";

const [, , cmd, ...rest] = process.argv;

function flag(name: string): boolean {
  return rest.includes(name);
}

function opt(name: string): string | undefined {
  const i = rest.indexOf(name);
  if (i === -1 || i + 1 >= rest.length) return undefined;
  return rest[i + 1];
}

async function main(): Promise<void> {
  switch (cmd) {
    case "compile":
      await runCompile({
        target: opt("--target") ?? "cursor",
        checkOnly: flag("--check"),
      });
      break;
    case "validate-souls":
      runValidateSouls();
      break;
    case "validate-missions":
      runValidateMissions();
      break;
    case "check":
      await runCheck();
      break;
    default:
      console.error(
        "Usage: pnpm harness <compile|validate-souls|validate-missions|check> [--target cursor] [--check]"
      );
      process.exit(cmd ? 1 : 0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
