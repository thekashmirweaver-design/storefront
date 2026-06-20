import "server-only";

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type AdminGraphqlError = { message: string };

type AdminRequestResult<T> = {
  data?: T;
  errors?: AdminGraphqlError[];
};

export function executeShopifyAdminCli<T>(
  storeDomain: string,
  partnerAppDir: string,
  query: string,
  variables?: Record<string, unknown>,
): T {
  const args = [
    "app",
    "execute",
    "--path",
    partnerAppDir,
    "-s",
    storeDomain,
    "-q",
    query.trim(),
  ];

  let tempDir: string | undefined;
  if (variables && Object.keys(variables).length) {
    tempDir = mkdtempSync(join(tmpdir(), "shopify-admin-"));
    writeFileSync(join(tempDir, "variables.json"), JSON.stringify(variables));
    args.push("--variable-file", join(tempDir, "variables.json"));
  }

  const result = spawnSync("shopify", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
  });

  if (tempDir) rmSync(tempDir, { recursive: true, force: true });

  if (result.status !== 0) {
    throw new Error(
      result.stderr?.trim() ||
        result.stdout?.trim() ||
        "shopify app execute failed — set SHOPIFY_PARTNER_APP_DIR or SHOPIFY_ADMIN_ACCESS_TOKEN",
    );
  }

  const jsonMatch = result.stdout.match(/\{[\s\S]*\}\s*$/);
  if (!jsonMatch) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(detail || "Could not parse shopify app execute output");
  }

  const parsed = JSON.parse(jsonMatch[0]) as AdminRequestResult<T> & Record<string, unknown>;
  if (parsed.errors?.length) {
    throw new Error(parsed.errors.map((error) => error.message).join("; "));
  }

  if (parsed.data !== undefined) {
    return parsed.data as T;
  }

  return parsed as T;
}
