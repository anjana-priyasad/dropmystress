import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Anchor,
  BookOpen,
  Brain,
  CircleDot,
  Feather,
  FaceSlightlySmiling,
  Gauge,
  HandHeart,
  Headphones,
  Hourglass,
  ListTodo,
  Mail,
  Mountain,
  PersonStanding,
  Scale,
  ScanFace,
  Sparkles,
  Sprout,
  Wind,
} from "lucide-react";

export type ToolCategory = "breathe" | "mind" | "express" | "play" | "track";

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  duration: string;
  icon: LucideIcon;
  /** Extra search terms that aren't in the name or description. */
  keywords: string;
};

export const CATEGORIES: Record<
  ToolCategory,
  { label: string; accent: string; iconBg: string; glow: string; ring: string }
> = {
  breathe: { label: "Breathe & body", accent: "text-calm", iconBg: "bg-calm/12", glow: "bg-calm/25", ring: "hover:border-calm/35" },
  mind: { label: "Calm the mind", accent: "text-lavender", iconBg: "bg-lavender/12", glow: "bg-lavender/25", ring: "hover:border-lavender/35" },
  express: { label: "Write & release", accent: "text-rose-500", iconBg: "bg-rose-300/12", glow: "bg-rose-300/25", ring: "hover:border-rose-300/35" },
  play: { label: "Play it out", accent: "text-amber-600", iconBg: "bg-amber-300/12", glow: "bg-amber-300/25", ring: "hover:border-amber-300/35" },
  track: { label: "Check in", accent: "text-sky-600", iconBg: "bg-sky-300/12", glow: "bg-sky-300/25", ring: "hover:border-sky-300/35" },
};

