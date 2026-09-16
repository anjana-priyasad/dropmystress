/** The garden is laid out in a fixed logical space and scaled to fit the screen. */
export const GARDEN_WIDTH = 1200;
export const GARDEN_HEIGHT = 800;

export type Point = { x: number; y: number };

/** A rake stroke, stored as a flat [x0, y0, x1, y1, …] list to keep saved gardens small. */
export type Stroke = { id: string; points: number[] };

export type RippleStone = { id: string; x: number; y: number; r: number; angle: number };

export type GardenItem = {
  id: string;
  kind: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flip: boolean;
  z: number;
};

export type Atmosphere = "day" | "sunset" | "night";
export type GardenEffect = "none" | "petals" | "rain" | "fireflies" | "snow";

export type Garden = {
  version: 1;
  seed: number;
  strokes: Stroke[];
  stones: RippleStone[];
  items: GardenItem[];
  atmosphere: Atmosphere;
  effect: GardenEffect;
};

export const EMPTY_GARDEN: Garden = {
  version: 1,
  seed: 7,
  strokes: [],
  stones: [],
  items: [],
  atmosphere: "day",
  effect: "none",
};

const ATMOSPHERES: Atmosphere[] = ["day", "sunset", "night"];
const EFFECTS: GardenEffect[] = ["none", "petals", "rain", "fireflies", "snow"];

/** Validates untrusted JSON (e.g. from localStorage) and returns a safe garden. */
export function parseGarden(raw: unknown): Garden {
  if (!raw || typeof raw !== "object") return EMPTY_GARDEN;
  const g = raw as Partial<Garden>;
  if (g.version !== 1) return EMPTY_GARDEN;
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
  return {
    version: 1,
    seed: num(g.seed, 7),
    strokes: Array.isArray(g.strokes)
      ? g.strokes.filter((s) => s && typeof s.id === "string" && Array.isArray(s.points)).map((s) => ({ id: s.id, points: s.points.map((p) => num(p, 0)) }))
      : [],
    stones: Array.isArray(g.stones)
      ? g.stones.filter((s) => s && typeof s.id === "string").map((s) => ({ id: s.id, x: num(s.x, 0), y: num(s.y, 0), r: num(s.r, 20), angle: num(s.angle, 0) }))
      : [],
    items: Array.isArray(g.items)
      ? g.items
          .filter((i) => i && typeof i.id === "string" && typeof i.kind === "string")
          .map((i) => ({
            id: i.id,
            kind: i.kind,
            x: num(i.x, GARDEN_WIDTH / 2),
            y: num(i.y, GARDEN_HEIGHT / 2),
            scale: num(i.scale, 1),
            rotation: num(i.rotation, 0),
            flip: Boolean(i.flip),
            z: num(i.z, 0),
          }))
      : [],
    atmosphere: ATMOSPHERES.includes(g.atmosphere as Atmosphere) ? (g.atmosphere as Atmosphere) : "day",
    effect: EFFECTS.includes(g.effect as GardenEffect) ? (g.effect as GardenEffect) : "none",
  };
}
