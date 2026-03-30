// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Clinical Assessment Tests Database
// Standardized, internationally validated scales
// ============================================

export interface ClinicalTestOption {
  label: { en: string; tr: string }
  value: number
}

export interface ClinicalTestQuestion {
  id: string
  text: { en: string; tr: string }
  options: ClinicalTestOption[]
}

export interface ClinicalTestThreshold {
  min: number
  max: number
  severity: string
  label: { en: string; tr: string }
  color: string
  message: { en: string; tr: string }
}

export interface ClinicalTest {
  id: string
  title: { en: string; tr: string }
  description: { en: string; tr: string }
  category: "depression" | "anxiety" | "adhd" | "stress" | "sleep" | "substance" | "wellbeing" | "somatic" | "trauma"
  icon: string
  color: string
  estimatedMinutes: number
  questionCount: number
  maxScore: number
  source: string
  questions: ClinicalTestQuestion[]
  thresholds: ClinicalTestThreshold[]
  disclaimer: { en: string; tr: string }
  crisisQuestionIds?: string[]
}

// ── Standard Likert-4 Options (PHQ-9, GAD-7, etc.) ──
const LIKERT_4: ClinicalTestOption[] = [
  { label: { en: "Not at all", tr: "Hiç" }, value: 0 },
  { label: { en: "Several days", tr: "Birkaç gün" }, value: 1 },
  { label: { en: "More than half the days", tr: "Günlerin yarısından fazlası" }, value: 2 },
  { label: { en: "Nearly every day", tr: "Neredeyse her gün" }, value: 3 },
]

// ── Standard Likert-5 Options (PSS, K10, etc.) ──
const LIKERT_5: ClinicalTestOption[] = [
  { label: { en: "Never", tr: "Hiçbir zaman" }, value: 0 },
  { label: { en: "Almost never", tr: "Neredeyse hiç" }, value: 1 },
  { label: { en: "Sometimes", tr: "Bazen" }, value: 2 },
  { label: { en: "Fairly often", tr: "Oldukça sık" }, value: 3 },
  { label: { en: "Very often", tr: "Çok sık" }, value: 4 },
]

// ══════════════════════════════════════════
// 1. PHQ-9 — Patient Health Questionnaire
// ══════════════════════════════════════════
const PHQ9: ClinicalTest = {
  id: "phq9",
  title: { en: "PHQ-9 Depression Scale", tr: "PHQ-9 Depresyon Ölçeği" },
  description: { en: "Screens for the presence and severity of depression. Used worldwide in clinical settings.", tr: "Depresyonun varlığını ve şiddetini tarar. Dünya genelinde klinik ortamlarda kullanılır." },
  category: "depression",
  icon: "CloudRain",
  color: "#6366F1",
  estimatedMinutes: 3,
  questionCount: 9,
  maxScore: 27,
  source: "Kroenke, Spitzer & Williams, 2001",
  crisisQuestionIds: ["phq9_q9"],
  disclaimer: {
    en: "This is a screening tool, not a diagnosis. If you scored moderate or higher, please consult a mental health professional.",
    tr: "Bu bir tarama aracıdır, teşhis değildir. Orta veya üzeri puan aldıysanız lütfen bir ruh sağlığı uzmanına danışın.",
  },
  questions: [
    { id: "phq9_q1", text: { en: "Little interest or pleasure in doing things", tr: "Bir şeyler yapmaya karşı çok az ilgi veya zevk duyma" }, options: LIKERT_4 },
    { id: "phq9_q2", text: { en: "Feeling down, depressed, or hopeless", tr: "Kendini kederli, depresif veya umutsuz hissetme" }, options: LIKERT_4 },
    { id: "phq9_q3", text: { en: "Trouble falling or staying asleep, or sleeping too much", tr: "Uykuya dalmada veya sürdürmede güçlük ya da çok fazla uyuma" }, options: LIKERT_4 },
    { id: "phq9_q4", text: { en: "Feeling tired or having little energy", tr: "Yorgun hissetme veya az enerjiye sahip olma" }, options: LIKERT_4 },
    { id: "phq9_q5", text: { en: "Poor appetite or overeating", tr: "İştahsızlık veya aşırı yeme" }, options: LIKERT_4 },
    { id: "phq9_q6", text: { en: "Feeling bad about yourself — or that you are a failure", tr: "Kendini kötü hissetme — ya da başarısız olduğunu düşünme" }, options: LIKERT_4 },
    { id: "phq9_q7", text: { en: "Trouble concentrating on things, such as reading or watching TV", tr: "Okuma veya TV izleme gibi şeylere konsantre olmada güçlük" }, options: LIKERT_4 },
    { id: "phq9_q8", text: { en: "Moving or speaking so slowly that others noticed — or being fidgety/restless", tr: "Başkalarının fark edeceği kadar yavaş hareket etme/konuşma — ya da huzursuzluk" }, options: LIKERT_4 },
    { id: "phq9_q9", text: { en: "Thoughts that you would be better off dead, or of hurting yourself", tr: "Ölseniz daha iyi olacağına dair düşünceler veya kendinize zarar verme düşünceleri" }, options: LIKERT_4 },
  ],
  thresholds: [
    { min: 0, max: 4, severity: "minimal", label: { en: "Minimal Depression", tr: "Minimal Depresyon" }, color: "#22C55E", message: { en: "Your score suggests minimal depressive symptoms. Continue taking care of your mental health with regular exercise, sleep, and social connection.", tr: "Skorunuz minimal depresif belirtilere işaret ediyor. Düzenli egzersiz, uyku ve sosyal bağlantılarla ruh sağlığınıza özen göstermeye devam edin." } },
    { min: 5, max: 9, severity: "mild", label: { en: "Mild Depression", tr: "Hafif Depresyon" }, color: "#EAB308", message: { en: "Your score suggests mild depressive symptoms. Consider lifestyle changes and monitor your mood. If symptoms persist for more than 2 weeks, speak with a healthcare provider.", tr: "Skorunuz hafif depresif belirtilere işaret ediyor. Yaşam tarzı değişikliklerini değerlendirin ve ruh halinizi izleyin. Belirtiler 2 haftadan fazla sürerse bir sağlık uzmanına danışın." } },
    { min: 10, max: 14, severity: "moderate", label: { en: "Moderate Depression", tr: "Orta Şiddetli Depresyon" }, color: "#F97316", message: { en: "Your score suggests moderate depressive symptoms. We recommend speaking with a mental health professional. Therapy, lifestyle changes, or medication may help.", tr: "Skorunuz orta şiddetli depresif belirtilere işaret ediyor. Bir ruh sağlığı uzmanıyla görüşmenizi öneriyoruz. Terapi, yaşam tarzı değişiklikleri veya ilaç yardımcı olabilir." } },
    { min: 15, max: 19, severity: "moderately_severe", label: { en: "Moderately Severe Depression", tr: "Orta-Ağır Depresyon" }, color: "#EF4444", message: { en: "Your score suggests moderately severe depressive symptoms. Please consult a mental health professional as soon as possible. Treatment is effective and help is available.", tr: "Skorunuz orta-ağır depresif belirtilere işaret ediyor. Lütfen en kısa sürede bir ruh sağlığı uzmanına danışın. Tedavi etkilidir ve yardım mevcuttur." } },
    { min: 20, max: 27, severity: "severe", label: { en: "Severe Depression", tr: "Ağır Depresyon" }, color: "#DC2626", message: { en: "Your score suggests severe depressive symptoms. Please seek professional help immediately. You are not alone, and effective treatment exists.", tr: "Skorunuz ağır depresif belirtilere işaret ediyor. Lütfen derhal profesyonel yardım alın. Yalnız değilsiniz ve etkili tedavi mevcuttur." } },
  ],
}

