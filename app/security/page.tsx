"use client"

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle, Key, Database } from "lucide-react"

export default function SecurityPage() {
  const { lang } = useLang()

  const sections = [
    { icon: Lock, titleKey: "security.dataEncryption", descKey: "security.dataEncryptionDesc", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { icon: Shield, titleKey: "security.kvkkGdpr", descKey: "security.kvkkGdprDesc", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
    { icon: Key, titleKey: "security.authentication", descKey: "security.authenticationDesc", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { icon: Server, titleKey: "security.infrastructure", descKey: "security.infrastructureDesc", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
    { icon: Eye, titleKey: "security.accessControl", descKey: "security.accessControlDesc", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
    { icon: Database, titleKey: "security.dataMinimization", descKey: "security.dataMinimizationDesc", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/20" },
    { icon: FileCheck, titleKey: "security.inputValidation", descKey: "security.inputValidationDesc", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
    { icon: AlertTriangle, titleKey: "security.errorMonitoring", descKey: "security.errorMonitoringDesc", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-semibold">
            {tx("security.title", lang)}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {tx("security.subtitle", lang)}
          </p>
        </div>

        <div className="grid gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon
            return (
              <Card key={i} className="p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{tx(s.titleKey, lang)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tx(s.descKey, lang)}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8 p-6 text-center bg-primary/5 border-primary/20">
          <p className="text-sm font-medium">
            {tx("security.reportVulnerability", lang)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">security@phytotherapy.ai</p>
        </Card>
      </div>
    </div>
  )
}
