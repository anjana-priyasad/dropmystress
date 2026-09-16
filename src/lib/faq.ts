export type FaqItem = { question: string; answer: string };

/** Shown on the home page and published as FAQPage structured data — keep both in sync by using this list. */
export const HOME_FAQ: FaqItem[] = [
  {
    question: "Is DropMyStress anonymous?",
    answer:
      "Yes. There are no accounts and no sign-up. DropMyStress doesn't save what you type in the vent box. To write the calm reply, your text is sent once to our AI provider, and we don't keep a copy.",
  },
  {
    question: "Is DropMyStress free?",
    answer: "Yes. Venting, the calming AI message, and all 20 stress-relief tools are free to use.",
  },
  {
    question: "What stress relief tools can I use?",
    answer:
      "There are 20 tools: breathing patterns like box breathing and 4-7-8, muscle relaxation, a body scan, 5-4-3-2-1 grounding, a thought reframe, a worry sorter, a brain dump, journal prompts, a gratitude jar, affirmation cards, bubble wrap, a stress ball, a zen sand garden, a mood tracker, a quick stress check, and a soundscape mixer.",
  },
  {
    question: "Where are my journal entries and mood check-ins stored?",
    answer:
      "Only in your own browser on this device. They're never uploaded. Clearing your browser data, or using a different device, means they won't be there.",
  },
  {
    question: "Which breathing exercise should I try first?",
    answer:
      "Box breathing is a good place to start: breathe in for 4 seconds, hold for 4, breathe out for 4, and hold for 4. If you're winding down for sleep, many people prefer 4-7-8 breathing, which has a longer exhale.",
  },
  {
    question: "Can DropMyStress replace therapy or professional help?",
    answer:
      "No. It's a place to release everyday stress, not a substitute for professional care. If you're struggling or thinking about harming yourself, please contact your local emergency number or a crisis helpline right away.",
  },
];
