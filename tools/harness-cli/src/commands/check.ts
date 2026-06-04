import { execSync } from "node:child_process";
import { fromRoot } from "../../../compile/lib/paths.js";
import { runValidateSouls } from "./validate-souls.js";
import { runValidateMissions } from "./validate-missions.js";
import { runCompile } from "./compile.js";

export async function runCheck(): Promise<void> {
  process.chdir(fromRoot("."));

  runValidateSouls();
  runValidateMissions();
  await runCompile({ target: "cursor", checkOnly: true });

  console.log("Running vitest...");
  execSync("pnpm test", { stdio: "inherit" });

  console.log("harness check OK");
}
