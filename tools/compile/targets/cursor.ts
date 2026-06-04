import fs from "node:fs";
import path from "node:path";
import { buildAgentMarkdown, writeAgentFile } from "../lib/build-agent.js";
import { fromRoot } from "../lib/paths.js";
import { loadAgentsRegistry } from "../lib/registry.js";

export type CompileResult = {
  written: string[];
  checkFailed: string[];
};

export function compileCursor(options: {
  checkOnly?: boolean;
}): CompileResult {
  const registry = loadAgentsRegistry();
  const written: string[] = [];
  const checkFailed: string[] = [];

  for (const [roleKey, role] of Object.entries(registry.roles)) {
    const mode =
      role.compile_mode ?? registry.defaults?.compile_mode ?? "generated";
    if (mode === "handwritten") continue;
    if (!role.soul_dir || !role.agent_file) continue;

    const content = buildAgentMarkdown(roleKey, role);
    const ok = writeAgentFile(role, content, options.checkOnly ?? false);
    if (options.checkOnly) {
      if (!ok) checkFailed.push(role.agent_file);
    } else {
      written.push(role.agent_file);
    }
  }

  if (!options.checkOnly) {
    writeCursorRules();
    writeMcpStub();
  }
  writeManifestLock(written, options.checkOnly ?? false);

  return { written, checkFailed };
}

function writeCursorRules(): void {
  const rulesDir = fromRoot(".cursor/rules");
  fs.mkdirSync(rulesDir, { recursive: true });

  const project = `---
description: Global harness discipline (T1). NEVER rules and pointers.
alwaysApply: true
---

# Project rules

Read \`AGENTS.md\` first. Obey \`policy/never-do.md\`.

- Do not edit generated files under \`.cursor/agents/\`.
- Run \`pnpm harness check\` before claiming work is done.
- Spec work lives under \`docs/exec-plans/active/\`.
`;

  const layers = `---
description: Architecture layers for demo-domain
globs: packages/demo-domain/**
alwaysApply: false
---

# Layers

Dependency flow: types → config → repo → service → runtime → ui.
Cross-cutting: \`providers/\` only.

See \`docs/architecture/LAYERS.md\` and \`policy/layers.yaml\`.
`;

  fs.writeFileSync(path.join(rulesDir, "project.mdc"), project, "utf8");
  fs.writeFileSync(path.join(rulesDir, "layers.mdc"), layers, "utf8");

  const domainsDir = path.join(rulesDir, "domains");
  fs.mkdirSync(domainsDir, { recursive: true });
  fs.writeFileSync(
    path.join(domainsDir, "demo-domain.mdc"),
    `---
description: demo-domain package rules
globs: packages/demo-domain/**
alwaysApply: false
---

See \`policy/domains/demo-domain.md\`.
`,
    "utf8"
  );
}

function writeMcpStub(): void {
  const mcpPath = fromRoot(".cursor/mcp.json");
  fs.mkdirSync(fromRoot(".cursor"), { recursive: true });
  if (!fs.existsSync(mcpPath)) {
    fs.writeFileSync(
      mcpPath,
      `${JSON.stringify({ mcpServers: {} }, null, 2)}\n`,
      "utf8"
    );
  }
}

function writeManifestLock(written: string[], checkOnly: boolean): void {
  if (checkOnly) return;
  const dir = fromRoot(".agents");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "manifest.lock.json"),
    `${JSON.stringify(
      {
        target: "cursor",
        generated_at: new Date().toISOString(),
        agents: written,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}
