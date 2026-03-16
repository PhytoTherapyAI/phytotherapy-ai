"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationHistory } from "@/components/chat/ConversationHistory";

const EXAMPLE_QUESTIONS = [
  "Does omega-3 actually reduce inflammation?",
  "What is the evidence for turmeric (curcumin)?",
  "How does valerian root work for sleep?",
  "Is magnesium effective for anxiety?",
  "What are the benefits of ashwagandha?",
  "Does ginger help with nausea?",
];

export default function HealthAssistantPage() {
  const [loadConversation, setLoadConversation] = useState<{
    query: string;
    response: string | null;
  } | null>(null);

  const handleSelectConversation = (query: string, response: string | null) => {
    // Use a new object reference each time to trigger the effect even for the same conversation
    setLoadConversation({ query, response });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold">Health Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Ask evidence-based health questions — powered by PubMed research
            </p>
          </div>
        </div>
        <ConversationHistory onSelectConversation={handleSelectConversation} />
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
              className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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
      <ChatInterface
        className="h-[calc(100vh-280px)] min-h-[500px]"
        loadConversation={loadConversation}
      />

      {/* Disclaimer */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        ⚠️ This tool provides general health information based on published
        research. It is not a substitute for professional medical advice.
        Always consult your healthcare provider.
      </p>
    </main>
  );
}
