"use client";

import { useState, useRef } from "react";
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  Trophy,
  Flame,
  Heart,
  Shield,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";

interface Certificate {
  id: string;
  titleEn: string;
  titleTr: string;
  descEn: string;
  descTr: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  requirement: string;
}

const CERTIFICATES: Certificate[] = [
  {
    id: "med-compliance-30",
    titleEn: "30-Day Medication Compliance",
    titleTr: "30 Günlük İlaç Uyumu",
    descEn: "Successfully tracked medications for 30 consecutive days",
    descTr: "30 gun boyunca ilaçlarıni duzgun sekilde takip ettin",
    icon: <Shield className="w-8 h-8" />,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    requirement: "30 days",
  },
  {
    id: "health-score-90",
    titleEn: "Health Score Champion",
    titleTr: "Sağlık Skoru Sampiyonu",
    descEn: "Achieved a health score of 90 or above",
    descTr: "90 ve uzerinde sağlık skoru elde ettin",
    icon: <Trophy className="w-8 h-8" />,
    color: "text-yellow-600 dark:text-yellow-400",
    bgGradient: "from-yellow-500/10 to-amber-500/10",
    requirement: "Score 90+",
  },
  {
    id: "streak-7",
    titleEn: "7-Day Health Streak",
    titleTr: "7 Günlük Sağlık Serisi",
    descEn: "Maintained a 7-day streak of daily health check-ins",
    descTr: "7 gun ust uste gunluk sağlık takibini tamamladin",
    icon: <Flame className="w-8 h-8" />,
    color: "text-orange-600 dark:text-orange-400",
    bgGradient: "from-orange-500/10 to-red-500/10",
    requirement: "7 days",
  },
  {
    id: "first-blood-test",
    titleEn: "First Blood Test Analysis",
    titleTr: "Ilk Kan Tahlili Analizi",
    descEn: "Completed your first blood test analysis on the platform",
    descTr: "Platformdaki ilk kan tahlili analizini tamamladin",
    icon: <Heart className="w-8 h-8" />,
    color: "text-red-600 dark:text-red-400",
    bgGradient: "from-red-500/10 to-pink-500/10",
    requirement: "1 analysis",
  },
  {
    id: "supplement-master",
    titleEn: "Supplement Tracking Master",
    titleTr: "Takviye Takip Ustasi",
    descEn: "Tracked supplements consistently for 14 days",
    descTr: "14 gun boyunca takviyelerini düzenli takip ettin",
    icon: <Star className="w-8 h-8" />,
    color: "text-purple-600 dark:text-purple-400",
    bgGradient: "from-purple-500/10 to-violet-500/10",
    requirement: "14 days",
  },
  {
    id: "quiz-master",
    titleEn: "Health Quiz Master",
    titleTr: "Sağlık Quiz Ustasi",
    descEn: "Answered 20 health quiz questions correctly",
    descTr: "20 sağlık quiz sorusunu doğru yanitledin",
    icon: <Award className="w-8 h-8" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "from-emerald-500/10 to-green-500/10",
    requirement: "20 correct",
  },
];

