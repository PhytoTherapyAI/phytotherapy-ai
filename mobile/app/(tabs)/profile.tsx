// © 2026 DoctoPal — All Rights Reserved
// Sprint 31 Commit 1 — Profile screen (read-only).
//
// Web parity: components/profile-v2/ — but READ ONLY in v1. Edit flows
// (medication add, allergy chip, BMI height/weight inline edit, chronic
// conditions selector) arrive in Sprint 32+.
//
// 3 sections + sign-out:
//   1. Kişisel Bilgiler — email + name + age + gender + blood + height/weight + BMI
//   2. Tıbbi Bilgiler   — chronic conditions list + allergies list
//   3. İlaçlar          — active medications list
//
// Loading: ActivityIndicator centered.
// Error: red message + "Yenile" retry button (re-fires loadProfile).
// Empty fields: "Henüz eklenmedi" placeholder.
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  fetchUserProfile,
  filterChronicConditions,
  calculateBMI,
  bmiCategoryTR,
  genderLabelTR,
  type ProfileData,
} from "@/lib/api/profile";

const EMPTY_LABEL = "Henüz eklenmedi";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Sprint 31 Commit 1 — single load function used on mount + retry button.
  // Errors caught here surface in UI; auth/getUser failures (no session)
  // shouldn't happen in this screen because RootLayout guards the route,
  // but we handle gracefully for resilience.
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yap.");
        setLoading(false);
        return;
      }
      setUser(u);
      const data = await fetchUserProfile(u.id);
      setProfileData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profil yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error: signOutErr } = await supabase.auth.signOut();
      if (signOutErr) {
        Alert.alert("Çıkış başarısız", signOutErr.message);
      }
      // RootLayout's auth listener fires → router.replace("/(auth)/login").
    } finally {
      setSigningOut(false);
    }
  };

  // ───── Loading ─────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
      </SafeAreaView>
    );
  }

  // ───── Error ─────
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-6 items-center justify-center">
          <Text className="text-base font-medium text-red-600 mb-1 text-center">
            Profil yüklenemedi
          </Text>
          <Text className="text-sm text-gray-500 mb-4 text-center">{error}</Text>
          <Pressable
            onPress={loadProfile}
            className="rounded-lg bg-primary px-5 py-2.5 active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">Yenile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ───── Loaded ─────
  const profile = profileData?.profile;
  const meds = profileData?.medications ?? [];
  const allergies = profileData?.allergies ?? [];

  const bmi = calculateBMI(profile?.height_cm ?? null, profile?.weight_kg ?? null);
  const chronicList = filterChronicConditions(profile?.chronic_conditions);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-4 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold mb-4 text-foreground">Profil</Text>

        {/* ── 1. Kişisel Bilgiler ── */}
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <Text className="text-base font-semibold mb-3">Kişisel Bilgiler</Text>
          <InfoRow label="E-posta" value={user?.email ?? null} isLast={false} />
          <InfoRow label="Ad Soyad" value={profile?.full_name ?? null} isLast={false} />
          <InfoRow
            label="Yaş"
            value={profile?.age != null ? String(profile.age) : null}
            isLast={false}
          />
          <InfoRow label="Cinsiyet" value={genderLabelTR(profile?.gender)} isLast={false} />
          <InfoRow label="Kan Grubu" value={profile?.blood_group ?? null} isLast={false} />
          <InfoRow
            label="Boy"
            value={profile?.height_cm ? `${profile.height_cm} cm` : null}
            isLast={false}
          />
          <InfoRow
            label="Kilo"
            value={profile?.weight_kg ? `${profile.weight_kg} kg` : null}
            isLast={bmi === null}
          />
          {bmi !== null && (
            <InfoRow
              label="VKİ (BMI)"
              value={`${bmi.toFixed(1)} — ${bmiCategoryTR(bmi)}`}
              isLast={true}
            />
          )}
        </View>

        {/* ── 2. Tıbbi Bilgiler ── */}
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <Text className="text-base font-semibold mb-3">Tıbbi Bilgiler</Text>
          <ListSection label="Kronik Hastalıklar" items={chronicList} />
          <ListSection
            label="Alerjiler"
            items={allergies.map((a) =>
              a.severity ? `${a.allergen} (${a.severity})` : a.allergen,
            )}
          />
        </View>

        {/* ── 3. İlaçlar ── */}
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <Text className="text-base font-semibold mb-3">İlaçlar</Text>
          {meds.length === 0 ? (
            <Text className="text-sm text-gray-500 italic">{EMPTY_LABEL}</Text>
          ) : (
            meds.map((m, idx) => {
              const display = m.brand_name || m.generic_name || "Bilinmeyen ilaç";
              const meta = [m.dosage, m.frequency].filter(Boolean).join(" · ");
              return (
                <View
                  key={m.id}
                  className={`py-2 ${idx === meds.length - 1 ? "" : "border-b border-gray-100"}`}
                >
                  <Text className="text-sm font-medium text-gray-900">{display}</Text>
                  {meta.length > 0 && (
                    <Text className="text-xs text-gray-500 mt-0.5">{meta}</Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* ── Sign out ── */}
        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          className="rounded-lg border border-destructive bg-card px-4 py-3.5 mt-4 active:opacity-80 disabled:opacity-50"
        >
          {signingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text className="text-center text-base font-semibold text-destructive">
              Çıkış Yap
            </Text>
          )}
        </Pressable>

        {/* Footer hint — Sprint 32 promise */}
        <Text className="mt-4 text-center text-[11px] text-gray-500">
          Düzenleme Sprint 32&apos;de gelecek. Şu an sadece görüntüleme.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ───── Sub-components ─────

/** Single row in the InfoRow card. Border-bottom unless `isLast`. */
function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string | null;
  isLast: boolean;
}) {
  return (
    <View
      className={`flex-row justify-between items-center py-2 ${
        isLast ? "" : "border-b border-gray-100"
      }`}
    >
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text
        className={`text-sm ${value ? "text-gray-900" : "text-gray-400 italic"}`}
        numberOfLines={1}
      >
        {value || EMPTY_LABEL}
      </Text>
    </View>
  );
}

/** Bullet list for chronic conditions / allergies. Empty state inline. */
function ListSection({ label, items }: { label: string; items: string[] }) {
  return (
    <View className="mb-3">
      <Text className="text-xs text-gray-500 mb-1">{label}</Text>
      {items.length === 0 ? (
        <Text className="text-sm text-gray-400 italic">{EMPTY_LABEL}</Text>
      ) : (
        items.map((item, i) => (
          <Text key={i} className="text-sm text-gray-900">
            • {item}
          </Text>
        ))
      )}
    </View>
  );
}
