"use client";

import { useState } from "react";
import BreathingBubble, { BOX_BREATHING, RESTING_SCALE, type BreathPhase } from "@/components/BreathingBubble";
import { Chip } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { speak } from "@/lib/voice";

type Pattern = { id: string; name: string; summary: string; spoken: string; phases: BreathPhase[] };

const PATTERNS: Pattern[] = [
  {
    id: "box",
    name: "Box breathing",
    summary: "4 in · 4 hold · 4 out · 4 hold. Steady and grounding — used by athletes and first responders.",
    spoken: "Box breathing. Breathe in for four, hold for four, breathe out for four, and hold for four. Tap the bubble when you're ready.",
    phases: BOX_BREATHING,
  },
  {
    id: "478",
    name: "4-7-8",
    summary: "4 in · 7 hold · 8 out. The long exhale is deeply calming, especially before sleep.",
    spoken: "Four seven eight breathing. Breathe in for four, hold for seven, and breathe out slowly for eight. Tap the bubble when you're ready.",
    phases: [
      { label: "Breathe in", seconds: 4, scale: 1 },
      { label: "Hold", seconds: 7, scale: 1 },
      { label: "Breathe out", seconds: 8, scale: RESTING_SCALE },
    ],
  },
  {
    id: "coherent",
    name: "Coherent",
    summary: "5 in · 5 out. About six breaths a minute — a gentle rhythm to settle your heart rate.",
    spoken: "Coherent breathing. Breathe in for five, and out for five. A slow, gentle rhythm. Tap the bubble when you're ready.",
    phases: [
      { label: "Breathe in", seconds: 5, scale: 1 },
      { label: "Breathe out", seconds: 5, scale: RESTING_SCALE },
    ],
  },
  {
    id: "sigh",
    name: "Physiological sigh",
    summary: "A deep inhale, a second short sip of air, then a long slow exhale. Quick relief in a few rounds.",
    spoken: "The physiological sigh. Take a deep breath in, then a second short sip of air, then a long, slow breath out. Tap the bubble when you're ready.",
    phases: [
      { label: "Breathe in", seconds: 3, scale: 0.88 },
      { label: "Sip in more", seconds: 1, scale: 1 },
      { label: "Long breath out", seconds: 6, scale: RESTING_SCALE },
    ],
  },
];

export default function BreathingPatterns() {
  const [patternId, setPatternId] = useState(PATTERNS[0].id);
  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Breathing pattern">
        {PATTERNS.map((p) => (
          <Chip
            key={p.id}
            selected={p.id === patternId}
            onClick={() => {
              setPatternId(p.id);
              void speak(p.spoken);
            }}
          >
            {p.name}
          </Chip>
        ))}
      </div>
      <div className="flex max-w-md flex-col items-center gap-3">
        <p className="text-center text-mist/65">{pattern.summary}</p>
        <ListenButton text={pattern.spoken} label="How it works" />
      </div>
      <BreathingBubble key={pattern.id} phases={pattern.phases} />
      <p className="max-w-md text-center text-xs text-mist/40">
        Breathe through your nose if you can. If you feel light-headed, stop and breathe normally.
      </p>
    </div>
  );
}