export const TOOLS: Tool[] = [
  {
    slug: "breathing",
    name: "Breathing patterns",
    tagline: "Box, 4-7-8, coherent breathing and the physiological sigh.",
    description:
      "Pick a pattern and follow the bubble. Slow, steady breathing is one of the fastest ways to tell your nervous system it's safe.",
    category: "breathe",
    duration: "1–5 min",
    icon: Wind,
    keywords: "anxious anxiety panic sleep calm breath breathe box 478",
  },
  {
    slug: "muscle-relaxation",
    name: "Muscle relaxation",
    tagline: "Tense, then release, one muscle group at a time.",
    description:
      "Progressive muscle relaxation: briefly tense each part of your body, then let it go. Stress hides in muscles — this helps you find it and release it.",
    category: "breathe",
    duration: "3 min",
    icon: Activity,
    keywords: "tense tension pmr body sleep tight shoulders",
  },
  {
    slug: "body-scan",
    name: "Body scan",
    tagline: "A slow, gentle sweep of attention from feet to head.",
    description:
      "Rest your attention on each part of your body in turn. There's nothing to fix — just notice what's there.",
    category: "breathe",
    duration: "4 min",
    icon: ScanFace,
    keywords: "mindfulness meditation sleep body relax",
  },
  {
    slug: "stretch-break",
    name: "Desk stretch break",
    tagline: "Loosen your neck, shoulders, back and eyes.",
    description:
      "A short guided routine you can do from your chair. Move slowly, and skip anything that hurts.",
    category: "breathe",
    duration: "3 min",
    icon: PersonStanding,
    keywords: "work desk office posture neck back tired",
  },
  {
    slug: "meditation-timer",
    name: "Meditation timer",
    tagline: "Quiet time with a soft bell to begin and end.",
    description:
      "Choose how long you'd like to sit. A bell marks the start and the end, with optional gentle bells along the way.",
    category: "breathe",
    duration: "3–20 min",
    icon: Hourglass,
    keywords: "meditate mindfulness focus quiet bell",
  },
  {
    slug: "grounding",
    name: "5-4-3-2-1 grounding",
    tagline: "Come back to the present through your senses.",
    description:
      "When your mind is racing, name what you can see, feel, hear, smell and taste. It anchors you in the here and now.",
    category: "mind",
    duration: "2 min",
    icon: Anchor,
    keywords: "anxious anxiety panic overwhelmed racing thoughts present",
  },
  {
    slug: "thought-reframe",
    name: "Thought reframe",
    tagline: "Untangle a stressful thought, step by step.",
    description:
      "A CBT-style thought record. Look at the evidence, spot thinking traps, and find a more balanced way to see things.",
    category: "mind",
    duration: "5 min",
    icon: Brain,
    keywords: "cbt anxious negative thoughts overthinking rumination",
  },
  {
    slug: "worry-sorter",
    name: "Worry sorter",
    tagline: "Act on what you can control. Set down what you can't.",
    description:
      "Put a worry through one simple question: can you do anything about it? Then either plan a small step or let it go.",
    category: "mind",
    duration: "2 min",
    icon: Scale,
    keywords: "worry anxious control overthinking plan",
  },
  {
    slug: "brain-dump",
    name: "Brain dump",
    tagline: "Empty your head, then sort it into today, later, or not yours.",
    description:
      "Overwhelm often comes from holding everything at once. Get it all out, then decide what actually needs you today.",
    category: "mind",
    duration: "5 min",
    icon: ListTodo,
    keywords: "overwhelmed work tasks todo busy stress focus",
  },
  {
    slug: "self-compassion",
    name: "Self-compassion break",
    tagline: "Three steps to treat yourself like a good friend would.",
    description:
      "A short guided practice based on Kristin Neff's Self-Compassion Break: acknowledge the hurt, remember you're not alone, and offer yourself kindness.",
    category: "mind",
    duration: "3 min",
    icon: HandHeart,
    keywords: "sad shame guilt kind critic lonely",
  },
  {
    slug: "unsent-letter",
    name: "Unsent letter",
    tagline: "Say everything to them. Then burn it or let it float away.",
    description:
      "Write the letter you'll never send — to a person, a situation, or your past self. Nothing is saved.",
    category: "express",
    duration: "5+ min",
    icon: Mail,
    keywords: "angry anger grief breakup hurt vent write",
  },
  {
    slug: "gratitude-jar",
    name: "Gratitude jar",
    tagline: "Collect small good things and revisit them on hard days.",
    description:
      "Drop one small good thing into the jar each day. When things feel heavy, pull a note out at random. Saved only in this browser.",
    category: "express",
    duration: "1 min",
    icon: Sprout,
    keywords: "grateful happy positive sad",
  },
  {
    slug: "journal",
    name: "Journal prompts",
    tagline: "Gentle questions to help you make sense of the day.",
    description:
      "A private journal with reflective prompts. Entries stay in this browser and never leave your device.",
    category: "express",
    duration: "5+ min",
    icon: BookOpen,
    keywords: "write reflect diary sad thoughts",
  },
  {
    slug: "affirmations",
    name: "Affirmation cards",
    tagline: "Flip through kind, grounded reminders.",
    description:
      "Shuffle a deck of realistic, gentle affirmations. Save the ones that land to come back to later.",
    category: "express",
    duration: "1 min",
    icon: Sparkles,
    keywords: "positive confidence self-esteem kind",
  },
  {
    slug: "bubble-wrap",
    name: "Bubble wrap",
    tagline: "Pop. Pop. Pop. Endlessly satisfying.",
    description: "An infinite sheet of bubble wrap. Tap, or hold and drag, to pop.",
    category: "play",
    duration: "Any",
    icon: CircleDot,
    keywords: "angry fidget bored fun game distraction",
  },
  {
    slug: "stress-ball",
    name: "Stress ball",
    tagline: "Squeeze it, squish it, throw it around.",
    description: "Press and hold to squeeze, or drag and fling it. It always bounces back — and so will you.",
    category: "play",
    duration: "Any",
    icon: FaceSlightlySmiling,
    keywords: "angry anger fidget squeeze fun game",
  },
  {
    slug: "sand-garden",
    name: "Zen garden",
    tagline: "Rake sand, plant trees and flowers, and add koi, birds and more.",
    description:
      "Build your own peaceful garden: rake patterns in the sand, plant cherry trees, bamboo and lotus flowers, add a pond with koi, a stone lantern, and animals — then watch it come alive at sunset or night, with gentle garden sounds.",
    category: "play",
    duration: "Any",
    icon: Mountain,
    keywords: "zen garden builder relaxing game draw calm fun focus plants flowers koi pond sand rake",
  },
  {
    slug: "mood-tracker",
    name: "Mood tracker",
    tagline: "Quick check-ins that reveal your patterns over time.",
    description:
      "Log how you feel and what's affecting it. Over time you'll see what lifts you up and what weighs you down. Saved only in this browser.",
    category: "track",
    duration: "30 sec",
    icon: Feather,
    keywords: "mood feelings log track patterns",
  },
  {
    slug: "stress-check",
    name: "Stress check",
    tagline: "A 4-question snapshot of your recent stress.",
    description:
      "Based on the Perceived Stress Scale (PSS-4). It's a quick self-reflection, not a diagnosis.",
    category: "track",
    duration: "1 min",
    icon: Gauge,
    keywords: "test quiz score assessment pss",
  },
  {
    slug: "soundscapes",
    name: "Soundscape mixer",
    tagline: "Blend rain, ocean, wind, fire and brown noise.",
    description:
      "Mix your own calming background sound. Everything is generated live in your browser — no downloads.",
    category: "track",
    duration: "Any",
    icon: Headphones,
    keywords: "sleep focus rain ocean noise music relax work",
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function relatedTools(tool: Tool, count = 3): Tool[] {
  const sameCategory = TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug);
  const others = TOOLS.filter((t) => t.category !== tool.category);
  return [...sameCategory, ...others].slice(0, count);
}
