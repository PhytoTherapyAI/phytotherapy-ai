// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Health Assistant tab placeholder.
// Web parity: app/health-assistant/page.tsx + ChatInterface + ConversationHistory.
// Mobile real implementation: Sprint 31+ (streaming chat + voice input + camera).
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-6">
        <Text className="mb-2 text-2xl font-bold text-foreground">Sağlık Asistanı</Text>
        <Text className="text-sm text-muted-foreground">
          Streaming chat + voice + kamera Sprint 31+&apos;da gelecek.
        </Text>
      </View>
    </SafeAreaView>
  );
}
