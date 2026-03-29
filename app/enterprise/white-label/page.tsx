"use client";

import { useState } from "react";
import { Palette, Building2, Shield, Zap, Globe, CheckCircle2, ArrowRight, Star, Settings, Code, Smartphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function WhiteLabelPage() {
  const { lang } = useLang();
  const isTr = lang === "tr";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const features = [
    { icon: <Palette className="w-6 h-6" />, en: "Custom Branding", tr: "Özel Markalama", descEn: "Your logo, colors, and domain", descTr: "Logo, renkler ve domain" },
    { icon: <Shield className="w-6 h-6" />, en: "Enterprise Security", tr: "Kurumsal Güvenlik", descEn: "SOC 2, HIPAA, KVKK compliance", descTr: "SOC 2, HIPAA, KVKK uyumu" },
    { icon: <Globe className="w-6 h-6" />, en: "Multi-language", tr: "Coklu Dil", descEn: "Support for 20+ languages", descTr: "20+ dil desteği" },
    { icon: <Code className="w-6 h-6" />, en: "API Access", tr: "API Erisimi", descEn: "Full REST API and webhooks", descTr: "REST API ve webhook desteği" },
    { icon: <Users className="w-6 h-6" />, en: "User Management", tr: "Kullanıcı Yönetimi", descEn: "SSO, LDAP, role-based access", descTr: "SSO, LDAP, rol bazli erisim" },
    { icon: <Smartphone className="w-6 h-6" />, en: "Mobile Apps", tr: "Mobil Uygulamalar", descEn: "Branded iOS and Android apps", descTr: "Markali iOS ve Android uygulamalar" },
  ];

  const tiers = [
    { name: "Starter", price: "$999/mo", en: "Up to 500 users", tr: "500 kullaniciya kadar", features: ["Custom domain", "Logo branding", "Email support"] },
    { name: "Professional", price: "$2,499/mo", en: "Up to 5,000 users", tr: "5.000 kullaniciya kadar", features: ["Everything in Starter", "API access", "SSO/LDAP", "Priority support"], popular: true },
    { name: "Enterprise", price: isTr ? "Özel Fiyat" : "Custom", en: "Unlimited users", tr: "Sinirsiz kullanici", features: ["Everything in Professional", "Dedicated server", "Custom development", "SLA guarantee"] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{tx("whiteLabel.title", lang)}</h1>
        </div>
        <p className="text-gray-500 mb-8 ml-11">{tx("whiteLabel.subtitle", lang)}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map(f => (
            <Card key={f.en} className="p-4 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3 text-indigo-600">{f.icon}</div>
              <h3 className="font-semibold text-sm">{isTr ? f.tr : f.en}</h3>
              <p className="text-xs text-gray-500 mt-1">{isTr ? f.descTr : f.descEn}</p>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">{tx("whiteLabel.pricing", lang)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tiers.map(t => (
            <Card key={t.name} className={"p-6 relative " + (t.popular ? "border-indigo-500 border-2 shadow-lg" : "")}>
              {t.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white"><Star className="w-3 h-3 mr-1" />{tx("whiteLabel.popular", lang)}</Badge>}
              <h3 className="text-lg font-bold">{t.name}</h3>
              <div className="text-2xl font-bold text-indigo-600 mt-2">{t.price}</div>
              <p className="text-sm text-gray-500 mt-1">{isTr ? t.tr : t.en}</p>
              <div className="mt-4 space-y-2">
                {t.features.map(f => (<div key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500" />{f}</div>))}
              </div>
              <Button className={"w-full mt-4 " + (t.popular ? "bg-indigo-500 hover:bg-indigo-600" : "")} variant={t.popular ? "default" : "outline"}>{tx("whiteLabel.select", lang)}</Button>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">{tx("whiteLabel.requestDemo", lang)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="rounded-lg border px-4 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder={tx("whiteLabel.yourName", lang)} value={name} onChange={e => setName(e.target.value)} />
            <input className="rounded-lg border px-4 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="rounded-lg border px-4 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder={tx("whiteLabel.company", lang)} value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <Button className="w-full mt-3 bg-indigo-500 hover:bg-indigo-600">{tx("whiteLabel.requestDemoBtn", lang)} <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </Card>
      </div>
    </div>
  );
}