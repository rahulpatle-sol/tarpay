import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { txAPI } from "../../services/api";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../hooks/useTheme";
import TRow from "../../components/TRow";
import { F, S, R } from "../../constants/theme";

const TABS = ["All","ON_HOLD","SETTLED","DISPUTED","REVERTED","CANCELLED"];
const LABELS = ["All","On Hold","Settled","Disputed","Reverted","Cancelled"];

export default function HistoryScreen() {
  const { C } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab]     = useState(0);
  const [txns, setTxns]   = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (pg=1, st=null) => {
    setLoading(true);
    try {
      const p={page:pg,limit:20}; if(st)p.status=st;
      const {data}=await txAPI.history(p);
      if(pg===1)setTxns(data.transactions);else setTxns(prev=>[...prev,...data.transactions]);
      setTotal(data.total); setPage(pg);
    }catch(e){console.log(e.message);}finally{setLoading(false);}
  },[]);

  useEffect(()=>{load(1,tab===0?null:TABS[tab]);},[tab]);
  const onRefresh=async()=>{setRefresh(true);await load(1,tab===0?null:TABS[tab]);setRefresh(false);};
  const loadMore=()=>{if(txns.length<total&&!loading)load(page+1,tab===0?null:TABS[tab]);};

  return (
    <View style={[s.container,{backgroundColor:C.bg0}]}>
      <View style={[s.header,{borderBottomColor:C.b1}]}>
        <Text style={[s.title,{color:C.t1}]}>Payments</Text>
        <Text style={{fontSize:F.sm,color:C.t3}}>{total} total</Text>
      </View>
      <FlatList horizontal data={TABS} keyExtractor={i=>i} showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabs}
        renderItem={({item,index})=>(
          <TouchableOpacity
            style={[s.tab, {borderColor:index===tab?C.primary:C.b1, backgroundColor:index===tab?C.primaryDim:C.bg1}]}
            onPress={()=>setTab(index)}>
            <Text style={[s.tabTxt,{color:index===tab?C.primary:C.t3}]}>{LABELS[index]}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList data={txns} keyExtractor={i=>i.id}
        contentContainerStyle={s.list}
        renderItem={({item})=><TRow tx={item} userId={user?.id} onPress={()=>router.push(`/tx/${item.id}`)}/>}
        onEndReached={loadMore} onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]}/>}
        ListEmptyComponent={!loading&&<View style={s.empty}><Text style={{fontSize:F.body,color:C.t3}}>No transactions found</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:S.lg,paddingTop:56,paddingBottom:12,borderBottomWidth:1},
  title:{fontSize:F.xxl,fontWeight:"900",letterSpacing:-0.5},
  tabs:{paddingHorizontal:S.lg,paddingBottom:12,paddingTop:8,gap:8},
  tab:{paddingHorizontal:14,paddingVertical:7,borderRadius:R.full,borderWidth:1.5},
  tabTxt:{fontSize:F.sm,fontWeight:"600"},
  list:{paddingHorizontal:S.lg,paddingBottom:100},
  empty:{alignItems:"center",padding:S.xxl},
});
