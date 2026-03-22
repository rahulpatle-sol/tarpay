/**
 * SendScreen — Premium 3-step payment flow
 * Step 1: Validate UPI → Step 2: Amount + UPI PIN → Step 3: Success
 * Animated transitions, sound effects, haptic feedback
 */
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Keyboard, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { txAPI } from "../../services/api";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../hooks/useTheme";
import { useSound } from "../../hooks/useSound";
import PBtn from "../../components/PBtn";
import PCard from "../../components/PCard";
import PInput from "../../components/PInput";
import UPIPinPad from "../../components/UPIPinPad";
import { F, S, R, IMG } from "../../constants/theme";

const QUICK = [50, 100, 500, 1000, 2000, 5000];

export default function SendScreen() {
  const { C } = useTheme();
  const { user, setUser, verifyPin, upiPin } = useAuth();
  const router  = useRouter();
  const { playSuccess, playError } = useSound();
  const [step,     setStep]     = useState(1);
  const [upi,      setUpi]      = useState("");
  const [receiver, setReceiver] = useState(null);
  const [warn,     setWarn]     = useState(null);
  const [amt,      setAmt]      = useState("");
  const [desc,     setDesc]     = useState("");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [showPin,  setShowPin]  = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideX    = useRef(new Animated.Value(0)).current;

  const nextStep = () => {
    Animated.sequence([
      Animated.timing(slideX, {toValue:-20, duration:100, useNativeDriver:true}),
      Animated.timing(slideX, {toValue:0,   duration:200, useNativeDriver:true}),
    ]).start();
  };

  const validate = async () => {
    if (!upi) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const {data} = await txAPI.validate(upi);
      setReceiver(data.receiver);
      setWarn(data.warning||null);
      if (data.warning) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      nextStep();
      setStep(2);
    } catch(e) {
      await playError();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("UPI Not Found", e.response?.data?.message||"Check the UPI ID and try again.");
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    const n = parseFloat(amt);
    if (!n||n<=0) { Alert.alert("Enter Amount","Please enter a valid amount."); return; }
    if (n>(user?.balance||0)) { Alert.alert("Insufficient Balance",`Your balance: ₹${user?.balance?.toLocaleString("en-IN")}`); return; }
    // Check if PIN is set
    if (upiPin) { setShowPin(true); return; }
    await processSend();
  };

  const processSend = async () => {
    setLoading(true);
    const n = parseFloat(amt);
    try {
      const {data} = await txAPI.send({receiverUpiId:upi, amount:n, description:desc});
      setResult(data);
      setUser({...user, balance:(user?.balance||0)-n});
      await playSuccess();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(3);
    } catch(e) {
      await playError();
      Alert.alert("Payment Failed", e.response?.data?.message||"Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handlePinComplete = async (pin) => {
    setShowPin(false);
    if (verifyPin(pin)) {
      await processSend();
    } else {
      await playError();
      Alert.alert("Wrong PIN","Incorrect UPI PIN. Please try again.");
    }
  };

  const reset = () => { setStep(1); setUpi(""); setReceiver(null); setWarn(null); setAmt(""); setDesc(""); setResult(null); setShowPin(false); };

  if (showPin) return (
    <View style={[s.container, {backgroundColor:C.bg0, justifyContent:"center"}]}>
      <UPIPinPad title="Confirm Payment" subtitle={`Paying ₹${parseFloat(amt).toLocaleString("en-IN")} to ${receiver?.name}`}
        onComplete={handlePinComplete} pinLength={6} mode="verify"/>
      <PBtn title="Cancel" variant="ghost" onPress={()=>setShowPin(false)} style={{marginHorizontal:S.lg}}/>
    </View>
  );

  // SUCCESS screen
  if (step===3 && result) return (
    <ScrollView style={[s.container,{backgroundColor:C.bg0}]} contentContainerStyle={{flexGrow:1,justifyContent:"center",padding:S.lg}}>
      <View style={s.successContent}>
        {/* Animated checkmark */}
        <LinearGradient colors={C.grad} style={s.successCircle}>
          <Ionicons name="checkmark" size={52} color="#fff"/>
        </LinearGradient>

        <Text style={[s.successTitle, {color:C.t1}]}>Payment Sent!</Text>
        <Text style={[s.successAmt, {color:C.primary}]}>₹{parseFloat(amt).toLocaleString("en-IN")}</Text>
        <Text style={[s.successTo, {color:C.t3}]}>to {receiver?.name}</Text>

        {/* Escrow card */}
        <PCard style={{width:"100%", marginTop:S.lg, gap:8}} glow>
          <View style={{flexDirection:"row",alignItems:"center",gap:8}}>
            <View style={[{width:36,height:36,borderRadius:10,alignItems:"center",justifyContent:"center"},{backgroundColor:C.warning+"20"}]}>
              <Ionicons name="time" size={18} color={C.warning}/>
            </View>
            <Text style={{fontSize:F.body,fontWeight:"700",color:C.t1}}>Held in Escrow — 24 Hours</Text>
          </View>
          <Text style={{fontSize:F.sm,color:C.t3,lineHeight:18}}>
            {receiver?.name} will receive funds after 24hrs. You can cancel within 1 hour or raise a dispute anytime.
          </Text>
          {result.isFlagged && (
            <View style={{flexDirection:"row",alignItems:"center",gap:6,marginTop:4,backgroundColor:C.danger+"12",padding:8,borderRadius:R.sm}}>
              <Ionicons name="warning" size={13} color={C.danger}/>
              <Text style={{fontSize:F.xs,color:C.danger}}>Auto-flagged: risk score {result.riskScore}/100</Text>
            </View>
          )}
        </PCard>

        <PBtn title="View Transaction" onPress={()=>{reset();router.push(`/tx/${result.transaction.id}`);}} style={{width:"100%",marginTop:S.lg}}/>
        <PBtn title="Send Another" variant="outline" onPress={reset} style={{width:"100%",marginTop:10}}/>
        <PBtn title="Go Home" variant="ghost" onPress={()=>{reset();router.push("/tabs/");}} style={{marginTop:4}}/>
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={[s.container,{backgroundColor:C.bg0}]} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={()=>step===1?router.push("/tabs/"):setStep(step-1)} style={[s.back,{backgroundColor:C.bg2,borderColor:C.b1}]}>
          <Ionicons name="arrow-back" size={20} color={C.t1}/>
        </TouchableOpacity>
        <Text style={[s.headerTitle,{color:C.t1}]}>{step===1?"Send Money":"Enter Amount"}</Text>
        <View style={{width:40}}/>
      </View>

      {/* Step indicator */}
      <View style={s.steps}>
        {[1,2].map(n=>(
          <View key={n} style={[s.stepDot, {backgroundColor: n<=step ? C.primary : C.b1, width: n===step?24:8}]}/>
        ))}
      </View>

      <Animated.View style={{transform:[{translateX:slideX}]}}>
        {step===1 && (
          <View style={s.stepContent}>
            <Text style={[s.stepTitle,{color:C.t1}]}>Who are you paying?</Text>
            <Text style={[s.stepSub,{color:C.t3}]}>Enter TarPay UPI ID of the receiver</Text>
            <PInput icon="at-circle-outline" placeholder="e.g. priya@tarpay"
              value={upi} onChange={setUpi} style={{marginTop:S.lg}}
              hint="Format: name@tarpay"/>
            {/* Suggestions */}
            <View style={{flexDirection:"row",gap:8,marginTop:10,flexWrap:"wrap"}}>
              {["priya@tarpay","samosa@tarpay"].map(id=>(
                <TouchableOpacity key={id} style={[s.chip,{backgroundColor:C.bg2,borderColor:C.b1}]} onPress={()=>setUpi(id)}>
                  <Ionicons name="person-circle-outline" size={13} color={C.t3}/>
                  <Text style={{fontSize:F.sm,color:C.t2}}>{id}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <PBtn title="Verify & Continue →" onPress={validate} loading={loading} style={{marginTop:S.lg}}/>
          </View>
        )}

        {step===2 && receiver && (
          <View style={s.stepContent}>
            {/* Receiver card */}
            <PCard style={{marginBottom:S.md}} glow>
              <View style={{flexDirection:"row",alignItems:"center",gap:12}}>
                <Image source={{uri:IMG.avatar(receiver.name)}} style={[s.recAvatar,{borderColor:C.b1}]}/>
                <View style={{flex:1}}>
                  <Text style={{fontSize:F.lg,fontWeight:"700",color:C.t1}}>{receiver.name}</Text>
                  <Text style={{fontSize:F.sm,color:C.t3,marginTop:1}}>{receiver.upiId}</Text>
                  {receiver.businessName&&<Text style={{fontSize:F.sm,color:C.primary,marginTop:1}}>{receiver.businessName}</Text>}
                </View>
                <View style={[s.verifiedBadge,{backgroundColor:C.success+"18"}]}>
                  <Ionicons name="checkmark-circle" size={20} color={C.success}/>
                  <Text style={{fontSize:10,color:C.success,fontWeight:"600"}}>Verified</Text>
                </View>
              </View>
            </PCard>

            {warn && (
              <View style={[s.warnBox,{backgroundColor:C.warning+"12",borderColor:C.warning+"40"}]}>
                <Ionicons name="warning" size={15} color={C.warning}/>
                <Text style={{fontSize:F.sm,color:C.warning,flex:1}}>{warn}</Text>
              </View>
            )}

            {/* Big amount display */}
            <View style={s.amtDisplay}>
              <Text style={[s.rupeeSign,{color:C.t3}]}>₹</Text>
              <Text style={[s.amtBig,{color:parseFloat(amt)>0?C.t1:C.t4}]}>{amt||"0"}</Text>
            </View>

            <PInput placeholder="Enter amount" value={amt} onChange={setAmt} keyb="numeric"/>

            {/* Quick amounts */}
            <View style={s.quickGrid}>
              {QUICK.map(q=>(
                <TouchableOpacity key={q} style={[s.qChip,{backgroundColor:C.bg2,borderColor:C.b1}]} onPress={()=>setAmt(String(q))}>
                  <Text style={{fontSize:F.sm,color:C.t1,fontWeight:"600"}}>₹{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <PInput icon="chatbubble-ellipses-outline" placeholder="Add note (optional)" value={desc} onChange={setDesc}/>

            {/* Escrow reminder */}
            <View style={[s.escrowNote,{backgroundColor:C.primaryDim,borderColor:C.b1}]}>
              <Ionicons name="shield-checkmark" size={14} color={C.primary}/>
              <Text style={{fontSize:F.xs,color:C.primary,flex:1}}>
                Funds held in escrow for 24hrs. Cancel within 1hr.{upiPin?" UPI PIN required to confirm.":""}
              </Text>
            </View>

            <PBtn
              title={`Pay ₹${parseFloat(amt)||0} ${upiPin?"(PIN required)":""}`}
              onPress={handleSend}
              loading={loading}
              disabled={!amt||parseFloat(amt)<=0}
              icon={upiPin?<Ionicons name="keypad" size={16} color="#fff"/>:null}
            />
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    {flex:1},
  content:      {padding:S.lg,paddingBottom:100},
  header:       {flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:S.md,paddingTop:12},
  back:         {width:40,height:40,borderRadius:20,alignItems:"center",justifyContent:"center",borderWidth:1},
  headerTitle:  {fontSize:F.lg,fontWeight:"800",letterSpacing:-0.3},
  steps:        {flexDirection:"row",gap:6,justifyContent:"center",marginBottom:S.lg},
  stepDot:      {height:8,borderRadius:4},
  stepContent:  {gap:12},
  stepTitle:    {fontSize:F.xl,fontWeight:"900",letterSpacing:-0.5},
  stepSub:      {fontSize:F.body},
  chip:         {flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:12,paddingVertical:7,borderRadius:R.full,borderWidth:1},
  recAvatar:    {width:52,height:52,borderRadius:26,borderWidth:1},
  verifiedBadge:{alignItems:"center",justifyContent:"center",gap:2,paddingHorizontal:8,paddingVertical:4,borderRadius:R.sm},
  warnBox:      {flexDirection:"row",alignItems:"flex-start",gap:8,padding:12,borderRadius:R.sm,borderWidth:1},
  amtDisplay:   {flexDirection:"row",alignItems:"center",justifyContent:"center",paddingVertical:S.md},
  rupeeSign:    {fontSize:32,fontWeight:"700",marginRight:4},
  amtBig:       {fontSize:64,fontWeight:"900",letterSpacing:-3},
  quickGrid:    {flexDirection:"row",gap:8,flexWrap:"wrap"},
  qChip:        {paddingHorizontal:14,paddingVertical:8,borderRadius:R.full,borderWidth:1},
  escrowNote:   {flexDirection:"row",alignItems:"flex-start",gap:8,padding:12,borderRadius:R.sm,borderWidth:1},
  successContent:{alignItems:"center"},
  successCircle: {width:100,height:100,borderRadius:50,alignItems:"center",justifyContent:"center",marginBottom:S.lg,shadowColor:"#00875A",shadowOffset:{width:0,height:8},shadowOpacity:0.4,shadowRadius:20,elevation:16},
  successTitle:  {fontSize:F.xxl,fontWeight:"900",letterSpacing:-0.5},
  successAmt:    {fontSize:48,fontWeight:"900",letterSpacing:-2},
  successTo:     {fontSize:F.body,marginBottom:S.sm},
});
