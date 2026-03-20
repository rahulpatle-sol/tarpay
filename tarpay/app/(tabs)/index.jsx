import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { userAPI, txAPI } from "../../services/api";
import TxRow from "../../components/TxRow";
import Card from "../../components/Card";

const { width } = Dimensions.get("window");

const IMG = { avatar:(n)=>`https://picsum.photos/seed/${encodeURIComponent(n||"u")}/80/80` };
const C = { bg0:"#050508", bg1:"#0C0C14", bg2:"#12121E", bg3:"#1A1A2E", mint:"#00F5B4", mintDim:"#00F5B420", blue:"#3D9EFF", green:"#00F5B4", red:"#FF4567", orange:"#FF9F43", purple:"#A855F7", t1:"#FFFFFF", t2:"#C4C4D4", t3:"#6E6E8A", t4:"#3D3D5C", b1:"#252540", b2:"#1A1A30", grad:["#00F5B4","#3D9EFF"] };
const R = { xs:6, sm:10, md:16, lg:22, xl:30, full:999 };
const S = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };

export default function HomeScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [stats,   setStats]   = useState(null);
  const [txns,    setTxns]    = useState([]);
  const [refresh, setRefresh] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, t, m] = await Promise.all([userAPI.dash(), txAPI.history({limit:5}), userAPI.me()]);
      setStats(d.data.stats); setTxns(t.data.transactions); setUser(m.data.user);
    } catch (e) { console.log(e.message); }
  }, []);

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  const QA = ({icon, label, color, route}) => (
    <TouchableOpacity style={s.qa} onPress={() => router.push(route)} activeOpacity={0.8}>
      <LinearGradient colors={[color+"30", color+"10"]} style={[s.qaIcon, {borderColor:color+"40"}]}>
        <Ionicons name={icon} size={22} color={color}/>
      </LinearGradient>
      <Text style={s.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.mint}/>}>

      {/* Hero */}
      <View style={s.hero}>
        <Image source={{uri:"https://picsum.photos/seed/tarpay-home/800/300"}} style={s.heroBg} blurRadius={3}/>
        <LinearGradient colors={["#0C0C14CC","#0C0C14F5","#0C0C14"]} style={StyleSheet.absoluteFill}/>
        <View style={s.heroHeader}>
          <View style={{flexDirection:"row", alignItems:"center", gap:10}}>
            <Image source={{uri:IMG.avatar(user?.name)}} style={s.avatar}/>
            <View>
              <Text style={{fontSize:11, color:C.t3}}>Good day 👋</Text>
              <Text style={{fontSize:18, fontWeight:"800", color:C.t1}}>{user?.name?.split(" ")[0] || "User"}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/notifs")} style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color={C.t2}/>
          </TouchableOpacity>
        </View>
        <View style={s.balWrap}>
          <Text style={{fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1}}>Available Balance</Text>
          <Text style={s.balAmt}>₹{(user?.balance||0).toLocaleString("en-IN")}</Text>
          <Text style={{fontSize:12, color:C.mint, fontWeight:"600", marginTop:4}}>{user?.upiId}</Text>
        </View>
        <View style={s.statsRow}>
          {[
            {l:"Received", a:stats?.totalReceived?.amount, c:C.green},
            {l:"Sent",     a:stats?.totalSent?.amount,     c:C.red},
            {l:"Escrow",   a:stats?.pendingEscrow?.amount, c:C.orange},
          ].map(st => (
            <View key={st.l} style={[s.statBox, {borderColor:st.c+"30"}]}>
              <Text style={{fontSize:12, fontWeight:"800", color:st.c}}>₹{(st.a||0).toLocaleString("en-IN",{maximumFractionDigits:0})}</Text>
              <Text style={{fontSize:10, color:C.t3, marginTop:2}}>{st.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Alerts */}
      {stats?.pendingEscrow?.count > 0 && (
        <TouchableOpacity onPress={() => router.push("/(tabs)/history")} activeOpacity={0.85}>
          <LinearGradient colors={[C.orange+"25", C.orange+"05"]} style={[s.alert, {borderColor:C.orange+"30"}]}>
            <Ionicons name="time" size={18} color={C.orange}/>
            <Text style={{flex:1, fontSize:13, fontWeight:"600", color:C.orange}}>
              {stats.pendingEscrow.count} payment{stats.pendingEscrow.count>1?"s":""} in escrow
            </Text>
            <Ionicons name="chevron-forward" size={16} color={C.orange}/>
          </LinearGradient>
        </TouchableOpacity>
      )}
      {stats?.openDisputes > 0 && (
        <TouchableOpacity onPress={() => router.push("/(tabs)/disputes")} activeOpacity={0.85}>
          <LinearGradient colors={[C.red+"25", C.red+"05"]} style={[s.alert, {borderColor:C.red+"30"}]}>
            <Ionicons name="alert-circle" size={18} color={C.red}/>
            <Text style={{flex:1, fontSize:13, fontWeight:"600", color:C.red}}>
              {stats.openDisputes} open dispute{stats.openDisputes>1?"s":""}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={C.red}/>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={s.section}>
        <Text style={s.secTitle}>Quick Actions</Text>
        <View style={s.qaRow}>
          <QA icon="send"         label="Send"     color={C.mint}   route="/(tabs)/send"/>
          <QA icon="receipt"      label="History"  color={C.blue}   route="/(tabs)/history"/>
          <QA icon="alert-circle" label="Disputes" color={C.orange} route="/(tabs)/disputes"/>
          <QA icon="person"       label="Profile"  color={C.purple} route="/(tabs)/profile"/>
        </View>
      </View>

      {/* Banner */}
      <TouchableOpacity style={s.banner} onPress={() => router.push("/(tabs)/send")} activeOpacity={0.9}>
        <Image source={{uri:"https://picsum.photos/seed/escrow-banner/800/200"}} style={StyleSheet.absoluteFill} blurRadius={2}/>
        <LinearGradient colors={["#050508AA","#050508"]} style={StyleSheet.absoluteFill}/>
        <View style={{padding:16, gap:4}}>
          <View style={{backgroundColor:C.mint, borderRadius:999, paddingHorizontal:8, paddingVertical:2, alignSelf:"flex-start"}}>
            <Text style={{fontSize:9, fontWeight:"900", color:"#000", letterSpacing:1}}>PROTECTED</Text>
          </View>
          <Text style={{fontSize:16, fontWeight:"800", color:C.t1}}>24hr Escrow Safety</Text>
          <Text style={{fontSize:11, color:C.t3}}>Every payment protected. Cancel anytime.</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={28} color={C.mint} style={{position:"absolute", right:16, top:36}}/>
      </TouchableOpacity>

      {/* Recent */}
      <View style={s.section}>
        <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <Text style={s.secTitle}>Recent</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
            <Text style={{fontSize:12, color:C.mint, fontWeight:"700"}}>See All →</Text>
          </TouchableOpacity>
        </View>
        {txns.length === 0
          ? <Card style={{alignItems:"center", padding:S.xl}}>
              <Text style={{fontSize:13, color:C.t3, textAlign:"center"}}>No transactions yet. Send your first payment!</Text>
            </Card>
          : txns.map(tx => <TxRow key={tx.id} tx={tx} userId={user?.id} onPress={() => router.push(`/tx/${tx.id}`)}/>)
        }
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flex:1, backgroundColor:C.bg0 },
  content:    { paddingBottom:100 },
  hero:       { position:"relative", overflow:"hidden" },
  heroBg:     { width:"100%", height:340, resizeMode:"cover" },
  heroHeader: { position:"absolute", top:56, left:S.lg, right:S.lg, flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  avatar:     { width:42, height:42, borderRadius:21, borderWidth:2, borderColor:C.mint },
  notifBtn:   { width:38, height:38, borderRadius:19, backgroundColor:"#0C0C14CC", alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:C.b1 },
  balWrap:    { position:"absolute", top:130, left:S.lg },
  balAmt:     { fontSize:40, fontWeight:"900", color:C.t1, letterSpacing:-1, marginVertical:2 },
  statsRow:   { position:"absolute", bottom:S.lg, left:S.lg, right:S.lg, flexDirection:"row", gap:8 },
  statBox:    { flex:1, backgroundColor:C.bg2, borderRadius:R.md, padding:10, borderWidth:1, alignItems:"center" },
  alert:      { flexDirection:"row", alignItems:"center", gap:10, marginHorizontal:S.lg, marginBottom:8, borderRadius:R.md, padding:14, borderWidth:1 },
  section:    { paddingHorizontal:S.lg, marginTop:S.lg },
  secTitle:   { fontSize:18, fontWeight:"800", color:C.t1, marginBottom:12 },
  qaRow:      { flexDirection:"row", justifyContent:"space-between" },
  qa:         { alignItems:"center", gap:8 },
  qaIcon:     { width:62, height:62, borderRadius:18, alignItems:"center", justifyContent:"center", borderWidth:1 },
  qaLabel:    { fontSize:11, color:C.t2, fontWeight:"600" },
  banner:     { marginHorizontal:S.lg, marginBottom:S.md, borderRadius:R.lg, overflow:"hidden", height:100, borderWidth:1, borderColor:C.b1 },
});