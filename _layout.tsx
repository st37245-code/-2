import { Tabs } from "expo-router";
import { Platform, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { C } from "@/components/primitives";
import { useAppStore } from "@/hooks/app-store";

function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  size: number;
  focused: boolean;
}) {
  return (
    <View
      style={{
        minWidth: 44,
        height: 31,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: focused ? C.leafSoft : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={size ?? 21} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { data } = useAppStore();
  const bottomPadding = Platform.OS === "web" ? 8 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: C.forest,
        tabBarInactiveTintColor: "#A08C78",
        tabBarLabelStyle: {
          fontSize: data.settings.largeText ? 12 : 10,
          fontWeight: "800",
          marginTop: 1,
        },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarStyle: {
          height: 68 + bottomPadding,
          paddingTop: 5,
          paddingBottom: bottomPadding,
          backgroundColor: C.paper,
          borderTopColor: C.line,
          borderTopWidth: 1.5,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: "#846142",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "หน้าแรก",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home" color={color} size={size ?? 21} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "สำรวจ",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="compass" color={color} size={size ?? 21} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: "ฟักไข่",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="egg" color={color} size={size ?? 21} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "คอลเลกชัน",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="leaf" color={color} size={size ?? 21} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "ฉัน",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person" color={color} size={size ?? 21} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
