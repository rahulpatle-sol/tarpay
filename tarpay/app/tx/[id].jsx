import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format, formatDistanceToNow } from "date-fns";
import { txAPI } from "../../services/api";
import { useAuth } from "../../store/auth";
import Pill from "../../components/Pill";
import Card from "../../components/Card";
import GBtn from "../../components/GBtn";
import { C, S, R, IMG } from "../../constants/theme";

export default function TxDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [tx, setTx] = useState(null);
  const [actLoad, setActLoad] = useState(false);

  useEffect(() => { txAPI.detail(id).then(r => setTx(r.data.transaction)).catch(() => {}); }, [id]);

  if (!tx) return <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}><Text style={{ color: C.t3 }}>Loading...</Text></View>;

  const isSender = tx.senderId === user?.id;
  const party = isSender ? tx.receiver : tx.sender;
  const canCancel = isSender && tx.status === "ON_HOLD";
  const canDispute = isSender && tx.status === "ON_HOLD";
  const holdPassed = tx.escrow?.releaseAt ? new Date() > new Date(tx.escrow.releaseAt) : false;

  const handleCancel = () => Alert.alert("Cancel Payment", "Funds returned instantly.", [
    { text: "No" },
    { text: "Cancel Payment", style: "destructive", onPress: async () => {
      setActLoad(true);
      try { await txAPI.cancel(id); const r = await txAPI.detail(id); setTx(r.data.transaction); Alert.alert("Cancelled ✅", "Funds returned."); }
      catch (e) { Alert.alert("Error", e.response?.data?.message); }
      finally { setActLoad(false); }
    }}
  ]);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="close" size={22} color={C.t2} /></TouchableOpacity>
        <Text style={s.title}>Transaction</Text>
        <View style={{ width: 36 }} />
      </View>
      <LinearGradient colors={["#12121E", "#0C0C14"]} style={s.amtHero}>
        <Image source={{ uri: IMG.avatar(party?.name) }} style={s.partyAvatar} />
        <Text style={[s.bigAmt, { color: isSender ? C.red : C.green }]}>{isSender ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN")}</Text>
        <Text style={s.partyName}>{isSender ? "To" : "From"} {party?.name}</Text>
        <View style={{ marginTop: 8 }}><Pill status={tx.status} /></View>
        <Text style={s.txId}>ID: {tx.id.slice(0, 20)}...</Text>
      </LinearGradient>
      {tx.escrow && tx.status === "ON_HOLD" && !holdPassed && (
        <Card style={[s.card, { borderColor: C.orange + "40" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Ionicons name="time" size={18} color={C.orange} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: C.orange }}>Escrow Active</Text>
          </View>
          <Text style={{ fontSize: 13, color: C.t2 }}>Releases in <Text style={{ color: C.orange, fontWeight: "700" }}>{formatDistanceToNow(new Date(tx.escrow.releaseAt))}</Text></Text>
        </Card>
      )}
      <Card style={s.card}>
        <Row icon="person"    label="From"    val={`${tx.sender?.name} (${tx.sender?.upiId})`} />
        <D /><Row icon="person" label="To"    val={`${tx.receiver?.name} (${tx.receiver?.upiId})`} />
        {tx.description && <><D /><Row icon="chatbubble" label="Note" val={tx.description} /></>}
        <D /><Row icon="calendar" label="Created" val={format(new Date(tx.createdAt), "dd MMM yyyy, hh:mm a")} />
        {tx.riskScore > 0 && <><D /><Row icon="shield" label="Risk Score" val={`${tx.riskScore}/100`} color={tx.riskScore >= 70 ? C.red : tx.riskScore >= 40 ? C.orange : C.green} /></>}
      </Card>
      {tx.dispute && (
        <Card style={[s.card, { borderColor: C.red + "40" }]}>
          <Text style={s.cardLabel}>Dispute</Text>
          <Row icon="alert-circle" label="Reason" val={tx.dispute.reason.replace(/_/g, " ")} />
          <D /><Row icon="information-circle" label="Status" val={tx.dispute.status.replace(/_/g, " ")} />
        </Card>
      )}
      {tx.logs?.length > 0 && (
        <Card style={s.card}>
          <Text style={s.cardLabel}>Audit Trail</Text>
          {tx.logs.map((log, i) => (
            <View key={log.id}>
              <View style={s.logRow}>
                <View style={s.logDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.logStatus}>{log.fromStatus} → {log.toStatus}</Text>
                  <Text style={s.logBy}>{log.triggeredBy} • {format(new Date(log.createdAt), "dd MMM, hh:mm a")}</Text>
                  {log.note && <Text style={s.logNote}>{log.note}</Text>}
                </View>
              </View>
              {i < tx.logs.length - 1 && <View style={{ width: 1, height: 12, backgroundColor: C.b1, marginLeft: 3.5, marginVertical: 2 }} />}
            </View>
          ))}
        </Card>
      )}
      {isSender && (canCancel || canDispute) && (
        <View style={{ paddingHorizontal: S.lg, gap: 10 }}>
          {canCancel && !holdPassed && <GBtn variant="outline" title="Cancel Payment" onPress={handleCancel} loading={actLoad} style={{ borderColor: C.red }} />}
          {canDispute && <GBtn variant="outline" title="Raise Dispute" onPress={() => router.push(`/dispute/${id}`)} />}
        </View>
      )}
    </ScrollView>
  );
}

const Row = ({ icon, label, val, color }) => (
  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
    <Ionicons name={icon} size={15} color={C.mint} style={{ marginTop: 2 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ fontSize: 14, color: color || C.t1, marginTop: 2, fontWeight: "500" }}>{val}</Text>
    </View>
  </View>
);
const D = () => <View style={{ height: 1, backgroundColor: C.b2, marginVertical: 10 }} />;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  content: { paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: S.lg, paddingTop: S.xl },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.b1 },
  title: { fontSize: 18, fontWeight: "800", color: C.t1 },
  amtHero: { alignItems: "center", padding: S.lg, paddingVertical: S.xl, marginHorizontal: S.lg, borderRadius: R.lg, marginBottom: 12, borderWidth: 1, borderColor: C.b1 },
  partyAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 12, borderWidth: 2, borderColor: C.b1 },
  bigAmt: { fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  partyName: { fontSize: 14, color: C.t3, marginTop: 4 },
  txId: { fontSize: 10, color: C.t4, marginTop: 8 },
  card: { marginHorizontal: S.lg, marginBottom: 10 },
  cardLabel: { fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  logRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.mint, marginTop: 4 },
  logStatus: { fontSize: 12, color: C.t2, fontWeight: "600" },
  logBy: { fontSize: 11, color: C.t3, marginTop: 1 },
  logNote: { fontSize: 11, color: C.t3, fontStyle: "italic", marginTop: 2 },
});
