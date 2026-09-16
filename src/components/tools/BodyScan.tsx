"use client";

import GuidedSession, { type GuidedStep } from "./GuidedSession";

const STEPS: GuidedStep[] = [
  { title: "Arrive", instruction: "Close your eyes if that feels okay. Take three slow breaths and let the day fall away.", seconds: 20 },
  { title: "Feet", instruction: "Bring your attention to your feet. Notice warmth, coolness, pressure, or nothing at all.", seconds: 25 },
  { title: "Legs", instruction: "Move up through your calves and knees to your thighs. Let them feel heavy.", seconds: 25 },
  { title: "Hips & lower back", instruction: "Notice where your body meets the chair or floor. Let it hold you.", seconds: 25 },
  { title: "Belly", instruction: "Feel your belly rise and fall with each breath. No need to change anything.", seconds: 25 },
  { title: "Chest", instruction: "Notice your heartbeat and the gentle movement of your chest.", seconds: 25 },
  { title: "Hands & arms", instruction: "Sense your fingertips, palms, wrists, and arms. Let your hands soften.", seconds: 25 },
  { title: "Shoulders & neck", instruction: "Stress often gathers here. Breathe into this area and let your shoulders drop.", seconds: 25 },
  { title: "Face & head", instruction: "Soften your jaw, your cheeks, the space between your eyebrows, your scalp.", seconds: 25 },
  { title: "Whole body", instruction: "Now feel your whole body at once, breathing, resting, here.", seconds: 25 },
];

export default function BodyScan() {
  return (
    <GuidedSession
      steps={STEPS}
      intro="Find a comfortable position. You'll move your attention slowly through your body. If your mind wanders, that's normal — just come back to the current step."
      outro="Welcome back. Take a moment before you move on with your day."
    />
  );
}
