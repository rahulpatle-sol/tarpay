import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuth } from "../store/auth";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";

function AuthGuard() {
  const { user, ready, restore } = useAuth();
  const router   = useRouter();
  const segments = useSegments();
  useEffect(() => { restore(); }, []);
  useEffect(() => {
    if (!ready) return;
    const inAuth    = segments[0] === "auth";
    const inWelcome = segments[0] === undefined;
    if (user && (inAuth || inWelcome)) router.replace("/tabs/");
    else if (!user && !inAuth && !inWelcome) router.replace("/");
  }, [user, ready, segments]);
  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <StatusBar style={scheme==="dark"?"light":"dark"} backgroundColor="transparent" translucent/>
      <AuthGuard/>
      <Stack screenOptions={{ headerShown:false, animation:"slide_from_right" }}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="auth"/>
        <Stack.Screen name="tabs"/>
        <Stack.Screen name="tx/[id]"      options={{ presentation:"modal", animation:"slide_from_bottom" }}/>
        <Stack.Screen name="dispute/[id]" options={{ presentation:"modal", animation:"slide_from_bottom" }}/>
        <Stack.Screen name="pin"          options={{ presentation:"modal", animation:"slide_from_bottom" }}/>
        <Stack.Screen name="notifs"       options={{ animation:"slide_from_right" }}/>
      </Stack>
    </GestureHandlerRootView>
  );
}
