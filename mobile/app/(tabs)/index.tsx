// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Home tab placeholder.
// Real implementation (vitality ring, daily care, recent activity) arrives
// in Sprint 31+ after the foundation is proven on device.
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-6">
        <Text className="mb-2 text-2xl font-bold text-foreground">Ana Sayfa</Text>
        <Text className="text-sm text-muted-foreground">
          Mobile foundation çalışıyor. Sprint 31+'da gerçek dashboard içeriği gelecek.
        </Text>
      </View>
    </SafeAreaView>
  );
}
