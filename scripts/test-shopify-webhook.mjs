#!/usr/bin/env node
/**
 * Smoke-test Shopify webhook HMAC verification and route responses.
 * Usage: node scripts/test-shopify-webhook.mjs [--live]
 */
import crypto from "node:crypto";
import { spawn } from "node:child_process";

const secret = process.env.SHOPIFY_WEBHOOK_SECRET?.trim();
const payload = JSON.stringify({ handle: "test-product", admin_graphql_api_id: "gid://shopify/Product/1" });
const topic = "products/update";

function sign(body, key) {
  return crypto.createHmac("sha256", key).update(body, "utf8").digest("base64");
}

function verify(rawBody, hmacHeader, key) {
  if (!hmacHeader) return false;
  const digest = sign(rawBody, key);
  const digestBuffer = Buffer.from(digest, "utf8");
  const headerBuffer = Buffer.from(hmacHeader, "utf8");
  if (digestBuffer.length !== headerBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, headerBuffer);
}

console.log("Shopify webhook handler smoke test\n");

// Unit-level HMAC check (mirrors webhooks.ts)
const testSecret = "test-webhook-secret";
const hmac = sign(payload, testSecret);
const valid = verify(payload, hmac, testSecret);
const invalid = verify(payload, "bad-signature", testSecret);
console.log(valid ? "✓ HMAC verification logic" : "✗ HMAC verification logic");
console.log(!invalid ? "✓ Rejects invalid HMAC" : "✗ Rejects invalid HMAC");

async function curlWebhook(port, useSecret) {
  const body = payload;
  const headers = {
    "Content-Type": "application/json",
    "x-shopify-topic": topic,
  };
  if (useSecret) {
    headers["x-shopify-hmac-sha256"] = sign(body, useSecret);
  }

  const res = await fetch(`http://127.0.0.1:${port}/api/webhooks/shopify`, {
    method: "POST",
    headers,
    body,
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function testLiveRoute() {
  if (!secret) {
    console.log("\n⚠ SHOPIFY_WEBHOOK_SECRET not set — skipping live route test");
    console.log("  Route would return 503 without secret configured.");
    return;
  }

  const port = 3456;
  const child = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, COMMERCE_PROVIDER: "shopify" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let ready = false;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Server start timeout")), 30000);
    child.stdout.on("data", (chunk) => {
      if (String(chunk).includes("Ready") || String(chunk).includes("started")) {
        ready = true;
        clearTimeout(timeout);
        resolve(undefined);
      }
    });
    child.stderr.on("data", (chunk) => {
      if (String(chunk).includes("Ready") || String(chunk).includes("started")) {
        ready = true;
        clearTimeout(timeout);
        resolve(undefined);
      }
    });
    child.on("error", reject);
  });

  if (!ready) throw new Error("Server did not become ready");

  try {
    const bad = await curlWebhook(port, null);
    console.log(bad.status === 401 ? "✓ Live route rejects missing HMAC (401)" : `✗ Expected 401, got ${bad.status}`);

    const good = await curlWebhook(port, secret);
    const parsed = JSON.parse(good.body);
    const ok =
      good.status === 200 &&
      parsed.ok === true &&
      parsed.topic === topic &&
      Array.isArray(parsed.revalidatedTags);
    console.log(ok ? "✓ Live route accepts valid webhook" : `✗ Live route failed: ${good.status} ${good.body}`);
  } finally {
    child.kill("SIGTERM");
  }
}

const live = process.argv.includes("--live");
if (live) {
  await testLiveRoute();
} else {
  console.log("\nRun with --live to test POST /api/webhooks/shopify (starts next start briefly).");
}

console.log("\nDone.");
