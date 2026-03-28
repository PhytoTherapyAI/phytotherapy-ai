# Phytotherapy.ai — Yeni Özellik Kataloğu

> Önceki 85 tool (TOOL 1-20 + 65 genişleme) zaten NEW-TOOLS-PROMPTS.md ve TOOL-IDEAS-FULL.md'de mevcut ve implement ediliyor.
> Bu dosya: O 85'e EK olarak önerilen tüm yeni fikirler.
> 3 segment: Kullanıcı (B2C) | Doktor (B2B Klinisyen) | Kurumsal (B2B Enterprise)
> Son güncelleme: 29 Mart 2026

---

# BÖLÜM 1: KULLANICI (B2C) — 55 Yeni Fikir

## UX & Günlük Deneyim
| # | Özellik | Açıklama |
|---|---------|----------|
| N1 | Akıllı Bildirim Merkezi | Tüm bildirimler tek inbox: ilaç saati, washout, randevu, aşı, kontraseptif yıllık, tahlil zamanı. Sabah özeti push. Retention'ın 1 numaralı aracı. |
| N2 | Sağlık Zaman Kapsülü | 6 ay sonra kendine mektup yaz → 6 ay sonra gerçek verilerle karşılaştırma. Viral paylaşım kartı: "6 ayda kolesterolümü %15 düşürdüm." |
| N3 | Kişiselleştirilmiş Haftalık Bülten | Her Pazartesi AI özeti: washout bitiyor, randevu var, hava kötü, ilaç uyumun %92. E-posta + push + in-app. |
| N4 | İlaç Hatırlatma Akıllı Modu | "Levotiroksinini aç karnına al, son yemekten 3 saat geçti — şimdi al." İlaç özelliğine göre zamanlama: aç/tok/kaç saat arayla. |
| N5 | Hızlı Eylem Butonları | Dashboard'da: "İlacımı aldım" "Su içtim" "Başım ağrıyor" "Bugün nasılım" tek tuşla. WhatsApp hızlı cevap gibi. |
| N6 | Karanlık Bilgi Kartları | Profil bazlı günlük 1 bilgi: "Metformin kullanıyorsun — B12 kontrol ettir", "PPI + kalsiyum 4 saat arayla al." Kullanıcı "bunu bilmiyordum" der. |
| N7 | Supplement Marketplace | Takviye önerisi + nereden alınır: "KSM-66 Ashwagandha: [marka1], [marka2]." Affiliate link. Eczaneden — aktardan değil. |
| N8 | Aile Haftalık Özet Ekranı | Tüm aile üyeleri tek ekranda: "Annen 3 gündür ilaç almamış, Baban tansiyon yükseliyor, Çocuk aşı zamanı." |
| N9 | Acil Durum Modu | Tek buton ACİL: 112, ilaç listesi, alerjiler, kan grubu, acil kişi. Panik atak modu → nefes egzersizine otomatik. |
| N10 | Sağlık Puanı Sosyal Paylaşım | Instagram story formatı: "Sağlık skorum 87/100", "30 gün ilaç uyumum %95", "Biyolojik yaşım 3 yıl genç." |
| N11 | Proaktif AI Bildirim | Kullanıcı sormadan: "3 gündür ilaç almamışsın", "Uyku kaliten düştü", "Magnezyum washout yaklaşıyor." |
| N12 | Sağlık Günlüğü (Diary) | Serbest metin günlük, AI otomatik sınıflandırma: semptom/mood/ilaç/egzersiz çıkarır, trend bulur. |
| N13 | Favori Takviye Listesi | Beğendiğin takviyeleri kaydet, birbirleriyle karşılaştır, hatırlatıcı ayarla, alışveriş listesi oluştur. |
| N14 | Arkadaşlarla Hedef Paylaşımı | Sağlık hedefi paylaş, birlikte takip, motivasyon: "İkimiz de 30 gün şekersiz." |
| N15 | Offline Mod | İnternet yokken çalışan: acil kart, ilk yardım, ilaç listesi, son tahlil sonuçları. PWA service worker. |
| N16 | Multi-Dil Genişleme | Arapça (MENA pazarı), Almanca (AB), Farsça (İran/diaspora), İspanyolca (Latin Amerika). |
| N17 | Sesli Asistan Entegrasyonu | Siri/Google Assistant/Alexa: "Hey Siri, ilacımı aldım" → Phytotherapy.ai'ye kayıt. |
| N18 | Widget'lar (iOS/Android) | Ana ekran widget: günlük skor, sonraki ilaç saati, su sayacı, bugünün bilgi kartı. |
| N19 | QR Kod Profil Paylaşımı | Acil durumda veya doktora giderken: QR tara → ilaçlar, alerjiler, kan grubu, son tahlil. |
| N20 | Sağlık Takvimi Entegrasyonu | Google Calendar/Apple Calendar'a otomatik: ilaç saatleri, doktor randevuları, tahlil zamanları. |

