"use client";

import { useState } from "react";
import {
  TreePine,
  Plus,
  X,
  Loader2,
  LogIn,
  Sparkles,
  AlertTriangle,
  Shield,
  Heart,
  Lightbulb,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface FamilyMember {
  id: string;
  relation: string;
  conditions: string[];
}

interface TreeResult {
  overallRiskAssessment: string;
  hereditaryPatterns: Array<{ condition: string; affectedRelatives: string[]; inheritancePattern: string; yourRiskMultiplier: string; geneticTestRecommended: boolean; specificTest: string }>;
  screeningRecommendations: Array<{ condition: string; startAge: string; frequency: string; test: string; reason: string }>;
  geneticCounselingAdvice: string;
  protectiveFactors: Array<{ factor: string; benefit: string }>;
  keyInsights: string[];
}

const RELATIONS = {
  en: ["Mother", "Father", "Sister", "Brother", "Maternal grandmother", "Maternal grandfather", "Paternal grandmother", "Paternal grandfather", "Maternal aunt", "Maternal uncle", "Paternal aunt", "Paternal uncle", "Daughter", "Son"],
  tr: ["Anne", "Baba", "Kiz kardes", "Erkek kardes", "Anneanne", "Dede (anne tarafi)", "Babaanne", "Dede (baba tarafi)", "Teyze", "Dayi", "Hala", "Amca", "Kiz cocuk", "Erkek cocuk"],
};

const CONDITIONS = {
  en: ["Breast cancer", "Colon cancer", "Lung cancer", "Prostate cancer", "Ovarian cancer", "Heart disease", "Stroke", "Type 2 diabetes", "Alzheimer's", "Parkinson's", "High blood pressure", "High cholesterol", "Autoimmune disease", "Thyroid disorder", "Kidney disease", "Depression", "Osteoporosis", "Melanoma"],
  tr: ["Meme kanseri", "Kolon kanseri", "Akciger kanseri", "Prostat kanseri", "Over kanseri", "Kalp hastaligi", "Inme", "Tip 2 diyabet", "Alzheimer", "Parkinson", "Yuksek tansiyon", "Yuksek kolesterol", "Otoimmun hastalik", "Tiroid bozuklugu", "Bobrek hastaligi", "Depresyon", "Osteoporoz", "Melanom"],
};

export default function FamilyHealthTreePage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TreeResult | null>(null);

  const addMember = () => {
    setMembers([...members, { id: Date.now().toString(), relation: RELATIONS.en[0], conditions: [] }]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateRelation = (id: string, relation: string) => {
    setMembers(members.map((m) => m.id === id ? { ...m, relation } : m));
  };

  const toggleCondition = (memberId: string, condition: string) => {
    setMembers(members.map((m) => {
      if (m.id !== memberId) return m;
      const conditions = m.conditions.includes(condition)
        ? m.conditions.filter((c) => c !== condition)
        : [...m.conditions, condition];
      return { ...m, conditions };
    }));
  };

  const handleAnalyze = async () => {
    if (!session?.access_token || members.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/family-health-tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          family_members: members.filter((m) => m.conditions.length > 0),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("familytree.title", lang)}</h1>
          <p className="text-muted-foreground">{lang === "tr" ? "Bu araci kullanmak icin giris yapin" : "Please log in to use this tool"}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  const relations = RELATIONS[lang];
  const conditions = CONDITIONS[lang];
  const conditionsEN = CONDITIONS.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <TreePine className="w-4 h-4" />
            {tx("familytree.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("familytree.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("familytree.subtitle", lang)}</p>
        </div>

        {/* Family Members Input */}
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="bg-card border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <select
                  value={member.relation}
                  onChange={(e) => updateRelation(member.id, e.target.value)}
                  className="px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {RELATIONS.en.map((rel, i) => (
                    <option key={rel} value={rel}>{relations[i]}</option>
                  ))}
                </select>
                <button onClick={() => removeMember(member.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{lang === "tr" ? "Sağlık Durumlari" : "Health Conditions"}</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {conditions.map((cond, i) => (
                    <button
                      key={cond}
                      onClick={() => toggleCondition(member.id, conditionsEN[i])}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        member.conditions.includes(conditionsEN[i])
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Button onClick={addMember} variant="outline" className="w-full border-dashed border-2">
            <Plus className="w-4 h-4 mr-2" /> {tx("familytree.addMember", lang)}
          </Button>
        </div>

        {/* Analyze Button */}
        {members.length > 0 && (
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || members.every((m) => m.conditions.length === 0)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Analiz ediliyor..." : "Analyzing..."}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{tx("familytree.analyze", lang)}</>
            )}
          </Button>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Assessment */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                {lang === "tr" ? "Genel Degerlendirme" : "Overall Assessment"}
              </h3>
              <p className="text-sm">{result.overallRiskAssessment}</p>
            </div>

            {/* Hereditary Patterns */}
            {result.hereditaryPatterns?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-500" />
                  {lang === "tr" ? "Kalitsal Risk Oruntuleri" : "Hereditary Risk Patterns"}
                </h2>
                <div className="grid gap-4">
                  {result.hereditaryPatterns.map((pattern, i) => (
                    <div key={i} className={`border rounded-xl p-4 space-y-2 ${
                      pattern.geneticTestRecommended ? "border-amber-200 dark:border-amber-800" : "border-border"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{pattern.condition}</span>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">{pattern.yourRiskMultiplier}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.inheritancePattern}</p>
                      <p className="text-xs text-muted-foreground">
                        {lang === "tr" ? "Etkilenen yakinlar:" : "Affected relatives:"} {pattern.affectedRelatives.join(", ")}
                      </p>
                      {pattern.geneticTestRecommended && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-sm text-amber-700 dark:text-amber-400">
                          {lang === "tr" ? "Onerilen genetik test:" : "Recommended genetic test:"} {pattern.specificTest}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Screening */}
            {result.screeningRecommendations?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  {lang === "tr" ? "Tarama Önerileri" : "Screening Recommendations"}
                </h2>
                <div className="grid gap-3">
                  {result.screeningRecommendations.map((rec, i) => (
                    <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <div className="font-medium">{rec.condition} — {rec.test}</div>
                      <div className="text-sm text-muted-foreground">{rec.startAge} | {rec.frequency}</div>
                      <div className="text-sm mt-1">{rec.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Protective Factors */}
            {result.protectiveFactors?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-500" />
                  {lang === "tr" ? "Koruyucu Faktorler" : "Protective Factors"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.protectiveFactors.map((factor, i) => (
                    <div key={i} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-1">
                      <div className="font-medium">{factor.factor}</div>
                      <div className="text-sm text-muted-foreground">{factor.benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Genetic Counseling */}
            {result.geneticCounselingAdvice && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <h3 className="font-medium flex items-center gap-2 mb-1 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  {lang === "tr" ? "Genetik Danismanlik" : "Genetic Counseling"}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-300">{result.geneticCounselingAdvice}</p>
              </div>
            )}

            {/* Key Insights */}
            {result.keyInsights?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  {lang === "tr" ? "Onemli Bilgiler" : "Key Insights"}
                </h2>
                {result.keyInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {insight}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
