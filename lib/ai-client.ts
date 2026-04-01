// © 2026 Phytotherapy.ai — All Rights Reserved
import Anthropic from "@anthropic-ai/sdk";

// Lazy-init client to ensure env vars are loaded at runtime
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
    }
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

// Model strategy:
// - Current: Haiku 4.5 for everything (fast + cost-effective, better than Gemini 2.0 Flash)
// - Future (when monetized): upgrade JSON routes to Sonnet 4.6 for highest medical quality
const MODEL_FAST = "claude-haiku-4-5";
const MODEL_SMART = "claude-haiku-4-5"; // TODO: switch to "claude-sonnet-4-6" when on Vercel Pro + revenue

// Token limits — lower = faster response time
const TOKENS_TEXT = 2048;    // chat/simple text — most answers < 800 tokens
const TOKENS_JSON = 3000;    // JSON analysis — most responses < 1500 tokens
const TOKENS_STREAM = 2048;  // streaming chat

// ──────────────────────────────────────────────
// Safe JSON parser — 5-layer cleaning
// ──────────────────────────────────────────────

function safeParseJSON(text: string): unknown {
  // 1. Markdown code block cleanup
  let cleaned = text
    .replace(/^```(?:json)?\s*\n?/gm, "")
    .replace(/\n?```\s*$/gm, "")
    .trim();

  // 2. Skip leading explanation text — find first { or [
  const jsonStart = cleaned.search(/[\[{]/);
  if (jsonStart > 0) cleaned = cleaned.substring(jsonStart);

  // 3. Clean trailing text — find last } or ]
  const lastBrace = Math.max(
    cleaned.lastIndexOf("}"),
    cleaned.lastIndexOf("]")
  );
  if (lastBrace > 0) cleaned = cleaned.substring(0, lastBrace + 1);

  // 4. First parse attempt
  try {
    return JSON.parse(cleaned);
  } catch {
    // 5. Aggressive cleanup — remove control chars and fix trailing commas
    cleaned = cleaned
      .replace(/[\x00-\x1F\x7F]/g, " ")
      .replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  }
}

// ──────────────────────────────────────────────
// Retry logic — handles 429 + 529
// ──────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return status === 429 || status === 529;
  }
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("429") ||
    msg.includes("529") ||
    msg.includes("overloaded") ||
    msg.includes("rate")
  );
}

async function retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [5000, 10000, 15000]; // exponential backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isRetryableError(error) || attempt === 2) throw error;
      const delay = delays[attempt];
      console.warn(
        `[Claude] Retryable error (attempt ${attempt + 1}/3), retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }
  throw new Error("Unreachable");
}

// ──────────────────────────────────────────────
// Exported functions — same names as gemini.ts
// ──────────────────────────────────────────────

export async function askGemini(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  return retryWithBackoff(async () => {
    const response = await getClient().messages.create({
      model: MODEL_FAST,
      max_tokens: TOKENS_TEXT,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  });
}

export async function askGeminiJSON(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const jsonSystemPrompt =
    systemPrompt +
    "\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown code blocks, no explanation text before or after, no ```json wrapper. Output ONLY the raw JSON object/array. Be concise — use short values, avoid unnecessary verbosity.";

  return retryWithBackoff(async () => {
    const response = await getClient().messages.create({
      model: MODEL_SMART,
      max_tokens: TOKENS_JSON,
      temperature: 0,
      system: jsonSystemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    const text = block.type === "text" ? block.text : "{}";
    const parsed = safeParseJSON(text);
    return JSON.stringify(parsed);
  });
}

export async function askGeminiStream(
  prompt: string,
  systemPrompt: string
): Promise<ReadableStream> {
  return retryWithBackoff(async () => {
    const stream = getClient().messages.stream({
      model: MODEL_FAST,
      max_tokens: TOKENS_STREAM,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
  });
}

// Re-export the same interface for multimodal
export interface GeminiFilePart {
  mimeType: string;
  base64: string;
}

export async function askGeminiJSONMultimodal(
  prompt: string,
  systemPrompt: string,
  files: GeminiFilePart[]
): Promise<string> {
  const jsonSystemPrompt =
    systemPrompt +
    "\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown code blocks, no explanation text before or after, no ```json wrapper. Output ONLY the raw JSON object/array. Be concise.";

  return retryWithBackoff(async () => {
    const contentParts: Anthropic.MessageCreateParams["messages"][0]["content"] =
      [];

    for (const file of files) {
      if (file.mimeType === "application/pdf") {
        contentParts.push({
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: file.base64,
          },
        } as unknown as Anthropic.ImageBlockParam);
      } else {
        contentParts.push({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: file.mimeType as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: file.base64,
          },
        });
      }
    }
    contentParts.push({ type: "text" as const, text: prompt });

    const response = await getClient().messages.create({
      model: MODEL_SMART,
      max_tokens: TOKENS_JSON,
      temperature: 0,
      system: jsonSystemPrompt,
      messages: [{ role: "user", content: contentParts }],
    });
    const block = response.content[0];
    const text = block.type === "text" ? block.text : "{}";
    const parsed = safeParseJSON(text);
    return JSON.stringify(parsed);
  });
}

export async function askGeminiStreamMultimodal(
  prompt: string,
  systemPrompt: string,
  files: GeminiFilePart[]
): Promise<ReadableStream> {
  return retryWithBackoff(async () => {
    const contentParts: Anthropic.MessageCreateParams["messages"][0]["content"] =
      [];

    for (const file of files) {
      if (file.mimeType === "application/pdf") {
        contentParts.push({
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: file.base64,
          },
        } as unknown as Anthropic.ImageBlockParam);
      } else {
        contentParts.push({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: file.mimeType as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: file.base64,
          },
        });
      }
    }
    contentParts.push({ type: "text" as const, text: prompt });

    const stream = getClient().messages.stream({
      model: MODEL_FAST,
      max_tokens: TOKENS_STREAM,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: contentParts }],
    });

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
  });
}