## Gelişmiş Takip & Analiz
| # | Özellik | Açıklama |
|---|---------|----------|
| N21 | Ağrı Kesici Kullanım Analizi | NSAID/parasetamol günlük kaydı → aylık kullanım grafiği. >15 gün/ay → overuse headache uyarısı. Doktorla paylaşım raporu. |
| N22 | İlaç Yan Etki Takvimi | Yeni ilaç başladığında: "İlk 2 hafta mide bulantısı olabilir, normal. 4 haftada geçmezse doktora git." İlaç bazlı zaman çizelgesi. |
| N23 | Biyomarker Trend Dashboard | Tüm tahlil sonuçları tek ekranda trend grafikle: HbA1c 3 yılda nasıl değişti, D vitamini mevsimsel pattern, kolesterol ilaç sonrası düşüş. |
| N24 | İlaç Etkileşim Zaman Matrisi | Hangi ilaç/takviye kaç saat arayla alınmalı → görsel matris. "Levotiroksin → 4 saat → Kalsiyum → 2 saat → Demir." |
| N25 | Otomatik İlaç Saat Planlayıcı | Tüm ilaçları gir → AI optimal saat planı oluştur: etkileşimleri, aç/tok kurallarını, uyku saatini hesaba kat. |
| N26 | Polifarmasi Risk Skoru | 5+ ilaç kullanan herkes için: toplam etkileşim sayısı, düşme riski, antikolinerjik yük, böbrek yükü → bileşik risk. |
| N27 | İlaç Değişiklik Günlüğü | Her ilaç değişikliğini otomatik kaydet: ne zaman başladı, ne zaman bitti, neden değişti, doz ayarı, yan etki kaydı. |
| N28 | Sağlık Risk Radar Grafiği | 6 eksenli radar: kardiyovasküler, metabolik, mental, kas-iskelet, sindirim, bağışıklık. Her eksen 0-100. Tek bakışta genel durum. |
| N29 | Mevsimsel Besin Haritası | Bu mevsimde hangi meyveler/sebzeler taze, hangilerinin besin değeri yüksek, profildeki eksikliklerle eşleştir. |
| N30 | Besin Hazırlama Rehberi | "Brokoli buharda pişir, haşlama C vitaminini %50 azaltır." "Zerdeçal karabiberle al, emilim 2000x artar." Pişirme yöntemi → besin değeri. |

