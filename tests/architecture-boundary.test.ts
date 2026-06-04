import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

/** Ratchet: only remove entries with explicit review. */
const KNOWN_VIOLATIONS: string[] = [];

type LayerDef = { id: string; glob: string; may_import: string[] };

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listTsFiles(full));
    else if (ent.name.endsWith(".ts") && !ent.name.endsWith(".test.ts"))
      out.push(full);
  }
  return out;
}

function layerForFile(
  filePath: string,
  root: string,
  layers: LayerDef[]
): string | undefined {
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  for (const layer of layers) {
    const m = layer.glob.match(/\*\*\/([^/]+)\/\*\*/);
    const segment = m?.[1] ?? layer.id;
    if (rel.startsWith(`${segment}/`)) return layer.id;
  }
  return undefined;
}

function parseImports(content: string): string[] {
  const specs: string[] = [];
  const re = /from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) specs.push(m[1]);
  return specs;
}

function resolveImport(
  spec: string,
  fromFile: string,
  root: string
): string | undefined {
  if (spec.startsWith(".")) {
    const resolved = path.resolve(path.dirname(fromFile), spec);
    if (!resolved.startsWith(root)) return undefined;
    const rel = path.relative(root, resolved);
    const tsPath = rel.endsWith(".js")
      ? path.join(root, rel.replace(/\.js$/, ".ts"))
      : path.join(root, `${rel}.ts`);
    if (fs.existsSync(tsPath)) return tsPath;
    if (fs.existsSync(path.join(root, rel, "index.ts")))
      return path.join(root, rel, "index.ts");
  }
  return undefined;
}

describe("architecture boundary (demo-domain)", () => {
  it("respects policy/layers.yaml import rules", () => {
    const policy = parseYaml(
      fs.readFileSync(path.join(repoRoot, "policy/layers.yaml"), "utf8")
    ) as {
      domains: Record<
        string,
        { root: string; layers: LayerDef[] }
      >;
    };

    const domain = policy.domains["demo-domain"];
    const root = path.join(repoRoot, domain.root);
    const layers = domain.layers;
    const layerById = Object.fromEntries(layers.map((l) => [l.id, l]));

    const violations: string[] = [];

    for (const file of listTsFiles(root)) {
      const fromLayer = layerForFile(file, root, layers);
      if (!fromLayer) continue;
      const allowed = new Set(layerById[fromLayer]?.may_import ?? []);
      const content = fs.readFileSync(file, "utf8");
      for (const spec of parseImports(content)) {
        const target = resolveImport(spec, file, root);
        if (!target) continue;
        const toLayer = layerForFile(target, root, layers);
        if (!toLayer || toLayer === fromLayer) continue;
        if (!allowed.has(toLayer)) {
          const relFrom = path.relative(repoRoot, file);
          const relTo = path.relative(repoRoot, target);
          violations.push(
            `${relFrom} (${fromLayer}) imports ${relTo} (${toLayer}) — allowed: ${[...allowed].join(", ") || "(none)"}. See docs/architecture/LAYERS.md`
          );
        }
      }
    }

    const unknown = violations.filter((v) => !KNOWN_VIOLATIONS.includes(v));
    const stale = KNOWN_VIOLATIONS.filter((k) => !violations.includes(k));

    if (stale.length > 0) {
      console.warn("Remove stale KNOWN_VIOLATIONS:", stale);
    }

    expect(unknown).toEqual([]);
  });
});
