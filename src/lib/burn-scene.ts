export type BurnToken =
  | { kind: "space"; text: string }
  | { kind: "word"; text: string; dx: number; dy: number; rotate: number; delay: number };

export type Ember = {
  left: number; // % across the box
  size: number; // px
  drift: number; // px sideways
  rise: number; // px upward
  delay: number; // s
  duration: number; // s
};

export type BurnScene = { tokens: BurnToken[]; embers: Ember[] };

// Past this many words, the tail is dropped from the animation to keep it smooth.
const MAX_ANIMATED_WORDS = 280;
const EMBER_COUNT = 36;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Pre-computes the random motion for every word and ember once, at release
 * time, so the animation stays stable across re-renders.
 */
export function createBurnScene(text: string): BurnScene {
  const parts = text.split(/(\s+)/).filter(Boolean);
  const wordCount = Math.min(
    parts.filter((p) => !/^\s+$/.test(p)).length,
    MAX_ANIMATED_WORDS,
  );

  const tokens: BurnToken[] = [];
  let wordIndex = 0;
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ kind: "space", text: part });
      continue;
    }
    if (wordIndex >= MAX_ANIMATED_WORDS) {
      tokens.push({ kind: "space", text: "…" });
      break;
    }
    // Fire catches at the bottom and climbs: later words ignite first.
    const progress = wordCount > 1 ? wordIndex / (wordCount - 1) : 1;
    tokens.push({
      kind: "word",
      text: part,
      dx: rand(-40, 40),
      dy: rand(-160, -70),
      rotate: rand(-25, 25),
      delay: (1 - progress) * 1.1 + rand(0, 0.25),
    });
    wordIndex++;
  }

  const embers: Ember[] = Array.from({ length: EMBER_COUNT }, () => ({
    left: rand(4, 96),
    size: rand(2, 5),
    drift: rand(-50, 50),
    rise: rand(180, 380),
    delay: rand(0, 1),
    duration: rand(1.4, 2),
  }));

  return { tokens, embers };
}
