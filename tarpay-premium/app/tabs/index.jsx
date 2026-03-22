/**
 * HomeScreen — Premium TarPay dashboard
 * Balance card, stats, quick actions, recent transactions
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { userAPI, txAPI } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";
import TarPayLogo from "../../components/TarPayLogo";
import TRow from "../../components/TRow";
import PCard from "../../components/PCard";
import { F, S, R, IMG } from "../../constants/theme";

export default function HomeScreen() {
  const { C } = useTheme();
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [stats,   setStats]   = useState(null);
  const [txns,    setTxns]    = useState([]);
  const [refresh, setRefresh] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  const load = useCallback(async () => {
    try {
      const [d,t,m] = await Promise.all([userAPI.dash(), txAPI.history({limit:5}), userAPI.me()]);
      setStats(d.data.stats); setTxns(t.data.transactions); setUser(m.data.user);
    } catch(e) { console.log(e.message); }
  }, []);

  useEffect(() => {
    load();
    Animated.parallel([
      Animated.timing(fadeIn,  {toValue:1, duration:600, useNativeDriver:true}),
      Animated.spring(slideY,  {toValue:0, tension:50, friction:8, useNativeDriver:true}),
    ]).start();
  }, []);

  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  const QA = ({icon, label, color, route, badge}) => (
    <TouchableOpacity style={[s.qa, {backgroundColor:C.bg1, borderColor:C.b1}]} onPress={()=>router.push(route)} activeOpacity={0.82}>
      <View style={[s.qaIconWrap, {backgroundColor:color+"20"}]}>
        <Ionicons name={icon} size={22} color={color}/>
        {badge>0 && <View style={[s.badge, {backgroundColor:C.danger}]}><Text style={s.badgeTxt}>{badge}</Text></View>}
      </View>
      <Text style={[s.qaLabel, {color:C.t2}]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[s.container,{backgroundColor:C.bg0}]} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]}/>}>

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image source={{uri:IMG.avatar(user?.name)}} style={[s.avatar, {borderColor:C.primary}]}/>
          <View>
            <Text style={[s.greet,  {color:C.t3}]}>Namaste 🙏</Text>
            <Text style={[s.hName,  {color:C.t1}]}>{user?.name?.split(" ")[0]||"Friend"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={()=>router.push("/notifs")} style={[s.notifBtn,{backgroundColor:C.bg2,borderColor:C.b1}]}>
          <Ionicons name="notifications-outline" size={20} color={C.t2}/>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <Animated.View style={{opacity:fadeIn, transform:[{translateY:slideY}]}}>
        <LinearGradient colors={C.grad} start={{x:0,y:0}} end={{x:1,y:1}} style={s.balCard}>
          {/* Card decoration */}
          <View style={s.cardDecor1}/>
          <View style={s.cardDecor2}/>

          <View style={s.cardTop}>
            <TarPayLogo size={32} showText={false}/>
            <View style={s.escrowBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#fff"/>
              <Text style={s.escrowBadgeTxt}>Escrow Protected</Text>
            </View>
          </View>

          <Text style={s.balLabel}>Available Balance</Text>
          <Text style={s.balAmt}>₹{(user?.balance||0).toLocaleString("en-IN")}</Text>
          <Text style={s.upiId}>{user?.upiId}</Text>

          <View style={s.cardStats}>
            {[
              {l:"Received", a:stats?.totalReceived?.amount, icon:"arrow-down-circle"},
              {l:"Sent",     a:stats?.totalSent?.amount,     icon:"arrow-up-circle"},
              {l:"Escrow",   a:stats?.pendingEscrow?.amount, icon:"time"},
            ].map((st,i)=>(
              <View key={i} style={s.cardStat}>
                <Ionicons name={st.icon} size={13} color="rgba(255,255,255,0.8)"/>
                <Text style={s.cardStatAmt}>₹{(st.a||0).toLocaleString("en-IN",{maximumFractionDigits:0})}</Text>
                <Text style={s.cardStatLabel}>{st.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Alerts */}
      {stats?.pendingEscrow?.count>0 && (
        <TouchableOpacity onPress={()=>router.push({pathname:"/tabs/history",params:{status:"ON_HOLD"}})} activeOpacity={0.85}>
          <View style={[s.alert, {backgroundColor:C.warning+"12", borderColor:C.warning+"40"}]}>
            <View style={[s.alertIcon, {backgroundColor:C.warning+"20"}]}>
              <Ionicons name="time" size={16} color={C.warning}/>
            </View>
            <View style={{flex:1}}>
              <Text style={[s.alertTitle, {color:C.warning}]}>{stats.pendingEscrow.count} payment{stats.pendingEscrow.count>1?"s":""} in escrow</Text>
              <Text style={[s.alertSub, {color:C.t3}]}>₹{(stats.pendingEscrow.amount||0).toLocaleString("en-IN")} held safely</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.warning}/>
          </View>
        </TouchableOpacity>
      )}
      {stats?.openDisputes>0 && (
        <TouchableOpacity onPress={()=>router.push("/tabs/disputes")} activeOpacity={0.85}>
          <View style={[s.alert, {backgroundColor:C.danger+"12", borderColor:C.danger+"40"}]}>
            <View style={[s.alertIcon, {backgroundColor:C.danger+"20"}]}>
              <Ionicons name="alert-circle" size={16} color={C.danger}/>
            </View>
            <View style={{flex:1}}>
              <Text style={[s.alertTitle, {color:C.danger}]}>{stats.openDisputes} open dispute{stats.openDisputes>1?"s":""}</Text>
              <Text style={[s.alertSub, {color:C.t3}]}>Tap to track status</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.danger}/>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={s.section}>
        <Text style={[s.secTitle, {color:C.t1}]}>Quick Actions</Text>
        <View style={s.qaGrid}>
          <QA icon="send"          label="Send"      color={C.primary} route="/tabs/send"/>
          <QA icon="receipt"       label="History"   color={C.info}    route="/tabs/history"/>
          <QA icon="shield"        label="Disputes"  color={C.warning} route="/tabs/disputes" badge={stats?.openDisputes||0}/>
          <QA icon="bar-chart"     label="Analytics" color="#9C27B0"   route="/tabs/profile"/>
        </View>
      </View>

      {/* Escrow Feature Banner */}
      <TouchableOpacity onPress={()=>router.push("/tabs/send")} activeOpacity={0.88}>
        <LinearGradient colors={[C.primary+"18", C.primary+"08"]} style={[s.banner, {borderColor:C.b1}]}>
          <View style={[s.bannerIconWrap, {backgroundColor:C.primaryDim}]}>
            <Ionicons name="shield-checkmark" size={22} color={C.primary}/>
          </View>
          <View style={{flex:1, marginLeft:12}}>
            <View style={[s.newTag, {backgroundColor:C.gold, alignSelf:"flex-start", marginBottom:4}]}>
              <Text style={{fontSize:8, fontWeight:"900", color:"#fff", letterSpacing:1}}>SMART ESCROW</Text>
            </View>
            <Text style={[s.bannerTitle, {color:C.t1}]}>24hr Safety Hold</Text>
            <Text style={[s.bannerSub,   {color:C.t3}]}>Cancel within 1hr • Dispute anytime • Zero fees</Text>
          </View>
          <Ionicons name="arrow-forward-circle-outline" size={24} color={C.primary}/>
        </LinearGradient>
      </TouchableOpacity>

      {/* Recent Transactions */}
      <View style={s.section}>
        <View style={s.secRow}>
          <Text style={[s.secTitle, {color:C.t1}]}>Recent</Text>
          <TouchableOpacity onPress={()=>router.push("/tabs/history")}>
            <Text style={{fontSize:F.sm, color:C.primary, fontWeight:"700"}}>See All →</Text>
          </TouchableOpacity>
        </View>
        {txns.length===0
          ? <PCard style={{alignItems:"center", padding:S.xl}}>
              <Ionicons name="receipt-outline" size={36} color={C.t4} style={{marginBottom:8}}/>
          <Text style={{fontSize:F.body, color:C.t3, textAlign:"center"}}>{"No transactions yet\nSend your first payment!"}</Text>
            </PCard>
          : txns.map(tx=><TRow key={tx.id} tx={tx} userId={user?.id} onPress={()=>router.push(`/tx/${tx.id}`)}/>)
        }
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:     {flex:1},
  content:       {paddingBottom:100},
  header:        {flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:S.lg,paddingTop:56},
  headerLeft:    {flexDirection:"row",alignItems:"center",gap:10},
  avatar:        {width:42,height:42,borderRadius:21,borderWidth:2},
  greet:         {fontSize:F.xs},
  hName:         {fontSize:F.xl,fontWeight:"800",letterSpacing:-0.3},
  notifBtn:      {width:38,height:38,borderRadius:19,alignItems:"center",justifyContent:"center",borderWidth:1},
  balCard:       {marginHorizontal:S.lg,marginBottom:S.md,borderRadius:R.xl,padding:S.lg,paddingBottom:S.lg,overflow:"hidden"},
  cardDecor1:    {position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:70,backgroundColor:"rgba(255,255,255,0.08)"},
  cardDecor2:    {position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:50,backgroundColor:"rgba(255,255,255,0.05)"},
  cardTop:       {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:S.md},
  escrowBadge:   {flexDirection:"row",alignItems:"center",gap:4,backgroundColor:"rgba(255,255,255,0.2)",paddingHorizontal:10,paddingVertical:4,borderRadius:R.full},
  escrowBadgeTxt:{fontSize:10,color:"#fff",fontWeight:"600"},
  balLabel:      {fontSize:F.sm,color:"rgba(255,255,255,0.75)",textTransform:"uppercase",letterSpacing:1},
  balAmt:        {fontSize:40,fontWeight:"900",color:"#fff",letterSpacing:-1,marginVertical:2},
  upiId:         {fontSize:F.sm,color:"rgba(255,255,255,0.8)",marginBottom:S.md},
  cardStats:     {flexDirection:"row",gap:0},
  cardStat:      {flex:1,alignItems:"center",gap:2},
  cardStatAmt:   {fontSize:F.md,fontWeight:"700",color:"#fff"},
  cardStatLabel: {fontSize:F.xs,color:"rgba(255,255,255,0.65)"},
  alert:         {flexDirection:"row",alignItems:"center",gap:10,marginHorizontal:S.lg,marginBottom:8,borderRadius:R.md,padding:12,borderWidth:1},
  alertIcon:     {width:36,height:36,borderRadius:10,alignItems:"center",justifyContent:"center"},
  alertTitle:    {fontSize:F.md,fontWeight:"600"},
  alertSub:      {fontSize:F.xs,marginTop:1},
  section:       {paddingHorizontal:S.lg,marginTop:S.lg},
  secRow:        {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12},
  secTitle:      {fontSize:F.lg,fontWeight:"800",marginBottom:12,letterSpacing:-0.3},
  qaGrid:        {flexDirection:"row",justifyContent:"space-between",gap:10},
  qa:            {flex:1,alignItems:"center",padding:14,borderRadius:R.lg,borderWidth:1,gap:6},
  qaIconWrap:    {width:48,height:48,borderRadius:14,alignItems:"center",justifyContent:"center"},
  qaLabel:       {fontSize:F.xs,fontWeight:"600"},
  badge:         {position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:8,alignItems:"center",justifyContent:"center"},
  badgeTxt:      {fontSize:8,color:"#fff",fontWeight:"700"},
  banner:        {marginHorizontal:S.lg,borderRadius:R.lg,padding:16,flexDirection:"row",alignItems:"center",borderWidth:1},
  bannerIconWrap:{width:48,height:48,borderRadius:14,alignItems:"center",justifyContent:"center"},
  bannerTitle:   {fontSize:F.body,fontWeight:"700"},
  bannerSub:     {fontSize:F.xs,marginTop:2},
  newTag:        {paddingHorizontal:6,paddingVertical:2,borderRadius:4},
});
