import { Shield } from "lucide-react";

export default function InteractionCheckerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
          <Shield className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Drug-Herb Interaction Checker</h1>
          <p className="text-sm text-muted-foreground">
            Enter your medications and find safe herbal alternatives
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          Interaction checker interface coming in Sprint 2
        </p>
      </div>
    </div>
  );
}
