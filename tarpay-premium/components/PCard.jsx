import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { R } from "../constants/theme";
export default function PCard({ children, style, glow, noPad }) {
  const { C } = useTheme();
  return (
    <View style={[
      s.card,
      { backgroundColor:C.card, borderColor: glow ? C.primaryMid : C.cardBorder },
      glow && C.shadow,
      noPad && { padding:0, overflow:"hidden" },
      style
    ]}>
      {children}
    </View>
  );
}
const s = StyleSheet.create({
  card: { borderRadius:R.lg, borderWidth:1.5, padding:18 },
});
