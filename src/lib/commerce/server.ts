import { getCommerceProvider } from "./factory";

/** Server-only commerce singleton — import from `@/lib/commerce/server`, not the client-safe barrel. */
export const commerce = getCommerceProvider();
