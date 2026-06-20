import { NextResponse } from "next/server";

import { clearCustomerSession, getCustomerLogoutUrl } from "@/lib/commerce/shopify/customer/auth";

export async function GET(request: Request) {
  const logoutUrl = await getCustomerLogoutUrl();
  await clearCustomerSession();

  if (logoutUrl) {
    return NextResponse.redirect(logoutUrl);
  }

  return NextResponse.redirect(new URL("/account", request.url));
}
