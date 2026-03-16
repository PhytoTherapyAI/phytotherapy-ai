import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function askGemini(prompt: string, systemPrompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Ask Gemini and force JSON-only output via responseMimeType.
 * Use this for structured data responses (interaction analysis, drug resolution, etc.)
 */
export async function askGeminiJSON(prompt: string, systemPrompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function askGeminiStream(prompt: string, systemPrompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContentStream(prompt);
  return result.stream;
}

/**
 * Multimodal streaming: accepts text + inline file data (images, PDFs).
 * Files are passed as Gemini inlineData parts.
 */
export interface GeminiFilePart {
  mimeType: string;
  base64: string;
}

export async function askGeminiStreamMultimodal(
  prompt: string,
  systemPrompt: string,
  files: GeminiFilePart[]
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
    },
  });

  // Build multimodal content parts: files first, then text
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
}