## Özel Durumlar & Niş
| # | Özellik | Açıklama |
|---|---------|----------|
| N31 | Hac/Umre Sağlık Rehberi | Türkiye'ye özel: sıcak iklim, kalabalık, enfeksiyon riski, kronik hasta ilaç yönetimi, menenjit aşısı, su/güneş. |
| N32 | Oruç Sağlık Monitörü | Ramazan + periyodik oruç: kan şekeri takibi, dehidratasyon riski, ilaç zamanlama (sahur/iftar), oruç kırma kriterleri. |
| N33 | Sınav Dönemi Sağlık Paketi | Öğrenciler için: uyku düzeni, kafein optimizasyonu, stres yönetimi, beyin destekleyici besinler, göz yorgunluğu. |
| N34 | Gece Mesaisi Sağlık Paketi | Güvenlikçi, sağlıkçı, şoför: sirkadyen düzensizlik, beslenme planı, kafein stratejisi, uyku hijyeni gündüz modu. |
| N35 | Yoğun Bakım Sonrası Rehber | ICU'dan çıkan hasta: toparlanma planı, fiziksel rehabilitasyon, mental sağlık (post-ICU sendromu), beslenme. |
| N36 | Organ Nakli Sonrası Takip | İmmünosupresif ilaç uyumu, enfeksiyon korunma, besin kısıtlamaları, kontrol takvimi, yaşam kalitesi skoru. |
| N37 | Kanser Tedavisi Destek | Kemoterapi/radyoterapi yan etki yönetimi: bulantı, ağız yaraları, yorgunluk, beslenme, takviye güvenliği kontrolü. |
| N38 | Diyaliz Hasta Takibi | Diyaliz günleri, sıvı kısıtlama, fosfor/potasyum takibi, besin rehberi, ilaç dozlama (diyaliz günü farklı). |
| N39 | Otizm Spektrum Aile Desteği | Aile için: rutin takibi, duyusal tetikleyici günlüğü, terapi randevu takvimi, ilaç uyumu, besin hassasiyetleri. |
| N40 | Migren Özel Dashboard | Migren tetikleyici günlüğü (yiyecek, hava, stres, uyku, hormonal), aura takibi, ilaç etkinlik, atak sıklığı trend. |

## Eğlence & Motivasyon
| # | Özellik | Açıklama |
|---|---------|----------|
| N41 | Günün Sağlık Bilmecesi | Her gün 1 sağlık sorusu: "Hangi vitamin güneş ışığıyla sentezlenir?" Doğru cevap = puan. Eğitim + gamification. |
| N42 | Sağlık Podcast Önerileri | Profil bazlı podcast önerisi: diyabet hastasına diyabet podcastleri, sporcuya performans podcastleri. |
| N43 | Sağlıklı Tarif Önerileri | Profildeki kısıtlamalara uygun tarifler: glutensiz, laktozsuz, böbrek dostu, anti-inflamatuar, düşük FODMAP. |
| N44 | Sanal Sağlık Asistanı Avatarı | Chat asistanına kişiselleştirilebilir avatar: ton seçimi (resmi/samimi/mizahi), isim verme, kişilik özellikleri. |
| N45 | Başarı Sertifikaları | "30 Gün Kesintisiz İlaç Uyumu Sertifikası" — PDF, paylaşılabilir. Gamification + somut ödül hissi. |

## Güvenlik & Gizlilik
| # | Özellik | Açıklama |
|---|---------|----------|
| N46 | Biyometrik Kilit | Uygulama açılırken parmak izi / Face ID. Sağlık verileri hassas — başkası telefonunu açsa bile göremez. |
| N47 | Veri İhracat (KVKK) | "Tüm verilerimi indir" → JSON/PDF formatında. KVKK madde 11 zorunluluğu. |
| N48 | Veri Silme (KVKK) | "Hesabımı ve tüm verilerimi kalıcı olarak sil." KVKK madde 11. Supabase'den tam temizlik. |
| N49 | Gizlilik Kontrol Paneli | Hangi verilerin paylaşıldığını gör/kontrol et: anonim araştırma opt-in/out, doktor paylaşım izinleri. |
| N50 | İki Faktörlü Kimlik Doğrulama | SMS veya authenticator app ile 2FA. Sağlık verisi hassas, ekstra güvenlik katmanı. |