export default function CertificatesPage() {
  const { lang } = useLang();
  const { session } = useAuth();
  const isTr = lang === "tr";
  const [generating, setGenerating] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || tx("certificates.defaultUser", lang);

  const generateCertificate = async (cert: Certificate) => {
    setGenerating(cert.id);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 800;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
      gradient.addColorStop(0, "#f8fafc");
      gradient.addColorStop(1, "#e2e8f0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 800);

      // Border
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1140, 740);
      ctx.strokeStyle = "#a5b4fc";
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 1120, 720);

      // Corner decorations
      const corners = [[50, 50], [1140, 50], [50, 740], [1140, 740]];
      corners.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#6366f1";
        ctx.fill();
      });

      // Header
      ctx.fillStyle = "#6366f1";
      ctx.font = "bold 18px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("PHYTOTHERAPY.AI", 600, 100);

      // Award icon area
      ctx.font = "48px serif";
      ctx.fillText("*", 600, 170);

      // Certificate title
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 16px system-ui";
      ctx.fillText(tx("certificates.achievementCert", lang), 600, 220);

      // Divider line
      ctx.beginPath();
      ctx.moveTo(350, 245);
      ctx.lineTo(850, 245);
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Presented to
      ctx.fillStyle = "#64748b";
      ctx.font = "16px system-ui";
      ctx.fillText(tx("certificates.presentedTo", lang), 600, 290);

      // User name
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 42px system-ui";
      ctx.fillText(userName, 600, 350);

      // Underline for name
      const nameWidth = ctx.measureText(userName).width;
      ctx.beginPath();
      ctx.moveTo(600 - nameWidth / 2 - 20, 365);
      ctx.lineTo(600 + nameWidth / 2 + 20, 365);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.stroke();

      // For
      ctx.fillStyle = "#64748b";
      ctx.font = "16px system-ui";
      ctx.fillText(tx("certificates.inRecognition", lang), 600, 410);

      // Achievement
      ctx.fillStyle = "#6366f1";
      ctx.font = "bold 28px system-ui";
      ctx.fillText(isTr ? cert.titleTr : cert.titleEn, 600, 460);

      // Description
      ctx.fillStyle = "#64748b";
      ctx.font = "15px system-ui";
      ctx.fillText(isTr ? cert.descTr : cert.descEn, 600, 500);

      // Date
      const today = new Date().toLocaleDateString(isTr ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" });
      ctx.fillStyle = "#64748b";
      ctx.font = "14px system-ui";
      ctx.fillText(today, 600, 580);

      // Signature line
      ctx.beginPath();
      ctx.moveTo(420, 650);
      ctx.lineTo(780, 650);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui";
      ctx.fillText("Phytotherapy.ai - Evidence-Based Health Assistant", 600, 680);

      // Footer
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px system-ui";
      ctx.fillText("phytotherapy.ai | " + tx("certificates.evidenceBased", lang), 600, 740);

      setPreview(canvas.toDataURL("image/png"));
    } finally {
      setGenerating(null);
    }
  };

  const downloadCertificate = () => {
    if (!preview) return;
    const link = document.createElement("a");
    link.download = "phytotherapy-certificate.png";
    link.href = preview;
    link.click();
  };

  const shareCertificate = async () => {
    if (!preview) return;
    try {
      const blob = await (await fetch(preview)).blob();
      const file = new File([blob], "phytotherapy-certificate.png", { type: "image/png" });
      if (navigator.share) {
        await navigator.share({ files: [file], title: "Phytotherapy.ai Certificate" });
      }
    } catch {
      downloadCertificate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <canvas ref={canvasRef} className="hidden" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
            <span className="font-semibold">{tx("certificates.title", lang)}</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {tx("certificates.subtitle", lang)}
          </p>
        </div>

        {preview && (
          <Card className="p-4 space-y-4">
            <img src={preview} alt="Certificate" className="w-full rounded-lg border" />
            <div className="flex gap-3 justify-center">
              <Button onClick={downloadCertificate} className="gap-2">
                <Download className="w-4 h-4" />
                {tx("certificates.download", lang)}
              </Button>
              <Button variant="outline" onClick={shareCertificate} className="gap-2">
                <Share2 className="w-4 h-4" />
                {tx("certificates.share", lang)}
              </Button>
              <Button variant="ghost" onClick={() => setPreview(null)}>
                {tx("certificates.close", lang)}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-4">
          {CERTIFICATES.map(cert => (
            <Card key={cert.id} className={`p-5 bg-gradient-to-r ${cert.bgGradient}`}>
              <div className="flex items-start gap-4">
                <div className={`${cert.color} shrink-0`}>{cert.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{isTr ? cert.titleTr : cert.titleEn}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{isTr ? cert.descTr : cert.descEn}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {cert.requirement}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => generateCertificate(cert)}
                      disabled={generating === cert.id}
                      className="gap-1"
                    >
                      {generating === cert.id ? (
                        <><Loader2 className="w-3 h-3 animate-spin" />{tx("certificates.generating", lang)}</>
                      ) : (
                        <><Award className="w-3 h-3" />{tx("certificates.generate", lang)}</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            {tx("certificates.keepTracking", lang)}
          </p>
        </Card>
      </div>
    </div>
  );
}
