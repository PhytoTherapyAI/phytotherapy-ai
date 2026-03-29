"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-semibold">
            {isTr ? "Bize Ulasin" : "Contact Us"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {isTr
              ? "Sorulariniz, onerileriniz veya geri bildirimleriniz icin bize yazin."
              : "Questions, suggestions, or feedback? We'd love to hear from you."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Card className="p-5 text-center">
            <Mail className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-medium text-sm">{isTr ? "E-posta" : "Email"}</p>
            <p className="text-xs text-muted-foreground mt-1">hello@phytotherapy.ai</p>
          </Card>
          <Card className="p-5 text-center">
            <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-medium text-sm">{isTr ? "Destek" : "Support"}</p>
            <p className="text-xs text-muted-foreground mt-1">{isTr ? "24 saat icinde yanit" : "Response within 24 hours"}</p>
          </Card>
          <Card className="p-5 text-center">
            <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-medium text-sm">{isTr ? "Konum" : "Location"}</p>
            <p className="text-xs text-muted-foreground mt-1">Istanbul, Turkey</p>
          </Card>
        </div>

        {sent ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isTr ? "Mesajiniz alindi!" : "Message received!"}
            </h2>
            <p className="text-muted-foreground">
              {isTr
                ? "En kisa surede size geri donecegiz."
                : "We'll get back to you as soon as possible."}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setSent(false)}>
              {isTr ? "Yeni mesaj gonder" : "Send another message"}
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isTr ? "Adiniz" : "Your Name"}
                  </label>
                  <Input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={isTr ? "Ad Soyad" : "Full Name"}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isTr ? "E-posta" : "Email"}
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
                  {isTr ? "Konu" : "Subject"}
                </label>
                <Input
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder={isTr ? "Konu basliginiz" : "What is this about?"}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {isTr ? "Mesajiniz" : "Your Message"}
                </label>
                <Textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={isTr ? "Mesajinizi buraya yazin..." : "Write your message here..."}
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Send className="w-4 h-4" />
                {isTr ? "Gonder" : "Send Message"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