## Platform & Altyapı
| # | Özellik | Açıklama |
|---|---------|----------|
| N51 | PWA Tam Offline | Service worker ile: son 7 günün verileri cache, internet olmadan da kayıt yapabilsin, bağlanınca sync. |
| N52 | Bildirim Tercihleri Paneli | Hangi bildirimleri almak istiyorsun: ilaç evet, washout evet, haftalık bülten hayır, challenge hayır. Granüler kontrol. |
| N53 | Tema Özelleştirme | Koyu/açık dışında: yeşil tema, mavi tema, yüksek kontrast (görme engelli), büyük font modu. |
| N54 | Çoklu Cihaz Senkronizasyon | Telefon + tablet + bilgisayar — hepsinde aynı veri, gerçek zamanlı sync. Supabase realtime. |
| N55 | Hata Raporlama Butonu | Her sayfada: "Bir sorun mu var? Bildir" → ekran görüntüsü + log otomatik eklensin. Bug takip hızlanır. |

---

# BÖLÜM 2: DOKTOR (B2B Klinisyen) — 25 Yeni Fikir

| # | Özellik | Açıklama |
|---|---------|----------|
| D1 | Hasta İlaç Uyum Skoru Dashboard | Her hasta için uyum %, hangi ilaçları atlıyor, hangi günlerde, görsel timeline. Vizitte somut konuşma. |
| D2 | AI Klinik Karar Destek | Yeni ilaç yazarken: "Bu hastanın profilinde X var, Y ile Z etkileşimi mevcut — alternatif W düşünün." |
| D3 | Güvenli Hasta Mesajlaşma | KVKK uyumlu, şifreli doktor-hasta mesajlaşma. WhatsApp alternatifi. Tıbbi veri paylaşımına uygun. |
| D4 | Reçete Asistanı | Doz hesaplama (çocuk/yaşlı/böbrek), etkileşim, kontraendikasyon, muadil (SGK kapsamında ucuz). |
| D5 | Popülasyon Sağlık Analitiği | Doktorun 150 hastası bütünleşik: HbA1c ort., ilaç uyum ort., en sık şikayet, demografik dağılım. |
| D6 | Doktor Arası Konsültasyon | Platform üzerinden hasta yönlendirme: "Endokrinolojiye yönlendiriyorum, profil hazır." Network etkisi. |
| D7 | Hasta Eğitim İçerik Oluşturucu | Doktor şablondan özelleştir → hastalara gönder: "Diyabet Beslenme Rehberi." Okudu mu takibi. |
| D8 | Klinik Araştırma Eşleştirme | Hasta profili ↔ ClinicalTrials.gov otomatik eşleştirme. Akademik doktorlar için. |
| D9 | Telemedicine | Video görüşme + tıbbi veri ekranda. 5dk takip viziti. TR'de yasal zemin var (2022 düzenleme). |
| D10 | Performans Göstergeleri | Hasta memnuniyeti, vizit süresi, tedavi başarı %, JCI/SKS metrikleri. Kalite takibi. |
| D11 | Çoklu Klinik Yönetimi | Birden fazla klinik/hastane, personel yetkilendirme, departman bazlı erişim. |
| D12 | EHR/E-Nabız FHIR | Hastane bilgi sistemiyle veri alışverişi. FHIR R4 standardı. |
| D13 | Randevu Yönetimi | Hasta online randevu, doktor takvimi, otomatik hatırlatıcı, bekleme listesi. |
| D14 | CME/STE Eğitim Takibi | Sürekli tıp eğitimi kredi, konferans takvimi, sertifika yönetimi. |
| D15 | AI Epikriz Oluşturucu | Vizit notlarından otomatik epikriz/sevk raporu oluşturma. 5 dakika tasarruf/vizit. |
| D16 | Farmakovijilans Raporlama | Yan etki TÜFAM/EMA'ya raporlama asistanı. Formları otomatik doldur. |
| D17 | Doktor Networking | Anonim vaka paylaşımı, uzman görüşü, meslektaş ağı. LinkedIn ama doktorlar için. |
| D18 | Tedavi Protokolü Kütüphanesi | Hastalık bazlı güncel kılavuzlar: TTB, WHO, ESC, ADA. Tek yerden erişim. |
| D19 | Hasta Risk Stratifikasyonu | AI her hastaya risk skoru → önceliklendirme: "Bu 5 hastanız acil ilgi gerektiriyor." |
| D20 | Mobil Doktor Dashboard | Cep telefonundan: hasta özeti, acil bildirim, hızlı cevap, tahlil onayı. |
| D21 | Multi-Disipliner Konsey | Karmaşık vakalar için sanal konsey: birden fazla uzman, ortak dosya, karar kayıt. |
| D22 | Tedavi Uyum Raporu | Her vizit öncesi AI: son vizit→şimdi karşılaştırma, ne değişti, ne yapılmadı. |
| D23 | Doktor İçin Phytotherapy Eğitimi | Fitoterapi etkileşim eğitim modülü: "Hastanız sarı kantaron kullanıyorsa…" CME kredili. |
| D24 | Hasta Segmentasyonu | Hastaları gruplara ayır: diyabet grubu, polifarmasi grubu, ilaç uyumu düşük grup → toplu müdahale. |
| D25 | Doktor Marka Sayfası | Her doktorun platform üzerinde profili: uzmanlık, hasta yorumları, randevu linki. SEO + güvenilirlik. |

