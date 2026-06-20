import { NextResponse } from "next/server";

import {
  getShopifyWebhookSecret,
  handleShopifyWebhookTopic,
  verifyShopifyWebhookHmac,
} from "@/lib/commerce/shopify/webhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getShopifyWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  if (!verifyShopifyWebhookHmac(rawBody, hmac, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic");
  if (!topic) {
    return NextResponse.json({ error: "Missing webhook topic" }, { status: 400 });
  }

  let payload: { handle?: string } = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as { handle?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
  }

  const revalidatedTags = handleShopifyWebhookTopic(topic, payload);
  return NextResponse.json({ ok: true, topic, revalidatedTags });
}
