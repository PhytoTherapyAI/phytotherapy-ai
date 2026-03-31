# Yeni Session Başlangıç Prompt'u

Terminalde `claude` yazdıktan sonra aşağıdaki TAMAMINI tek seferde yapıştır:

---

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

Mevcut lib/gemini.ts'deki 5 fonksiyonun AYNI İSİMLERLE Claude implementasyonunu yaz:
- `askGemini()` → `client.messages.create()`
- `askGeminiJSON()` → `client.messages.create()` + JSON enforcement
- `askGeminiStream()` → `client.messages.stream()`
- `askGeminiJSONMultimodal()` → vision + JSON
- `askGeminiStreamMultimodal()` → vision + streaming

Ayarlar:
- Model: `claude-sonnet-4-5-20250514`
- Temperature: `0`
- Max tokens: text=4096, JSON=8192

### JSON PARSING GÜVENLİĞİ (ÇOK ÖNEMLİ):
Claude bazen JSON'ı markdown code block, açıklama metni veya trailing text ile döndürebilir. `askGeminiJSON` ve `askGeminiJSONMultimodal` fonksiyonlarında şu 5 katmanlı temizlik MUTLAKA olsun:

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
    // 5. Agresif temizlik — tüm kontrol karakterlerini kaldır
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, " ").replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  }
}
```

Bu `safeParseJSON` fonksiyonunu `askGeminiJSON` ve `askGeminiJSONMultimodal`'ın return kısmında kullan. Asla düz `JSON.parse()` yazma.

### PDF NATIVE DESTEK:
Claude PDF'i native destekliyor. `askGeminiJSONMultimodal` ve `askGeminiStreamMultimodal` içinde:
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
```

### RETRY LOGİC:
Mevcut Gemini retry mantığını koru. 429 hatalarında exponential backoff (5s, 10s, 15s). Overloaded (529) hatalarını da yakala:
```typescript
if (error?.status === 429 || error?.status === 529) { /* retry */ }
```

## ADIM 3: 75+ Route'ta Import Değiştir
Find-replace:
- Ara: `from "@/lib/gemini"`
- Değiştir: `from "@/lib/ai-client"`

Tüm `app/api/*/route.ts` dosyalarında yap. Tek tek değil, toplu sed/replace ile.

## ADIM 4: scan-medication Route'u Düzelt
`app/api/scan-medication/route.ts` doğrudan `@google/generative-ai` import ediyor. Bu dosyayı `ai-client` fonksiyonlarını kullanacak şekilde yeniden yaz. `@google/generative-ai` import'unu tamamen kaldır.

## ADIM 5: Embedding'e DOKUNMA
`lib/embeddings.ts` Gemini `text-embedding-004` kullanıyor. Bu dosyaya DOKUNMA, aynen kalsın. GEMINI_API_KEY .env.local'de duruyor.

## ADIM 6: Guardrail Model Adı Güncelle
`lib/safety-guardrail.ts` → `aiModel: "gemini-2.0-flash"` → `aiModel: "claude-sonnet-4-5-20250514"`

## ADIM 7: CLAUDE.md Güncelle
- AI Motor: `Google Gemini API` → `Anthropic Claude API (claude-sonnet-4-5-20250514)`
- Teknik Stack'teki AI Engine satırını güncelle
- Embedding: `Gemini text-embedding-004 (ayrı, sadece embedding için)`

## ADIM 8: Health Check Route
`/api/health-check/route.ts` Gemini bağlantı testi yapıyor. Claude'a uyarla.

## ADIM 9: Build & Test
```bash
npx next build
```
Zero errors olmalı. Hata varsa düzelt, tekrar build et.

## ADIM 10: PROGRESS.md Güncelle
Yeni session bilgilerini ekle: hangi dosyalar değişti, migration tamamlandı.

## SON COMMIT
```
git add -A && git commit -m "migration: Gemini → Claude API tam geçiş tamamlandı" && git push
```

## ÖZEL DİKKAT NOKTALARI (BUNLARI UNUTMA):
- `@google/generative-ai` package.json'dan SİLME — embedding hâlâ kullanıyor
- `.env.local`'deki `GEMINI_API_KEY`'i SİLME — embedding için lazım
- `lib/gemini.ts` dosyasını SİLME — yedek olarak kalsın, sadece import'lar ai-client'a yönlendirilsin
- `lib/embeddings.ts`'e DOKUNMA
- Fonksiyon isimleri (askGemini, askGeminiJSON vb.) AYNI KALSIN — sadece iç implementasyon değişsin
- JSON parse'da HER ZAMAN safeParseJSON kullan, düz JSON.parse ASLA
- Claude'un 529 (overloaded) hatasını da retry logic'e ekle

Başla. Adım 1'den başla, durmadan tüm adımları yap.
