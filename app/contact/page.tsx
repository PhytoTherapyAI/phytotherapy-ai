// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send")
      }
      setSent(true)
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isTr ? "Gönderim başarısız oldu" : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-semibold">
            {tx("contact.title", lang)}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {tx("contact.subtitle", lang)}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Card className="p-5 text-center">
            <Mail className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-medium text-sm">{tx("contact.email", lang)}</p>
            <p className="text-xs text-muted-foreground mt-1">hello@doctopal.com</p>
          </Card>
          <Card className="p-5 text-center">
            <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-medium text-sm">{tx("contact.support", lang)}</p>
            <p className="text-xs text-muted-foreground mt-1">{tx("contact.responseTime", lang)}</p>
          </Card>
          <Card className="p-5 text-center">
            <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-medium text-sm">{tx("contact.location", lang)}</p>
            <p className="text-xs text-muted-foreground mt-1">Istanbul, Turkey</p>
          </Card>
        </div>

        {sent ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {tx("contact.messageReceived", lang)}
            </h2>
            <p className="text-muted-foreground">
              {tx("contact.willGetBack", lang)}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setSent(false)}>
              {tx("contact.sendAnother", lang)}
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {tx("contact.yourName", lang)}
                  </label>
                  <Input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={tx("contact.fullName", lang)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {tx("contact.email", lang)}
                  </label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {tx("contact.subject", lang)}
                </label>
                <Input
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder={tx("contact.subjectPlaceholder", lang)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {tx("contact.yourMessage", lang)}
                </label>
                <Textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={tx("contact.messagePlaceholder", lang)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full gap-2" disabled={sending}>
                <Send className="w-4 h-4" />
                {sending ? (isTr ? "Gönderiliyor..." : "Sending...") : tx("contact.send", lang)}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
