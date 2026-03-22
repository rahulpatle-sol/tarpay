/**
 * PIN Screen — Set or verify UPI PIN
 * Secure 6-digit PIN like real UPI apps
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "../store/auth";
import { useTheme } from "../hooks/useTheme";
import UPIPinPad from "../components/UPIPinPad";
import TarPayLogo from "../components/TarPayLogo";
import { F, S } from "../constants/theme";

export default function PinScreen() {
  const { C } = useTheme();
  const router = useRouter();
  const { mode, redirect, txData } = useLocalSearchParams();
  const { setUpiPin, verifyPin } = useAuth();

  const handleComplete = async (pin) => {
    if (mode === "set") {
      await setUpiPin(pin);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(redirect || "/tabs/");
    } else if (mode === "verify") {
      if (verifyPin(pin)) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Pass back to send screen
        router.back();
        // Signal PIN verified via global state or router params
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  return (
    <View style={[s.container, {backgroundColor:C.bg0}]}>
      {/* Close button */}
      <TouchableOpacity onPress={()=>router.back()} style={[s.close, {backgroundColor:C.bg2}]}>
        <Text style={{fontSize:20,color:C.t1}}>×</Text>
      </TouchableOpacity>

      <View style={s.logoWrap}>
        <TarPayLogo size={50} showText={false}/>
        <Text style={[s.brand, {color:C.primary}]}>TarPay</Text>
        <Text style={[s.secure, {color:C.t3}]}>🔐 Secured by UPI PIN</Text>
      </View>

      <UPIPinPad
        title={mode==="set" ? "Set Your UPI PIN" : "Enter UPI PIN"}
        subtitle={mode==="set" ? "You'll need this for all payments" : "Authenticate your payment"}
        onComplete={handleComplete}
        pinLength={6}
        mode={mode||"set"}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex:1, paddingHorizontal:S.lg},
  close:     {position:"absolute",top:50,right:S.lg,width:36,height:36,borderRadius:18,alignItems:"center",justifyContent:"center",zIndex:10},
  logoWrap:  {alignItems:"center",paddingTop:100,marginBottom:S.lg},
  brand:     {fontSize:F.xl,fontWeight:"900",marginTop:8,letterSpacing:-0.5},
  secure:    {fontSize:F.sm,marginTop:4},
});
