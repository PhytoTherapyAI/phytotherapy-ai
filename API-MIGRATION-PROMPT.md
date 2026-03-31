# Claude API Migration Prompt — Yeni Session'a Yapıştır

Aşağıdaki TAMAMINI terminalde `claude` açtıktan sonra yapıştır:

---

Mevcut projemiz phytotherapy.ai bir Next.js 14 (App Router) + Tailwind CSS uygulaması. Şu an tüm AI çağrıları Google Gemini API üzerinden yapılıyor. Şimdi Gemini'dan Anthropic Claude API'ye geçiş yapacağız.

## KRİTİK KURALLAR
1. DURMA. Soru sorma, onay bekleme. Tüm migration'ı baştan sona yap.
2. Her adımı bitirdikten sonra `git add . && git commit -m "migration: [açıklama]" && git push` yap.
3. Mevcut fonksiyon imzalarını (parametre adları, return tipleri) DEĞİŞTİRME — sadece iç implementasyonu değiştir.
4. Tüm 75 API route'u test edebilecek şekilde çalışır bırak.
5. Build PASS olmadan commit yapma.
6. Context limiti dolarsa dur, o zamana kadar durmadan devam et.

---

## ADIM 1: Anthropic SDK Kurulumu

```bash
npm install @anthropic-ai/sdk
```

