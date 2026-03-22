import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { disputeAPI } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";
import PCard from "../../components/PCard";
import { F, S, R } from "../../constants/theme";
const SC={OPEN:"#F57C00",UNDER_REVIEW:"#1565C0",RESOLVED_REVERT:"#00875A",RESOLVED_SETTLE:"#9C27B0",REJECTED:"#E53935"};

export default function DisputesScreen() {
  const { C } = useTheme();
  const [list, setList]       = useState([]);
  const [refresh, setRefresh] = useState(false);
  const load=async()=>{try{const{data}=await disputeAPI.myList();setList(data.disputes);}catch{}};
  useEffect(()=>{load();},[]);
  const onRefresh=async()=>{setRefresh(true);await load();setRefresh(false);};

  return (
    <View style={[s.container,{backgroundColor:C.bg0}]}>
      <View style={[s.header,{borderBottomColor:C.b1}]}>
        <Text style={[s.title,{color:C.t1}]}>Disputes</Text>
        <Text style={{fontSize:F.sm,color:C.t3}}>{list.length} total</Text>
      </View>
      <FlatList data={list} keyExtractor={i=>i.id} contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]}/>}
        renderItem={({item})=>{
          const c=SC[item.status]||C.t3;
          return (
            <PCard style={{marginBottom:10}}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <View style={{paddingHorizontal:10,paddingVertical:4,borderRadius:R.full,backgroundColor:c+"18"}}>
                  <Text style={{fontSize:10,fontWeight:"700",color:c,textTransform:"uppercase",letterSpacing:0.5}}>{item.reason.replace(/_/g," ")}</Text>
                </View>
                <Text style={{fontSize:10,fontWeight:"600",color:c}}>{item.status.replace(/_/g," ")}</Text>
              </View>
              <Text style={{fontSize:28,fontWeight:"900",color:C.t1}}>₹{item.transaction?.amount?.toLocaleString("en-IN")}</Text>
              <Text style={{fontSize:F.sm,color:C.t3,marginTop:2}}>to {item.transaction?.receiver?.name}</Text>
              {item.description&&<Text style={{fontSize:F.body,color:C.t2,marginTop:8}}>{item.description}</Text>}
              <Text style={{fontSize:F.xs,color:C.t4,marginTop:8}}>Raised {format(new Date(item.createdAt),"dd MMM yyyy, hh:mm a")}</Text>
            </PCard>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[s.emptyIcon,{backgroundColor:C.success+"18"}]}>
              <Ionicons name="shield-checkmark" size={40} color={C.success}/>
            </View>
            <Text style={[s.emptyTitle,{color:C.t1}]}>All Clear!</Text>
<Text style={{fontSize:F.body,color:C.t3,textAlign:"center"}}>{"No disputes found.\nAll your payments are safe."}</Text>
          </View>
        }
      />
    </View>
  );
}
const s=StyleSheet.create({
  container:{flex:1},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:S.lg,paddingTop:56,paddingBottom:12,borderBottomWidth:1},
  title:{fontSize:F.xxl,fontWeight:"900",letterSpacing:-0.5},
  list:{padding:S.lg,paddingBottom:100},
  empty:{alignItems:"center",padding:S.xxl,gap:12},
  emptyIcon:{width:80,height:80,borderRadius:40,alignItems:"center",justifyContent:"center"},
  emptyTitle:{fontSize:F.xl,fontWeight:"800"},
});
