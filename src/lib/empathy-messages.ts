/**
 * Used when no AI provider is configured or the provider call fails,
 * so a person who just vented never sees an error.
 */
export const FALLBACK_MESSAGES = [
  "Take a deep breath. Today is just a bad day, not a bad life.",
  "That was a lot to carry. You've set it down now, even if only for a moment.",
  "You don't have to have it all figured out tonight. Being here is enough.",
  "Feelings this heavy are a sign of how much you care. Be gentle with yourself.",
  "You made space for what you're feeling. That takes more strength than it seems.",
  "Nothing needs fixing in this exact second. Just breathe, and let your shoulders drop.",
];

export function pickFallbackMessage(): string {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}
