/** Keys for the visitor's own activity. Like everything else, it lives only in this browser. */
export const FAVOURITES_KEY = "dms.favourite-tools";
export const RECENT_KEY = "dms.recent-tools";
export const ACTIVE_DAYS_KEY = "dms.active-days";

export type RecentTool = { slug: string; at: string };

export const NO_SLUGS: string[] = [];
export const NO_RECENT: RecentTool[] = [];

const RECENT_LIMIT = 8;
const ACTIVE_DAYS_LIMIT = 400;

export function withRecent(recent: RecentTool[], slug: string, at = new Date()): RecentTool[] {
  return [{ slug, at: at.toISOString() }, ...recent.filter((r) => r.slug !== slug)].slice(0, RECENT_LIMIT);
}

export function withActiveDay(days: string[], day: string): string[] {
  return days.includes(day) ? days : [...days, day].sort().slice(-ACTIVE_DAYS_LIMIT);
}

/** Consecutive days of activity ending today (or yesterday, so the streak survives until you check in). */
export function currentStreak(days: string[], today: string): number {
  const set = new Set(days);
  const cursor = new Date(`${today}T12:00:00`);
  if (!set.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