---

# BÖLÜM 3: KURUMSAL (B2B Enterprise) — 40 Yeni Fikir

## Sigorta Şirketleri
| # | Özellik | Açıklama |
|---|---------|----------|
| E1 | Wellbeing ROI Hesaplayıcı | İlaç uyum↑%18 → hastane↓%12 → yıllık tasarruf ₺450K. Demo hesaplayıcı → gerçek veriyle doğrulama. |
| E2 | Claim Azaltma Analitiği | Acil servis↓%8, gereksiz poliklinik↓%15, erken müdahale↑%25. Sigorta dili: "Ne kadar tasarruf ederiz?" |
| E3 | Popülasyon Risk Haritası | Sigortalı portföy sağlık risk dağılımı, kronik prevalans, yaş-cinsiyet-bölge bazlı. |
| E4 | Wellbeing Program Entegrasyonu | Çalışan sağlığı programlarına API: adım yarışması, su challenge, ilaç uyum takibi. |
| E5 | Poliçe Sağlık Skoru | Bireysel poliçe fiyatlandırmasında sağlık skoru: aktif kullanıcı = düşük prim. İndirim motivasyonu. |
| E6 | Prediktif Maliyet Modeli | "Bu portföyde 6 ay sonra tahmini claim maliyeti X — bu müdahalelerle Y'ye düşürülebilir." |

## İlaç & Biyoteknoloji
| # | Özellik | Açıklama |
|---|---------|----------|
| E7 | Gerçek Dünya Kanıt (RWE) Paneli | Anonim ilaç kullanım: yan etki oranları, uyum istatistikleri, kombinasyon pattern'ları. |
| E8 | Yan Etki Erken Sinyal | Yeni ilaçlarda beklenmeyen yan etki pattern → farmakovijilans desteği. Hayat kurtarır + düzenleyiciye rapor. |
| E9 | İlaç-Bitki Etkileşim DB API | Veritabanına programatik erişim satışı: eczane yazılımları, diğer sağlık uygulamaları entegre. |
| E10 | Klinik Araştırma Hasta Bulma | Araştırma kriterlerine uygun hasta havuzu (opt-in, anonim). Hasta bulma maliyetini %80 düşürür. |
| E11 | Post-Market Surveillance | Piyasaya sürülen ilacın gerçek dünya performansı: etkinlik mi, prospektüs mü söylüyor? |
| E12 | Competitor Intelligence | Rakip ürünlerin kullanıcı tercih, memnuniyet, switch oranı karşılaştırması. |
| E13 | İlaç Lansman Desteği | Yeni ilaç piyasaya çıkınca: farkındalık kampanyası, doktor bilgilendirme, hasta eğitim içeriği. |
| E14 | Tedavi Yolculuğu Haritalaması | Hasta X hastalığında hangi aşamalardan geçiyor, hangi ilaçları deniyor, nerede terk ediyor. |

