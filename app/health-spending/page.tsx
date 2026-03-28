"use client";

import { useState, useEffect, useMemo } from "react";
import { Wallet, Plus, Trash2, Pill, Stethoscope, TestTube, Leaf, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = [
  { value: "medications", icon: <Pill className="w-4 h-4" />, en: "Medications", tr: "İlaçlar", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
  { value: "supplements", icon: <Leaf className="w-4 h-4" />, en: "Supplements", tr: "Takviyeler", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
  { value: "doctor", icon: <Stethoscope className="w-4 h-4" />, en: "Doctor Visits", tr: "Doktor Ziyaretleri", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { value: "tests", icon: <TestTube className="w-4 h-4" />, en: "Tests & Labs", tr: "Test & Tahlil", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
];

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("phyto_health_spending");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveExpenses(expenses: Expense[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("phyto_health_spending", JSON.stringify(expenses));
}

export default function HealthSpendingPage() {
  const { lang } = useLang();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("medications");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setExpenses(loadExpenses());
  }, []);

  const addExpense = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: numAmount,
      category,
      description: description.trim(),
      date,
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setAmount("");
    setDescription("");
    setShowForm(false);
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTotal = useMemo(() => {
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonth, currentYear]);

  const yearlyTotal = useMemo(() => {
    return expenses
      .filter((e) => new Date(e.date).getFullYear() === currentYear)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentYear]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses
      .filter((e) => new Date(e.date).getFullYear() === currentYear)
      .forEach((e) => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
      });
    return totals;
  }, [expenses, currentYear]);

  const getCat = (value: string) => CATEGORIES.find((c) => c.value === value) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("spending.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("spending.subtitle", lang)}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tx("spending.monthly", lang)}</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {monthlyTotal.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} TL
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tx("spending.yearly", lang)}</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {yearlyTotal.toLocaleString("tr-TR", { minimumFractionDigits: 0 })} TL
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {lang === "tr" ? "Kategori Dagılımı" : "Category Breakdown"}
              </h3>
            </div>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => {
                const total = categoryTotals[cat.value] || 0;
                if (total === 0) return null;
                const pct = yearlyTotal > 0 ? (total / yearlyTotal) * 100 : 0;
                return (
                  <div key={cat.value} className="flex items-center gap-3">
                    <div className={`${cat.color}`}>{cat.icon}</div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-28">{lang === "tr" ? cat.tr : cat.en}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                      {total.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl mb-6 gap-2"
          >
            <Plus className="w-5 h-5" />
            {tx("spending.addExpense", lang)}
          </Button>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-emerald-100 dark:border-gray-700 p-6 mb-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">{tx("spending.addExpense", lang)}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={lang === "tr" ? "Tutar (TL)" : "Amount (TL)"}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                      category === cat.value
                        ? `${cat.bg} ${cat.color} border-current ring-1 ring-current`
                        : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {cat.icon}
                    {lang === "tr" ? cat.tr : cat.en}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === "tr" ? "Açıklama (isteğe bağlı)" : "Description (optional)"}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                onClick={addExpense}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {lang === "tr" ? "Ekle" : "Add"}
              </Button>
            </div>
          </div>
        )}

        {/* Expense List */}
        <div className="space-y-2">
          {expenses.slice(0, 50).map((exp) => {
            const cat = getCat(exp.category);
            return (
              <div key={exp.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className={`${cat.bg} p-2 rounded-lg ${cat.color}`}>{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {exp.description || (lang === "tr" ? cat.tr : cat.en)}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString(tx("common.locale", lang))}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  {exp.amount.toLocaleString("tr-TR")} TL
                </span>
                <button
                  onClick={() => deleteExpense(exp.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{lang === "tr" ? "Henuz harcama kaydi yok" : "No expenses recorded yet"}</p>
          </div>
        )}

        {/* Tax Info */}
        <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-2">
            {lang === "tr" ? "Vergi İndirimi Bilgisi" : "Tax Deduction Info"}
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {lang === "tr"
              ? "Türkiye'de sağlık harcamalari yillik gelir vergisi beyannamesinde indirim olarak gosterilebilir. SGK katilim paylari, ilac, ozel hastane, dis ve goz masraflari için fatura ve makbuzlarinizi saklayin. Yillik toplam gelirin %10'unu gecmeyen sağlık harcamalari indirilebilir."
              : "In Turkey, health expenses can be deducted in annual income tax returns. Keep receipts for SGK copays, medications, private hospital visits, dental and eye care. Health expenses up to 10% of annual income may be deductible."}
          </p>
        </div>
      </div>
    </div>
  );
}
