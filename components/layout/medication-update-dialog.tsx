"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pill, CheckCircle2 } from "lucide-react";

export function MedicationUpdateDialog() {
  const router = useRouter();
  const { isAuthenticated, needsMedicationUpdate, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isAuthenticated && needsMedicationUpdate) {
      // Show dialog after a short delay to avoid jarring UX
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, needsMedicationUpdate]);

  const handleConfirmSame = async () => {
    setIsConfirming(true);
    try {
      const supabase = createBrowserClient();
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", profile!.id);
      await refreshProfile();
      setOpen(false);
    } catch (error) {
      console.error("Failed to update medication timestamp:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleUpdate = () => {
    setOpen(false);
    router.push("/profile?tab=medications");
  };

  if (!isAuthenticated || !needsMedicationUpdate) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-600" />
            Medication Check-In
          </DialogTitle>
          <DialogDescription>
            It&apos;s been over 30 days since you last updated your medication list.
            Has anything changed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleConfirmSame}
            disabled={isConfirming}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isConfirming ? "Confirming..." : "No changes — same medications"}
          </Button>
          <Button
            onClick={handleUpdate}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            Update my medications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
