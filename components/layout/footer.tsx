import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <strong>Medical Disclaimer:</strong> Phytotherapy.ai is an educational
          wellness tool and does not provide medical diagnosis or treatment. All
          recommendations are based on published scientific research. Always
          consult your healthcare provider before starting any supplement or
          making changes to your medication.
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <span>&copy; {new Date().getFullYear()} Phytotherapy.ai</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Evidence-based phytotherapy meets modern medicine
          </p>
        </div>
      </div>
    </footer>
  );
}
