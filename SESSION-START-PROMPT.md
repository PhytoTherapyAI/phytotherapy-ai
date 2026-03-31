# Yeni Session Başlangıç Prompt'u

Terminalde `claude` yazdıktan sonra aşağıdaki TAMAMINI tek seferde yapıştır:

---

CLAUDE.md ve PROGRESS.md dosyalarını oku. Ardından API-MIGRATION-PROMPT.md dosyasını oku ve oradaki 10 adımı SIRALI olarak uygula.

Özet: Tüm AI çağrılarını Google Gemini API'den Anthropic Claude API'ye taşıyacaksın.

KRİTİK KURALLAR:
1. DURMA. Soru sorma, onay bekleme. 10 adımın hepsini art arda yap.
2. lib/ai-client.ts dosyasını oluştur — mevcut lib/gemini.ts'deki 5 fonksiyonun AYNI isimlerle Claude implementasyonunu yaz.
3. 75+ API route dosyasında `from "@/lib/gemini"` → `from "@/lib/ai-client"` değiştir.
4. app/api/scan-medication/route.ts dosyasındaki doğrudan GoogleGenerativeAI kullanımını ai-client fonksiyonlarına çevir.
5. lib/embeddings.ts'e DOKUNMA — embedding Gemini'da kalacak.
6. lib/safety-guardrail.ts'deki model adını güncelle.
7. CLAUDE.md'deki AI motor bilgisini güncelle.
8. Her adım sonunda commit+push yap.
9. Son adımda `npx next build` çalıştır, zero errors olmalı.
10. Context limiti dolarsa dur, o ana kadar durmadan devam et.

ANTHROPIC_API_KEY .env.local'de mevcut. Başla.