## Eczane & Perakende
| # | Özellik | Açıklama |
|---|---------|----------|
| E15 | Eczane Tezgah Entegrasyonu | Müşteri ilaç alırken tablet ekranda: profil bazlı etkileşim kontrolü. Güvenlik + satış↑. |
| E16 | Takviye Marka Analitiği | Supplement markalarına: kullanım süresi ort., uyum %, birlikte kullanılan ilaçlar, raporlanan etkiler. |
| E17 | Eczane Stok Optimizasyonu | Bölgesel talep tahmini: "Bu bölgede D vitamini talebi kışın %40 artacak." Stok planla. |
| E18 | Eczacı Karar Destek | Tezgahta hızlı: "Bu ilaçla bu takviye alınır mı?" — 2 saniyede cevap. |
| E19 | Eczane Sadakat Programı | Müşteri Phytotherapy.ai kullanıyorsa: puan kazan, indirim al. Eczane müşteri bağlılığı + bizim kullanıcı büyümesi. |

## Klinik & Hastane
| # | Özellik | Açıklama |
|---|---------|----------|
| E20 | Kurumsal Doktor Paneli | Çoklu doktor, departman bazlı, yönetici dashboard, performans karşılaştırma. |
| E21 | Hasta Deneyimi Anketi | Vizit sonrası otomatik NPS anketi, trend takibi, iyileştirme önerileri. |
| E22 | Klinik Kalite Göstergeleri | JCI/SKS metrikleri dashboard, akreditasyon hazırlık, eksiklik tespiti. |
| E23 | Entegre Faturalandırma | "Sağlık yönetim yazılımı" olarak klinik faturası kesebilme. |

## Kurumsal Wellness & HR
| # | Özellik | Açıklama |
|---|---------|----------|
| E24 | White-Label Platform | "Powered by Phytotherapy.ai" ama şirket markalı. 500+ çalışan wellness bütçesi → turnkey çözüm. |
| E25 | Çalışan Sağlık Risk Skoru | Anonim: "Çalışanlarınızın %35'i yüksek KV risk." HR'ye aksiyon yönlendirmesi. |
| E26 | Kurumsal Challenge'lar | Şirket içi: departmanlar arası adım yarışı, su challenge, sağlıklı beslenme haftası. |
| E27 | İSG Entegrasyonu | İş sağlığı güvenliği uzmanına veri, meslek hastalığı risk tespiti, periyodik muayene takibi. |
| E28 | Absenteeism Analizi | Hastalık izni pattern: "Pazartesi izinleri %40 fazla — stres mi?" Önleyici müdahale. |
| E29 | Çalışan Onboarding Wellness | Yeni çalışana: sağlık profili oluştur, ilaçlarını gir, acil kart oluştur. İlk günden aktif. |

## Araştırma & Akademi
| # | Özellik | Açıklama |
|---|---------|----------|
| E30 | Akademik Ortaklık | Üniversitelere anonim veri, biz yayında "Data: Phytotherapy.ai" — en güçlü pazarlama. |
| E31 | Kohort Oluşturma | Araştırmacı istediği kritere göre anonim kohort: "45+ yaş, diyabetli, metformin+statin kullanan." |
| E32 | Akademik API | Üniversite araştırmacılarına özel API, indirimli veya ücretsiz. Yayın desteği. |

