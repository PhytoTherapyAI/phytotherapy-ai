// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Bottom tab navigation.
// 4 tabs: Home / Chat / Interaction / Profile.
// Web parity: components/layout/BottomNavbar.tsx (Sprint 29 Commit 4 was
// 4-tab Home/Calendar/Family/Profile — mobile v1 swaps Calendar/Family for
// Chat/Interaction since those are the highest-value mobile flows per the
// IGNITE 26 demo + Sprint 25 multimodal). Calendar + Family arrive later.
import type { ComponentType } from "react";
import { Tabs } from "expo-router";
import { Home, MessageSquare, ShieldAlert, User } from "lucide-react-native";

// lucide-react-native v1.14 ships web-SVG type defs (RefAttributes<SVGSVGElement>)
// but its RN runtime accepts native-friendly { color, size, strokeWidth } props.
// Sprint 30 Commit 1 — minimal type cast so Tabs.tabBarIcon callbacks compile.
type TabIcon = ComponentType<{ color?: string; size?: number }>;
const HomeIcon = Home as unknown as TabIcon;
const ChatIcon = MessageSquare as unknown as TabIcon;
const ShieldIcon = ShieldAlert as unknown as TabIcon;
const UserIcon = User as unknown as TabIcon;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#059669", // primary (emerald-600)
        tabBarInactiveTintColor: "#64748b", // muted-foreground (slate-500)
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Asistan",
          tabBarIcon: ({ color, size }) => <ChatIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="interaction"
        options={{
          title: "Etkileşim",
          tabBarIcon: ({ color, size }) => <ShieldIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
