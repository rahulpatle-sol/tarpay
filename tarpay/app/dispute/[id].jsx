import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { disputeAPI, txAPI } from "../../services/api";
import GBtn from "../../components/GBtn";
import Card from "../../components/Card";
// import { C, S, R } from "../../constants/theme";

const C = { bg0:"#050508", bg1:"#0C0C14", bg2:"#12121E", bg3:"#1A1A2E", mint:"#00F5B4", mintDim:"#00F5B420", blue:"#3D9EFF", green:"#00F5B4", red:"#FF4567", orange:"#FF9F43", purple:"#A855F7", t1:"#FFFFFF", t2:"#C4C4D4", t3:"#6E6E8A", t4:"#3D3D5C", b1:"#252540", b2:"#1A1A30", grad:["#00F5B4","#3D9EFF"] };
const R = { xs:6, sm:10, md:16, lg:22, xl:30, full:999 };
const S = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };

const REASONS = [
  { k: "WRONG_RECIPIENT",      l: "Wrong Recipient",      i: "person-remove" },
  { k: "DUPLICATE_PAYMENT",    l: "Duplicate Payment",    i: "copy" },
  { k: "FRAUD_SUSPECTED",      l: "Fraud Suspected",      i: "warning" },
  { k: "SERVICE_NOT_RECEIVED", l: "No Service Received",  i: "close-circle" },
  { k: "OTHER",                l: "Other",                i: "ellipsis-horizontal" },
];
export default function RaiseDisputeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!reason) { Alert.alert("Select a reason"); return; }
    setLoading(true);
    try {
      await disputeAPI.raise({ transactionId: id, reason, description: desc });
      Alert.alert("Dispute Raised ✅", "Escrow is frozen. Funds safe until resolved.", [{ text: "OK", onPress: () => router.replace("/(tabs)/disputes") }]);
    } catch (e) { Alert.alert("Error", e.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="close" size={22} color={C.t2} /></TouchableOpacity>
        <Text style={s.title}>Raise Dispute</Text>
        <View style={{ width: 36 }} />
      </View>
      <Text style={s.secLabel}>What went wrong?</Text>
      <View style={s.list}>
        {REASONS.map(r => (
          <TouchableOpacity key={r.k} style={[s.item, reason === r.k && s.itemOn]} onPress={() => setReason(r.k)} activeOpacity={0.8}>
            <View style={[s.rIcon, { backgroundColor: (reason === r.k ? C.mint : C.t3) + "20" }]}>
              <Ionicons name={r.i} size={18} color={reason === r.k ? C.mint : C.t3} />
            </View>
            <Text style={[s.rLabel, reason === r.k && { color: C.mint }]}>{r.l}</Text>
            {reason === r.k && <Ionicons name="checkmark-circle" size={20} color={C.mint} style={{ marginLeft: "auto" }} />}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.secLabel}>Additional Details</Text>
      <TextInput style={s.descInput} placeholder="Describe what happened..." placeholderTextColor={C.t4} value={desc} onChangeText={setDesc} multiline numberOfLines={4} textAlignVertical="top" />
      <View style={s.noteBox}><Ionicons name="shield-checkmark" size={14} color={C.mint} /><Text style={s.noteTxt}> Escrow freezes immediately. Funds safe until resolved.</Text></View>
      <GBtn title="Submit Dispute" onPress={submit} loading={loading} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  content: { padding: S.lg, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.lg, paddingTop: 12 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.b1 },
  title: { fontSize: 18, fontWeight: "800", color: C.t1 },
  secLabel: { fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  list: { gap: 8, marginBottom: S.lg },
  item: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.bg2, borderRadius: R.md, borderWidth: 1.5, borderColor: C.b1, padding: 14 },
  itemOn: { borderColor: C.mint, backgroundColor: C.mintDim },
  rIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rLabel: { fontSize: 14, fontWeight: "600", color: C.t1 },
  descInput: { backgroundColor: C.bg2, borderRadius: R.md, borderWidth: 1.5, borderColor: C.b1, padding: 14, color: C.t1, fontSize: 14, minHeight: 100, marginBottom: S.md },
  noteBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: C.mintDim, borderRadius: R.sm, padding: 12, borderWidth: 1, borderColor: C.mint + "30", marginBottom: S.lg },
  noteTxt: { fontSize: 11, color: C.mint, flex: 1 },
});
