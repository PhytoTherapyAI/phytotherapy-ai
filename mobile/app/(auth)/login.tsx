// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Mobile login screen (email + password).
//
// Web parity: app/auth/page.tsx uses the same supabase.auth.signInWithPassword
// flow. Mobile is simpler — no OAuth providers in v1 (Google/Facebook OAuth
// requires deep-link config + native shim). Foundation phase covers email/
// password only; OAuth arrives in a later sprint after Iyzico unblock.
//
// Auth state listener in app/_layout.tsx redirects on success — no manual
// router.replace needed here.
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Eksik bilgi", "E-posta ve parola gerekli.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        Alert.alert("Giriş başarısız", error.message);
      }
      // On success, RootLayout's auth listener fires → router.replace("/(tabs)").
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="mb-2 text-3xl font-bold text-foreground">DoctoPal</Text>
          <Text className="mb-8 text-sm text-muted-foreground">
            Kanıta dayalı sağlık asistanın
          </Text>

          <View className="mb-4">
            <Text className="mb-1.5 text-sm font-medium text-foreground">E-posta</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="ornek@eposta.com"
              className="rounded-lg border border-border bg-card px-3 py-3 text-base text-foreground"
            />
          </View>

          <View className="mb-6">
            <Text className="mb-1.5 text-sm font-medium text-foreground">Parola</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              placeholder="••••••••"
              className="rounded-lg border border-border bg-card px-3 py-3 text-base text-foreground"
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-3.5 active:opacity-80 disabled:opacity-50"
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-center text-base font-semibold text-primary-foreground">
                Giriş Yap
              </Text>
            )}
          </Pressable>

          <Text className="mt-6 text-center text-xs text-muted-foreground">
            Sprint 30 Commit 1 — Foundation only. OAuth + signup later.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
