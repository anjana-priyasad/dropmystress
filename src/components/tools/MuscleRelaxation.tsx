"use client";

import GuidedSession, { type GuidedStep } from "./GuidedSession";

const GROUPS: [string, string][] = [
  ["Hands", "Make tight fists with both hands."],
  ["Arms", "Bend your elbows and tense your upper arms, like showing off a muscle."],
  ["Shoulders", "Lift your shoulders up toward your ears and hold them there."],
  ["Face", "Scrunch your whole face — eyes, nose, forehead — tightly together."],
  ["Jaw", "Clench your teeth gently and press your tongue to the roof of your mouth."],
  ["Chest & back", "Take a deep breath, hold it, and gently squeeze your shoulder blades together."],
  ["Stomach", "Pull your belly in tight, as if bracing for a nudge."],
  ["Legs", "Straighten your legs and tense your thighs."],
  ["Feet", "Curl your toes downward and tense your feet."],
];

const STEPS: GuidedStep[] = [
  {
    title: "Settle in",
    instruction: "Sit or lie comfortably. Let your breathing slow down a little.",
    seconds: 10,
  },
  ...GROUPS.flatMap(([group, tense]): GuidedStep[] => [
    { title: `${group}: tense`, instruction: `${tense} Hold it — about 70% effort, not pain.`, seconds: 5, tone: "tense" },
    {
      title: `${group}: release`,
      instruction: "Let go all at once. Notice the difference between tension and relaxation.",
      seconds: 10,
    },
  ]),
  {
    title: "Whole body",
    instruction: "Take a slow breath and feel your whole body heavy, warm and loose.",
    seconds: 15,
  },
];

export default function MuscleRelaxation() {
  return (
    <GuidedSession
      steps={STEPS}
      intro="You'll gently tense each muscle group for 5 seconds, then release it for 10. Follow the ring — warm means tense, calm means let go."
      outro="Notice how your body feels now. You can come back to this whenever tension builds up."
      note="Skip any area that's injured or painful. Tense gently, never to the point of strain."
    />
  );
}
