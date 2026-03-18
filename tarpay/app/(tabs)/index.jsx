import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { userAPI, txAPI } from "../../services/api";
import TxRow from "../../components/TxRow";
import Card from "../../components/Card";
import { C, S, R, IMG } from "../../constants/theme";
const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [txns, setTxns] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, t, m] = await Promise.all([userAPI.dash(), txAPI.history({ limit: 5 }), userAPI.me()]);
      setStats(d.data.stats); setTxns(t.data.transactions); setUser(m.data.user);
    } catch (e) { console.log(e.message); }
  }, []);

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  const QA = ({ icon, label, color, route }) => (
    <TouchableOpacity style={s.qa} onPress={() => router.push(route)} activeOpacity={0.8}>
      <LinearGradient colors={[color + "30", color + "10"]} style={[s.qaIcon, { borderColor: color + "40" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </LinearGradient>
      <Text style={s.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.mint} />}>
      
      {/* Hero */}
      <View style={s.hero}>
        <Image source={{ uri: "https://picsum.photos/seed/tarpay-home/800/300" }} style={s.heroBg} blurRadius={3} />
        <LinearGradient colors={["#0C0C14CC", "#0C0C14F0", "#0C0C14"]} style={s.heroGrad} />
        <View style={s.heroHeader}>
          <View style={s.userRow}>
            <Image source={{ uri: IMG.avatar(user?.name) }} style={s.avatar} />
            <View>
              <Text style={s.greet}>Good day 👋</Text>
              <Text style={s.heroName}>{user?.name?.split(" ")[0]}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/notifs")} style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color={C.t2} />
          </TouchableOpacity>
        </View>
        <View style={s.balWrap}>
          <Text style={s.balLabel}>Available Balance</Text>
          <Text style={s.balAmt}>₹{(user?.balance || 0).toLocaleString("en-IN")}</Text>
          <Text style={s.upiTxt}>{user?.upiId}</Text>
        </View>
        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: "Received", amt: stats?.totalReceived?.amount, color: C.green },
            { label: "Sent",     amt: stats?.totalSent?.amount,     color: C.red },
            { label: "Escrow",   amt: stats?.pendingEscrow?.amount, color: C.orange },
          ].map(st => (
            <View key={st.label} style={[s.statBox, { borderColor: st.color + "30" }]}>
              <Text style={[s.statAmt, { color: st.color }]}>₹{(st.amt || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Alerts */}
      {stats?.pendingEscrow?.count > 0 && (
        <TouchableOpacity onPress={() => router.push("/(tabs)/history")} activeOpacity={0.85}>
          <LinearGradient colors={[C.orange + "25", C.orange + "05"]} style={[s.alert, { borderColor: C.orange + "30" }]}>
            <Ionicons name="time" size={18} color={C.orange} />
            <Text style={[s.alertTxt, { color: C.orange }]}>{stats.pendingEscrow.count} payment{stats.pendingEscrow.count > 1 ? "s" : ""} in escrow</Text>
            <Ionicons name="chevron-forward" size={16} color={C.orange} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      {stats?.openDisputes > 0 && (
        <TouchableOpacity onPress={() => router.push("/(tabs)/disputes")} activeOpacity={0.85}>
          <LinearGradient colors={[C.red + "25", C.red + "05"]} style={[s.alert, { borderColor: C.red + "30" }]}>
            <Ionicons name="alert-circle" size={18} color={C.red} />
            <Text style={[s.alertTxt, { color: C.red }]}>{stats.openDisputes} open dispute{stats.openDisputes > 1 ? "s" : ""}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.red} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={s.section}>
        <Text style={s.secTitle}>Quick Actions</Text>
        <View style={s.qaRow}>
          <QA icon="send"         label="Send"     color={C.mint}   route="/(tabs)/send" />
          <QA icon="receipt"      label="History"  color={C.blue}   route="/(tabs)/history" />
          <QA icon="alert-circle" label="Disputes" color={C.orange} route="/(tabs)/disputes" />
          <QA icon="person"       label="Profile"  color={C.purple} route="/(tabs)/profile" />
        </View>
      </View>

      {/* Feature banner */}
      <TouchableOpacity style={s.banner} onPress={() => router.push("/(tabs)/send")} activeOpacity={0.9}>
        <Image source={{ uri: "https://picsum.photos/seed/escrow-banner/800/200" }} style={s.bannerImg} blurRadius={2} />
        <LinearGradient colors={["#050508AA", "#050508"]} style={StyleSheet.absoluteFill} />
        <View style={s.bannerContent}>
          <View style={s.newBadge}><Text style={s.newBadgeTxt}>PROTECTED</Text></View>
          <Text style={s.bannerTitle}>24hr Escrow Safety</Text>
          <Text style={s.bannerSub}>Every payment protected. Cancel anytime.</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={28} color={C.mint} style={s.bannerArrow} />
      </TouchableOpacity>

      {/* Recent */}
      <View style={s.section}>
        <View style={s.secRow}>
          <Text style={s.secTitle}>Recent</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
            <Text style={s.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        {txns.length === 0
          ? <Card style={s.empty}><Text style={s.emptyTxt}>No transactions yet. Send your first payment!</Text></Card>
          : txns.map(tx => <TxRow key={tx.id} tx={tx} userId={user?.id} onPress={() => router.push(`/tx/${tx.id}`)} />)
        }
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  content: { paddingBottom: 100 },
  hero: { position: "relative", overflow: "hidden" },
  heroBg: { width: "100%", height: 340, resizeMode: "cover" },
  heroGrad: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroHeader: { position: "absolute", top: 56, left: S.lg, right: S.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: C.mint },
  greet: { fontSize: 11, color: C.t3 },
  heroName: { fontSize: 18, fontWeight: "800", color: C.t1 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#0C0C14CC", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.b1 },
  balWrap: { position: "absolute", top: 130, left: S.lg },
  balLabel: { fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: 1 },
  balAmt: { fontSize: 40, fontWeight: "900", color: C.t1, letterSpacing: -1, marginVertical: 2 },
  upiTxt: { fontSize: 12, color: C.mint, fontWeight: "600" },
  statsRow: { position: "absolute", bottom: S.lg, left: S.lg, right: S.lg, flexDirection: "row", gap: 8 },
  statBox: { flex: 1, backgroundColor: C.bg2, borderRadius: R.md, padding: 10, borderWidth: 1, alignItems: "center" },
  statAmt: { fontSize: 12, fontWeight: "800" },
  statLabel: { fontSize: 10, color: C.t3, marginTop: 2 },
  alert: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: S.lg, marginBottom: 8, borderRadius: R.md, padding: 14, borderWidth: 1 },
  alertTxt: { flex: 1, fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: S.lg, marginTop: S.lg },
  secRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  secTitle: { fontSize: 18, fontWeight: "800", color: C.t1, marginBottom: 12 },
  seeAll: { fontSize: 12, color: C.mint, fontWeight: "700" },
  qaRow: { flexDirection: "row", justifyContent: "space-between" },
  qa: { alignItems: "center", gap: 8 },
  qaIcon: { width: 62, height: 62, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  qaLabel: { fontSize: 11, color: C.t2, fontWeight: "600" },
  banner: { marginHorizontal: S.lg, marginBottom: S.md, borderRadius: R.lg, overflow: "hidden", height: 100, borderWidth: 1, borderColor: C.b1 },
  bannerImg: { position: "absolute", width: "100%", height: 100, resizeMode: "cover" },
  bannerContent: { position: "absolute", top: 0, left: 0, bottom: 0, justifyContent: "center", padding: 16, gap: 4 },
  newBadge: { backgroundColor: C.mint, borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" },
  newBadgeTxt: { fontSize: 9, fontWeight: "900", color: "#000", letterSpacing: 1 },
  bannerTitle: { fontSize: 16, fontWeight: "800", color: C.t1 },
  bannerSub: { fontSize: 11, color: C.t3 },
  bannerArrow: { position: "absolute", right: 16, alignSelf: "center" },
  empty: { alignItems: "center", padding: S.xl },
  emptyTxt: { fontSize: 13, color: C.t3, textAlign: "center" },
});
