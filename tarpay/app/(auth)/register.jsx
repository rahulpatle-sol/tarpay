import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, Alert, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import GBtn from "../../components/GBtn";
import Input from "../../components/Input";
import { C, S, R } from "../../constants/theme";
const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: "", phone: "", upiId: "", password: "", isMerchant: false, businessName: "" });
  const { register, loading } = useAuth();
  const router = useRouter();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.name || !form.phone || !form.upiId || !form.password) { Alert.alert("Missing Fields", "Fill all required fields"); return; }
    if (!form.upiId.endsWith("@tarpay")) { Alert.alert("Invalid UPI ID", "Must end with @tarpay"); return; }
    try {
      await register(form);
      Alert.alert("Account Created! 🎉", "You get ₹10,000 TarPay credits.", [{ text: "Login", onPress: () => router.replace("/(auth)/login") }]);
    } catch (e) { Alert.alert("Error", e.response?.data?.message || "Registration failed"); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Image source={{ uri: "https://picsum.photos/seed/tarpay-register/800/1400" }} style={s.bg} blurRadius={10} />
      <LinearGradient colors={["#05050800", "#050508DD", "#050508"]} style={s.grad} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ color: C.t2, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Create Account</Text>
        <Text style={s.sub}>Get ₹10,000 credits on signup</Text>
        <View style={s.card}>
          <Input label="Full Name"  icon="person"      placeholder="Rahul Sharma"        value={form.name}         onChange={v => set("name", v)} />
          <Input label="Phone"      icon="call"        placeholder="9876543210"           value={form.phone}        onChange={v => set("phone", v)}    keyb="phone-pad" />
          <Input label="UPI ID"     icon="at"          placeholder="rahul@tarpay"         value={form.upiId}        onChange={v => set("upiId", v)}    hint="Must end with @tarpay" />
          <Input label="Password"   icon="lock-closed" placeholder="Min 8 characters"     value={form.password}     onChange={v => set("password", v)} secure />
          <View style={s.toggle}>
            <View>
              <Text style={s.toggleLabel}>Merchant Account</Text>
              <Text style={s.toggleSub}>Business / shop owner</Text>
            </View>
            <Switch value={form.isMerchant} onValueChange={v => set("isMerchant", v)} trackColor={{ false: C.b1, true: C.mint + "60" }} thumbColor={form.isMerchant ? C.mint : C.t3} />
          </View>
          {form.isMerchant && <Input label="Business Name" icon="storefront" placeholder="Rajat ka Samosa Corner" value={form.businessName} onChange={v => set("businessName", v)} />}
          <GBtn title="Create Account" onPress={handle} loading={loading} />
          <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={s.link}>
            <Text style={s.linkTxt}>Already have account? <Text style={{ color: C.mint }}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  bg: { position: "absolute", width, height, resizeMode: "cover" },
  grad: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scroll: { flexGrow: 1, padding: S.lg, paddingBottom: S.xxl },
  back: { marginTop: 16, marginBottom: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.b1 },
  title: { fontSize: 28, fontWeight: "900", color: C.t1, marginBottom: 4, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: C.t3, marginBottom: S.lg },
  card: { backgroundColor: "#0C0C14EE", borderRadius: R.xl, borderWidth: 1, borderColor: C.b1, padding: S.lg, gap: 14 },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.bg2, borderRadius: R.md, padding: 14, borderWidth: 1, borderColor: C.b1 },
  toggleLabel: { fontSize: 15, fontWeight: "600", color: C.t1 },
  toggleSub: { fontSize: 11, color: C.t3, marginTop: 2 },
  link: { alignItems: "center", paddingVertical: 6 },
  linkTxt: { fontSize: 13, color: C.t3 },
});
