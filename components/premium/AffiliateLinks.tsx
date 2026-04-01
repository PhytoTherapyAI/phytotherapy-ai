// © 2026 Doctopal — All Rights Reserved
"use client"

import { ExternalLink, Info } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { getAffiliateLinks, AFFILIATE_DISCLAIMER } from "@/lib/affiliate"

interface AffiliateLinksProps {
  supplementName: string
}

export function AffiliateLinks({ supplementName }: AffiliateLinksProps) {
  const { lang } = useLang()
  const links = getAffiliateLinks(supplementName)

  if (links.length === 0) return null

  return (
    <div className="mt-3 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {tx("affiliate.whereToBuy", lang)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
          >
            {link.pharmacy}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
      {links[0]?.note && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">{links[0].note}</p>
      )}
      <div className="mt-2 flex items-start gap-1">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/50" />
        <p className="text-[9px] text-muted-foreground/60">
          {AFFILIATE_DISCLAIMER[lang]}
        </p>
      </div>
    </div>
  )
}
