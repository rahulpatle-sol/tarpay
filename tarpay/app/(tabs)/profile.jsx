import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import Card from "../../components/Card";
import GBtn from "../../components/GBtn";

const IMG = { avatar:(n)=>`https://picsum.photos/seed/${encodeURIComponent(n||"u")}/80/80` };
const C = { bg0:"#050508", bg1:"#0C0C14", bg2:"#12121E", mint:"#00F5B4", mintDim:"#00F5B420", orange:"#FF9F43", t1:"#FFFFFF", t2:"#C4C4D4", t3:"#6E6E8A", t4:"#3D3D5C", b1:"#252540", b2:"#1A1A30", green:"#00F5B4", red:"#FF4567" };
const R = { md:16, lg:22, full:999 };
const S = { sm:8, md:16, lg:24, xl:32, xxl:48 };

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const doLogout = () => Alert.alert("Logout","Are you sure?",[
    {text:"Cancel"},
    {text:"Logout", style:"destructive", onPress:async()=>{ await logout(); router.replace("/(auth)/login"); }}
  ]);

  const Div = () => <View style={{height:1, backgroundColor:C.b2}}/>;

  const MI = ({icon, label, sub, color, onPress}) => (
    <TouchableOpacity style={{flexDirection:"row", alignItems:"center", gap:12, padding:16}} onPress={onPress} activeOpacity={0.8}>
      <View style={{width:36, height:36, borderRadius:10, backgroundColor:(color||C.mint)+"20", alignItems:"center", justifyContent:"center"}}>
        <Ionicons name={icon} size={17} color={color||C.mint}/>
      </View>
      <View style={{flex:1}}>
        <Text style={{fontSize:15, fontWeight:"600", color:C.t1}}>{label}</Text>
        {sub && <Text style={{fontSize:11, color:C.t3, marginTop:1}}>{sub}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={15} color={C.t4}/>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{paddingBottom:100}}>
      {/* Hero */}
      <View style={s.heroWrap}>
        <Image source={{uri:"https://picsum.photos/seed/profile-hero/800/300"}} style={StyleSheet.absoluteFill} blurRadius={8}/>
        <LinearGradient colors={["transparent","#050508"]} style={StyleSheet.absoluteFill}/>
        <View style={s.profileCenter}>
          <Image source={{uri:IMG.avatar(user?.name)}} style={s.bigAvatar}/>
          {user?.isMerchant && (
            <View style={s.merchantBadge}>
              <Ionicons name="storefront" size={11} color={C.mint}/>
              <Text style={s.merchantTxt}>{user?.businessName||"Merchant"}</Text>
            </View>
          )}
          <Text style={s.pName}>{user?.name}</Text>
          <Text style={s.pUpi}>{user?.upiId}</Text>
        </View>
      </View>

      {/* Balance */}
      <Card style={{marginHorizontal:S.lg, marginBottom:S.lg, alignItems:"center"}} glow>
        <Text style={{fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1}}>TarPay Balance</Text>
        <Text style={{fontSize:34, fontWeight:"900", color:C.t1, marginVertical:4}}>₹{(user?.balance||0).toLocaleString("en-IN")}</Text>
        <View style={{flexDirection:"row", alignItems:"center", gap:6}}>
          <View style={{width:8, height:8, borderRadius:4, backgroundColor:user?.fraudScore>=50?C.red:C.green}}/>
          <Text style={{fontSize:12, color:C.t3}}>Fraud Score: {user?.fraudScore||0}/100</Text>
        </View>
      </Card>

      {/* Activity */}
      <Text style={s.secLabel}>Activity</Text>
      <Card style={{marginHorizontal:S.lg, marginBottom:S.lg, padding:0, overflow:"hidden"}}>
        <MI icon="receipt"       label="Transactions"  onPress={()=>router.push("/(tabs)/history")}/>
        <Div/>
        <MI icon="alert-circle"  label="My Disputes"   onPress={()=>router.push("/(tabs)/disputes")} color={C.orange}/>
        <Div/>
        <MI icon="notifications" label="Notifications" onPress={()=>router.push("/notifs")}/>
      </Card>

      {/* Account */}
      <Text style={s.secLabel}>Account</Text>
      <Card style={{marginHorizontal:S.lg, marginBottom:S.lg, padding:0, overflow:"hidden"}}>
        <MI icon="call"   label="Phone"        sub={user?.phone}/>
        <Div/>
        <MI icon="at"     label="UPI ID"       sub={user?.upiId}/>
        <Div/>
        <MI icon="person" label="Account Type" sub={user?.isMerchant?"Merchant":"Consumer"}/>
      </Card>

      <GBtn variant="outline" title="Logout" onPress={doLogout} style={{marginTop:S.md, marginHorizontal:S.lg, borderColor:C.red}}/>
      <Text style={{fontSize:11, color:C.t4, textAlign:"center", marginTop:S.md}}>TarPay v1.0.0 · HACK HUSTLE 2.0</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex:1, backgroundColor:C.bg0 },
  heroWrap:     { height:280, position:"relative", overflow:"hidden" },
  profileCenter:{ alignItems:"center", position:"absolute", bottom:S.lg, width:"100%" },
  bigAvatar:    { width:84, height:84, borderRadius:42, borderWidth:3, borderColor:C.mint, marginBottom:10 },
  merchantBadge:{ flexDirection:"row", alignItems:"center", gap:4, backgroundColor:C.mintDim, paddingHorizontal:10, paddingVertical:4, borderRadius:999, marginBottom:6, borderWidth:1, borderColor:C.mint+"40" },
  merchantTxt:  { fontSize:11, color:C.mint, fontWeight:"700" },
  pName:        { fontSize:22, fontWeight:"900", color:C.t1 },
  pUpi:         { fontSize:12, color:C.mint, marginTop:2 },
  secLabel:     { fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, paddingHorizontal:S.lg, marginBottom:8 },
});