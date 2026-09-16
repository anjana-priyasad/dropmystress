"use client";

import GuidedSession, { type GuidedStep } from "./GuidedSession";

const STEPS: GuidedStep[] = [
  { title: "Sit tall", instruction: "Feet flat on the floor, spine long, shoulders relaxed. Take a deep breath.", seconds: 10 },
  { title: "Neck: right", instruction: "Gently tilt your right ear toward your right shoulder. Breathe.", seconds: 20 },
  { title: "Neck: left", instruction: "Slowly bring your head back up and tilt your left ear toward your left shoulder.", seconds: 20 },
  { title: "Shoulder rolls", instruction: "Roll your shoulders slowly backward in big circles.", seconds: 20 },
  { title: "Chest opener", instruction: "Clasp your hands behind your back (or hold the chair), lift your chest and gently squeeze your shoulder blades.", seconds: 25 },
  { title: "Seated twist: right", instruction: "Place your left hand on your right knee and gently turn your upper body to the right.", seconds: 20 },
  { title: "Seated twist: left", instruction: "Return to centre, then place your right hand on your left knee and turn to the left.", seconds: 20 },
  { title: "Wrists & fingers", instruction: "Stretch one arm forward, palm up, and gently pull your fingers back with the other hand. Switch halfway.", seconds: 30 },
  { title: "Forward fold", instruction: "Let your upper body hang forward over your legs. Let your head and arms be heavy.", seconds: 25 },
  { title: "Rest your eyes", instruction: "Look at something at least 6 metres (20 feet) away and let your eyes relax.", seconds: 20 },
];

export default function StretchBreak() {
  return (
    <GuidedSession
      steps={STEPS}
      intro="A short routine you can do right from your chair. Move slowly and breathe through each stretch."
      outro="Nicely done. A few minutes of movement can reset both your body and your focus."
      note="Stretch gently and stop if anything hurts. Skip any movement that isn't right for your body."
    />
  );
}
