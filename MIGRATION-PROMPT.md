CLAUDE.md ve PROGRESS.md ve API-MIGRATION-PROMPT.md dosyalarını oku. Sonra aşağıdaki migration planını SIRALI ve EKSIKSIZ uygula.

## GÖREV: Gemini → Claude API Migration (Tüm AI Çağrıları)

Tüm AI çağrılarını Google Gemini API'den Anthropic Claude API'ye taşıyacaksın. ANTHROPIC_API_KEY .env.local'de zaten mevcut.

## KRİTİK KURALLAR
1. DURMA. Soru sorma, onay bekleme. Tüm adımları art arda yap.
2. Her adım sonunda commit+push yap.
3. Mevcut fonksiyon imzalarını (parametre adları, return tipleri) DEĞİŞTİRME.
4. Build PASS olmadan commit yapma.
5. Context limiti dolarsa dur, o ana kadar durmadan devam et.

## ADIM 1: SDK Kur
```bash
npm install @anthropic-ai/sdk
```

## ADIM 2: lib/ai-client.ts Oluştur

Önce mevcut lib/gemini.ts dosyasını oku ve anla. Sonra yeni lib/ai-client.ts dosyasını oluştur. Mevcut 5 fonksiyonun AYNI İSİMLERLE Claude implementasyonunu yaz:
- `askGemini()` → `client.messages.create()` — text only, tek seferlik
- `askGeminiJSON()` → `client.messages.create()` + JSON enforcement — 137 route bunu kullanıyor, EN KRİTİK
- `askGeminiStream()` → `client.messages.stream()` — chat streaming
- `askGeminiJSONMultimodal()` → vision + JSON — görsel/PDF analizi
- `askGeminiStreamMultimodal()` → vision + streaming — chat dosya yükleme

Ayarlar:
- Model: `claude-sonnet-4-5-20250514`
- Temperature: `0` (mevcut ayar korunacak — tıbbi güvenlik için)
- Max tokens: text=4096, JSON=8192

### JSON PARSING GÜVENLİĞİ (ÇOK ÖNEMLİ — BU KISMI ATLA DEME):

Claude bazen JSON'ı markdown code block, açıklama metni veya trailing text ile döndürebilir. Gemini'da `responseMimeType: "application/json"` vardı ve garanti JSON döndürüyordu. Claude'da bu özellik yok. Bu yüzden `askGeminiJSON` ve `askGeminiJSONMultimodal` fonksiyonlarında şu 5 katmanlı temizlik fonksiyonu MUTLAKA kullanılacak:

```typescript
function safeParseJSON(text: string): any {
  // 1. Markdown code block temizliği
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();

  // 2. Başındaki açıklama metnini atla — ilk { veya [ bul
  const jsonStart = cleaned.search(/[\[{]/);
  if (jsonStart > 0) cleaned = cleaned.substring(jsonStart);

  // 3. Sonundaki trailing text'i temizle — son } veya ] bul
  const lastBrace = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (lastBrace > 0) cleaned = cleaned.substring(0, lastBrace + 1);

  // 4. İlk parse denemesi
  try {
    return JSON.parse(cleaned);
  } catch {
    // 5. Agresif temizlik — tüm kontrol karakterlerini kaldır ve trailing comma fix
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, " ").replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  }
}
```

Bu `safeParseJSON` fonksiyonunu `askGeminiJSON` ve `askGeminiJSONMultimodal`'ın return kısmında kullan. Asla düz `JSON.parse()` yazma.

