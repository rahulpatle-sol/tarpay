import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, KeyboardAvoidingView, Platform, Alert, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import GBtn from "../../components/GBtn";
import Input from "../../components/Input";
import { C, S, R } from "../../constants/theme";
const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [upiId, setUpiId] = useState("");
  const [pass, setPass] = useState("");
  const { login, loading } = useAuth();
  const router = useRouter();
  const shake = useRef(new Animated.Value(0)).current;

  const doShake = () => Animated.sequence([
    Animated.timing(shake, { toValue: 12, duration: 60, useNativeDriver: true }),
    Animated.timing(shake, { toValue: -12, duration: 60, useNativeDriver: true }),
    Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
    Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
  ]).start();

  const handle = async () => {
    if (!upiId || !pass) { doShake(); return; }
    try {
      await login(upiId, pass);
      router.replace("/(tabs)/");
    } catch (e) {
      doShake();
      Alert.alert("Login Failed", e.response?.data?.message || "Check your credentials");
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Image source={{ uri: "https://picsum.photos/seed/tarpay-login/800/1400" }} style={s.bg} blurRadius={8} />
      <LinearGradient colors={["#05050800", "#050508CC", "#050508"]} style={s.grad} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <LinearGradient colors={["#00F5B4", "#3D9EFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logo}>
            <Text style={s.logoTxt}>T</Text>
          </LinearGradient>
          <Text style={s.brand}>TarPay</Text>
          <Text style={s.tagline}>Paise bhejo, darr nahi 💚</Text>
        </View>
        <Animated.View style={[s.card, { transform: [{ translateX: shake }] }]}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <View style={s.fields}>
            <Input label="UPI ID" icon="at" placeholder="rahul@tarpay" value={upiId} onChange={setUpiId} hint="Format: name@tarpay" />
            <Input label="Password" icon="lock-closed" placeholder="••••••••" value={pass} onChange={setPass} secure />
          </View>
          <GBtn title="Sign In" onPress={handle} loading={loading} style={s.btn} />
          <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={s.link}>
            <Text style={s.linkTxt}>New to TarPay? <Text style={{ color: C.mint, fontWeight: "700" }}>Create Account</Text></Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={s.demo}>
          <Text style={s.demoTxt}>Demo: <Text style={{ color: C.mint }}>rahul@tarpay</Text> / password123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  bg: { position: "absolute", width, height, resizeMode: "cover" },
  grad: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scroll: { flexGrow: 1, padding: S.lg, justifyContent: "flex-end", paddingBottom: S.xxl },
  logoWrap: { alignItems: "center", marginBottom: S.xl },
  logo: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", shadowColor: "#00F5B4", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 16 },
  logoTxt: { fontSize: 44, fontWeight: "900", color: "#000" },
  brand: { fontSize: 28, fontWeight: "900", color: C.t1, marginTop: 12, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: C.t3, marginTop: 4 },
  card: { backgroundColor: "#0C0C14EE", borderRadius: R.xl, borderWidth: 1, borderColor: C.b1, padding: S.lg, gap: S.md },
  cardTitle: { fontSize: 22, fontWeight: "800", color: C.t1 },
  fields: { gap: 14 },
  btn: { marginTop: 4 },
  link: { alignItems: "center", paddingVertical: 8 },
  linkTxt: { fontSize: 14, color: C.t3 },
  demo: { alignItems: "center", marginTop: S.md, padding: 10, backgroundColor: "#00F5B420", borderRadius: R.sm },
  demoTxt: { fontSize: 12, color: C.t3 },
});
