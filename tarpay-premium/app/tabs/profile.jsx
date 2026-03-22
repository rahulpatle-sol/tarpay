import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../hooks/useTheme";
import PCard from "../../components/PCard";
import PBtn from "../../components/PBtn";
import TarPayLogo from "../../components/TarPayLogo";
import { F, S, R, IMG } from "../../constants/theme";

export default function ProfileScreen() {
  const { C } = useTheme();
  const { user, logout, upiPin } = useAuth();
  const router = useRouter();

  const doLogout = () => Alert.alert("Logout","Are you sure you want to logout?",[
    {text:"Cancel"},
    {text:"Logout",style:"destructive",onPress:async()=>{ await logout(); router.replace("/"); }}
  ]);

  const Div = () => <View style={{height:1,backgroundColor:C.b2,marginLeft:60}}/>;

  const MI = ({icon, label, sub, color, onPress, rightEl}) => (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.mIcon,{backgroundColor:(color||C.primary)+"18"}]}>
        <Ionicons name={icon} size={18} color={color||C.primary}/>
      </View>
      <View style={{flex:1}}>
        <Text style={{fontSize:F.body,fontWeight:"600",color:C.t1}}>{label}</Text>
        {sub&&<Text style={{fontSize:F.xs,color:C.t3,marginTop:1}}>{sub}</Text>}
      </View>
      {rightEl || <Ionicons name="chevron-forward" size={16} color={C.t4}/>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[s.container,{backgroundColor:C.bg0}]} contentContainerStyle={{paddingBottom:100}}>
      {/* Hero */}
      <LinearGradient colors={[C.primary+"30","transparent"]} style={s.heroGrad}>
        <View style={s.profileTop}>
          <Image source={{uri:IMG.avatar(user?.name)}} style={[s.bigAvatar,{borderColor:C.primary}]}/>
          <TarPayLogo size={24} showText={false} style={{position:"absolute",bottom:0,right:0}}/>
        </View>
        {user?.isMerchant&&(
          <View style={[s.merchantBadge,{backgroundColor:C.goldDim,borderColor:C.gold}]}>
            <Ionicons name="storefront" size={12} color={C.gold}/>
            <Text style={{fontSize:F.sm,color:C.gold,fontWeight:"700"}}>{user?.businessName||"Merchant"}</Text>
          </View>
        )}
        <Text style={[s.pName,{color:C.t1}]}>{user?.name}</Text>
        <Text style={[s.pUpi,{color:C.primary}]}>{user?.upiId}</Text>
      </LinearGradient>

      {/* Balance card */}
      <PCard style={{marginHorizontal:S.lg,marginBottom:S.lg,alignItems:"center"}} glow>
        <Text style={{fontSize:F.xs,color:C.t3,textTransform:"uppercase",letterSpacing:1}}>TarPay Balance</Text>
        <Text style={{fontSize:36,fontWeight:"900",color:C.t1,marginVertical:4,letterSpacing:-1}}>₹{(user?.balance||0).toLocaleString("en-IN")}</Text>
        <View style={{flexDirection:"row",alignItems:"center",gap:6}}>
          <View style={{width:8,height:8,borderRadius:4,backgroundColor:user?.fraudScore>=50?C.danger:C.success}}/>
          <Text style={{fontSize:F.xs,color:C.t3}}>Fraud Score: {user?.fraudScore||0}/100</Text>
        </View>
      </PCard>

      {/* UPI PIN */}
      <Text style={[s.secLabel,{color:C.t3}]}>Security</Text>
      <PCard style={{marginHorizontal:S.lg,marginBottom:S.lg,padding:0,overflow:"hidden"}} noPad>
        <TouchableOpacity style={s.menuItem} onPress={()=>router.push({pathname:"/pin",params:{mode:"set"}})} activeOpacity={0.8}>
          <View style={[s.mIcon,{backgroundColor:C.primary+"18"}]}>
            <Ionicons name="keypad" size={18} color={C.primary}/>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:F.body,fontWeight:"600",color:C.t1}}>UPI PIN</Text>
            <Text style={{fontSize:F.xs,color:C.t3,marginTop:1}}>{upiPin?"PIN is set — tap to change":"Set PIN for payment security"}</Text>
          </View>
          <View style={[{paddingHorizontal:8,paddingVertical:3,borderRadius:R.full},{backgroundColor:upiPin?C.success+"18":C.warning+"18"}]}>
            <Text style={{fontSize:10,fontWeight:"700",color:upiPin?C.success:C.warning}}>{upiPin?"Active":"Not Set"}</Text>
          </View>
        </TouchableOpacity>
      </PCard>

      {/* Activity */}
      <Text style={[s.secLabel,{color:C.t3}]}>Activity</Text>
      <PCard style={{marginHorizontal:S.lg,marginBottom:S.lg,padding:0,overflow:"hidden"}} noPad>
        <MI icon="receipt"        label="All Transactions" onPress={()=>router.push("/tabs/history")}/>
        <Div/>
        <MI icon="shield"         label="My Disputes"      onPress={()=>router.push("/tabs/disputes")} color={C.warning}/>
        <Div/>
        <MI icon="notifications"  label="Notifications"    onPress={()=>router.push("/notifs")}/>
      </PCard>

      {/* Account */}
      <Text style={[s.secLabel,{color:C.t3}]}>Account</Text>
      <PCard style={{marginHorizontal:S.lg,marginBottom:S.lg,padding:0,overflow:"hidden"}} noPad>
        <MI icon="call-outline"  label="Phone"        sub={user?.phone}/>
        <Div/>
        <MI icon="at-circle-outline"  label="UPI ID"  sub={user?.upiId}/>
        <Div/>
        <MI icon="person-outline" label="Account Type" sub={user?.isMerchant?"Merchant Account":"Consumer Account"}/>
      </PCard>

      <PBtn variant="danger" title="Logout" onPress={doLogout} style={{marginHorizontal:S.lg,marginTop:4}}/>
      <Text style={{fontSize:F.xs,color:C.t4,textAlign:"center",marginTop:S.lg}}>TarPay v2.0 · HACK HUSTLE 2.0 · FinTech Track</Text>
      <Text style={{fontSize:F.xs,color:C.t4,textAlign:"center",marginTop:2}}>॥ तर्पण ॥ — Honouring the ones before us</Text>
    </ScrollView>
  );
}
const s=StyleSheet.create({
  container:{flex:1},
  heroGrad:{paddingTop:56,paddingBottom:S.lg,paddingHorizontal:S.lg,alignItems:"center"},
  profileTop:{position:"relative",marginBottom:S.sm},
  bigAvatar:{width:84,height:84,borderRadius:42,borderWidth:3},
  merchantBadge:{flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:12,paddingVertical:5,borderRadius:R.full,borderWidth:1,marginBottom:8},
  pName:{fontSize:F.xl,fontWeight:"900",letterSpacing:-0.5},
  pUpi:{fontSize:F.body,marginTop:2,fontWeight:"600"},
  secLabel:{fontSize:F.xs,color:"#000",textTransform:"uppercase",letterSpacing:1,paddingHorizontal:S.lg,marginBottom:8},
  menuItem:{flexDirection:"row",alignItems:"center",gap:12,padding:16},
  mIcon:{width:36,height:36,borderRadius:10,alignItems:"center",justifyContent:"center"},
});
