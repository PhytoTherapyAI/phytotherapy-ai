// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Profile tab placeholder + sign out button.
// Web parity: app/profile/page.tsx (ProfileShellV2 11-tab sidebar refactored
// in Sprint 45). Mobile foundation only shows email + sign out — full profile
// editor arrives Sprint 33+ after onboarding flow lands.
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Çıkış başarısız", error.message);
      }
      // RootLayout's auth listener fires → router.replace("/(auth)/login").
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-6">
        <Text className="mb-2 text-2xl font-bold text-foreground">Profil</Text>
        <Text className="mb-6 text-sm text-muted-foreground">
          Tam profil editörü Sprint 33+&apos;da. Şu an sadece oturum bilgisi + çıkış.
        </Text>

        <View className="mb-6 rounded-lg border border-border bg-card p-4">
          <Text className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            E-posta
          </Text>
          <Text className="text-sm text-foreground">
            {user?.email ?? "—"}
          </Text>
        </View>

        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          className="rounded-lg border border-destructive bg-card px-4 py-3.5 active:opacity-80 disabled:opacity-50"
        >
          {signingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text className="text-center text-base font-semibold text-destructive">
              Çıkış Yap
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
