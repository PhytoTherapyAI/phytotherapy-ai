import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model fallback chain — try primary first, fall back if 429/quota
const MODEL_PRIMARY = "gemini-2.0-flash";
const MODEL_FALLBACK = "gemini-2.5-flash";

/**
 * Parse retry delay from Gemini 429 error.
 * Returns delay in ms, or 0 if not found.
 */
function parseRetryDelay(error: unknown): number {
  const msg = error instanceof Error ? error.message : String(error);
  const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000);
  return 0;
}

/**
 * Check if error is a rate limit (429) error
 */
function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED");
}

/**
 * Check if error is a daily quota exhaustion (limit: 0)
 */
function isDailyQuotaExhausted(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("limit: 0");
}

/**
 * Sleep for given milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function askGemini(prompt: string, systemPrompt: string) {
  return retryWithFallback(async (modelName: string) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 4096,
      },
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

/**
 * Ask Gemini and force JSON-only output via responseMimeType.
 */
export async function askGeminiJSON(prompt: string, systemPrompt: string) {
  return retryWithFallback(async (modelName: string) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

export async function askGeminiStream(prompt: string, systemPrompt: string) {
  return retryStreamWithFallback(async (modelName: string) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 4096,
      },
    });
    const result = await model.generateContentStream(prompt);
    return result.stream;
  });
}

/**
 * Multimodal streaming: accepts text + inline file data (images, PDFs).
 */
export interface GeminiFilePart {
  mimeType: string;
  base64: string;
}

/**
 * Ask Gemini with file attachments (non-streaming, JSON output).
 * Used for PDF/image analysis like blood test extraction.
 */
export async function askGeminiJSONMultimodal(
  prompt: string,
  systemPrompt: string,
  files: GeminiFilePart[]
) {
  return retryWithFallback(async (modelName: string) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    for (const file of files) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.base64,
        },
      });
    }
    parts.push({ text: prompt });

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    return result.response.text();
  });
}

export async function askGeminiStreamMultimodal(
  prompt: string,
  systemPrompt: string,
  files: GeminiFilePart[]
) {
  return retryStreamWithFallback(async (modelName: string) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 4096,
      },
    });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    for (const file of files) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.base64,
        },
      });
    }
    parts.push({ text: prompt });

    const result = await model.generateContentStream({ contents: [{ role: "user", parts }] });
    return result.stream;
  });
}

// ──────────────────────────────────────────────
// Retry + fallback logic
// ──────────────────────────────────────────────

/**
 * Retry a non-streaming Gemini call with exponential backoff + model fallback.
 * Strategy:
 *   1. Try primary model
 *   2. If 429 per-minute → wait retryDelay → retry primary (up to 2 times)
 *   3. If still failing → try fallback model
 *   4. If daily quota exhausted on all → throw with clear message
 */
async function retryWithFallback<T>(fn: (model: string) => Promise<T>): Promise<T> {
  const models = [MODEL_PRIMARY, MODEL_FALLBACK];

  for (const modelName of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await fn(modelName);
      } catch (error) {
        if (!isRateLimitError(error)) throw error; // non-429 error, don't retry

        if (isDailyQuotaExhausted(error) && attempt === 0) {
          console.warn(`[Gemini] Daily quota exhausted for ${modelName}, trying fallback...`);
          break; // skip to next model
        }

        const retryMs = parseRetryDelay(error) || (5000 * (attempt + 1));
        console.warn(`[Gemini] 429 on ${modelName} (attempt ${attempt + 1}/3), retrying in ${retryMs}ms...`);

        if (attempt < 2) {
          await sleep(Math.min(retryMs, 35000)); // cap at 35s
        }
      }
    }
  }

  throw new Error(
    "QUOTA_EXHAUSTED: All Gemini API quotas are exhausted. " +
    "Enable billing at https://aistudio.google.com or wait for daily quota reset."
  );
}

/**
 * Same as retryWithFallback but for streaming calls.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function retryStreamWithFallback(fn: (model: string) => Promise<any>): Promise<any> {
  return retryWithFallback(fn);
}
