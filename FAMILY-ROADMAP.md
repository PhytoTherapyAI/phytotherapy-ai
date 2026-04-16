# DoctoPal — Aile Profili Yol Haritası

## Vizyon
Netflix tarzı profil seçim sistemi. Giriş → aile grubu varsa profil seç →
o kişinin dashboard'ı. Premium kullanıcılar tam erişim, free kullanıcılar
sadece görüntüleme.

## Mevcut Durum (Nisan 2026)

### ✅ Çalışan
- FamilyProvider (lib/family-context.tsx) — root layout'ta aktif
- family_groups + family_members DB tabloları + RLS + FK'ler
- family_notifications tablosu + RLS
- family_allergies + family_medications tabloları + RLS
- /select-profile sayfası (Netflix ekranı)
- /app/family/ sayfası
- FamilyManagementSettings component'i
- NotificationBell (header'da bildirim zili)
- family/route.ts API (grup oluşturma)
- family/invite/route.ts API (davet)
- family/accept/page.tsx (davet kabul)

### ❌ Silinecek
- components/family/FamilyManager.tsx — DEAD CODE, 0 import

### ⚠️ Test Edilmemiş / Bozuk Olabilir
- Netflix ekranı dark mode + unicode
- Email daveti (Resend API key eksik)
- allows_management toggle
- Aktif profil data routing

## Premium Kuralları

### Premium Kullanıcı (aile kurucusu veya üye)
- Aile grubu oluşturabilir
- Üye davet edebilir (email veya kod)
- Aile üyesinin ilaçlarını/alerjilerini görebilir
- Aile üyesi adına AI'a soru sorabilir
- Aile üyesi adına SBAR raporu oluşturabilir
- İlaç hatırlatma gönderebilir
- Sağlık ağacını görebilir

### Free Kullanıcı
- Aile grubuna katılabilir (davet kabul)
- Aile üyelerini SADECE görüntüleyebilir
- Düzenleme, AI sorma, SBAR oluşturma YASAK
- Premium upgrade CTA gösterilir

### Premium Olmayan Aile Üyesi
- Kendi profilini yönetebilir
- Aile grubunu görüntüleyebilir
- Başkasının verisini düzenleyemez
- Premium özellikler kilitli

## Implementasyon Fazları

### FAZ 1: Temizlik + Temel Akış
1. FamilyManager.tsx dead code sil
2. Netflix profil seçim ekranı fix (dark mode, unicode, responsive)
3. Login → aile grubu varsa → /select-profile → profil seç → dashboard
4. "Ben" kartı + aile üyesi kartları
5. Aile grubu yoksa "Aile Oluştur" butonu veya skip

### FAZ 2: Davet Sistemi
6. Email davet (Resend API key + mail template)
7. Kod ile davet (6 haneli kod → paylaş → gir → bağlan)
8. Davet kabul akışı test + fix
9. Davet reddedme
10. Üye çıkarma (admin)

### FAZ 3: Aile Üyesi Görüntüleme (Premium Kontrollü)
11. Premium gate sistemi (isPremium kontrolü her aile aksiyonunda)
12. Aile üyesi profil detay sayfası
13. Üyenin ilaç listesi görüntüleme
14. Üyenin alerji listesi görüntüleme
15. Üyenin kronik hastalık listesi görüntüleme

### FAZ 4: Aile Üyesi İçin Aksiyonlar (Premium Only)
16. Aile üyesi adına AI chat (profil context switch)
17. Aile üyesi adına SBAR raporu oluşturma
18. İlaç hatırlatma gönderme (family_notifications)
19. Su/ilaç/egzersiz hatırlatma
20. Acil durum bildirimi (SOS)

### FAZ 5: Sağlık Ağacı (Yeni Özellik)
21. Aile ilişki yapısı (anne/baba/kardeş/çocuk/eş)
22. Genetik risk haritası (aile geçmişinden)
23. Kronik hastalık pattern analizi
24. Görsel ağaç UI (interactive tree diagram)
25. AI destekli aile riski özeti

## Teknik Notlar

### DB Tabloları (Hazır)
- family_groups: id, owner_id, name, created_at
- family_members: id, group_id, user_id, role, nickname,
  allows_management, invite_token, invite_email, invite_status
- family_allergies: family_member_id → family_members.id
- family_medications: family_member_id → family_members.id
- family_notifications: from_user_id, to_user_id, type, message

### RLS Policy Pattern
- family_groups: owner_id = auth.uid()
- family_members: user_id = auth.uid()
- family_allergies/medications: family_members join ile
- family_notifications: to_user_id = auth.uid() (SELECT)

### Context API
- FamilyProvider: familyGroup, familyMembers, pendingInvites,
  activeProfileId, fetchMembers()
- activeProfileId değişince tüm data fetch'ler o profil için çalışmalı

### Premium Check Pattern
```typescript
const { isPremium } = usePremium();
if (!isPremium) {
  return <PremiumGate feature="family_management" />;
}
```

## Dosya Referansları
- lib/family-context.tsx — ana context
- app/select-profile/page.tsx — Netflix ekranı
- app/family/page.tsx — aile yönetim sayfası
- components/family/NotificationBell.tsx — bildirim zili
- components/profile/FamilyManagementSettings.tsx — ayarlar
- app/api/family/route.ts — grup CRUD
- app/api/family/invite/route.ts — davet
- app/family/accept/page.tsx — davet kabul
