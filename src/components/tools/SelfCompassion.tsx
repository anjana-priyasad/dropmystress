"use client";

import GuidedSession, { type GuidedStep } from "./GuidedSession";

const STEPS: GuidedStep[] = [
  {
    title: "Bring it to mind",
    instruction: "Think of something that's causing you stress right now. Notice where you feel it in your body.",
    seconds: 25,
  },
  {
    title: "1 · This is hard",
    instruction: "Say to yourself: “This is a moment of suffering.” Or simply: “This hurts.” You're acknowledging it, not fighting it.",
    seconds: 30,
  },
  {
    title: "2 · I'm not alone",
    instruction: "Say: “Struggle is part of being human.” Somewhere, many people feel exactly like this right now.",
    seconds: 30,
  },
  {
    title: "3 · Be kind to yourself",
    instruction: "Place a hand on your heart. Say: “May I be kind to myself.” What would you say to a close friend feeling this way? Say it to yourself.",
    seconds: 45,
  },
  {
    title: "Rest",
    instruction: "Breathe slowly and feel the warmth of your hand. Let yourself receive that kindness.",
    seconds: 25,
  },
];

export default function SelfCompassion() {
  return (
    <GuidedSession
      steps={STEPS}
      intro="Adapted from Kristin Neff's Self-Compassion Break. In three short steps, you'll respond to your own stress the way you'd respond to a friend's."
      outro="You deserve the same kindness you give to others."
    />
  );
}
