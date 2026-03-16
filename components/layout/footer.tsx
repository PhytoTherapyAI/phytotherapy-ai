import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-gold/20 bg-gold/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Medical Disclaimer:</strong> Phytotherapy.ai is an educational
          wellness tool and does not provide medical diagnosis or treatment. All
          recommendations are based on published scientific research. Always
          consult your healthcare provider before starting any supplement or
          making changes to your medication.
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="font-heading">&copy; {new Date().getFullYear()} Phytotherapy.ai</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Evidence-based integrative medicine &middot; Backed by peer-reviewed research
          </p>
        </div>
      </div>
    </footer>
  );
}