`.env.local` dosyasına ekle (mevcut GEMINI_API_KEY'i SİLME, yorum satırı yap):
```
ANTHROPIC_API_KEY=sk-ant-... (kullanıcıdan alınacak)
# GEMINI_API_KEY=... (eski, yedek olarak kalsın)
```

---

## ADIM 2: Ana AI Client Dosyası — `lib/gemini.ts` → `lib/ai-client.ts`

Mevcut `lib/gemini.ts` dosyası 5 fonksiyon export ediyor. Yeni `lib/ai-client.ts` dosyası AYNI fonksiyon isimlerini export etmeli ki 75 API route'ta hiçbir import değişmesin.

### Mevcut Fonksiyonlar (değiştirilecek iç implementasyon):

```typescript
// 1. Text-only, tek seferlik yanıt
export async function askGemini(systemPrompt: string, userMessage: string): Promise<string>

// 2. JSON çıktı zorunlu — 137 route bunu kullanıyor (EN KRİTİK)
export async function askGeminiJSON(systemPrompt: string, userMessage: string): Promise<any>

// 3. Streaming text yanıt (chat için)
export async function askGeminiStream(systemPrompt: string, userMessage: string): Promise<ReadableStream>

// 4. Multimodal (görsel/PDF) + JSON çıktı
export async function askGeminiJSONMultimodal(
  systemPrompt: string,
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
): Promise<any>

// 5. Multimodal + Streaming
export async function askGeminiStreamMultimodal(
  systemPrompt: string,
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
): Promise<ReadableStream>
```

### Claude API Karşılıkları:

| Gemini Fonksiyon | Claude API Karşılığı | Notlar |
|---|---|---|
| `askGemini()` | `messages.create()` | system + user message |
| `askGeminiJSON()` | `messages.create()` + system prompt'a "Return valid JSON only" ekle | Claude'da `response_format` yok, prompt'la zorla |
| `askGeminiStream()` | `messages.stream()` veya `messages.create({ stream: true })` | SSE streaming |
| `askGeminiJSONMultimodal()` | `messages.create()` + content array with `image` type | base64 image support |
| `askGeminiStreamMultimodal()` | `messages.stream()` + content array with `image` type | streaming + vision |

### Claude API Ayarları:
- **Model:** `claude-sonnet-4-5-20250514` (primary), `claude-sonnet-4-5-20250514` (fallback — aynı model, Claude'da tek model yeterli)
- **Temperature:** `0` (mevcut ayar korunacak)
- **Max Tokens:** `4096` (text), `8192` (JSON)
- **System Prompt:** `system` parametresi olarak gönder (Gemini'daki `systemInstruction` yerine)

### Yeni `lib/ai-client.ts` Dosyası Şablonu:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PRIMARY_MODEL = "claude-sonnet-4-5-20250514";

// Retry logic — mevcut Gemini retry mantığını koru
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 && attempt < maxRetries - 1) {
        const wait = Math.min(5000 * (attempt + 1), 30000);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// 1. askGemini — text only
export async function askGemini(systemPrompt: string, userMessage: string): Promise<string> {
  return withRetry(async () => {
    const response = await client.messages.create({
      model: PRIMARY_MODEL,
      max_tokens: 4096,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    return (response.content[0] as { type: "text"; text: string }).text;
  });
}

// 2. askGeminiJSON — JSON output (KRİTİK: 137 route)
export async function askGeminiJSON(systemPrompt: string, userMessage: string): Promise<any> {
  const jsonSystemPrompt = systemPrompt + "\n\nCRITICAL: You MUST respond with valid JSON only. No markdown, no code blocks, no explanation. Just raw JSON.";
  return withRetry(async () => {
    const response = await client.messages.create({
      model: PRIMARY_MODEL,
      max_tokens: 8192,
      temperature: 0,
      system: jsonSystemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = (response.content[0] as { type: "text"; text: string }).text;
    // Clean potential markdown code blocks
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  });
}

// 3. askGeminiStream — streaming text
export async function askGeminiStream(systemPrompt: string, userMessage: string): Promise<ReadableStream> {
  const stream = client.messages.stream({
    model: PRIMARY_MODEL,
    max_tokens: 4096,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// 4. askGeminiJSONMultimodal — vision + JSON
export async function askGeminiJSONMultimodal(
  systemPrompt: string,
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
): Promise<any> {
  const jsonSystemPrompt = systemPrompt + "\n\nCRITICAL: You MUST respond with valid JSON only. No markdown, no code blocks. Just raw JSON.";

  // Convert Gemini parts format to Claude content format
  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = parts.map(part => {
    if (part.inlineData) {
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: part.inlineData.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: part.inlineData.data,
        },
      };
    }
    return { type: "text" as const, text: part.text || "" };
  });

  return withRetry(async () => {
    const response = await client.messages.create({
      model: PRIMARY_MODEL,
      max_tokens: 8192,
      temperature: 0,
      system: jsonSystemPrompt,
      messages: [{ role: "user", content }],
    });
    const text = (response.content[0] as { type: "text"; text: string }).text;
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  });
}

// 5. askGeminiStreamMultimodal — vision + streaming
export async function askGeminiStreamMultimodal(
  systemPrompt: string,
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
): Promise<ReadableStream> {
  const content: any[] = parts.map(part => {
    if (part.inlineData) {
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: part.inlineData.mimeType,
          data: part.inlineData.data,
        },
      };
    }
    return { type: "text" as const, text: part.text || "" };
  });

  const stream = client.messages.stream({
    model: PRIMARY_MODEL,
    max_tokens: 4096,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content }],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
```

---

## ADIM 3: Import Güncellemesi — 75 API Route

Tüm API route'larda import yolunu değiştir:

```
// ESKİ:
import { askGemini, askGeminiJSON, askGeminiStream, askGeminiJSONMultimodal, askGeminiStreamMultimodal } from "@/lib/gemini";

// YENİ:
import { askGemini, askGeminiJSON, askGeminiStream, askGeminiJSONMultimodal, askGeminiStreamMultimodal } from "@/lib/ai-client";
```

Bu değişiklik 75 dosyada yapılacak. `find and replace` kullan:
- Ara: `from "@/lib/gemini"`
- Değiştir: `from "@/lib/ai-client"`

---

## ADIM 4: Doğrudan GoogleGenerativeAI Kullanan Route

`/api/scan-medication/route.ts` dosyası `@google/generative-ai`'ı doğrudan import ediyor (wrapper kullanmıyor). Bu dosyayı da `ai-client.ts` fonksiyonlarını kullanacak şekilde güncelle.

```typescript
// ESKİ:
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const result = await model.generateContent([...]);

// YENİ:
import { askGeminiJSONMultimodal } from "@/lib/ai-client";
const result = await askGeminiJSONMultimodal(systemPrompt, parts);
```

---

## ADIM 5: Embedding Model Migrasyonu

`lib/embeddings.ts` dosyası Gemini'nin `text-embedding-004` modelini kullanıyor. Seçenekler:

**Seçenek A (Önerilen): Voyage AI veya OpenAI Embeddings**
- Claude'un kendi embedding modeli yok
- `voyage-3-lite` veya `text-embedding-3-small` kullan
- Supabase pgvector boyutu değişebilir (768 → 1024 veya 1536)

**Seçenek B: Embedding'leri şimdilik Gemini'da bırak**
- Sadece embedding için GEMINI_API_KEY'i koru
- Ana AI çağrıları Claude, embedding'ler Gemini
- En az riskli seçenek

**BU ADIMI ŞIMDILIK ATLA — Seçenek B uygula (embedding Gemini'da kalsın)**

---

## ADIM 6: PDF Desteği — Claude'a Özel

Claude API, PDF dosyalarını doğrudan destekliyor (Gemini'dan farklı olarak base64 image'a çevirmeye gerek yok):

```typescript
// Claude PDF desteği — askGeminiJSONMultimodal içinde
if (part.inlineData?.mimeType === "application/pdf") {
  return {
    type: "document" as const,
    source: {
      type: "base64" as const,
      media_type: "application/pdf" as const,
      data: part.inlineData.data,
    },
  };
}
```

Bu değişikliği `askGeminiJSONMultimodal` ve `askGeminiStreamMultimodal` fonksiyonlarına ekle.

---

## ADIM 7: Güvenlik Guardrail Güncellemesi

`lib/safety-guardrail.ts` dosyasında `aiModel: "gemini-2.0-flash"` referansı var. Bunu güncelle:

```typescript
// ESKİ:
aiModel: "gemini-2.0-flash"

// YENİ:
aiModel: "claude-sonnet-4-5-20250514"
```

---

## ADIM 8: Health Check Route Güncellemesi

`/api/health-check/route.ts` dosyasında Gemini bağlantı testi var. Claude'a çevir:

```typescript
// ESKİ:
const testResult = await askGemini("Say ok", "test");

// YENİ:
const testResult = await askGemini("You are a health check bot. Reply with exactly: ok", "test");
```

---

## ADIM 9: CLAUDE.md Güncellemesi

CLAUDE.md dosyasındaki şu satırları güncelle:

```
// ESKİ:
- **AI Motor:** Google Gemini API (gemini-2.0-flash primary + gemini-2.5-flash fallback)

// YENİ:
- **AI Motor:** Anthropic Claude API (claude-sonnet-4-5-20250514) — Embedding: Gemini text-embedding-004
```

Teknik Stack bölümünde:
```
// ESKİ:
AI Engine:    Google Gemini API (gemini-2.0-flash primary + gemini-2.5-flash fallback)

// YENİ:
AI Engine:    Anthropic Claude API (claude-sonnet-4-5-20250514)
```

---

## ADIM 10: Build & Test

1. `npx next build` — zero errors olmalı
2. Dev server başlat ve şu test senaryolarını çalıştır:
   - Chat streaming çalışıyor mu?
   - Interaction checker JSON döndürüyor mu?
   - Blood test PDF analysis çalışıyor mu?
   - Health check endpoint "ok" döndürüyor mu?

---

## ÖZET — Değişecek Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `package.json` | `@anthropic-ai/sdk` eklendi |
| `.env.local` | `ANTHROPIC_API_KEY` eklendi |
| `lib/ai-client.ts` | YENİ dosya — Claude implementasyonu |
| `lib/gemini.ts` | Dokunma, yedek olarak kalsın |
| `lib/safety-guardrail.ts` | Model adı güncellemesi |
| `lib/embeddings.ts` | DEĞİŞMEYECEK (Gemini'da kalıyor) |
| `app/api/*/route.ts` | 75 dosyada import yolu değişikliği |
| `app/api/scan-medication/route.ts` | Doğrudan GoogleGenerativeAI → ai-client |
| `CLAUDE.md` | AI motor bilgisi güncelleme |

## ÖNEMLİ NOTLAR

1. **Fonksiyon isimleri değişmiyor** — `askGemini`, `askGeminiJSON` vs. aynı kalıyor, sadece iç implementasyon Claude'a geçiyor. Bu sayede 75 route'ta sadece import path değişiyor.

2. **JSON parse hatalarına dikkat** — Claude bazen JSON'ı markdown code block içinde döndürebilir. `askGeminiJSON` içinde `replace(/```json\n?/g, "")` temizliği şart.

3. **Vision/multimodal format farkı** — Gemini `inlineData` kullanıyor, Claude `source.type: "base64"` kullanıyor. Dönüşüm `ai-client.ts` içinde yapılıyor.

4. **PDF desteği** — Claude PDF'i native destekliyor (`type: "document"`), Gemini sadece image destekliyordu. Bu bir BONUS.

5. **Streaming format farkı** — Gemini `generateContentStream()`, Claude `messages.stream()` kullanıyor. Her ikisi de SSE döndürüyor ama event formatları farklı.

6. **Rate limiting** — Claude API'de farklı rate limit'ler var. Mevcut retry logic'i koru ama 429 handling'i Claude'un hata formatına uyarla.

7. **Embedding** — Claude'un kendi embedding modeli yok. Şimdilik Gemini'da bırakıyoruz. İleride Voyage AI veya OpenAI embeddings'e geçilebilir.

8. **ANTHROPIC_API_KEY** — console.anthropic.com'dan alınacak. Kullanıcıya sor, .env.local'e ekle.

---

Başla. Adım 1'den başla, tüm adımları sırayla yap, her adım sonunda commit+push.
