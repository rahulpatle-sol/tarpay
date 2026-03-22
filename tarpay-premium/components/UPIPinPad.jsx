/**
 * UPIPinPad — Secure UPI PIN entry (4-6 digits)
 * Like real UPI apps — dot display + number keypad
 * Supports set PIN mode and verify PIN mode
 */
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../hooks/useTheme";
import { R, F, S } from "../constants/theme";

const KEYS = [
  ["1","2","3"],
  ["4","5","6"],
  ["7","8","9"],
  ["","0","⌫"],
];

export default function UPIPinPad({ title, subtitle, onComplete, pinLength=6, mode="set" }) {
  const { C } = useTheme();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState(1); // 1=enter, 2=confirm (set mode)
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim,{toValue:8,duration:60,useNativeDriver:true}),
      Animated.timing(shakeAnim,{toValue:-8,duration:60,useNativeDriver:true}),
      Animated.timing(shakeAnim,{toValue:6,duration:60,useNativeDriver:true}),
      Animated.timing(shakeAnim,{toValue:0,duration:60,useNativeDriver:true}),
    ]).start();
  };

  const handleKey = (key) => {
    if (key === "") return;
    if (key === "⌫") {
      if (step===1) setPin(p=>p.slice(0,-1));
      else setConfirm(c=>c.slice(0,-1));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step===1) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === pinLength) {
        if (mode==="set") {
          setTimeout(()=>setStep(2), 150);
        } else {
          setTimeout(()=>onComplete(newPin), 150);
        }
      }
    } else {
      const newConfirm = confirm + key;
      setConfirm(newConfirm);
      if (newConfirm.length === pinLength) {
        if (newConfirm === pin) {
          setTimeout(()=>onComplete(newConfirm), 150);
        } else {
          shake();
          setTimeout(()=>{ setConfirm(""); setPin(""); setStep(1); }, 600);
        }
      }
    }
  };

  const currentVal = step===1 ? pin : confirm;
  const displayTitle = mode==="verify" ? title : (step===1 ? "Set UPI PIN" : "Confirm UPI PIN");
  const displaySub   = mode==="verify" ? subtitle : (step===1 ? `Enter ${pinLength}-digit PIN` : "Enter PIN again to confirm");

  return (
    <View style={s.container}>
      <Text style={[s.title, {color:C.t1}]}>{displayTitle}</Text>
      <Text style={[s.sub,   {color:C.t3}]}>{displaySub}</Text>

      {/* PIN dots */}
      <Animated.View style={[s.dots, {transform:[{translateX:shakeAnim}]}]}>
        {Array(pinLength).fill(0).map((_,i)=>(
          <View key={i} style={[
            s.dot,
            { borderColor:C.primary,
              backgroundColor: i < currentVal.length ? C.primary : "transparent" }
          ]}/>
        ))}
      </Animated.View>

      {/* Keypad */}
      <View style={s.pad}>
        {KEYS.map((row, ri)=>(
          <View key={ri} style={s.row}>
            {row.map((key, ki)=>(
              <TouchableOpacity
                key={ki}
                style={[s.key, key===""&&{opacity:0}, {backgroundColor:C.bg2}]}
                onPress={()=>handleKey(key)}
                activeOpacity={0.75}
                disabled={key===""}
              >
                {key==="⌫"
                  ? <Ionicons name="backspace-outline" size={22} color={C.t1}/>
                  : <Text style={[s.keyTxt, {color:C.t1}]}>{key}</Text>
                }
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems:"center", paddingVertical:S.lg },
  title:     { fontSize:F.xl, fontWeight:"800", marginBottom:4, letterSpacing:-0.5 },
  sub:       { fontSize:F.body, marginBottom:S.xl },
  dots:      { flexDirection:"row", gap:14, marginBottom:S.xl },
  dot:       { width:16, height:16, borderRadius:8, borderWidth:2 },
  pad:       { gap:12 },
  row:       { flexDirection:"row", gap:20 },
  key:       { width:72, height:72, borderRadius:36, alignItems:"center", justifyContent:"center" },
  keyTxt:    { fontSize:26, fontWeight:"500" },
});
