import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { R } from "../constants/theme";
const M = {
  ON_HOLD:   { l:"On Hold",   c:"#FF9F43" },
  SETTLED:   { l:"Settled",   c:"#00F5B4" },
  REVERTED:  { l:"Reverted",  c:"#3D9EFF" },
  DISPUTED:  { l:"Disputed",  c:"#FF4567" },
  FLAGGED:   { l:"Flagged",   c:"#FF4567" },
  CANCELLED: { l:"Cancelled", c:"#6E6E8A" },
  INITIATED: { l:"Initiated", c:"#3D9EFF" },
};
export default function Pill({ status }) {
  const { l, c } = M[status] || { l: status, c: "#6E6E8A" };
  return (
    <View style={[s.pill, { backgroundColor: c + "22" }]}>
      <View style={[s.dot, { backgroundColor: c }]} />
      <Text style={[s.txt, { color: c }]}>{l}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.full, alignSelf: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  txt: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
});
