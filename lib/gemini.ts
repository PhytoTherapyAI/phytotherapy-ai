import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function askGemini(prompt: string, systemPrompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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
    model: "gemini-2.5-flash",
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
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContentStream(prompt);
  return result.stream;
}
