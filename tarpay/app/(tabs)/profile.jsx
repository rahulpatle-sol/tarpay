import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import Card from "../../components/Card";
import GBtn from "../../components/GBtn";
import { C, S, R, IMG } from "../../constants/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const doLogout = () => Alert.alert("Logout", "Are you sure?", [
    { text: "Cancel" },
    { text: "Logout", style: "destructive", onPress: async () => { await logout(); router.replace("/(auth)/login"); } }
  ]);

  const MenuItem = ({ icon, label, sub, color, onPress }) => (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.mIcon, { backgroundColor: (color || C.mint) + "20" }]}><Ionicons name={icon} size={17} color={color || C.mint} /></View>
      <View style={{ flex: 1 }}><Text style={s.mLabel}>{label}</Text>{sub && <Text style={s.mSub}>{sub}</Text>}</View>
      <Ionicons name="chevron-forward" size={15} color={C.t4} />
    </TouchableOpacity>
  );
  const Div = () => <View style={{ height: 1, backgroundColor: C.b2 }} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.heroWrap}>
        <Image source={{ uri: "https://picsum.photos/seed/profile-hero/800/300" }} style={s.heroBg} blurRadius={8} />
        <LinearGradient colors={["transparent", "#050508"]} style={StyleSheet.absoluteFill} />
        <View style={s.profileCenter}>
          <Image source={{ uri: IMG.avatar(user?.name) }} style={s.bigAvatar} />
          {user?.isMerchant && <View style={s.merchantBadge}><Ionicons name="storefront" size={11} color={C.mint} /><Text style={s.merchantTxt}>{user?.businessName || "Merchant"}</Text></View>}
          <Text style={s.pName}>{user?.name}</Text>
          <Text style={s.pUpi}>{user?.upiId}</Text>
        </View>
      </View>
      <Card style={s.balCard} glow>
        <Text style={s.balLabel}>TarPay Balance</Text>
        <Text style={s.balAmt}>₹{(user?.balance || 0).toLocaleString("en-IN")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: user?.fraudScore >= 50 ? C.red : C.green }} />
          <Text style={{ fontSize: 12, color: C.t3 }}>Fraud Score: {user?.fraudScore || 0}/100</Text>
        </View>
      </Card>
      <Text style={s.secLabel}>Activity</Text>
      <Card style={s.menuCard}>
        <MenuItem icon="receipt"       label="Transactions"  onPress={() => router.push("/(tabs)/history")} />
        <Div />
        <MenuItem icon="alert-circle"  label="My Disputes"   onPress={() => router.push("/(tabs)/disputes")} color={C.orange} />
        <Div />
        <MenuItem icon="notifications" label="Notifications" onPress={() => router.push("/notifs")} />
      </Card>
      <Text style={s.secLabel}>Account</Text>
      <Card style={s.menuCard}>
        <MenuItem icon="call"   label="Phone"        sub={user?.phone} />
        <Div />
        <MenuItem icon="at"     label="UPI ID"       sub={user?.upiId} />
        <Div />
        <MenuItem icon="person" label="Account Type" sub={user?.isMerchant ? "Merchant" : "Consumer"} />
      </Card>
      <GBtn variant="outline" title="Logout" onPress={doLogout} style={{ marginTop: S.md, borderColor: C.red }} />
      <Text style={s.version}>TarPay v1.0.0 · HACK HUSTLE 2.0</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  content: { paddingBottom: 100 },
  heroWrap: { height: 280, position: "relative", overflow: "hidden" },
  heroBg: { position: "absolute", width: "100%", height: 280, resizeMode: "cover" },
  profileCenter: { alignItems: "center", position: "absolute", bottom: S.lg, width: "100%" },
  bigAvatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: C.mint, marginBottom: 10 },
  merchantBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.mintDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full, marginBottom: 6, borderWidth: 1, borderColor: C.mint + "40" },
  merchantTxt: { fontSize: 11, color: C.mint, fontWeight: "700" },
  pName: { fontSize: 22, fontWeight: "900", color: C.t1 },
  pUpi: { fontSize: 12, color: C.mint, marginTop: 2 },
  balCard: { marginHorizontal: S.lg, marginBottom: S.lg, alignItems: "center" },
  balLabel: { fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: 1 },
  balAmt: { fontSize: 34, fontWeight: "900", color: C.t1, marginVertical: 4 },
  secLabel: { fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: 1, paddingHorizontal: S.lg, marginBottom: 8 },
  menuCard: { marginHorizontal: S.lg, marginBottom: S.lg, padding: 0, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  mIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  mLabel: { fontSize: 15, fontWeight: "600", color: C.t1 },
  mSub: { fontSize: 11, color: C.t3, marginTop: 1 },
  version: { fontSize: 11, color: C.t4, textAlign: "center", marginTop: S.md, marginBottom: S.sm },
});
