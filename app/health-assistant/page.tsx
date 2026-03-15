import { FlaskConical } from "lucide-react";

export default function HealthAssistantPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
          <FlaskConical className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Health Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask evidence-based health questions powered by PubMed
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          Health assistant chat interface coming in Sprint 3
        </p>
      </div>
    </div>
  );
}
