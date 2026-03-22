import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";
import { userAPI } from "../services/api";
import { useTheme } from "../hooks/useTheme";
import { F, S, R } from "../constants/theme";
export default function NotifsScreen() {
  const{C}=useTheme();
  const[list,setList]=useState([]);
  const[refresh,setRefresh]=useState(false);
  const router=useRouter();
  const load=async()=>{try{const{data}=await userAPI.notifs();setList(data.notifications);await userAPI.read();}catch{}};
  useEffect(()=>{load();},[]);
  const onRefresh=async()=>{setRefresh(true);await load();setRefresh(false);};
  const ICON_MAP={
    "Payment Sent":"arrow-up-circle",
    "Payment Received!":"arrow-down-circle",
    "Payment Settled":"checkmark-circle",
    "Payment Cancelled":"close-circle",
    "Dispute Raised":"alert-circle",
    "Dispute Resolved":"shield-checkmark",
    "Incoming Payment":"time",
  };
  return (
    <View style={[s.container,{backgroundColor:C.bg0}]}>
      <View style={[s.header,{borderBottomColor:C.b1}]}>
        <TouchableOpacity onPress={()=>router.back()} style={[s.back,{backgroundColor:C.bg2,borderColor:C.b1}]}>
          <Ionicons name="arrow-back" size={20} color={C.t1}/>
        </TouchableOpacity>
        <Text style={[s.title,{color:C.t1}]}>Notifications</Text>
        <View style={{width:40}}/>
      </View>
      <FlatList data={list} keyExtractor={i=>i.id} contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]}/>}
        renderItem={({item})=>(
          <View style={[s.item,{backgroundColor:C.card,borderColor:item.isRead?C.b1:C.primary+"40"},{backgroundColor:item.isRead?C.card:C.primaryDim}]}>
            <View style={[s.itemIcon,{backgroundColor:C.primaryDim}]}>
              <Ionicons name={ICON_MAP[item.title]||"notifications"} size={18} color={C.primary}/>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.body,fontWeight:"700",color:C.t1}}>{item.title}</Text>
              <Text style={{fontSize:F.sm,color:C.t2,marginTop:3,lineHeight:18}}>{item.body}</Text>
              <Text style={{fontSize:F.xs,color:C.t4,marginTop:5}}>{formatDistanceToNow(new Date(item.createdAt))} ago</Text>
            </View>
            {!item.isRead&&<View style={[s.unreadDot,{backgroundColor:C.primary}]}/>}
          </View>
        )}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="notifications-off-outline" size={40} color={C.t4}/><Text style={{fontSize:F.body,color:C.t3,marginTop:10}}>No notifications yet</Text></View>}
      />
    </View>
  );
}
const s=StyleSheet.create({
  container:{flex:1},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:S.lg,paddingTop:S.xl,paddingBottom:12,borderBottomWidth:1},
  back:{width:40,height:40,borderRadius:20,alignItems:"center",justifyContent:"center",borderWidth:1},
  title:{fontSize:F.xxl,fontWeight:"900",letterSpacing:-0.5},
  list:{padding:S.lg,paddingBottom:40},
  item:{flexDirection:"row",alignItems:"flex-start",gap:12,borderRadius:R.md,borderWidth:1.5,padding:14,marginBottom:10},
  itemIcon:{width:40,height:40,borderRadius:12,alignItems:"center",justifyContent:"center"},
  unreadDot:{width:8,height:8,borderRadius:4,marginTop:5},
  empty:{alignItems:"center",padding:S.xxl},
});
