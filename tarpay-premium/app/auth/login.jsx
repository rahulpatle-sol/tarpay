/**
 * LoginScreen — Premium milk-green themed login
 * Animated form with shake on error
 */
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../hooks/useTheme";
import PBtn from "../../components/PBtn";
import PInput from "../../components/PInput";
import TarPayLogo from "../../components/TarPayLogo";
import { F, S, R } from "../../constants/theme";

export default function LoginScreen() {
  const { C } = useTheme();
  const router = useRouter();
  const [upiId, setUpiId] = useState("");
  const [pass,  setPass]  = useState("");
  const { login, loading } = useAuth();
  const shakeX = useRef(new Animated.Value(0)).current;
  const fadeIn  = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeIn, { toValue:1, duration:500, useNativeDriver:true }).start();
  }, []);

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeX,{toValue:10,duration:60,useNativeDriver:true}),
      Animated.timing(shakeX,{toValue:-10,duration:60,useNativeDriver:true}),
      Animated.timing(shakeX,{toValue:6,duration:60,useNativeDriver:true}),
      Animated.timing(shakeX,{toValue:0,duration:60,useNativeDriver:true}),
    ]).start();
  };

  const handle = async () => {
    if (!upiId||!pass) { shake(); return; }
    try {
      await login(upiId, pass);
      router.replace("/tabs/");
    } catch (e) {
      shake();
      Alert.alert("Login Failed", e.response?.data?.message||"Check your credentials and try again.");
    }
  };

  return (
    <KeyboardAvoidingView style={[s.container, {backgroundColor:C.bg0}]} behavior={Platform.OS==="ios"?"padding":undefined}>
      {/* Top accent */}
      <LinearGradient colors={[C.primary+"20","transparent"]} style={s.topGrad}/>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={{opacity:fadeIn}}>
          {/* Header */}
          <View style={s.header}>
            <TarPayLogo size={60} showText={false}/>
            <View style={{marginLeft:14}}>
              <Text style={[s.title, {color:C.t1}]}>Welcome back</Text>
              <Text style={[s.sub,   {color:C.t3}]}>Sign in to your TarPay account</Text>
            </View>
          </View>

          {/* Form */}
          <Animated.View style={[s.form, {transform:[{translateX:shakeX}]}]}>
            <PInput label="UPI ID" icon="at-circle-outline" placeholder="rahul@tarpay"
              value={upiId} onChange={setUpiId} hint="Your TarPay UPI ID"/>
            <PInput label="Password" icon="lock-closed-outline" placeholder="Enter password"
              value={pass} onChange={setPass} secure/>

            <PBtn title={loading?"Signing in...":"Sign In"} onPress={handle} loading={loading} style={{marginTop:8}}/>

            <View style={s.dividerRow}>
              <View style={[s.divider,{backgroundColor:C.b1}]}/>
              <Text style={[s.dividerTxt,{color:C.t3}]}>or</Text>
              <View style={[s.divider,{backgroundColor:C.b1}]}/>
            </View>

            <TouchableOpacity onPress={()=>router.push("/auth/register")} style={s.registerBtn}>
              <Text style={[s.registerTxt,{color:C.t2}]}>
                New to TarPay? <Text style={{color:C.primary,fontWeight:"700"}}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Demo box */}
          <View style={[s.demoBox, {backgroundColor:C.bg2, borderColor:C.b1}]}>
            <Text style={[{fontSize:F.sm, fontWeight:"700", color:C.primary, marginBottom:4}]}>Demo Credentials</Text>
            <Text style={[{fontSize:F.sm, color:C.t3}]}>UPI: <Text style={{color:C.t1, fontWeight:"600"}}>rahul@tarpay</Text>  Pass: <Text style={{color:C.t1, fontWeight:"600"}}>password123</Text></Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex:1 },
  topGrad:   { position:"absolute", top:0, left:0, right:0, height:200 },
  scroll:    { flexGrow:1, padding:S.lg, justifyContent:"center", paddingTop:60, paddingBottom:S.xxl },
  header:    { flexDirection:"row", alignItems:"center", marginBottom:S.xl },
  title:     { fontSize:F.xxl, fontWeight:"900", letterSpacing:-0.5 },
  sub:       { fontSize:F.body, marginTop:2 },
  form:      { gap:14 },
  dividerRow:{ flexDirection:"row", alignItems:"center", gap:10, marginVertical:4 },
  divider:   { flex:1, height:1 },
  dividerTxt:{ fontSize:F.sm },
  registerBtn:{ alignItems:"center", paddingVertical:8 },
  registerTxt:{ fontSize:F.body },
  demoBox:   { marginTop:S.lg, padding:14, borderRadius:R.md, borderWidth:1 },
});
