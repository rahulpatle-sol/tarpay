import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";
import { userAPI } from "../services/api";
import { C, S, R } from "../constants/theme";
export default function NotifsScreen() {
  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();
  const load = async () => { try { const { data } = await userAPI.notifs(); setList(data.notifications); await userAPI.read(); } catch {} };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={20} color={C.t2} /></TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={list} keyExtractor={i => i.id} contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.mint} />}
        renderItem={({ item }) => (
          <View style={[s.item, !item.isRead && s.unread]}>
            <View style={[s.dot, !item.isRead && { backgroundColor: C.mint }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.nTitle}>{item.title}</Text>
              <Text style={s.nBody}>{item.body}</Text>
              <Text style={s.nTime}>{formatDistanceToNow(new Date(item.createdAt))} ago</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="notifications-off-outline" size={40} color={C.t4} /><Text style={s.emptyTxt}>No notifications yet</Text></View>}
      />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.lg, paddingTop: S.xl, paddingBottom: 12 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.b1 },
  title: { fontSize: 18, fontWeight: "800", color: C.t1 },
  list: { padding: S.lg, paddingBottom: 40 },
  item: { flexDirection: "row", gap: 12, backgroundColor: C.bg1, borderRadius: R.md, borderWidth: 1, borderColor: C.b1, padding: 14, marginBottom: 10 },
  unread: { borderColor: C.mint + "40", backgroundColor: C.mintDim },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.t4, marginTop: 6 },
  nTitle: { fontSize: 14, fontWeight: "700", color: C.t1 },
  nBody: { fontSize: 13, color: C.t2, marginTop: 3, lineHeight: 19 },
  nTime: { fontSize: 11, color: C.t3, marginTop: 5 },
  empty: { alignItems: "center", padding: 40, gap: 10 },
  emptyTxt: { fontSize: 14, color: C.t3 },
});
