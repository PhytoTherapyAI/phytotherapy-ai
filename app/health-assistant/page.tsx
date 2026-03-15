"use client";

import { Sparkles } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";

const EXAMPLE_QUESTIONS = [
  "Does omega-3 actually reduce inflammation?",
  "What is the evidence for turmeric (curcumin)?",
  "How does valerian root work for sleep?",
  "Is magnesium effective for anxiety?",
  "What are the benefits of ashwagandha?",
  "Does ginger help with nausea?",
];

export default function HealthAssistantPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
          <Sparkles className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Health Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask evidence-based health questions — powered by PubMed research
          </p>
        </div>
      </div>

      {/* Example Questions */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Try asking:
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-emerald-500 hover:text-emerald-600"
              onClick={() => {
                // Find the textarea and set its value
                const textarea = document.querySelector("textarea");
                if (textarea) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype,
                    "value"
                  )?.set;
                  nativeInputValueSetter?.call(textarea, q);
                  textarea.dispatchEvent(new Event("input", { bubbles: true }));
                  textarea.dispatchEvent(new Event("change", { bubbles: true }));
                  textarea.focus();
                }
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface className="h-[calc(100vh-280px)] min-h-[500px]" />

      {/* Disclaimer */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        ⚠️ This tool provides general health information based on published
        research. It is not a substitute for professional medical advice.
        Always consult your healthcare provider.
      </p>
    </main>
  );
}
