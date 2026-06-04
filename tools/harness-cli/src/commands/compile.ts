import { compileCursor } from "../../../compile/targets/cursor.js";

export async function runCompile(options: {
  target: string;
  checkOnly: boolean;
}): Promise<void> {
  if (options.target !== "cursor" && options.target !== "all") {
    console.error(`P1 supports --target cursor only (got ${options.target})`);
    process.exit(1);
  }

  const result = compileCursor({ checkOnly: options.checkOnly });

  if (options.checkOnly) {
    if (result.checkFailed.length > 0) {
      console.error("Compile check failed (stale generated agents):");
      for (const f of result.checkFailed) console.error(`  - ${f}`);
      process.exit(1);
    }
    console.log("Compile check OK");
    return;
  }

  console.log(`Compiled ${result.written.length} agents:`);
  for (const f of result.written) console.log(`  ${f}`);
}
