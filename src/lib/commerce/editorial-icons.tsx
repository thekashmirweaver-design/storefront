import {
  Feather,
  Hand,
  Heart,
  Hexagon,
  Home,
  Infinity,
  Leaf,
  Mountain,
  type LucideIcon,
} from "lucide-react";

import type { EditorialIconName } from "./types";

const EDITORIAL_ICONS: Record<EditorialIconName, LucideIcon> = {
  leaf: Leaf,
  hexagon: Hexagon,
  feather: Feather,
  mountain: Mountain,
  hand: Hand,
  home: Home,
  heart: Heart,
  infinity: Infinity,
};

export function editorialIcon(name: EditorialIconName): LucideIcon {
  return EDITORIAL_ICONS[name] ?? Leaf;
}
