// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useRef } from "react";
import { CreditCard, LogIn, Printer, Phone, Heart, Pill, AlertTriangle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function EmergencyIdPage() {
  const { isAuthenticated, session, profile } = useAuth();
  const { lang } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);
  const [emergencyContact, setEmergencyContact] = useState({ name: "", phone: "" });
  const [showCard, setShowCard] = useState(false);

  const handlePrint = () => {
    if (!cardRef.current) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Emergency ID Card</title>
        <style>
          body{margin:0;padding:20px;font-family:system-ui,sans-serif}
          .card{border:3px solid #dc2626;border-radius:16px;padding:24px;max-width:400px;margin:0 auto}
          .header{background:#dc2626;color:white;text-align:center;padding:12px;border-radius:8px;margin-bottom:16px;font-size:18px;font-weight:bold}
          .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
          .label{font-weight:600;color:#555;font-size:14px}
          .value{color:#111;font-size:14px}
          .section-title{font-weight:700;color:#dc2626;margin-top:12px;margin-bottom:8px;font-size:15px}
          .med-tag{display:inline-block;background:#fef2f2;color:#991b1b;padding:3px 10px;border-radius:20px;font-size:13px;margin:3px}
          .allergy-tag{display:inline-block;background:#fff7ed;color:#9a3412;padding:3px 10px;border-radius:20px;font-size:13px;margin:3px}
          .emergency-box{background:#dc2626;color:white;border-radius:8px;padding:12px;text-align:center;margin-top:16px}
          @media print{body{padding:0}.card{border-width:2px}}
        </style>
        </head><body>${cardRef.current.innerHTML}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tx("emergencyid.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{tx("emergencyid.subtitle", lang)}</p>
          <Button onClick={() => window.location.href = "/auth"} className="gap-2">
            <LogIn className="w-4 h-4" />
            {tx("tool.loginRequired", lang)}
          </Button>
        </div>
      </div>
    );
  }

  const fullName = profile?.full_name ?? undefined;
  const dateOfBirth = profile?.birth_date ?? undefined;
  const gender = profile?.gender ?? undefined;
  const bloodType = profile?.blood_group ?? undefined;
  const chronicConditions = profile?.chronic_conditions ?? undefined;
  // Medications and allergies come from separate tables, but profile may have them loaded
  const profileAny = profile as Record<string, unknown> | null;
  const medications = (profileAny?.medications ?? []) as Array<{ name: string }>;
  const allergies = (profileAny?.allergies ?? []) as Array<{ name: string }>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("emergencyid.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("emergencyid.subtitle", lang)}</p>
        </div>

        {/* Emergency Contact Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            {tx("emergencyId.contactInfo", lang)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input
              type="text"
              value={emergencyContact.name}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, name: e.target.value }))}
              placeholder={tx("emergencyId.contactName", lang)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="tel"
              value={emergencyContact.phone}
              onChange={(e) => setEmergencyContact((p) => ({ ...p, phone: e.target.value }))}
              placeholder={tx("emergencyId.phoneNumber", lang)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCard(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {tx("emergencyid.generate", lang)}
            </Button>
            {showCard && (
              <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-xl">
                <Printer className="w-4 h-4" />
                {tx("emergencyid.print", lang)}
              </Button>
            )}
          </div>
        </div>

        {/* Generated Card */}
        {showCard && (
          <div className="animate-in fade-in duration-500">
            <div ref={cardRef}>
              <div className="card bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-500 dark:border-red-700 overflow-hidden shadow-xl">
                {/* Card Header */}
                <div className="header bg-red-600 text-white p-4 text-center">
                  <p className="text-lg font-bold flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    {tx("emergencyId.cardTitle", lang)}
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Personal Info */}
                  <div className="space-y-2">
                    <div className="row flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="label text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {tx("emergencyId.fullName", lang)}
                      </span>
                      <span className="value text-sm font-semibold text-gray-900 dark:text-white">
                        {fullName || tx("emergencyId.notSpecified", lang)}
                      </span>
                    </div>
                    {dateOfBirth && (
                      <div className="row flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="label text-sm font-medium text-gray-500 dark:text-gray-400">
                          {tx("emergencyId.dateOfBirth", lang)}
                        </span>
                        <span className="value text-sm text-gray-900 dark:text-white">{dateOfBirth}</span>
                      </div>
                    )}
                    {gender && (
                      <div className="row flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="label text-sm font-medium text-gray-500 dark:text-gray-400">
                          {tx("common.gender", lang)}
                        </span>
                        <span className="value text-sm text-gray-900 dark:text-white">{gender}</span>
                      </div>
                    )}
                    {bloodType && (
                      <div className="row flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="label text-sm font-medium text-gray-500 dark:text-gray-400">
                          {tx("emergencyId.bloodType", lang)}
                        </span>
                        <span className="value text-sm font-bold text-red-600 dark:text-red-400">{bloodType}</span>
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  {allergies && allergies.length > 0 && (
                    <div>
                      <p className="section-title text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        {tx("emergencyId.allergies", lang)}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {allergies.map((a, i) => (
                          <span key={i} className="allergy-tag text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {medications && medications.length > 0 && (
                    <div>
                      <p className="section-title text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-2">
                        <Pill className="w-4 h-4" />
                        {tx("emergencyId.medications", lang)}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {medications.map((m, i) => (
                          <span key={i} className="med-tag text-xs px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chronic Conditions */}
                  {chronicConditions && chronicConditions.length > 0 && (
                    <div>
                      <p className="section-title text-sm font-bold text-red-600 dark:text-red-400 mb-2">
                        {tx("emergencyId.chronicConditions", lang)}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {chronicConditions.map((c, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {emergencyContact.name && (
                    <div className="emergency-box bg-red-600 rounded-xl p-4 text-center">
                      <p className="text-white text-xs uppercase tracking-wider mb-1">
                        {tx("emergencyId.emergencyContact", lang)}
                      </p>
                      <p className="text-white font-bold">{emergencyContact.name}</p>
                      {emergencyContact.phone && (
                        <p className="text-red-100 flex items-center justify-center gap-1 mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          {emergencyContact.phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {tx("emergencyId.cardTip", lang)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
