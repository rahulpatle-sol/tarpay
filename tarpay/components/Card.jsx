import React from "react";
import { View, StyleSheet } from "react-native";
import { C, R } from "../constants/theme";
export default function Card({ children, style, glow }) {
  return <View style={[s.card, glow && s.glow, style]}>{children}</View>;
}
const s = StyleSheet.create({
  card: { backgroundColor: C.bg1, borderRadius: R.lg, borderWidth: 1, borderColor: C.b1, padding: 18 },
  glow: { borderColor: "#00F5B450", shadowColor: C.mint, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
});
