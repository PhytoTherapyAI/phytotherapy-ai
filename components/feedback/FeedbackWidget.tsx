// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useLang } from "@/components/layout/language-toggle"
import { MessageSquarePlus, X, Send, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const HIDDEN_PATHS = ["/health-assistant", "/interaction-checker", "/blood-test"]

export function FeedbackWidget() {
  const pathname = usePathname()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"ask" | "form" | "done">("ask")
  const [pageWorks, setPageWorks] = useState<boolean | null>(null)
  const [broken, setBroken] = useState("")
  const [wishlist, setWishlist] = useState("")
  const [sending, setSending] = useState(false)

  if (HIDDEN_PATHS.includes(pathname)) return null

  const handleSubmit = async () => {
    setSending(true)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          page_works: pageWorks,
          broken_description: broken,
          feature_request: wishlist,
          lang,
        }),
      })
      setStep("done")
    } catch {
      setStep("done")
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setOpen(false)
    setStep("ask")
    setPageWorks(null)
    setBroken("")
    setWishlist("")
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Feedback"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">
              {isTr ? "Geri Bildirim" : "Feedback"}
            </span>
            <button onClick={reset} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {step === "ask" && (
              <div className="space-y-3">
                <p className="text-sm">{isTr ? "Bu sayfa dogru calisiyor mu?" : "Did this page work correctly?"}</p>
                <div className="flex gap-3">
                  <Button
                    variant={pageWorks === true ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => { setPageWorks(true); setStep("form") }}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {isTr ? "Evet" : "Yes"}
                  </Button>
                  <Button
                    variant={pageWorks === false ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => { setPageWorks(false); setStep("form") }}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {isTr ? "Hayir" : "No"}
                  </Button>
                </div>
              </div>
            )}

            {step === "form" && (
              <div className="space-y-3">
                {pageWorks === false && (
                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      {isTr ? "Ne bozuktu?" : "What was broken?"}
                    </label>
                    <Textarea
                      rows={2}
                      value={broken}
                      onChange={(e) => setBroken(e.target.value)}
                      placeholder={isTr ? "Sorunu aciklayiniz..." : "Describe the issue..."}
                      className="text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    {isTr ? "Ne gormek istersiniz?" : "What would you like to see?"}
                  </label>
                  <Textarea
                    rows={2}
                    value={wishlist}
                    onChange={(e) => setWishlist(e.target.value)}
                    placeholder={isTr ? "Onerinizi yaziniz..." : "Your suggestion..."}
                    className="text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={handleSubmit}
                  disabled={sending}
                >
                  <Send className="h-3.5 w-3.5" />
                  {sending ? (isTr ? "Gonderiliyor..." : "Sending...") : (isTr ? "Gonder" : "Send")}
                </Button>
              </div>
            )}

            {step === "done" && (
              <div className="text-center py-4">
                <ThumbsUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {isTr ? "Tesekkurler!" : "Thank you!"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isTr ? "Geri bildiriminiz alindi." : "Your feedback has been received."}
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={reset}>
                  {isTr ? "Kapat" : "Close"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
