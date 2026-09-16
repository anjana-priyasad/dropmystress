import { SPRITE_MAP } from "./sprites";
import type { Garden, GardenItem } from "./types";

type Placement = [kind: string, x: number, y: number, scale?: number, flip?: boolean];

const SAMPLE: Placement[] = [
  ["moss", 930, 420, 1.1],
  ["pond", 440, 480],
  ["stepping-stones", 820, 640],
  ["lily-pads", 330, 450, 0.9],
  ["lotus", 520, 430],
  ["koi", 400, 520, 1, true],
  ["koi", 520, 540, 0.8],
  ["bridge", 640, 500, 0.75],
  ["cherry-tree", 170, 250, 1.1],
  ["stone-lantern", 330, 230],
  ["big-rock", 770, 320],
  ["maple-tree", 1040, 230],
  ["bamboo", 1130, 560, 1.2],
  ["pine-bonsai", 900, 250, 0.8],
  ["tulips", 110, 650],
  ["lavender", 230, 720],
  ["daisies", 620, 730],
  ["grass", 60, 460],
  ["frog", 250, 560],
  ["songbird", 700, 170],
  ["butterfly", 240, 520],
  ["cat", 1010, 710],
  ["wind-chime", 1150, 160],
];

/** A ready-made garden to explore or build on. `makeId` keeps ids unique. */
export function createSampleGarden(makeId: () => string): Garden {
  const items: GardenItem[] = SAMPLE.map(([kind, x, y, scale = 1, flip = false], i) => ({
    id: makeId(),
    kind,
    x,
    y,
    scale,
    rotation: 0,
    flip,
    z: (SPRITE_MAP[kind]?.layer ?? 3) * 10000 + i + 1,
  }));
  const wave = (y: number, amplitude: number) => {
    const points: number[] = [];
    for (let x = 380; x <= 1180; x += 12) points.push(x, Math.round((y + Math.sin(x / 70) * amplitude) * 10) / 10);
    return points;
  };
  return {
    version: 1,
    seed: 11,
    strokes: [
      { id: makeId(), points: wave(60, 10) },
      { id: makeId(), points: wave(100, 10) },
    ],
    stones: [{ id: makeId(), x: 990, y: 560, r: 24, angle: 0.4 }],
    items,
    atmosphere: "day",
    effect: "petals",
  };
}
