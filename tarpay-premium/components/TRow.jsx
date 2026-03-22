import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useTheme } from "../hooks/useTheme";
import { R, F, IMG } from "../constants/theme";
import SPill from "./SPill";

export default function TRow({ tx, userId, onPress }) {
  const { C } = useTheme();
  const out   = tx.senderId === userId;
  const party = out ? tx.receiver : tx.sender;
  const clr   = out ? C.danger : C.success;
  return (
    <TouchableOpacity style={[s.row, { backgroundColor:C.card, borderColor:C.b1 }]} onPress={onPress} activeOpacity={0.82}>
      <View style={[s.iconBox, { backgroundColor: out ? C.danger+"15" : C.success+"15" }]}>
        <Ionicons name={out?"arrow-up":"arrow-down"} size={20} color={clr}/>
      </View>
      <View style={s.mid}>
        <Text style={[s.name, {color:C.t1}]} numberOfLines={1}>{party?.name||"Unknown"}</Text>
        <Text style={[s.upi,  {color:C.t3}]} numberOfLines={1}>{party?.upiId}</Text>
        <SPill status={tx.status}/>
      </View>
      <View style={s.right}>
        <Text style={[s.amt, {color:clr}]}>{out?"-":"+"}₹{tx.amount.toLocaleString("en-IN")}</Text>
        <Text style={[s.date, {color:C.t3}]}>{format(new Date(tx.createdAt),"dd MMM")}</Text>
      </View>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  row:     { flexDirection:"row", alignItems:"center", gap:12, borderRadius:R.md, borderWidth:1, padding:14, marginBottom:10 },
  iconBox: { width:44, height:44, borderRadius:22, alignItems:"center", justifyContent:"center" },
  mid:     { flex:1, gap:3 },
  name:    { fontSize:F.body, fontWeight:"700" },
  upi:     { fontSize:F.sm },
  right:   { alignItems:"flex-end", gap:4 },
  amt:     { fontSize:F.body, fontWeight:"800" },
  date:    { fontSize:F.xs },
});
