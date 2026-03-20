import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, KeyboardAvoidingView, Platform, Alert, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import GBtn from "../../components/GBtn";
import Input from "../../components/Input";

const { width, height } = Dimensions.get("window");

// ── inline theme (no import needed) ──────────────────────────────────────
const C = { bg0:"#050508", bg1:"#0C0C14", bg2:"#12121E", bg3:"#1A1A2E", mint:"#00F5B4", mintDim:"#00F5B420", t1:"#FFFFFF", t2:"#C4C4D4", t3:"#6E6E8A", t4:"#3D3D5C", b1:"#252540", grad:["#00F5B4","#3D9EFF"] };
const R = { xl:30, full:999 };
const S = { sm:8, md:16, lg:24, xl:32, xxl:48 };

export default function LoginScreen() {
  const [upiId, setUpiId] = useState("");
  const [pass,  setPass]  = useState("");
  const { login, loading } = useAuth();
  const router = useRouter();
  const shake  = useRef(new Animated.Value(0)).current;

  const doShake = () => Animated.sequence([
    Animated.timing(shake,{toValue:12,duration:60,useNativeDriver:true}),
    Animated.timing(shake,{toValue:-12,duration:60,useNativeDriver:true}),
    Animated.timing(shake,{toValue:6,duration:60,useNativeDriver:true}),
    Animated.timing(shake,{toValue:0,duration:60,useNativeDriver:true}),
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
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS==="ios"?"padding":undefined}>
      <Image source={{uri:"https://picsum.photos/seed/tarpay-login/800/1400"}} style={s.bg} blurRadius={8}/>
      <LinearGradient colors={["#05050800","#050508CC","#050508"]} style={s.grad}/>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <LinearGradient colors={C.grad} start={{x:0,y:0}} end={{x:1,y:1}} style={s.logo}>
            <Text style={s.logoTxt}>T</Text>
          </LinearGradient>
          <Text style={s.brand}>TarPay</Text>
          <Text style={s.tagline}>Paise bhejo, darr nahi 💚</Text>
        </View>
        <Animated.View style={[s.card, {transform:[{translateX:shake}]}]}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <View style={{gap:14}}>
            <Input label="UPI ID"   icon="at"         placeholder="rahul@tarpay" value={upiId} onChange={setUpiId} hint="Format: name@tarpay"/>
            <Input label="Password" icon="lock-closed" placeholder="••••••••"    value={pass}  onChange={setPass}  secure/>
          </View>
          <GBtn title="Sign In" onPress={handle} loading={loading} style={{marginTop:8}}/>
          <TouchableOpacity onPress={()=>router.push("/(auth)/register")} style={{alignItems:"center",paddingVertical:10}}>
            <Text style={{fontSize:14,color:C.t3}}>New to TarPay? <Text style={{color:C.mint,fontWeight:"700"}}>Create Account</Text></Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={s.demo}>
          <Text style={{fontSize:12,color:C.t3}}>Demo: <Text style={{color:C.mint}}>rahul@tarpay</Text> / password123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg0 },
  bg:        { position:"absolute", width, height, resizeMode:"cover" },
  grad:      { position:"absolute", top:0, left:0, right:0, bottom:0 },
  scroll:    { flexGrow:1, padding:S.lg, justifyContent:"flex-end", paddingBottom:S.xxl },
  logoWrap:  { alignItems:"center", marginBottom:S.xl },
  logo:      { width:80, height:80, borderRadius:24, alignItems:"center", justifyContent:"center", shadowColor:"#00F5B4", shadowOffset:{width:0,height:8}, shadowOpacity:0.6, shadowRadius:20, elevation:16 },
  logoTxt:   { fontSize:44, fontWeight:"900", color:"#000" },
  brand:     { fontSize:28, fontWeight:"900", color:C.t1, marginTop:12, letterSpacing:-0.5 },
  tagline:   { fontSize:13, color:C.t3, marginTop:4 },
  card:      { backgroundColor:"#0C0C14EE", borderRadius:22, borderWidth:1, borderColor:C.b1, padding:S.lg, gap:S.md },
  cardTitle: { fontSize:22, fontWeight:"800", color:C.t1 },
  demo:      { alignItems:"center", marginTop:S.md, padding:10, backgroundColor:C.mintDim, borderRadius:8 },
});