## Genel Kurumsal & İş Geliştirme
| # | Özellik | Açıklama |
|---|---------|----------|
| E33 | API Marketplace | Etkileşim motoru, takviye DB, PubMed RAG → API olarak sat. Pasif gelir. Çağrı başı $0.01. |
| E34 | Yatırımcı Data Room | Kullanıcı büyüme, retention, cohort, LTV/CAC → otomatik yatırımcı dashboard. |
| E35 | Sağlık Bakanlığı Raporlama | Popülasyon sağlık verileri, aşı kapsama, ilaç uyum → devlet formatında. Hibe/destek potansiyeli. |
| E36 | Franchise/Lisans | Diğer ülkelere platform lisansı: "Phytotherapy.ai MENA", "Phytotherapy.ai DACH". |
| E37 | B2B Sales Pipeline | CRM entegrasyonu, demo talep formu, otomatik takip, pipeline yönetimi. |
| E38 | Pazar Trendleri Raporları | Aylık/çeyreklik biyoteknoloji pazar raporu. Ücretli PDF → pasif gelir. |
| E39 | Hammadde Fiyat İzleme | Curcumin, ashwagandha, berberine fiyat trend. Alım kararı desteği. |
| E40 | Patent İzleme | Fitoterapi patentleri takip, yeni patent bildirimi. Ar-Ge departmanları için. |
| E41 | Regülasyon Takip | AB, FDA, TITCK düzenlemeleri takip + uyarı. "Novel Food listesi güncellendi — ashwagandha risk altında." |
| E42 | Yatırım Eşleştirme | Biyotek startup ↔ melek yatırımcı eşleştirme platformu. Komisyon bazlı. |
| E43 | Sağlık Turizmi Entegrasyonu | TR hastanelerine yabancı hasta yönlendirme: fitoterapi + modern tıp paketi. Türkiye sağlık turizmi büyüyor. |

---

# TOPLAM YENİ FİKİRLER

| Segment | Sayı |
|---------|------|
| Kullanıcı (B2C) | **55** |
| Doktor (B2B Klinisyen) | **25** |
| Kurumsal (B2B Enterprise) | **43** |
| **TOPLAM YENİ** | **123** |

**Önceki 85 + Bu 123 = 208 toplam özellik/tool**

---

# EN ÖNCELİKLİ 15 (Tüm Segmentler)

| # | Özellik | Segment | Neden Önce |
|---|---------|---------|------------|
| N6 | Karanlık Bilgi Kartları | Kullanıcı | 0 maliyet, mevcut veriden üretilir, güven patlaması |
| N1 | Akıllı Bildirim Merkezi | Kullanıcı | Retention'ın anahtarı, her şeyi birleştirir |
| N4 | İlaç Hatırlatma Akıllı | Kullanıcı | Günlük kullanım, hayat kurtarır |
| N25 | Otomatik İlaç Saat Planlayıcı | Kullanıcı | Polifarmasi hastası için devrim, deterministik |
| N5 | Hızlı Eylem Butonları | Kullanıcı | Veri girişini kolaylaştır, retention |
| D1 | Hasta İlaç Uyum Skoru | Doktor | Doktor paneline gerçek değer, B2B satış aracı |
| D2 | AI Klinik Karar Destek | Doktor | Hasta güvenliği, doktor zaman tasarrufu |
| E1 | Sigorta ROI Hesaplayıcı | Kurumsal | İlk B2B satışı tetikler, somut rakam |
| E33 | API Marketplace | Kurumsal | Pasif gelir, ekosistem, scalable |
| N47 | Veri İhracat (KVKK) | Kullanıcı | Yasal zorunluluk, güven |
| N48 | Veri Silme (KVKK) | Kullanıcı | Yasal zorunluluk, güven |
| D15 | AI Epikriz Oluşturucu | Doktor | 5dk/vizit tasarruf × 30 hasta = 2.5 saat/gün |
| E24 | White-Label Platform | Kurumsal | En büyük B2B gelir potansiyeli |
| N9 | Acil Durum Modu | Kullanıcı | Hayat kurtarır, PR/hikaye değeri çok yüksek |
| E7 | RWE Paneli | Kurumsal | İlaç şirketleri milyon dolar öder |
