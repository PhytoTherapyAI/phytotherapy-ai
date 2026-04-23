// © 2026 DoctoPal — All Rights Reserved
//
// F-SAFETY-002 Commit 3: build a `mailto:` URL the user can open from
// the safety banner's "Doktoruma Sor" CTA. The body summarises the
// detected interaction edges in plain prose so the patient's physician
// gets a one-page brief — no PDF generation, no SBAR pipeline reuse.
// The mail client opens with everything pre-filled; the user fills in
// the recipient and (optionally) edits the body before sending.
//
// Why mailto rather than the SBAR dialog reuse?
// SBAR's email flow generates a Claude PDF and ships it through
// /api/sbar-email — too heavy for a one-off interaction summary, and
// the body is server-rendered (the user can't tweak it). A mailto:
// URL is editable, recipient-flexible, and works on every platform
// without an extra round trip. Future iteration could add an
// interaction-aware SBAR PDF; for now mailto covers the gap cleanly.

import type { EdgeItem, EdgeCategory } from "@/lib/safety/check-med-interactions"

const CATEGORY_HEADINGS: Record<EdgeCategory, { tr: string; en: string }> = {
  "drug-drug":       { tr: "💊 İlaç + İlaç",         en: "💊 Drug + Drug" },
  "drug-chronic":    { tr: "🩺 İlaç + Hastalık",     en: "🩺 Drug + Condition" },
  "drug-supplement": { tr: "🌿 İlaç + Takviye",      en: "🌿 Drug + Supplement" },
  "drug-allergy":    { tr: "⚠️ İlaç + Alerji",       en: "⚠️ Drug + Allergy" },
  "drug-condition":  { tr: "🚨 İlaç + Kritik Durum", en: "🚨 Drug + Critical Flag" },
}

const CATEGORY_ORDER: EdgeCategory[] = [
  "drug-condition",
  "drug-allergy",
  "drug-drug",
  "drug-chronic",
  "drug-supplement",
]

const SEVERITY_LABEL: Record<EdgeItem["severity"], { tr: string; en: string }> = {
  dangerous: { tr: "ciddi",  en: "serious" },
  caution:   { tr: "dikkat", en: "caution" },
  safe:      { tr: "düşük",  en: "low" },
}

interface BuildMailtoParams {
  /** Edges from the latest interaction check. Filtered to dangerous +
   *  caution before being passed in (caller responsibility). */
  edges: EdgeItem[]
  /** Optional summary line from the interaction-map response. */
  summary?: string
  /** Patient name for the closing line. Falls back to a neutral "Hasta". */
  patientName?: string | null
  lang: "tr" | "en"
}

/**
 * Build the body text shown in the user's mail client. Returned without
 * URL encoding — `toMailtoUrl` does that wrapping.
 */
export function buildDoctorEmailBody(params: BuildMailtoParams): string {
  const { edges, summary, patientName, lang } = params
  const tr = lang === "tr"
  const dateStr = new Date().toLocaleDateString(tr ? "tr-TR" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  })

  // Group edges by category in clinical-weight order, mirroring the
  // banner. Empty categories are skipped.
  const grouped: Array<{ cat: EdgeCategory; items: EdgeItem[] }> = []
  for (const cat of CATEGORY_ORDER) {
    const items = edges.filter((e) => (e.category ?? "drug-drug") === cat)
    if (items.length > 0) grouped.push({ cat, items })
  }

  const greeting = tr ? "Sayın Doktorum," : "Dear Doctor,"
  const intro = tr
    ? `${dateStr} tarihinde DoctoPal güvenlik tarama sonucu aşağıdaki etkileşimleri tespit etti. Görüşünüzü almak isterim.`
    : `On ${dateStr}, DoctoPal's safety screen detected the interactions below. I'd value your opinion.`

  const sections = grouped.map(({ cat, items }) => {
    const heading = CATEGORY_HEADINGS[cat][lang]
    const lines = items.map((e) => {
      const sev = SEVERITY_LABEL[e.severity][lang]
      const head = `• ${e.source} + ${e.target} — ${sev}`
      const desc = e.description ? `\n  ${e.description}` : ""
      const mech = e.mechanism
        ? `\n  ${tr ? "Mekanizma:" : "Mechanism:"} ${e.mechanism}`
        : ""
      return `${head}${desc}${mech}`
    }).join("\n")
    return `${heading}\n${lines}`
  }).join("\n\n")

  const summaryBlock = summary
    ? `\n\n${tr ? "Özet:" : "Summary:"} ${summary}`
    : ""

  const questions = tr
    ? `Sormak istediklerim:
- Bu kombinasyonu birlikte kullanmama uygun bulur musunuz?
- Alternatif öneriniz var mı?
- Hangi izlemler (kan testi, tansiyon vb.) gerekli?`
    : `Questions I'd like to ask:
- Is it appropriate for me to take this combination together?
- Do you have an alternative recommendation?
- Which monitoring (blood test, blood pressure, etc.) is needed?`

  const closing = tr
    ? `Saygılarımla,\n${patientName?.trim() || "Hasta"}`
    : `Respectfully,\n${patientName?.trim() || "Patient"}`

  const footer = tr
    ? "— Bu özet DoctoPal güvenlik tarama sonucundan otomatik oluşturuldu. Tıbbi karar yetkisi sizdedir."
    : "— Auto-generated from DoctoPal's safety screen. Clinical decisions remain yours."

  return [
    greeting,
    "",
    intro,
    "",
    sections,
    summaryBlock.trimStart(),
    "",
    questions,
    "",
    closing,
    "",
    footer,
  ].filter(Boolean).join("\n")
}

/** Subject line — short, specific, severity-aware. */
export function buildDoctorEmailSubject(edges: EdgeItem[], lang: "tr" | "en"): string {
  const hasDangerous = edges.some((e) => e.severity === "dangerous")
  if (lang === "tr") {
    return hasDangerous
      ? "Yeni ilaç güvenlik incelemesi — önemli etkileşim, görüşünüze ihtiyacım var"
      : "Yeni ilaç güvenlik incelemesi — görüşünüze ihtiyacım var"
  }
  return hasDangerous
    ? "New medication safety review — important interaction, your opinion needed"
    : "New medication safety review — your opinion needed"
}

/** Compose the final `mailto:` URL. Recipient is left blank so the
 *  user picks their own physician's address in the mail client. */
export function buildDoctorMailtoUrl(params: BuildMailtoParams): string {
  const subject = encodeURIComponent(buildDoctorEmailSubject(params.edges, params.lang))
  const body = encodeURIComponent(buildDoctorEmailBody(params))
  return `mailto:?subject=${subject}&body=${body}`
}
