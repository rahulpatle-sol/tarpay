import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
const MAP = {
  ON_HOLD:   { l:"On Hold",   c:"#F57C00", icon:"time-outline" },
  SETTLED:   { l:"Settled",   c:"#00875A", icon:"checkmark-circle-outline" },
  REVERTED:  { l:"Reverted",  c:"#1565C0", icon:"return-up-back-outline" },
  DISPUTED:  { l:"Disputed",  c:"#E53935", icon:"alert-circle-outline" },
  FLAGGED:   { l:"Flagged",   c:"#E53935", icon:"flag-outline" },
  CANCELLED: { l:"Cancelled", c:"#757575", icon:"close-circle-outline" },
  INITIATED: { l:"Initiated", c:"#1565C0", icon:"ellipsis-horizontal" },
};
export default function SPill({ status }) {
  const {c,l,icon} = MAP[status]||{l:status,c:"#757575",icon:"help"};
  return (
    <View style={[s.pill, {backgroundColor:c+"18"}]}>
      <Ionicons name={icon} size={11} color={c}/>
      <Text style={[s.txt, {color:c}]}>{l}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  pill: { flexDirection:"row", alignItems:"center", gap:4, paddingHorizontal:9, paddingVertical:4, borderRadius:999, alignSelf:"flex-start" },
  txt:  { fontSize:11, fontWeight:"600", letterSpacing:0.3 },
});
