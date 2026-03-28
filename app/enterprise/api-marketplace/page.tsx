"use client";

import { useState } from "react";
import { Code, Zap, Shield, Server, Key, Copy, Check, ExternalLink, Lock, Database, Activity, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface APIEndpoint { id: string; name: string; method: string; path: string; descEn: string; descTr: string; price: string; category: string; }

export default function APIMarketplacePage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [copiedSnippet, setCopiedSnippet] = useState("");

  const endpoints: APIEndpoint[] = [
    { id: "1", name: "Drug Interaction Check", method: "POST", path: "/api/v1/interactions", descEn: "Check drug-drug and drug-herb interactions", descTr: "İlaç-ilac ve ilac-bitki etkilesimi kontrolü", price: "$0.02/req", category: "safety" },
    { id: "2", name: "PubMed Search", method: "GET", path: "/api/v1/pubmed/search", descEn: "Search PubMed for evidence-based data", descTr: "PubMed kanita dayali veri arama", price: "$0.01/req", category: "research" },
    { id: "3", name: "Blood Test Analysis", method: "POST", path: "/api/v1/bloodtest/analyze", descEn: "AI-powered blood test interpretation", descTr: "AI destekli kan tahlili yorumlama", price: "$0.05/req", category: "analysis" },
    { id: "4", name: "Supplement Safety", method: "POST", path: "/api/v1/supplements/check", descEn: "Check supplement safety with medications", descTr: "Takviye güvenligini ilaclarla kontrol et", price: "$0.02/req", category: "safety" },
    { id: "5", name: "Generic Alternatives", method: "GET", path: "/api/v1/drugs/alternatives", descEn: "Find generic drug alternatives with pricing", descTr: "Jenerik ilac alternatiflerini fiyatla bul", price: "$0.01/req", category: "data" },
    { id: "6", name: "Health Score", method: "POST", path: "/api/v1/health/score", descEn: "Calculate comprehensive health score", descTr: "Kapsamli saglik skoru hesapla", price: "$0.03/req", category: "analysis" },
  ];

  const pricing = [
    { name: "Developer", reqs: "10K/mo", price: "$49/mo", features: ["All endpoints", "Rate limit: 100/min", "Email support"] },
    { name: "Business", reqs: "100K/mo", price: "$299/mo", features: ["All endpoints", "Rate limit: 1000/min", "Priority support", "Webhooks"] },
    { name: "Enterprise", reqs: "Unlimited", price: isTr ? "Özel" : "Custom", features: ["All endpoints", "No rate limit", "Dedicated support", "SLA", "Custom endpoints"] },
  ];

  const codeSnippet = "curl -X POST https://api.phytotherapy.ai/v1/interactions \\\n  -H \"Authorization: Bearer YOUR_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"medications\":[\"metformin\",\"lisinopril\"],\"supplements\":[\"st_johns_wort\"]}'";

  const copySnippet = () => { navigator.clipboard.writeText(codeSnippet); setCopiedSnippet("main"); setTimeout(() => setCopiedSnippet(""), 2000); };

  const methodColor = (m: string) => m === "GET" ? "bg-green-100 text-green-700" : m === "POST" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Code className="w-8 h-8 text-gray-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isTr ? "API Pazaryeri" : "API Marketplace"}</h1>
            <p className="text-sm text-gray-500">{isTr ? "Sağlık AI API entegrasyonlari" : "Health AI API integrations"}</p>
          </div>
        </div>

        <Card className="p-4 mb-6 bg-gray-900 dark:bg-gray-800 text-gray-100">
          <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400">cURL</span><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={copySnippet}>{copiedSnippet ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</Button></div>
          <pre className="text-xs font-mono overflow-x-auto text-green-400">{codeSnippet}</pre>
        </Card>

        <h2 className="text-lg font-semibold mb-4">{isTr ? "Mevcut API Endpointleri" : "Available Endpoints"}</h2>
        <div className="space-y-3 mb-8">
          {endpoints.map(ep => (
            <Card key={ep.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Badge className={methodColor(ep.method)}>{ep.method}</Badge>
                <code className="text-sm font-mono text-gray-600 dark:text-gray-400 flex-1">{ep.path}</code>
                <Badge variant="outline">{ep.price}</Badge>
              </div>
              <div className="mt-2"><span className="font-medium text-sm">{ep.name}</span><p className="text-xs text-gray-500 mt-0.5">{isTr ? ep.descTr : ep.descEn}</p></div>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">{isTr ? "API Fiyatlandirma" : "API Pricing"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricing.map(p => (
            <Card key={p.name} className="p-6">
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="text-2xl font-bold text-blue-600 mt-1">{p.price}</div>
              <p className="text-sm text-gray-500">{p.reqs} {isTr ? "istek" : "requests"}</p>
              <div className="mt-4 space-y-2">{p.features.map(f => (<div key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" />{f}</div>))}</div>
              <Button className="w-full mt-4" variant="outline"><Key className="w-4 h-4 mr-2" /> {isTr ? "API Anahtari Al" : "Get API Key"}</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}