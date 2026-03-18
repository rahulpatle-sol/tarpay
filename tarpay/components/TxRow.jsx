import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { format } from "date-fns";
import { C, R, IMG } from "../constants/theme";
import Pill from "./Pill";
export default function TxRow({ tx, userId, onPress }) {
  const out = tx.senderId === userId;
  const party = out ? tx.receiver : tx.sender;
  const clr = out ? C.red : C.green;
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.78}>
      <Image source={{ uri: IMG.avatar(party?.name) }} style={s.avatar} />
      <View style={s.mid}>
        <Text style={s.name} numberOfLines={1}>{party?.name || "Unknown"}</Text>
        <Text style={s.upi} numberOfLines={1}>{party?.upiId}</Text>
        <Pill status={tx.status} />
      </View>
      <View style={s.right}>
        <Text style={[s.amt, { color: clr }]}>{out ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN")}</Text>
        <Text style={s.date}>{format(new Date(tx.createdAt), "dd MMM")}</Text>
      </View>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.bg1, borderRadius: R.md, borderWidth: 1, borderColor: C.b1, padding: 14, marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.bg3 },
  mid: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: "700", color: C.t1 },
  upi: { fontSize: 11, color: C.t3 },
  right: { alignItems: "flex-end", gap: 4 },
  amt: { fontSize: 15, fontWeight: "800" },
  date: { fontSize: 11, color: C.t3 },
});
