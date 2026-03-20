import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuth } from "../store/auth";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AuthGuard() {
  const { user, ready, restore } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => { restore(); }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuth    = segments[0] === "(auth)";
    const inWelcome = segments[0] === undefined;
    const inTabs    = segments[0] === "(tabs)";

    if (user && (inAuth || inWelcome)) {
      // Logged in user — seedha tabs pe
      router.replace("/(tabs)/");
    } else if (!user && !inAuth && !inWelcome) {
      // Not logged in, not on auth, not on welcome — welcome pe bhejo
      router.replace("/");
    }
  }, [user, ready, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <StatusBar style="light" backgroundColor="transparent" translucent/>
      <AuthGuard/>
      <Stack screenOptions={{ headerShown:false, contentStyle:{ backgroundColor:"#050508" } }}>
        <Stack.Screen name="index"        options={{ animation:"fade" }}/>
        <Stack.Screen name="(auth)"/>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen name="tx/[id]"      options={{ presentation:"modal" }}/>
        <Stack.Screen name="dispute/[id]" options={{ presentation:"modal" }}/>
        <Stack.Screen name="notifs"/>
      </Stack>
    </GestureHandlerRootView>
  );
}
