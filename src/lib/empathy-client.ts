import { pickFallbackMessage } from "./empathy-messages";

export async function fetchEmpathyMessage(
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const res = await fetch("/api/empathy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });
    if (!res.ok) throw new Error(`Empathy API responded ${res.status}`);
    const data: { message?: unknown } = await res.json();
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch (err) {
    if (signal?.aborted) throw err;
  }
  return pickFallbackMessage();
}
