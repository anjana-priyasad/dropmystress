import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

const MAX_CHARS = 600;
const MEMORY_LIMIT = 200;
const CACHE_DIR = path.join(process.cwd(), ".voice-cache");

const VOICE_INSTRUCTIONS =
  "Voice: warm, soft and reassuring, like a calm meditation guide. Pacing: slow and unhurried, with gentle pauses between sentences. Tone: kind and grounded — never cheerful, rushed or salesy.";

const memory = new Map<string, Uint8Array>();

function remember(key: string, audio: Uint8Array) {
  memory.set(key, audio);
  if (memory.size > MEMORY_LIMIT) memory.delete(memory.keys().next().value!);
}

async function readDiskCache(key: string): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(await readFile(path.join(CACHE_DIR, `${key}.mp3`)));
  } catch {
    return null;
  }
}

async function writeDiskCache(key: string, audio: Uint8Array) {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(path.join(CACHE_DIR, `${key}.mp3`), audio);
  } catch {
    // Read-only filesystems (e.g. some serverless hosts) just skip the disk cache.
  }
}

/**
 * GET /api/voice          → { available } — whether natural voice audio can be generated.
 * GET /api/voice?text=…   → spoken audio (mp3). 501 when no TTS provider is configured.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (!params.has("text")) {
    return Response.json({ available: Boolean(process.env.OPENAI_API_KEY) });
  }

  const text = params.get("text")?.trim() ?? "";
  if (!text || text.length > MAX_CHARS) {
    return Response.json({ error: `text must be 1–${MAX_CHARS} characters.` }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Voice generation is not configured." }, { status: 501 });
  }

  const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const voice = process.env.OPENAI_TTS_VOICE || "marin";
  const supportsInstructions = model.startsWith("gpt-");
  const key = createHash("sha256")
    .update([model, voice, supportsInstructions ? VOICE_INSTRUCTIONS : "", text].join("|"))
    .digest("hex");

  let audio = memory.get(key) ?? (await readDiskCache(key));
  if (!audio) {
    try {
      const client = new OpenAI({ timeout: 15_000, maxRetries: 1 });
      const response = await client.audio.speech.create({
        model,
        voice,
        input: text,
        response_format: "mp3",
        ...(supportsInstructions && { instructions: VOICE_INSTRUCTIONS }),
      });
      audio = new Uint8Array(await response.arrayBuffer());
      void writeDiskCache(key, audio);
    } catch (err) {
      console.error("[voice] speech generation failed:", err instanceof Error ? err.message : err);
      return Response.json({ error: "Voice generation failed." }, { status: 502 });
    }
  }
  remember(key, audio);

  return new Response(audio as BodyInit, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
