import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../hooks/useTheme";
import PBtn from "../../components/PBtn";
import PInput from "../../components/PInput";
import TarPayLogo from "../../components/TarPayLogo";
import { F, S, R } from "../../constants/theme";

export default function RegisterScreen() {
  const { C } = useTheme();
  const router = useRouter();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({name:"",phone:"",upiId:"",password:"",isMerchant:false,businessName:""});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handle = async () => {
    if (!form.name||!form.phone||!form.upiId||!form.password) {
      Alert.alert("Missing Fields","Please fill all required fields.");
      return;
    }
    if (!form.upiId.endsWith("@tarpay")) {
      Alert.alert("Invalid UPI ID","UPI ID must end with @tarpay\nExample: yourname@tarpay");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Weak Password","Password must be at least 6 characters.");
      return;
    }
    try {
      await register(form);
      Alert.alert("Account Created! 🎉","You receive ₹10,000 TarPay credits to start.",[
        {text:"Set UPI PIN", onPress:()=>router.push({pathname:"/pin", params:{mode:"set",redirect:"/auth/login"}})},
        {text:"Login Now", onPress:()=>router.replace("/auth/login")},
      ]);
    } catch(e) {
      Alert.alert("Registration Failed", e.response?.data?.message||"Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView style={[s.container,{backgroundColor:C.bg0}]} behavior={Platform.OS==="ios"?"padding":undefined}>
      <LinearGradient colors={[C.primary+"20","transparent"]} style={s.topGrad}/>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={()=>router.back()} style={[s.back,{backgroundColor:C.bg2,borderColor:C.b1}]}>
          <Ionicons name="arrow-back" size={20} color={C.t1}/>
        </TouchableOpacity>
        <View style={s.header}>
          <TarPayLogo size={48} showText={false}/>
          <View style={{marginLeft:12}}>
            <Text style={[s.title,{color:C.t1}]}>Create Account</Text>
            <Text style={[s.sub,{color:C.t3}]}>Join 300M+ UPI users, safely</Text>
          </View>
        </View>
        <View style={[s.creditPill,{backgroundColor:C.goldDim,borderColor:C.gold}]}>
          <Ionicons name="gift-outline" size={15} color={C.gold}/>
          <Text style={[s.creditTxt,{color:C.gold}]}>Get ₹10,000 TarPay credits on signup</Text>
        </View>
        <View style={s.form}>
          <PInput label="Full Name"  icon="person-outline"     placeholder="Rahul Sharma"      value={form.name}         onChange={v=>set("name",v)}/>
          <PInput label="Phone"      icon="call-outline"        placeholder="9876543210"         value={form.phone}        onChange={v=>set("phone",v)}    keyb="phone-pad"/>
          <PInput label="UPI ID"     icon="at-circle-outline"   placeholder="rahul@tarpay"       value={form.upiId}        onChange={v=>set("upiId",v)}    hint="Must end with @tarpay"/>
          <PInput label="Password"   icon="lock-closed-outline" placeholder="Min 6 characters"   value={form.password}     onChange={v=>set("password",v)} secure/>
          <View style={[s.toggle,{backgroundColor:C.bg2,borderColor:C.b1}]}>
            <View style={[s.toggleIcon,{backgroundColor:C.primaryDim}]}>
              <Ionicons name="storefront-outline" size={18} color={C.primary}/>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.body,fontWeight:"600",color:C.t1}}>Merchant Account</Text>
              <Text style={{fontSize:F.sm,color:C.t3,marginTop:1}}>For businesses & shops</Text>
            </View>
            <Switch
              value={form.isMerchant}
              onValueChange={v=>set("isMerchant",v)}
              trackColor={{false:C.b1,true:C.primary+"60"}}
              thumbColor={form.isMerchant?C.primary:C.t4}
            />
          </View>
          {form.isMerchant && (
            <PInput label="Business Name" icon="business-outline" placeholder="Rajat ka Samosa Corner" value={form.businessName} onChange={v=>set("businessName",v)}/>
          )}
          <PBtn title="Create Account" onPress={handle} loading={loading} style={{marginTop:4}}/>
          <TouchableOpacity onPress={()=>router.push("/auth/login")} style={{alignItems:"center",paddingVertical:8}}>
            <Text style={{fontSize:F.body,color:C.t3}}>
              Already have account? <Text style={{color:C.primary,fontWeight:"700"}}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  {flex:1},
  topGrad:    {position:"absolute",top:0,left:0,right:0,height:200},
  scroll:     {flexGrow:1,padding:S.lg,paddingBottom:S.xxl},
  back:       {width:40,height:40,borderRadius:20,alignItems:"center",justifyContent:"center",borderWidth:1,marginBottom:S.lg,marginTop:16},
  header:     {flexDirection:"row",alignItems:"center",marginBottom:S.md},
  title:      {fontSize:F.xxl,fontWeight:"900",letterSpacing:-0.5},
  sub:        {fontSize:F.body,marginTop:2},
  creditPill: {flexDirection:"row",alignItems:"center",gap:6,padding:10,borderRadius:R.full,borderWidth:1,alignSelf:"flex-start",marginBottom:S.md},
  creditTxt:  {fontSize:F.sm,fontWeight:"600"},
  form:       {gap:14},
  toggle:     {flexDirection:"row",alignItems:"center",gap:12,padding:14,borderRadius:R.md,borderWidth:1},
  toggleIcon: {width:36,height:36,borderRadius:10,alignItems:"center",justifyContent:"center"},
});