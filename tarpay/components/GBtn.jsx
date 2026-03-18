import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, R } from "../constants/theme";
export default function GBtn({ title, onPress, loading, variant = "primary", style, disabled }) {
  if (variant === "outline") return (
    <TouchableOpacity onPress={onPress} disabled={loading || disabled} style={[s.outline, style]} activeOpacity={0.75}>
      {loading ? <ActivityIndicator color={C.mint} /> : <Text style={s.outTxt}>{title}</Text>}
    </TouchableOpacity>
  );
  return (
    <TouchableOpacity onPress={onPress} disabled={loading || disabled} activeOpacity={0.82} style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
      <LinearGradient colors={C.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.grad}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={s.txt}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  grad: { borderRadius: R.full, paddingVertical: 17, alignItems: "center", shadowColor: "#00F5B4", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 10 },
  outline: { borderRadius: R.full, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: C.mint },
  txt: { fontSize: 16, fontWeight: "800", color: "#000" },
  outTxt: { fontSize: 16, fontWeight: "700", color: C.mint },
});
