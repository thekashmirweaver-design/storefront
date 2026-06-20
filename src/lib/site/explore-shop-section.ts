/** Paths where a trailing “Explore / Shop” block is redundant or wrong. */
export function shouldShowExploreShopSection(pathname: string): boolean {
  if (pathname === "/") return false;
  if (pathname === "/shop") return false;
  if (pathname === "/collections") return false;
  if (pathname.startsWith("/product/")) return false;
  return true;
}

export function excludeCollectionSlugFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/collections\/([^/]+)/);
  return match?.[1];
}
