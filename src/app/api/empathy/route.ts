import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { pickFallbackMessage } from "@/lib/empathy-messages";

const MAX_INPUT_CHARS = 5000;
const PROVIDER_TIMEOUT_MS = 10_000;

const SYSTEM_PROMPT = `You are the quiet, compassionate voice of DropMyStress, a place where people anonymously vent and then let their frustration go.

Reply to what they wrote with ONE short, comforting message:
- 1 to 3 sentences, under 45 words.
- Warm, calm, human. Validate the feeling; don't minimize it or rush to fix it.
- You may gently acknowledge the gist of what they shared, but never quote it back.
- No advice lists, no diagnoses, no toxic positivity, no emoji, no quotation marks.
- If they mention self-harm, suicide, or being in danger, kindly encourage them to reach out right now to someone they trust, a local crisis line, or emergency services.

Return only the message text.`;

type Provider = "openai" | "gemini";

function resolveProvider(): Provider | null {
  const preferred = process.env.AI_PROVIDER?.toLowerCase();
  if (preferred === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (preferred === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

async function generateWithOpenAI(vent: string): Promise<string> {
  const client = new OpenAI({ timeout: PROVIDER_TIMEOUT_MS, maxRetries: 1 });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    instructions: SYSTEM_PROMPT,
    input: vent,
  });
  return response.output_text;
}

async function generateWithGemini(vent: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: vent,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      abortSignal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    },
  });
  return response.text ?? "";
}

function cleanMessage(raw: string): string {
  return raw.trim().replace(/^["“”']+|["“”']+$/g, "").trim();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body as { text?: unknown } | null)?.text;
  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "`text` must be a non-empty string." }, { status: 400 });
  }

  const vent = text.trim().slice(0, MAX_INPUT_CHARS);
  const provider = resolveProvider();

  if (provider) {
    try {
      const raw =
        provider === "openai" ? await generateWithOpenAI(vent) : await generateWithGemini(vent);
      const message = cleanMessage(raw);
      if (message) {
        return Response.json({ message, source: provider });
      }
    } catch (err) {
      // Deliberately never log the vent itself — users were promised anonymity.
      console.error(`[empathy] ${provider} request failed:`, err instanceof Error ? err.message : err);
    }
  }

  return Response.json({ message: pickFallbackMessage(), source: "fallback" });
}
