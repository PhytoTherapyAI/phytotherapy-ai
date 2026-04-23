// © 2026 DoctoPal — All Rights Reserved
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, X } from "lucide-react";
import type { UserAllergy, AllergySeverity } from "@/lib/database.types";
import { MotivationCard, SectionXPBadge } from "@/components/profile/ProfileGamification";

interface AllergiesSectionProps {
  lang: "en" | "tr";
  allergies: UserAllergy[];
  newAllergen: string;
  setNewAllergen: (v: string) => void;
  newAllergenSeverity: AllergySeverity;
  setNewAllergenSeverity: (v: AllergySeverity) => void;
  addAllergy: () => void;
  removeAllergy: (id: string) => void;
}

export function AllergiesSection({
  lang, allergies, newAllergen, setNewAllergen,
  newAllergenSeverity, setNewAllergenSeverity, addAllergy, removeAllergy,
}: AllergiesSectionProps) {
  const tr = lang === "tr";
  const hasAnaphylaxis = allergies.some(a => a.severity === "anaphylaxis");
  const reactionConfig: Record<string, { emoji: string; color: string; label: string }> = {
    anaphylaxis: { emoji: "🔴", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: tr ? "Anafilaksi" : "Anaphylaxis" },
    urticaria: { emoji: "🟡", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", label: tr ? "Kurdeşen" : "Urticaria" },
    mild_skin: { emoji: "🟢", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: tr ? "Hafif Kaşıntı" : "Mild Skin" },
    gi_intolerance: { emoji: "🔵", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", label: tr ? "Sindirim / İntolerans" : "GI Intolerance" },
    intolerance: { emoji: "🔵", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", label: tr ? "İntolerans" : "Intolerance" },
    mild_rash: { emoji: "🟢", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: tr ? "Hafif Döküntü" : "Mild Rash" },
    unknown: { emoji: "❓", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", label: tr ? "Bilmiyorum" : "Unknown" },
    mild: { emoji: "🟢", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: tr ? "Hafif" : "Mild" },
    moderate: { emoji: "🟡", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", label: tr ? "Orta" : "Moderate" },
    severe: { emoji: "🔴", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: tr ? "Şiddetli" : "Severe" },
  };

  return (
    <Card id="allergy-card" className={`mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow scroll-mt-20 ${hasAnaphylaxis ? "border-red-300 dark:border-red-700 border-l-4 border-l-red-500" : allergies.length > 0 ? "border-l-4 border-l-amber-500" : "border-green-200 dark:border-green-800"}`}
      style={hasAnaphylaxis ? { backgroundColor: "var(--red-50, rgba(254,242,242,0.5))" } : allergies.length === 0 ? { backgroundColor: "var(--green-50, rgba(240,253,244,0.5))" } : {}}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          {hasAnaphylaxis ? (
            <span className="animate-pulse">🚨</span>
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
          {hasAnaphylaxis
            ? (tr ? "Anafilaksi Uyarısı Aktif" : "Anaphylaxis Alert Active")
            : allergies.length === 0
              ? (tr ? "Alerjiler" : "Allergies")
              : `${allergies.length} ${tr ? "Alerji Tanımlı" : allergies.length === 1 ? "Allergy Defined" : "Allergies Defined"}`}
          <SectionXPBadge completed={allergies.length > 0} />
          {allergies.length === 0 && !hasAnaphylaxis && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
              🛡️ {tr ? "Alerji Yok" : "No Allergies"}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MotivationCard
          id="motiv_allergy"
          icon={"\u{26A0}\u{FE0F}"}
          title={tr ? "F\u0131st\u0131k konusunda \u015faka yapm\u0131yorum" : "I don't joke about peanuts"}
          message={tr ? "Alerji bilgisi olmadan \u00f6neri vermek, g\u00f6z\u00fc kapal\u0131 dart atmak gibi. Bazen tutturursun, bazen tutturmazs\u0131n. Sen tutturulmak istemiyorsun, de\u011fil mi? Ben de istemiyorum. Ekle. \u{1F3AF}" : "Giving advice without allergy info is like throwing darts blindfolded. Sometimes you hit, sometimes you don't. You don't want to be the dartboard, right? Neither do I. Add them. \u{1F3AF}"}
          color="yellow"
        />

        {allergies.length > 0 && (
          <div className="space-y-2">
            {allergies.map((allergy) => {
              const rc = reactionConfig[allergy.severity] || reactionConfig.unknown;
              return (
                <div key={allergy.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{rc.emoji}</span>
                    <span className="text-sm font-medium">{allergy.allergen}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={rc.color}>{rc.label}</Badge>
                    <button onClick={() => removeAllergy(allergy.id)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {hasAnaphylaxis && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
                <span className="shrink-0 mt-0.5">{"\u{26A1}"}</span>
                {tr ? "Bu bilgi tüm AI önerilerinde otomatik filtreleme yapıyor." : "This data automatically filters all AI recommendations."}
              </p>
            )}
          </div>
        )}

        {allergies.length === 0 && (
          <p className="text-sm text-green-700 dark:text-green-400">
            {tr ? "Kayıtlı alerjin yok. Güvenle öneri alabilirsin." : "No allergies recorded. You can safely receive recommendations."}
          </p>
        )}

        <div className="rounded-xl border border-dashed border-primary/30 p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {tr ? "Yaygın Alerjenler" : "Common Allergens"}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "Penicillin", tr: "Penisilin", en: "Penicillin" },
              { id: "Sulfonamide", tr: "Sülfonamid", en: "Sulfonamide" },
              { id: "NSAID", tr: "NSAİİ (İbuprofen vb.)", en: "NSAIDs" },
              { id: "Peanut", tr: "Fıstık", en: "Peanut" },
              { id: "Milk", tr: "Süt", en: "Milk" },
              { id: "Egg", tr: "Yumurta", en: "Egg" },
              { id: "Shellfish", tr: "Kabuklu Deniz Ürünü", en: "Shellfish" },
              { id: "Gluten", tr: "Gluten", en: "Gluten" },
              { id: "Soy", tr: "Soya", en: "Soy" },
              { id: "Latex", tr: "Lateks", en: "Latex" },
              { id: "Bee Venom", tr: "Arı Zehiri", en: "Bee Venom" },
              { id: "Pollen", tr: "Polen", en: "Pollen" },
            ].map(a => (
              <Badge key={a.id} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => { setNewAllergen(tr ? a.tr : a.en); }}>
                {tr ? a.tr : a.en}
              </Badge>
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
            {tr ? "Hassasiyetler" : "Sensitivities"}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "Lactose", tr: "Laktoz", en: "Lactose" },
              { id: "Fructose", tr: "Fruktoz", en: "Fructose" },
              { id: "MSG", tr: "MSG", en: "MSG" },
              { id: "Caffeine", tr: "Kafein", en: "Caffeine" },
              { id: "Histamine", tr: "Histamin", en: "Histamine" },
            ].map(a => (
              <Badge key={a.id} variant="outline" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                onClick={() => { setNewAllergen(tr ? a.tr : a.en); setNewAllergenSeverity("gi_intolerance" as AllergySeverity); }}>
                {tr ? a.tr : a.en}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Input
              placeholder={tr ? "Alerjen adı..." : "Allergen name..."}
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
              className="flex-1"
            />
            <Select value={newAllergenSeverity} onValueChange={(v) => setNewAllergenSeverity(v as AllergySeverity)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anaphylaxis">{tr ? "🔴 Anafilaksi" : "🔴 Anaphylaxis"}</SelectItem>
                <SelectItem value="urticaria">{tr ? "🟡 Kurdeşen" : "🟡 Urticaria"}</SelectItem>
                <SelectItem value="mild_skin">{tr ? "🟢 Hafif Kaşıntı" : "🟢 Mild Skin"}</SelectItem>
                <SelectItem value="gi_intolerance">{tr ? "🔵 İntolerans" : "🔵 Intolerance"}</SelectItem>
                <SelectItem value="unknown">{tr ? "❓ Bilmiyorum" : "❓ Unknown"}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addAllergy} disabled={!newAllergen.trim()} className="gap-1">
              <Plus className="h-4 w-4" />
              {tr ? "Ekle" : "Add"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
