"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Pill, AlertTriangle, Heart, Shield, Trash2, Download } from "lucide-react";
import type { UserMedication, UserAllergy } from "@/lib/database.types";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile, user } = useAuth();
  const [medications, setMedications] = useState<UserMedication[]>([]);
  const [allergies, setAllergies] = useState<UserAllergy[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;
    const supabase = createBrowserClient();

    // Fetch medications
    supabase
      .from("user_medications")
      .select("*")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setMedications(data as UserMedication[]);
      });

    // Fetch allergies
    supabase
      .from("user_allergies")
      .select("*")
      .eq("user_id", profile.id)
      .then(({ data }) => {
        if (data) setAllergies(data as UserAllergy[]);
      });
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>

      {/* Personal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{profile.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-medium">{profile.age ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium capitalize">{profile.gender?.replace("_", " ") || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Active Medications
          </CardTitle>
          <CardDescription>
            Last updated: {profile.last_medication_update
              ? new Date(profile.last_medication_update).toLocaleDateString()
              : "Never"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No medications recorded</p>
          ) : (
            <div className="space-y-2">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{med.brand_name || med.generic_name}</p>
                    {med.dosage && <Badge variant="secondary" className="mt-1">{med.dosage}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No allergies recorded</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge key={allergy.id} variant="destructive">
                  {allergy.allergen} ({allergy.severity})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Flags */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Flags
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.is_pregnant && <Badge variant="outline">Pregnant</Badge>}
          {profile.is_breastfeeding && <Badge variant="outline">Breastfeeding</Badge>}
          {profile.kidney_disease && <Badge variant="destructive">Kidney Disease</Badge>}
          {profile.liver_disease && <Badge variant="destructive">Liver Disease</Badge>}
          {profile.recent_surgery && <Badge variant="outline">Recent Surgery</Badge>}
          {profile.chronic_conditions.map((c) => (
            <Badge key={c} variant="secondary">{c}</Badge>
          ))}
          {!profile.is_pregnant &&
            !profile.is_breastfeeding &&
            !profile.kidney_disease &&
            !profile.liver_disease &&
            !profile.recent_surgery &&
            profile.chronic_conditions.length === 0 && (
              <p className="text-sm text-muted-foreground">No health flags</p>
            )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>Manage your data according to GDPR/KVKK</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download My Data
            </Button>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete My Account
            </Button>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Your data is encrypted and stored securely. It will be automatically deleted after 2 years of inactivity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
