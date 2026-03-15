"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, FileText } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function ConsentStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      {/* Medical Disclaimer */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Medical Disclaimer</h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Phytotherapy.ai is a <strong>wellness and decision-support tool</strong>, not a medical device.
            It does not diagnose, treat, cure, or prevent any disease.
          </p>
          <p>
            All recommendations are based on published scientific literature (PubMed, NIH, WHO) and
            are provided for <strong>informational purposes only</strong>.
          </p>
          <p>
            <strong>You must consult your healthcare provider</strong> before starting, stopping, or
            changing any medication, supplement, or herbal product. This is especially important if you:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Take prescription medications</li>
            <li>Have chronic health conditions</li>
            <li>Are pregnant, breastfeeding, or planning pregnancy</li>
            <li>Are scheduled for surgery</li>
          </ul>
          <p>
            Phytotherapy.ai and its developers are <strong>not liable</strong> for any health outcomes
            resulting from the use of information provided by this service.
          </p>
        </div>
      </div>

      {/* Data Privacy Summary */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Data Privacy</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Your health data is:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Encrypted and stored securely on Supabase servers</li>
            <li>Only accessible by you — never shared with third parties</li>
            <li>Deletable at any time via your profile settings</li>
            <li>Retained for a maximum of 2 years</li>
          </ul>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="consent"
            checked={data.consent_agreed}
            onCheckedChange={(checked) => updateData({ consent_agreed: checked === true })}
            className="mt-1"
          />
          <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
            I have read and understood the Medical Disclaimer and Data Privacy notice above.
            I understand that Phytotherapy.ai is not a substitute for professional medical advice,
            and I will consult my healthcare provider before acting on any recommendations.
          </Label>
        </div>
      </div>
    </div>
  );
}
