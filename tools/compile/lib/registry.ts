import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { fromRoot } from "./paths.js";

export type RoleConfig = {
  soul_dir?: string;
  agent_file?: string;
  description: string;
  model?: string;
  readonly?: boolean;
  mission_template?: string;
  compile_mode?: string;
  workflow?: string;
};

export type AgentsRegistry = {
  version: number;
  defaults?: { model?: string; compile_mode?: string };
  roles: Record<string, RoleConfig>;
};

export function loadAgentsRegistry(): AgentsRegistry {
  const raw = fs.readFileSync(fromRoot("config/agents.registry.yaml"), "utf8");
  return parseYaml(raw) as AgentsRegistry;
}

export function roleNameFromAgentFile(agentFile: string): string {
  return path.basename(agentFile, ".md");
}
