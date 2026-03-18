import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { txAPI } from "../../services/api";
import { useAuth } from "../../store/auth";
import TxRow from "../../components/TxRow";
import { C, S, R } from "../../constants/theme";
const TABS = ["All", "ON_HOLD", "SETTLED", "DISPUTED", "REVERTED"];

export default function HistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (pg = 1, st = null) => {
    setLoading(true);
    try {
      const p = { page: pg, limit: 20 }; if (st) p.status = st;
      const { data } = await txAPI.history(p);
      if (pg === 1) setTxns(data.transactions); else setTxns(prev => [...prev, ...data.transactions]);
      setTotal(data.total); setPage(pg);
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1, tab === 0 ? null : TABS[tab]); }, [tab]);
  const onRefresh = async () => { setRefresh(true); await load(1, tab === 0 ? null : TABS[tab]); setRefresh(false); };
  const loadMore = () => { if (txns.length < total && !loading) load(page + 1, tab === 0 ? null : TABS[tab]); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Transactions</Text>
        <Text style={s.count}>{total} total</Text>
      </View>
      <FlatList
        horizontal data={TABS} keyExtractor={i => i}
        contentContainerStyle={s.tabs} showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={[s.tab, index === tab && s.tabOn]} onPress={() => setTab(index)}>
            <Text style={[s.tabTxt, index === tab && s.tabTxtOn]}>{item === "All" ? item : item.replace("_", " ")}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={txns} keyExtractor={i => i.id} contentContainerStyle={s.list}
        renderItem={({ item }) => <TxRow tx={item} userId={user?.id} onPress={() => router.push(`/tx/${item.id}`)} />}
        onEndReached={loadMore} onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.mint} />}
        ListEmptyComponent={!loading && <View style={s.empty}><Text style={s.emptyTxt}>No transactions found</Text></View>}
      />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.lg, paddingTop: 56, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "900", color: C.t1 },
  count: { fontSize: 12, color: C.t3 },
  tabs: { paddingHorizontal: S.lg, paddingBottom: 12, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: R.full, backgroundColor: C.bg2, borderWidth: 1, borderColor: C.b1 },
  tabOn: { backgroundColor: C.mintDim, borderColor: C.mint },
  tabTxt: { fontSize: 12, color: C.t3, fontWeight: "600" },
  tabTxtOn: { color: C.mint },
  list: { paddingHorizontal: S.lg, paddingBottom: 100 },
  empty: { alignItems: "center", padding: 40 },
  emptyTxt: { fontSize: 14, color: C.t3 },
});
