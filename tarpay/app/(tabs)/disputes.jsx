import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { disputeAPI } from "../../services/api";
import Card from "../../components/Card";
const C = { bg0:"#050508", bg1:"#0C0C14", bg2:"#12121E", bg3:"#1A1A2E", mint:"#00F5B4", mintDim:"#00F5B420", blue:"#3D9EFF", green:"#00F5B4", red:"#FF4567", orange:"#FF9F43", purple:"#A855F7", t1:"#FFFFFF", t2:"#C4C4D4", t3:"#6E6E8A", t4:"#3D3D5C", b1:"#252540", b2:"#1A1A30", grad:["#00F5B4","#3D9EFF"] };
const R = { xs:6, sm:10, md:16, lg:22, xl:30, full:999 };
const S = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };
const SC = { OPEN: C.orange, UNDER_REVIEW: C.blue, RESOLVED_REVERT: C.green, RESOLVED_SETTLE: C.purple, REJECTED: C.red };

export default function DisputesScreen() {
  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const load = async () => { try { const { data } = await disputeAPI.myList(); setList(data.disputes); } catch {} };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.title}>My Disputes</Text><Text style={s.count}>{list.length} total</Text></View>
      <FlatList
        data={list} keyExtractor={i => i.id} contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.mint} />}
        renderItem={({ item }) => {
          const c = SC[item.status] || C.t3;
          return (
            <Card style={[s.card, { borderColor: c + "40" }]}>
              <View style={s.top}>
                <View style={[s.badge, { backgroundColor: c + "20" }]}><Text style={[s.badgeTxt, { color: c }]}>{item.reason.replace(/_/g, " ")}</Text></View>
                <Text style={[s.status, { color: c }]}>{item.status.replace(/_/g, " ")}</Text>
              </View>
              <Text style={s.amt}>₹{item.transaction?.amount?.toLocaleString("en-IN")}</Text>
              <Text style={s.to}>to {item.transaction?.receiver?.name}</Text>
              {item.description && <Text style={s.desc}>{item.description}</Text>}
              <Text style={s.date}>Raised {format(new Date(item.createdAt), "dd MMM yyyy")}</Text>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="shield-checkmark" size={48} color={C.mint} style={{ marginBottom: 12 }} />
            <Text style={s.emptyTitle}>No Disputes</Text>
            <Text style={s.emptyTxt}>All your payments are safe!</Text>
          </View>
        }
      />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.lg, paddingTop: 56, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: C.t1 },
  count: { fontSize: 12, color: C.t3 },
  list: { padding: S.lg, paddingBottom: 100 },
  card: { marginBottom: 12 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full },
  badgeTxt: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  status: { fontSize: 11, fontWeight: "600" },
  amt: { fontSize: 26, fontWeight: "900", color: C.t1 },
  to: { fontSize: 12, color: C.t3, marginTop: 2 },
  desc: { fontSize: 13, color: C.t2, marginTop: 8 },
  date: { fontSize: 11, color: C.t3, marginTop: 6 },
  empty: { alignItems: "center", padding: 60 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: C.t1, marginBottom: 4 },
  emptyTxt: { fontSize: 14, color: C.t3 },
});
