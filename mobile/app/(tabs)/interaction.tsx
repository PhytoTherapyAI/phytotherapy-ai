// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Interaction Checker tab placeholder.
// Web parity: app/interaction-checker/page.tsx + DrugInput + InteractionResult.
// Mobile real implementation: Sprint 32+ (medication scanner via expo-camera +
// barcode + interaction-map endpoint shared with web).
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InteractionScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-6">
        <Text className="mb-2 text-2xl font-bold text-foreground">Etkileşim Kontrolü</Text>
        <Text className="text-sm text-muted-foreground">
          İlaç + bitki + alerji + kronik etkileşim taraması Sprint 32+&apos;da.
        </Text>
      </View>
    </SafeAreaView>
  );
}
