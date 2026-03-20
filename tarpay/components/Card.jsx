import React from "react";
import { View, StyleSheet } from "react-native";

export default function Card({ children, style, glow }) {
  return <View style={[s.card, glow&&s.glow, style]}>{children}</View>;
}
const s = StyleSheet.create({
  card: { backgroundColor:"#0C0C14", borderRadius:22, borderWidth:1, borderColor:"#252540", padding:18 },
  glow: { borderColor:"#00F5B450", shadowColor:"#00F5B4", shadowOffset:{width:0,height:0}, shadowOpacity:0.2, shadowRadius:20, elevation:10 },
});