// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Flame, TrendingDown, TrendingUp, Minus, Ruler, Scale } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"

interface CalorieCalculatorProps {
  lang: Lang
  defaultAge?: number | null
  defaultGender?: string | null
  defaultHeight?: number | null
  defaultWeight?: number | null
}

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "extra"
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
}

interface WeightEntry {
  date: string
  weight: number
}

export function CalorieCalculator({
  lang,
  defaultAge,
  defaultGender,
  defaultHeight,
  defaultWeight,
}: CalorieCalculatorProps) {
  const [age, setAge] = useState(defaultAge ?? 25)
  const [gender, setGender] = useState<"male" | "female">(
    defaultGender === "female" ? "female" : "male"
  )
  const [height, setHeight] = useState(defaultHeight ?? 170)
  const [weight, setWeight] = useState(defaultWeight ?? 70)
  const [activity, setActivity] = useState<ActivityLevel>("moderate")
  const [result, setResult] = useState<number | null>(null)
  const tr = lang === "tr"

  // Advanced body measurements
  const [waist, setWaist] = useState<number>(0)
  const [neck, setNeck] = useState<number>(0)
  const [hip, setHip] = useState<number>(0) // for females
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Weight tracking
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("weight-history")
      if (saved) setWeightHistory(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const saveWeight = () => {
    const today = new Date().toISOString().split("T")[0]
    const updated = [...weightHistory.filter(e => e.date !== today), { date: today, weight }]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Keep last 30 entries
    setWeightHistory(updated)
    localStorage.setItem("weight-history", JSON.stringify(updated))
  }

  const calculate = () => {
    // Mifflin-St Jeor equation
    let bmr: number
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }
    const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity])
    setResult(tdee)
    saveWeight()
  }

  // BMI calculation
  const bmi = height > 0 ? (weight / ((height / 100) ** 2)) : 0
  const bmiCategory = bmi < 18.5 ? tx("calorie.bmiUnderweight", lang)
    : bmi < 25 ? tx("calorie.bmiNormal", lang)
    : bmi < 30 ? tx("calorie.bmiOverweight", lang)
    : tx("calorie.bmiObese", lang)
  const bmiColor = bmi < 18.5 ? "text-blue-500" : bmi < 25 ? "text-green-500" : bmi < 30 ? "text-amber-500" : "text-red-500"

  // Body fat estimation (US Navy method)
  const bodyFat = (() => {
    if (!waist || !neck || !height) return null
    if (gender === "male") {
      if (waist <= neck) return null
      return Math.round((495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450) * 10) / 10
    } else {
      if (!hip || (waist + hip) <= neck) return null
      return Math.round((495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450) * 10) / 10
    }
  })()

  // Weight trend
  const weightTrend = weightHistory.length >= 2
    ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
    : null

  const activityOptions: { key: ActivityLevel; labelKey: string }[] = [
    { key: "sedentary", labelKey: "calorie.sedentary" },
    { key: "light", labelKey: "calorie.light" },
    { key: "moderate", labelKey: "calorie.moderate" },
    { key: "active", labelKey: "calorie.active" },
    { key: "extra", labelKey: "calorie.extra" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" />
          {tx("calorie.title", lang)}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{tx("calorie.subtitle", lang)}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gender toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setGender("male")}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              gender === "male" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            {tx("calorie.male", lang)}
          </button>
          <button
            onClick={() => setGender("female")}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              gender === "female" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            {tx("calorie.female", lang)}
          </button>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{tx("calorie.age", lang)}</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              min={1}
              max={120}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{tx("calorie.height", lang)}</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={100}
              max={250}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{tx("calorie.weight", lang)}</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              min={20}
              max={300}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* BMI Display */}
        {height > 0 && weight > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <span className="text-xs text-muted-foreground">BMI</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${bmiColor}`}>{bmi.toFixed(1)}</span>
              <span className={`text-[10px] ${bmiColor}`}>{bmiCategory}</span>
            </div>
          </div>
        )}

        {/* Advanced measurements toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Ruler className="h-3 w-3" />
          {showAdvanced
            ? tx("calorie.hideAdvanced", lang)
            : tx("calorie.calcBodyFat", lang)
          }
        </button>

        {showAdvanced && (
          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {tx("calorie.usNavy", lang)}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">
                  {tx("calorie.waist", lang)}
                </label>
                <input
                  type="number"
                  value={waist || ""}
                  onChange={(e) => setWaist(Number(e.target.value))}
                  placeholder="cm"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">
                  {tx("calorie.neck", lang)}
                </label>
                <input
                  type="number"
                  value={neck || ""}
                  onChange={(e) => setNeck(Number(e.target.value))}
                  placeholder="cm"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              {gender === "female" && (
                <div className="col-span-2">
                  <label className="mb-1 block text-[10px] text-muted-foreground">
                    {tx("calorie.hip", lang)}
                  </label>
                  <input
                    type="number"
                    value={hip || ""}
                    onChange={(e) => setHip(Number(e.target.value))}
                    placeholder="cm"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
            {bodyFat !== null && (
              <div className="rounded-lg border bg-background px-3 py-2 text-center">
                <span className="text-xs text-muted-foreground">{tx("calorie.estBodyFat", lang)}</span>
                <p className={`text-xl font-bold ${
                  bodyFat < 15 ? "text-blue-500" : bodyFat < 25 ? "text-green-500" : bodyFat < 35 ? "text-amber-500" : "text-red-500"
                }`}>
                  {bodyFat}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Activity level */}
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">{tx("calorie.activity", lang)}</label>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setActivity(opt.key)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activity === opt.key
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:border-primary/30"
                }`}
              >
                {tx(opt.labelKey, lang)}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={calculate} className="w-full" size="sm">
          <Flame className="mr-2 h-4 w-4" />
          {tx("calorie.calculate", lang)}
        </Button>

        {/* Result */}
        {result !== null && (
          <div className="rounded-xl border bg-primary/5 p-4 space-y-3">
            <p className="text-center text-xs text-muted-foreground">{tx("calorie.result", lang)}</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3" /> {tx("calorie.lose", lang)}
                </div>
                <span className="text-lg font-semibold text-amber-600">{result - 500}</span>
              </div>
              <div className="text-center border-x px-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Minus className="h-3 w-3" /> {tx("calorie.maintain", lang)}
                </div>
                <span className="text-2xl font-bold text-primary">{result}</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" /> {tx("calorie.gain", lang)}
                </div>
                <span className="text-lg font-semibold text-blue-600">{result + 500}</span>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground">{tx("calorie.kcal", lang)}</p>
          </div>
        )}

        {/* Weight Trend */}
        {weightHistory.length >= 2 && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Scale className="h-3 w-3" />
                {tx("calorie.weightTrend", lang)}
              </span>
              {weightTrend !== null && (
                <span className={`text-xs font-bold ${weightTrend < 0 ? "text-green-500" : weightTrend > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {weightTrend > 0 ? "+" : ""}{weightTrend.toFixed(1)} kg
                </span>
              )}
            </div>
            {/* Simple bar chart */}
            <div className="flex items-end gap-1 h-12">
              {weightHistory.slice(-14).map((entry, i) => {
                const min = Math.min(...weightHistory.map(e => e.weight))
                const max = Math.max(...weightHistory.map(e => e.weight))
                const range = max - min || 1
                const pct = ((entry.weight - min) / range) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-primary/60 transition-all"
                    style={{ height: `${Math.max(10, pct)}%` }}
                    title={`${entry.date}: ${entry.weight}kg`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">
                {weightHistory[Math.max(0, weightHistory.length - 14)]?.date}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {weightHistory[weightHistory.length - 1]?.date}
              </span>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground italic">{tx("calorie.disclaimer", lang)}</p>
      </CardContent>
    </Card>
  )
}