Ayrıca system prompt'a JSON zorlama metni ekle:
```typescript
const jsonSystemPrompt = systemPrompt + "\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown code blocks, no explanation text before or after, no ```json wrapper. Output ONLY the raw JSON object/array.";
```

### PDF NATIVE DESTEK:
Claude PDF'i native destekliyor (Gemini'dan farklı olarak base64 image'a çevirmeye gerek yok). `askGeminiJSONMultimodal` ve `askGeminiStreamMultimodal` içinde parts dönüştürürken:
```typescript
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
// Diğer image tipleri (jpeg, png, webp, gif):
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
```

### RETRY LOGİC:
Mevcut Gemini retry mantığını koru ama Claude'a özel hataları da ekle:
- 429 = rate limit (Gemini'daki gibi)
- 529 = Claude overloaded (Gemini'da yoktu, Claude'a özel)
- Exponential backoff: 5s → 10s → 15s, max 3 retry
```typescript
if (error?.status === 429 || error?.status === 529) { /* wait and retry */ }
```

### STREAMING FORMAT:
Gemini `generateContentStream()` kullanıyordu, Claude `messages.stream()` kullanıyor. Event formatı farklı:
```typescript
// Claude streaming
const stream = client.messages.stream({...});
for await (const event of stream) {
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    controller.enqueue(encoder.encode(event.delta.text));
  }
}
```
Mevcut chat route'u ReadableStream döndürüyor, aynı formatı koru.

## ADIM 3: 75+ Route'ta Import Değiştir

Tüm `app/api/*/route.ts` dosyalarında toplu replace yap:
- Ara: `from "@/lib/gemini"`
- Değiştir: `from "@/lib/ai-client"`

Grep ile bul, sonra sed/replace ile toplu değiştir. Tek tek yapma, hepsini bir seferde yap.

## ADIM 4: scan-medication Route'u Düzelt

`app/api/scan-medication/route.ts` diğerlerinden farklı olarak `@google/generative-ai` paketini doğrudan import ediyor (wrapper fonksiyonları kullanmıyor). Bu dosyayı oku, anla ve `ai-client` fonksiyonlarını kullanacak şekilde yeniden yaz. `@google/generative-ai` import'unu tamamen kaldır.

## ADIM 5: Embedding'e DOKUNMA

`lib/embeddings.ts` Gemini `text-embedding-004` modelini kullanıyor. Bu dosyaya KESİNLİKLE DOKUNMA, aynen kalsın. GEMINI_API_KEY .env.local'de durmaya devam edecek.

## ADIM 6: Guardrail Model Adı Güncelle

`lib/safety-guardrail.ts` dosyasında `aiModel: "gemini-2.0-flash"` var. Bunu güncelle:
```
aiModel: "claude-sonnet-4-5-20250514"
```

## ADIM 7: CLAUDE.md Güncelle

CLAUDE.md dosyasındaki şu kısımları güncelle:
- Hızlı Bağlam bölümünde: `AI Motor: Google Gemini API (gemini-2.0-flash primary + gemini-2.5-flash fallback)` → `AI Motor: Anthropic Claude API (claude-sonnet-4-5-20250514) + Embedding: Gemini text-embedding-004`
- Teknik Stack bölümünde: `AI Engine:` satırını güncelle
- AI Motor Yol Haritası bölümünü güncelle: artık Claude ana motor

## ADIM 8: Health Check Route

`/api/health-check/route.ts` Gemini bağlantı testi yapıyor. Claude'a uyarla — basit bir "test" mesajı gönder, "ok" yanıtı bekle.

## ADIM 9: Build & Test
```bash
npx next build
```
Zero errors olmalı. Hata varsa düzelt, tekrar build et. Build geçene kadar devam et.

## ADIM 10: PROGRESS.md Güncelle

Yeni session bilgilerini ekle: migration tamamlandı, hangi dosyalar değişti, build durumu.

Son commit:
```
git add -A && git commit -m "migration: Gemini → Claude API tam geçiş tamamlandı" && git push
```

## ASLA YAPMA LİSTESİ (ÇOK ÖNEMLİ):
- `@google/generative-ai` paketini package.json'dan SİLME — embedding hâlâ kullanıyor
- `.env.local`'deki `GEMINI_API_KEY`'i SİLME — embedding için lazım
- `lib/gemini.ts` dosyasını SİLME — yedek olarak kalsın
- `lib/embeddings.ts`'e DOKUNMA — olduğu gibi kalacak
- Fonksiyon isimlerini DEĞİŞTİRME (askGemini, askGeminiJSON vb. AYNI KALSIN)
- JSON parse'da düz `JSON.parse()` KULLANMA — her zaman `safeParseJSON()` kullan
- Build PASS olmadan commit YAPMA

Başla. Adım 1'den başla, durmadan tüm adımları yap.
