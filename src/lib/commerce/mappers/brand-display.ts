/** "The Kashmir Weaver" → { primary: "THE KASHMIR", secondary: "WEAVER" } */
export function splitBrandName(name: string): { primary: string; secondary: string } {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) {
    return { primary: name.toUpperCase(), secondary: "" };
  }
  const secondary = words.pop()!.toUpperCase();
  const primary = words.join(" ").toUpperCase();
  return { primary, secondary };
}
