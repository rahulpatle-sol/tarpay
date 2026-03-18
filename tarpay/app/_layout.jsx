import { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuth } from "../store/auth";
import { useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AuthGuard() {
  const { user, ready, restore } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => { restore(); }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === "(auth)";
    const inTabs = segments[0] === "(tabs)";
    if (!user && !inAuth) {
      router.replace("/(auth)/login");
    } else if (user && (inAuth || segments[0] === undefined)) {
      router.replace("/(tabs)/");
    }
  }, [user, ready, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#050508" } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tx/[id]"       options={{ presentation: "modal" }} />
        <Stack.Screen name="dispute/[id]"  options={{ presentation: "modal" }} />
        <Stack.Screen name="notifs"        />
      </Stack>
    </GestureHandlerRootView>
  );
}
