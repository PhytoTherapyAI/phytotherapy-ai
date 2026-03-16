'use client'

import { Leaf } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle"

export function Footer() {
  const { lang } = useLang()
  const t = {
    disclaimer: lang === 'en'
      ? 'Medical Disclaimer:'
      : 'Tıbbi Sorumluluk Reddi:',
    disclaimerText: lang === 'en'
      ? 'Phytotherapy.ai is an educational wellness tool and does not provide medical diagnosis or treatment. All recommendations are based on published scientific research. Always consult your healthcare provider before starting any supplement or making changes to your medication.'
      : 'Phytotherapy.ai bir eğitim amaçlı sağlık aracıdır; tıbbi teşhis veya tedavi sunmaz. Tüm öneriler yayımlanmış bilimsel araştırmalara dayanır. Herhangi bir takviye başlamadan veya ilaç değişikliği yapmadan önce sağlık profesyonelinize danışın.',
    tagline: lang === 'en'
      ? 'Evidence-based integrative medicine · Backed by peer-reviewed research'
      : 'Kanıta dayalı bütünleştirici tıp · Hakemli araştırmalarla desteklenir',
    copyright: `© ${new Date().getFullYear()} Phytotherapy.ai`,
  }

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-gold/20 bg-gold/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">{t.disclaimer}</strong> {t.disclaimerText}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="font-heading">{t.copyright}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
