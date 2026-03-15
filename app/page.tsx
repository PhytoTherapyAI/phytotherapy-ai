import Link from "next/link";
import { Leaf, Shield, FlaskConical, FileText, ArrowRight } from "lucide-react";

const features = [
  {
    href: "/interaction-checker",
    icon: Shield,
    title: "Drug-Herb Interaction Checker",
    description:
      "Enter your medications and get safe, evidence-based herbal recommendations. Every interaction checked against scientific databases.",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  {
    href: "/health-assistant",
    icon: FlaskConical,
    title: "Health Assistant",
    description:
      "Ask any health question and get answers backed by PubMed research. Dosage, duration, and scientific references included.",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    href: "/blood-test",
    icon: FileText,
    title: "Blood Test Analysis",
    description:
      "Upload your blood test results and get personalized supplement and lifestyle recommendations with your doctor-ready PDF report.",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Leaf className="h-4 w-4" />
          Evidence-Based Integrative Medicine
        </div>

        <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Where Modern Medicine Meets{" "}
          <span className="text-emerald-600">Nature&apos;s Power</span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-muted-foreground">
          AI-powered health assistant that checks drug-herb interactions,
          analyzes blood tests, and provides personalized recommendations — all
          backed by PubMed research.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/interaction-checker"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Check Drug Interactions
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/health-assistant"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Ask Health Question
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group rounded-xl border p-6 transition-all hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex rounded-lg p-3 ${feature.bgColor}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                Get started <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t bg-muted/30 px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center sm:flex-row sm:justify-center sm:text-left">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-2xl font-bold text-emerald-600">PubMed</span>
            <span className="text-xs text-muted-foreground">
              Verified Sources
            </span>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-2xl font-bold text-emerald-600">OpenFDA</span>
            <span className="text-xs text-muted-foreground">Drug Database</span>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-2xl font-bold text-emerald-600">
              3-Layer
            </span>
            <span className="text-xs text-muted-foreground">
              Safety System
            </span>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-2xl font-bold text-emerald-600">AI</span>
            <span className="text-xs text-muted-foreground">
              Gemini Powered
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
