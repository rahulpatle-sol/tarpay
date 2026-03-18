import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarBackground: () => <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />,
        tabBarActiveTintColor: C.mint,
        tabBarInactiveTintColor: C.t3,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index"    options={{ tabBarIcon: ({ color, focused }) => <TabIcon name="home"         color={color} focused={focused} /> }} />
      <Tabs.Screen name="history"  options={{ tabBarIcon: ({ color, focused }) => <TabIcon name="receipt"      color={color} focused={focused} /> }} />
      <Tabs.Screen name="send"     options={{ tabBarIcon: () => <SendBtn /> }} />
      <Tabs.Screen name="disputes" options={{ tabBarIcon: ({ color, focused }) => <TabIcon name="alert-circle" color={color} focused={focused} /> }} />
      <Tabs.Screen name="profile"  options={{ tabBarIcon: ({ color, focused }) => <TabIcon name="person"       color={color} focused={focused} /> }} />
    </Tabs>
  );
}

function TabIcon({ name, color, focused }) {
  return (
    <View style={s.iconWrap}>
      <Ionicons name={focused ? name : name + "-outline"} size={24} color={color} />
      {focused && <View style={s.dot} />}
    </View>
  );
}

function SendBtn() {
  return (
    <LinearGradient colors={["#00F5B4", "#3D9EFF"]} style={s.sendBtn}>
      <Ionicons name="send" size={20} color="#000" />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  tabBar: { position: "absolute", borderTopWidth: 1, borderTopColor: "#25254080", height: 80, backgroundColor: "transparent", elevation: 0 },
  iconWrap: { alignItems: "center", gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.mint },
  sendBtn: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", shadowColor: "#00F5B4", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10 },
});