// ══════════════════════════════════════════
// 2. GAD-7 — Generalized Anxiety Disorder
// ══════════════════════════════════════════
const GAD7: ClinicalTest = {
  id: "gad7",
  title: { en: "GAD-7 Anxiety Scale", tr: "GAD-7 Anksiyete Ölçeği" },
  description: { en: "Measures the severity of generalized anxiety disorder. Quick, reliable, and widely used.", tr: "Yaygın anksiyete bozukluğunun şiddetini ölçer. Hızlı, güvenilir ve yaygın kullanılır." },
  category: "anxiety",
  icon: "Wind",
  color: "#EC4899",
  estimatedMinutes: 2,
  questionCount: 7,
  maxScore: 21,
  source: "Spitzer, Kroenke, Williams & Löwe, 2006",
  disclaimer: {
    en: "This is a screening tool, not a diagnosis. If you scored moderate or higher, please consult a healthcare provider.",
    tr: "Bu bir tarama aracıdır, teşhis değildir. Orta veya üzeri puan aldıysanız lütfen bir sağlık uzmanına danışın.",
  },
  questions: [
    { id: "gad7_q1", text: { en: "Feeling nervous, anxious, or on edge", tr: "Gergin, endişeli veya sinirli hissetme" }, options: LIKERT_4 },
    { id: "gad7_q2", text: { en: "Not being able to stop or control worrying", tr: "Endişelenmeyi durduramama veya kontrol edememe" }, options: LIKERT_4 },
    { id: "gad7_q3", text: { en: "Worrying too much about different things", tr: "Farklı şeyler hakkında çok fazla endişelenme" }, options: LIKERT_4 },
    { id: "gad7_q4", text: { en: "Trouble relaxing", tr: "Rahatlamada güçlük çekme" }, options: LIKERT_4 },
    { id: "gad7_q5", text: { en: "Being so restless that it's hard to sit still", tr: "O kadar huzursuz olmak ki yerinde oturmanın zor olması" }, options: LIKERT_4 },
    { id: "gad7_q6", text: { en: "Becoming easily annoyed or irritable", tr: "Kolay sinirlenme veya huzursuzlanma" }, options: LIKERT_4 },
    { id: "gad7_q7", text: { en: "Feeling afraid as if something awful might happen", tr: "Kötü bir şey olacakmış gibi korkma" }, options: LIKERT_4 },
  ],
  thresholds: [
    { min: 0, max: 4, severity: "minimal", label: { en: "Minimal Anxiety", tr: "Minimal Anksiyete" }, color: "#22C55E", message: { en: "Your anxiety level appears minimal. Keep maintaining healthy habits like exercise, good sleep, and mindfulness.", tr: "Anksiyete seviyeniz minimal görünüyor. Egzersiz, iyi uyku ve farkındalık gibi sağlıklı alışkanlıklara devam edin." } },
    { min: 5, max: 9, severity: "mild", label: { en: "Mild Anxiety", tr: "Hafif Anksiyete" }, color: "#EAB308", message: { en: "You may be experiencing mild anxiety. Breathing exercises, regular physical activity, and stress management techniques may help.", tr: "Hafif anksiyete yaşıyor olabilirsiniz. Nefes egzersizleri, düzenli fiziksel aktivite ve stres yönetimi teknikleri yardımcı olabilir." } },
    { min: 10, max: 14, severity: "moderate", label: { en: "Moderate Anxiety", tr: "Orta Şiddetli Anksiyete" }, color: "#F97316", message: { en: "Your score suggests moderate anxiety. Consider speaking with a healthcare provider about therapy or other treatment options.", tr: "Skorunuz orta şiddetli anksiyeteye işaret ediyor. Terapi veya diğer tedavi seçenekleri hakkında bir sağlık uzmanıyla görüşmeyi değerlendirin." } },
    { min: 15, max: 21, severity: "severe", label: { en: "Severe Anxiety", tr: "Ağır Anksiyete" }, color: "#DC2626", message: { en: "Your score suggests severe anxiety. Please consult a mental health professional. Effective treatments are available, including therapy and medication.", tr: "Skorunuz ağır anksiyeteye işaret ediyor. Lütfen bir ruh sağlığı uzmanına danışın. Terapi ve ilaç dahil etkili tedaviler mevcuttur." } },
  ],
}

