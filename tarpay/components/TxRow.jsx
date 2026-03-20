import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { format } from "date-fns";
import Pill from "./Pill";

const IMG = { avatar:(n)=>`https://picsum.photos/seed/${encodeURIComponent(n||"u")}/80/80` };

export default function TxRow({ tx, userId, onPress }) {
  const out   = tx.senderId === userId;
  const party = out ? tx.receiver : tx.sender;
  const clr   = out ? "#FF4567" : "#00F5B4";
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.78}>
      <Image source={{uri:IMG.avatar(party?.name)}} style={s.avatar}/>
      <View style={s.mid}>
        <Text style={s.name} numberOfLines={1}>{party?.name||"Unknown"}</Text>
        <Text style={s.upi}  numberOfLines={1}>{party?.upiId}</Text>
        <Pill status={tx.status}/>
      </View>
      <View style={s.right}>
        <Text style={[s.amt,{color:clr}]}>{out?"-":"+"}₹{tx.amount.toLocaleString("en-IN")}</Text>
        <Text style={s.date}>{format(new Date(tx.createdAt),"dd MMM")}</Text>
      </View>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  row:    { flexDirection:"row", alignItems:"center", gap:12, backgroundColor:"#0C0C14", borderRadius:16, borderWidth:1, borderColor:"#252540", padding:14, marginBottom:10 },
  avatar: { width:46, height:46, borderRadius:23, backgroundColor:"#1A1A2E" },
  mid:    { flex:1, gap:4 },
  name:   { fontSize:15, fontWeight:"700", color:"#FFFFFF" },
  upi:    { fontSize:11, color:"#6E6E8A" },
  right:  { alignItems:"flex-end", gap:4 },
  amt:    { fontSize:15, fontWeight:"800" },
  date:   { fontSize:11, color:"#6E6E8A" },
});