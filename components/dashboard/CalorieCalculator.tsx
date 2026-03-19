"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Flame, TrendingDown, TrendingUp, Minus } from "lucide-react"
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
  }

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
            <p className="text-center text-[10px] text-muted-foreground italic">{tx("calorie.disclaimer", lang)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