// ══════════════════════════════════════════
// 3. ASRS v1.1 Part A — Adult ADHD Self-Report
// ══════════════════════════════════════════
const ASRS: ClinicalTest = {
  id: "asrs",
  title: { en: "ASRS ADHD Screening", tr: "ASRS DEHB Taraması" },
  description: { en: "WHO Adult ADHD Self-Report Scale (Part A). 6 key questions for initial screening.", tr: "DSÖ Yetişkin DEHB Öz-Bildirim Ölçeği (Kısım A). İlk tarama için 6 anahtar soru." },
  category: "adhd",
  icon: "Zap",
  color: "#F59E0B",
  estimatedMinutes: 2,
  questionCount: 6,
  maxScore: 24,
  source: "WHO, Kessler et al., 2005",
  disclaimer: {
    en: "This is a screening tool only. ADHD diagnosis requires comprehensive clinical evaluation by a specialist.",
    tr: "Bu yalnızca bir tarama aracıdır. DEHB tanısı bir uzman tarafından kapsamlı klinik değerlendirme gerektirir.",
  },
  questions: [
    { id: "asrs_q1", text: { en: "How often do you have trouble wrapping up the final details of a project?", tr: "Bir projenin son detaylarını tamamlamada ne sıklıkla zorluk çekersiniz?" }, options: LIKERT_5 },
    { id: "asrs_q2", text: { en: "How often do you have difficulty getting things in order when you have to do a task that requires organization?", tr: "Organizasyon gerektiren bir görev yaparken işleri düzene sokmada ne sıklıkla güçlük çekersiniz?" }, options: LIKERT_5 },
    { id: "asrs_q3", text: { en: "How often do you have problems remembering appointments or obligations?", tr: "Randevuları veya yükümlülükleri hatırlamada ne sıklıkla sorun yaşarsınız?" }, options: LIKERT_5 },
    { id: "asrs_q4", text: { en: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?", tr: "Çok düşünme gerektiren bir görev olduğunda, başlamayı ne sıklıkla erteler veya kaçınırsınız?" }, options: LIKERT_5 },
    { id: "asrs_q5", text: { en: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?", tr: "Uzun süre oturmanız gerektiğinde ne sıklıkla elleriniz veya ayaklarınızla kıpırdanırsınız?" }, options: LIKERT_5 },
    { id: "asrs_q6", text: { en: "How often do you feel overly active and compelled to do things, like you were driven by a motor?", tr: "Ne sıklıkla aşırı aktif ve bir motor tarafından sürülüyormuş gibi bir şeyler yapmaya mecbur hissedersiniz?" }, options: LIKERT_5 },
  ],
  thresholds: [
    { min: 0, max: 9, severity: "unlikely", label: { en: "ADHD Unlikely", tr: "DEHB Olası Değil" }, color: "#22C55E", message: { en: "Your score does not suggest significant ADHD symptoms. If you still have concerns, discuss them with your doctor.", tr: "Skorunuz önemli DEHB belirtilerine işaret etmiyor. Hâlâ endişeleriniz varsa doktorunuzla görüşün." } },
    { min: 10, max: 15, severity: "possible", label: { en: "ADHD Possible", tr: "DEHB Olası" }, color: "#F97316", message: { en: "Your score suggests possible ADHD symptoms. Consider a comprehensive evaluation by a psychiatrist or psychologist.", tr: "Skorunuz olası DEHB belirtilerine işaret ediyor. Bir psikiyatrist veya psikolog tarafından kapsamlı değerlendirmeyi değerlendirin." } },
    { min: 16, max: 24, severity: "likely", label: { en: "ADHD Likely", tr: "DEHB Muhtemel" }, color: "#DC2626", message: { en: "Your score is consistent with ADHD. A professional clinical evaluation is strongly recommended for proper diagnosis and treatment.", tr: "Skorunuz DEHB ile tutarlıdır. Doğru tanı ve tedavi için profesyonel klinik değerlendirme şiddetle önerilir." } },
  ],
}

// ══════════════════════════════════════════
// 4. PSS-10 — Perceived Stress Scale
// ══════════════════════════════════════════
const PSS10: ClinicalTest = {
  id: "pss10",
  title: { en: "PSS-10 Stress Scale", tr: "PSS-10 Stres Ölçeği" },
  description: { en: "Measures the degree to which life situations are perceived as stressful.", tr: "Yaşam durumlarının ne derece stresli algılandığını ölçer." },
  category: "stress",
  icon: "Gauge",
  color: "#EF4444",
  estimatedMinutes: 3,
  questionCount: 10,
  maxScore: 40,
  source: "Cohen, Kamarck & Mermelstein, 1983",
  disclaimer: {
    en: "This measures perceived stress, not clinical conditions. High stress can affect your health — consider speaking with a professional.",
    tr: "Bu algılanan stresi ölçer, klinik durumları değil. Yüksek stres sağlığınızı etkileyebilir — bir uzmanla görüşmeyi değerlendirin.",
  },
  questions: [
    { id: "pss_q1", text: { en: "How often have you been upset because of something that happened unexpectedly?", tr: "Beklenmedik bir şey olduğu için ne sıklıkla üzüldünüz?" }, options: LIKERT_5 },
    { id: "pss_q2", text: { en: "How often have you felt that you were unable to control important things in your life?", tr: "Hayatınızdaki önemli şeyleri kontrol edemediğinizi ne sıklıkla hissettiniz?" }, options: LIKERT_5 },
    { id: "pss_q3", text: { en: "How often have you felt nervous and stressed?", tr: "Ne sıklıkla gergin ve stresli hissettiniz?" }, options: LIKERT_5 },
    { id: "pss_q4", text: { en: "How often have you felt confident about handling personal problems?", tr: "Kişisel sorunlarla başa çıkma konusunda ne sıklıkla kendinize güvendiniz?" }, options: LIKERT_5 },
    { id: "pss_q5", text: { en: "How often have you felt that things were going your way?", tr: "İşlerin yolunda gittiğini ne sıklıkla hissettiniz?" }, options: LIKERT_5 },
    { id: "pss_q6", text: { en: "How often have you found that you could not cope with all the things you had to do?", tr: "Yapmanız gereken tüm şeylerle başa çıkamadığınızı ne sıklıkla fark ettiniz?" }, options: LIKERT_5 },
    { id: "pss_q7", text: { en: "How often have you been able to control irritations in your life?", tr: "Hayatınızdaki sinirlendiren şeyleri ne sıklıkla kontrol edebildiniz?" }, options: LIKERT_5 },
    { id: "pss_q8", text: { en: "How often have you felt that you were on top of things?", tr: "İşlerin üstesinden geldiğinizi ne sıklıkla hissettiniz?" }, options: LIKERT_5 },
    { id: "pss_q9", text: { en: "How often have you been angered because of things outside your control?", tr: "Kontrolünüz dışındaki şeyler yüzünden ne sıklıkla öfkelendiniz?" }, options: LIKERT_5 },
    { id: "pss_q10", text: { en: "How often have you felt difficulties were piling up so high that you could not overcome them?", tr: "Zorlukların üstesinden gelemeyeceğiniz kadar biriktiğini ne sıklıkla hissettiniz?" }, options: LIKERT_5 },
  ],
  thresholds: [
    { min: 0, max: 13, severity: "low", label: { en: "Low Stress", tr: "Düşük Stres" }, color: "#22C55E", message: { en: "Your perceived stress is low. You seem to be managing well. Keep up your healthy coping strategies.", tr: "Algılanan stres seviyeniz düşük. İyi başa çıkıyor görünüyorsunuz. Sağlıklı baş etme stratejilerinize devam edin." } },
    { min: 14, max: 26, severity: "moderate", label: { en: "Moderate Stress", tr: "Orta Stres" }, color: "#F97316", message: { en: "You're experiencing moderate stress. Consider stress management techniques like mindfulness, exercise, or talking to someone you trust.", tr: "Orta düzeyde stres yaşıyorsunuz. Farkındalık, egzersiz veya güvendiğiniz biriyle konuşma gibi stres yönetimi tekniklerini değerlendirin." } },
    { min: 27, max: 40, severity: "high", label: { en: "High Stress", tr: "Yüksek Stres" }, color: "#DC2626", message: { en: "Your stress level is high. Chronic stress can significantly affect your physical and mental health. Please consider professional support.", tr: "Stres seviyeniz yüksek. Kronik stres fiziksel ve ruhsal sağlığınızı önemli ölçüde etkileyebilir. Lütfen profesyonel destek almayı değerlendirin." } },
  ],
}

// ══════════════════════════════════════════
// 5. ISI — Insomnia Severity Index
// ══════════════════════════════════════════
const ISI: ClinicalTest = {
  id: "isi",
  title: { en: "ISI Insomnia Scale", tr: "ISI Uykusuzluk Ölçeği" },
  description: { en: "Evaluates the nature, severity, and impact of insomnia.", tr: "Uykusuzluğun doğasını, şiddetini ve etkisini değerlendirir." },
  category: "sleep",
  icon: "Moon",
  color: "#818CF8",
  estimatedMinutes: 2,
  questionCount: 7,
  maxScore: 28,
  source: "Morin, 1993",
  disclaimer: {
    en: "This assesses insomnia severity. Persistent sleep problems should be discussed with a healthcare provider.",
    tr: "Bu uykusuzluk şiddetini değerlendirir. Kalıcı uyku sorunları bir sağlık uzmanıyla görüşülmelidir.",
  },
  questions: [
    { id: "isi_q1", text: { en: "Difficulty falling asleep", tr: "Uykuya dalma güçlüğü" }, options: [{ label: { en: "None", tr: "Yok" }, value: 0 }, { label: { en: "Mild", tr: "Hafif" }, value: 1 }, { label: { en: "Moderate", tr: "Orta" }, value: 2 }, { label: { en: "Severe", tr: "Şiddetli" }, value: 3 }, { label: { en: "Very severe", tr: "Çok şiddetli" }, value: 4 }] },
    { id: "isi_q2", text: { en: "Difficulty staying asleep", tr: "Uykuyu sürdürme güçlüğü" }, options: [{ label: { en: "None", tr: "Yok" }, value: 0 }, { label: { en: "Mild", tr: "Hafif" }, value: 1 }, { label: { en: "Moderate", tr: "Orta" }, value: 2 }, { label: { en: "Severe", tr: "Şiddetli" }, value: 3 }, { label: { en: "Very severe", tr: "Çok şiddetli" }, value: 4 }] },
    { id: "isi_q3", text: { en: "Problem waking up too early", tr: "Çok erken uyanma sorunu" }, options: [{ label: { en: "None", tr: "Yok" }, value: 0 }, { label: { en: "Mild", tr: "Hafif" }, value: 1 }, { label: { en: "Moderate", tr: "Orta" }, value: 2 }, { label: { en: "Severe", tr: "Şiddetli" }, value: 3 }, { label: { en: "Very severe", tr: "Çok şiddetli" }, value: 4 }] },
    { id: "isi_q4", text: { en: "How satisfied/dissatisfied are you with your current sleep pattern?", tr: "Mevcut uyku düzeninizden ne kadar memnunsunuz?" }, options: [{ label: { en: "Very satisfied", tr: "Çok memnun" }, value: 0 }, { label: { en: "Satisfied", tr: "Memnun" }, value: 1 }, { label: { en: "Neutral", tr: "Nötr" }, value: 2 }, { label: { en: "Dissatisfied", tr: "Memnun değil" }, value: 3 }, { label: { en: "Very dissatisfied", tr: "Hiç memnun değil" }, value: 4 }] },
    { id: "isi_q5", text: { en: "How noticeable to others do you think your sleep problem is?", tr: "Uyku sorununuzun başkaları tarafından ne kadar fark edildiğini düşünüyorsunuz?" }, options: [{ label: { en: "Not at all", tr: "Hiç" }, value: 0 }, { label: { en: "A little", tr: "Biraz" }, value: 1 }, { label: { en: "Somewhat", tr: "Bir miktar" }, value: 2 }, { label: { en: "Much", tr: "Çok" }, value: 3 }, { label: { en: "Very much", tr: "Çok fazla" }, value: 4 }] },
    { id: "isi_q6", text: { en: "How worried/distressed are you about your current sleep problem?", tr: "Mevcut uyku sorununuz hakkında ne kadar endişeli/sıkıntılısınız?" }, options: [{ label: { en: "Not at all", tr: "Hiç" }, value: 0 }, { label: { en: "A little", tr: "Biraz" }, value: 1 }, { label: { en: "Somewhat", tr: "Bir miktar" }, value: 2 }, { label: { en: "Much", tr: "Çok" }, value: 3 }, { label: { en: "Very much", tr: "Çok fazla" }, value: 4 }] },
    { id: "isi_q7", text: { en: "How much does your sleep problem interfere with your daily functioning?", tr: "Uyku sorununuz günlük işlevselliğinizi ne kadar etkiliyor?" }, options: [{ label: { en: "Not at all", tr: "Hiç" }, value: 0 }, { label: { en: "A little", tr: "Biraz" }, value: 1 }, { label: { en: "Somewhat", tr: "Bir miktar" }, value: 2 }, { label: { en: "Much", tr: "Çok" }, value: 3 }, { label: { en: "Very much", tr: "Çok fazla" }, value: 4 }] },
  ],
  thresholds: [
    { min: 0, max: 7, severity: "none", label: { en: "No Clinically Significant Insomnia", tr: "Klinik Olarak Anlamlı Uykusuzluk Yok" }, color: "#22C55E", message: { en: "Your sleep appears to be in a healthy range. Continue practicing good sleep hygiene.", tr: "Uykunuz sağlıklı aralıkta görünüyor. İyi uyku hijyeni uygulamalarına devam edin." } },
    { min: 8, max: 14, severity: "subthreshold", label: { en: "Subthreshold Insomnia", tr: "Eşik Altı Uykusuzluk" }, color: "#EAB308", message: { en: "You're showing some insomnia symptoms. Focus on sleep hygiene: consistent schedule, dark cool room, no screens before bed.", tr: "Bazı uykusuzluk belirtileri gösteriyorsunuz. Uyku hijyenine odaklanın: tutarlı program, karanlık serin oda, yatmadan önce ekran yok." } },
    { min: 15, max: 21, severity: "moderate", label: { en: "Moderate Insomnia", tr: "Orta Şiddetli Uykusuzluk" }, color: "#F97316", message: { en: "You may have moderate insomnia. Consider speaking with your doctor about cognitive behavioral therapy for insomnia (CBT-I).", tr: "Orta şiddetli uykusuzluğunuz olabilir. Uykusuzluk için bilişsel davranışçı terapi (BDT-I) hakkında doktorunuzla görüşmeyi değerlendirin." } },
    { min: 22, max: 28, severity: "severe", label: { en: "Severe Insomnia", tr: "Ağır Uykusuzluk" }, color: "#DC2626", message: { en: "Your score suggests severe insomnia. Please consult a sleep specialist. Untreated insomnia can significantly impact your health.", tr: "Skorunuz ağır uykusuzluğa işaret ediyor. Lütfen bir uyku uzmanına danışın. Tedavi edilmeyen uykusuzluk sağlığınızı ciddi şekilde etkileyebilir." } },
  ],
}

// ══════════════════════════════════════════
// 6. WHO-5 — Well-Being Index
// ══════════════════════════════════════════
const WHO5: ClinicalTest = {
  id: "who5",
  title: { en: "WHO-5 Well-Being Index", tr: "WHO-5 İyi Oluş İndeksi" },
  description: { en: "A short, positive measure of emotional well-being over the last 2 weeks.", tr: "Son 2 haftadaki duygusal iyi oluşun kısa, olumlu bir ölçüsü." },
  category: "wellbeing",
  icon: "Smile",
  color: "#10B981",
  estimatedMinutes: 1,
  questionCount: 5,
  maxScore: 25,
  source: "WHO, 1998",
  disclaimer: {
    en: "A low WHO-5 score may indicate reduced well-being and warrants further screening for depression.",
    tr: "Düşük WHO-5 skoru azalmış iyi oluşa işaret edebilir ve depresyon için ileri tarama gerektirebilir.",
  },
  questions: [
    { id: "who5_q1", text: { en: "I have felt cheerful and in good spirits", tr: "Neşeli ve iyi ruh halinde hissettim" }, options: [{ label: { en: "At no time", tr: "Hiçbir zaman" }, value: 0 }, { label: { en: "Some of the time", tr: "Bazı zamanlar" }, value: 1 }, { label: { en: "Less than half the time", tr: "Zamanın yarısından az" }, value: 2 }, { label: { en: "More than half the time", tr: "Zamanın yarısından fazla" }, value: 3 }, { label: { en: "Most of the time", tr: "Çoğu zaman" }, value: 4 }, { label: { en: "All of the time", tr: "Her zaman" }, value: 5 }] },
    { id: "who5_q2", text: { en: "I have felt calm and relaxed", tr: "Sakin ve rahat hissettim" }, options: [{ label: { en: "At no time", tr: "Hiçbir zaman" }, value: 0 }, { label: { en: "Some of the time", tr: "Bazı zamanlar" }, value: 1 }, { label: { en: "Less than half the time", tr: "Zamanın yarısından az" }, value: 2 }, { label: { en: "More than half the time", tr: "Zamanın yarısından fazla" }, value: 3 }, { label: { en: "Most of the time", tr: "Çoğu zaman" }, value: 4 }, { label: { en: "All of the time", tr: "Her zaman" }, value: 5 }] },
    { id: "who5_q3", text: { en: "I have felt active and vigorous", tr: "Aktif ve dinç hissettim" }, options: [{ label: { en: "At no time", tr: "Hiçbir zaman" }, value: 0 }, { label: { en: "Some of the time", tr: "Bazı zamanlar" }, value: 1 }, { label: { en: "Less than half the time", tr: "Zamanın yarısından az" }, value: 2 }, { label: { en: "More than half the time", tr: "Zamanın yarısından fazla" }, value: 3 }, { label: { en: "Most of the time", tr: "Çoğu zaman" }, value: 4 }, { label: { en: "All of the time", tr: "Her zaman" }, value: 5 }] },
    { id: "who5_q4", text: { en: "I woke up feeling fresh and rested", tr: "Dinlenmiş ve taze hissederek uyandım" }, options: [{ label: { en: "At no time", tr: "Hiçbir zaman" }, value: 0 }, { label: { en: "Some of the time", tr: "Bazı zamanlar" }, value: 1 }, { label: { en: "Less than half the time", tr: "Zamanın yarısından az" }, value: 2 }, { label: { en: "More than half the time", tr: "Zamanın yarısından fazla" }, value: 3 }, { label: { en: "Most of the time", tr: "Çoğu zaman" }, value: 4 }, { label: { en: "All of the time", tr: "Her zaman" }, value: 5 }] },
    { id: "who5_q5", text: { en: "My daily life has been filled with things that interest me", tr: "Günlük hayatım ilgimi çeken şeylerle doluydu" }, options: [{ label: { en: "At no time", tr: "Hiçbir zaman" }, value: 0 }, { label: { en: "Some of the time", tr: "Bazı zamanlar" }, value: 1 }, { label: { en: "Less than half the time", tr: "Zamanın yarısından az" }, value: 2 }, { label: { en: "More than half the time", tr: "Zamanın yarısından fazla" }, value: 3 }, { label: { en: "Most of the time", tr: "Çoğu zaman" }, value: 4 }, { label: { en: "All of the time", tr: "Her zaman" }, value: 5 }] },
  ],
  thresholds: [
    { min: 0, max: 12, severity: "poor", label: { en: "Poor Well-Being", tr: "Düşük İyi Oluş" }, color: "#DC2626", message: { en: "Your well-being score is low. This may indicate depression or significant emotional distress. Please consider speaking with a healthcare provider.", tr: "İyi oluş skorunuz düşük. Bu depresyon veya önemli duygusal sıkıntıya işaret edebilir. Lütfen bir sağlık uzmanıyla görüşmeyi değerlendirin." } },
    { min: 13, max: 17, severity: "moderate", label: { en: "Moderate Well-Being", tr: "Orta İyi Oluş" }, color: "#F97316", message: { en: "Your well-being could be better. Focus on activities that bring you joy, social connections, and physical activity.", tr: "İyi oluşunuz daha iyi olabilir. Size neşe veren aktiviteler, sosyal bağlantılar ve fiziksel aktiviteye odaklanın." } },
    { min: 18, max: 25, severity: "good", label: { en: "Good Well-Being", tr: "İyi İyi Oluş" }, color: "#22C55E", message: { en: "Your well-being is good! Keep nurturing your mental health with activities you enjoy and meaningful connections.", tr: "İyi oluşunuz iyi! Keyif aldığınız aktiviteler ve anlamlı bağlantılarla ruh sağlığınızı beslemeye devam edin." } },
  ],
}

// ══════════════════════════════════════════
// 7. AUDIT — Alcohol Use Disorders Test
// ══════════════════════════════════════════
const AUDIT: ClinicalTest = {
  id: "audit",
  title: { en: "AUDIT Alcohol Screening", tr: "AUDIT Alkol Taraması" },
  description: { en: "WHO test to identify hazardous or harmful alcohol consumption.", tr: "Tehlikeli veya zararlı alkol tüketimini belirlemek için DSÖ testi." },
  category: "substance",
  icon: "Wine",
  color: "#8B5CF6",
  estimatedMinutes: 3,
  questionCount: 10,
  maxScore: 40,
  source: "WHO, Babor et al., 2001",
  disclaimer: {
    en: "This screens for alcohol use patterns. If you scored high, consider discussing your drinking habits with a healthcare provider.",
    tr: "Bu alkol kullanım kalıplarını tarar. Yüksek puan aldıysanız içme alışkanlıklarınızı bir sağlık uzmanıyla görüşmeyi değerlendirin.",
  },
  questions: [
    { id: "audit_q1", text: { en: "How often do you have a drink containing alcohol?", tr: "Ne sıklıkla alkol içeren bir içecek içersiniz?" }, options: [{ label: { en: "Never", tr: "Hiç" }, value: 0 }, { label: { en: "Monthly or less", tr: "Ayda bir veya daha az" }, value: 1 }, { label: { en: "2-4 times a month", tr: "Ayda 2-4 kez" }, value: 2 }, { label: { en: "2-3 times a week", tr: "Haftada 2-3 kez" }, value: 3 }, { label: { en: "4+ times a week", tr: "Haftada 4+ kez" }, value: 4 }] },
    { id: "audit_q2", text: { en: "How many drinks do you have on a typical day when you are drinking?", tr: "İçtiğiniz günlerde tipik olarak kaç kadeh içersiniz?" }, options: [{ label: { en: "1-2", tr: "1-2" }, value: 0 }, { label: { en: "3-4", tr: "3-4" }, value: 1 }, { label: { en: "5-6", tr: "5-6" }, value: 2 }, { label: { en: "7-9", tr: "7-9" }, value: 3 }, { label: { en: "10+", tr: "10+" }, value: 4 }] },
    { id: "audit_q3", text: { en: "How often do you have 6 or more drinks on one occasion?", tr: "Tek seferde 6 veya daha fazla içeceği ne sıklıkla içersiniz?" }, options: [{ label: { en: "Never", tr: "Hiç" }, value: 0 }, { label: { en: "Less than monthly", tr: "Ayda birden az" }, value: 1 }, { label: { en: "Monthly", tr: "Aylık" }, value: 2 }, { label: { en: "Weekly", tr: "Haftalık" }, value: 3 }, { label: { en: "Daily or almost daily", tr: "Günlük veya neredeyse günlük" }, value: 4 }] },
    { id: "audit_q4", text: { en: "How often have you found that you were not able to stop drinking once you had started?", tr: "Başladığınızda içmeyi durduramadığınızı ne sıklıkla fark ettiniz?" }, options: LIKERT_5 },
    { id: "audit_q5", text: { en: "How often have you failed to do what was normally expected of you because of drinking?", tr: "İçme yüzünden normalde sizden beklenen şeyleri yapamadığınız ne sıklıkla oldu?" }, options: LIKERT_5 },
    { id: "audit_q6", text: { en: "How often have you needed a first drink in the morning to get yourself going?", tr: "Sabah kendini toplamak için ne sıklıkla bir içkiye ihtiyaç duydunuz?" }, options: LIKERT_5 },
    { id: "audit_q7", text: { en: "How often have you had a feeling of guilt or remorse after drinking?", tr: "İçtikten sonra ne sıklıkla suçluluk veya pişmanlık hissettiniz?" }, options: LIKERT_5 },
    { id: "audit_q8", text: { en: "How often have you been unable to remember what happened the night before because of drinking?", tr: "İçme yüzünden bir önceki geceyi hatırlayamadığınız ne sıklıkla oldu?" }, options: LIKERT_5 },
    { id: "audit_q9", text: { en: "Have you or someone else been injured as a result of your drinking?", tr: "İçmeniz sonucunda siz veya başkası yaralandı mı?" }, options: [{ label: { en: "No", tr: "Hayır" }, value: 0 }, { label: { en: "Yes, but not in the last year", tr: "Evet, ama son bir yılda değil" }, value: 2 }, { label: { en: "Yes, during the last year", tr: "Evet, son bir yılda" }, value: 4 }] },
    { id: "audit_q10", text: { en: "Has someone been concerned about your drinking or suggested you cut down?", tr: "Biri içmeniz konusunda endişelendi mi veya azaltmanızı önerdi mi?" }, options: [{ label: { en: "No", tr: "Hayır" }, value: 0 }, { label: { en: "Yes, but not in the last year", tr: "Evet, ama son bir yılda değil" }, value: 2 }, { label: { en: "Yes, during the last year", tr: "Evet, son bir yılda" }, value: 4 }] },
  ],
  thresholds: [
    { min: 0, max: 7, severity: "low_risk", label: { en: "Low Risk", tr: "Düşük Risk" }, color: "#22C55E", message: { en: "Your alcohol use appears to be in a low-risk range. Continue to drink responsibly if you choose to drink.", tr: "Alkol kullanımınız düşük riskli aralıkta görünüyor. İçmeyi seçerseniz sorumlu içmeye devam edin." } },
    { min: 8, max: 15, severity: "hazardous", label: { en: "Hazardous Use", tr: "Tehlikeli Kullanım" }, color: "#F97316", message: { en: "Your drinking pattern may be putting your health at risk. Consider reducing your alcohol intake.", tr: "İçme alışkanlığınız sağlığınızı riske atıyor olabilir. Alkol alımınızı azaltmayı değerlendirin." } },
    { min: 16, max: 19, severity: "harmful", label: { en: "Harmful Use", tr: "Zararlı Kullanım" }, color: "#EF4444", message: { en: "Your drinking pattern suggests harmful use. Please speak with a healthcare provider about your alcohol consumption.", tr: "İçme alışkanlığınız zararlı kullanıma işaret ediyor. Lütfen alkol tüketiminiz hakkında bir sağlık uzmanıyla görüşün." } },
    { min: 20, max: 40, severity: "dependence", label: { en: "Possible Dependence", tr: "Olası Bağımlılık" }, color: "#DC2626", message: { en: "Your score suggests possible alcohol dependence. Professional help is strongly recommended. Recovery is possible.", tr: "Skorunuz olası alkol bağımlılığına işaret ediyor. Profesyonel yardım şiddetle önerilir. İyileşme mümkündür." } },
  ],
}

// ── Export All Tests ────────────────────

export const CLINICAL_TESTS: ClinicalTest[] = [PHQ9, GAD7, ASRS, PSS10, ISI, WHO5, AUDIT]

export function getTestById(id: string): ClinicalTest | null {
  return CLINICAL_TESTS.find(t => t.id === id) || null
}

export function getTestsByCategory(category: string): ClinicalTest[] {
  return CLINICAL_TESTS.filter(t => t.category === category)
}

export const TEST_CATEGORIES = [
  { id: "all", label: { en: "All Tests", tr: "Tüm Testler" } },
  { id: "depression", label: { en: "Depression", tr: "Depresyon" } },
  { id: "anxiety", label: { en: "Anxiety", tr: "Anksiyete" } },
  { id: "adhd", label: { en: "ADHD", tr: "DEHB" } },
  { id: "stress", label: { en: "Stress", tr: "Stres" } },
  { id: "sleep", label: { en: "Sleep", tr: "Uyku" } },
  { id: "wellbeing", label: { en: "Well-Being", tr: "İyi Oluş" } },
  { id: "substance", label: { en: "Substance Use", tr: "Madde Kullanımı" } },
]
