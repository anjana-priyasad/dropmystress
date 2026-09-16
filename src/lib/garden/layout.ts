import { SPRITE_MAP } from "./sprites";
import type { GardenItem } from "./types";

const LAYER_SIZE = 10000;
export const MAX_ITEMS = 200;

const layerOf = (item: GardenItem) => SPRITE_MAP[item.kind]?.layer ?? 3;

/** Items stack by layer (water under flowers under animals), then by when they were placed. */
export function frontZ(items: GardenItem[], layer: number): number {
  const inLayer = items.filter((i) => layerOf(i) === layer).map((i) => i.z);
  return inLayer.length ? Math.max(...inLayer) + 1 : layer * LAYER_SIZE + 1;
}

export function backZ(items: GardenItem[], layer: number): number {
  const inLayer = items.filter((i) => layerOf(i) === layer).map((i) => i.z);
  return inLayer.length ? Math.min(...inLayer) - 1 : layer * LAYER_SIZE;
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
