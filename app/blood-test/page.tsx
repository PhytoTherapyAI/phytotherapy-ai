import { FileText } from "lucide-react";

export default function BloodTestPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <FileText className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Blood Test Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Get personalized recommendations from your blood test results
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          Blood test analysis interface coming in Sprint 4
        </p>
      </div>
    </div>
  );
}
