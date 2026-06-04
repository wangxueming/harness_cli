import fs from "node:fs";
import path from "node:path";
import { fromRoot } from "./paths.js";
import type { RoleConfig } from "./registry.js";
import { roleNameFromAgentFile } from "./registry.js";

function yamlEscape(s: string): string {
  if (/[:#\n"']/.test(s)) return JSON.stringify(s);
  return s;
}

function readIfExists(relPath: string): string {
  const full = fromRoot(relPath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8").trim();
}

export function buildAgentMarkdown(roleKey: string, role: RoleConfig): string {
  const name = roleNameFromAgentFile(role.agent_file);
  const soulPath = path.join(role.soul_dir, "SOUL.md");
  const soul = readIfExists(soulPath);
  if (!soul) {
    throw new Error(`Missing soul: ${soulPath}`);
  }

  const missionRel =
    role.mission_template ?? "templates/mission/default.mission.md";
  const mission = readIfExists(missionRel);
  const model = role.model ?? "inherit";
  const readonly = role.readonly === true;

  const lines = [
    "<!-- generated: do not edit; edit souls/ and templates/mission/, then pnpm agents:compile -->",
    "---",
    `name: ${name}`,
    `description: ${yamlEscape(role.description)}`,
    `model: ${model}`,
  ];
  if (readonly) lines.push("readonly: true");
  lines.push("---", "");
  lines.push(`<!-- BEGIN SOUL: ${soulPath} -->`);
  lines.push(soul);
  lines.push("<!-- END SOUL -->", "");
  lines.push(`<!-- BEGIN MISSION: ${missionRel} -->`);
  lines.push(mission || "## Mission\n\n(See AGENTS.md)");
  lines.push("<!-- END MISSION -->", "");

  return lines.join("\n");
}

export function writeAgentFile(
  role: RoleConfig,
  content: string,
  checkOnly: boolean
): boolean {
  const outPath = fromRoot(role.agent_file);
  const dir = path.dirname(outPath);
  if (!checkOnly) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, content, "utf8");
    return true;
  }
  if (!fs.existsSync(outPath)) return false;
  const existing = fs.readFileSync(outPath, "utf8");
  return existing === content;
}
