import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format, formatDistanceToNow } from "date-fns";
import { txAPI } from "../../services/api";
import { useAuth } from "../../store/auth";
import { useTheme } from "../../hooks/useTheme";
import SPill from "../../components/SPill";
import PCard from "../../components/PCard";
import PBtn from "../../components/PBtn";
import { F, S, R, IMG } from "../../constants/theme";

export default function TxDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { C }    = useTheme();
  const router   = useRouter();
  const [tx, setTx]         = useState(null);
  const [actLoad, setActLoad] = useState(false);

  useEffect(()=>{txAPI.detail(id).then(r=>setTx(r.data.transaction)).catch(()=>{});},[id]);

  if(!tx) return <View style={[s.container,{backgroundColor:C.bg0,alignItems:"center",justifyContent:"center"}]}><Text style={{color:C.t3}}>Loading...</Text></View>;

  const isSender   = tx.senderId===user?.id;
  const party      = isSender?tx.receiver:tx.sender;
  const canCancel  = isSender&&tx.status==="ON_HOLD";
  const canDispute = isSender&&tx.status==="ON_HOLD";
  const holdPassed = tx.escrow?.releaseAt?new Date()>new Date(tx.escrow.releaseAt):false;

  const handleCancel=()=>Alert.alert("Cancel Payment","Funds will be returned to your balance instantly.",[
    {text:"No"},
    {text:"Cancel Payment",style:"destructive",onPress:async()=>{
      setActLoad(true);
      try{await txAPI.cancel(id);const r=await txAPI.detail(id);setTx(r.data.transaction);Alert.alert("Cancelled ✅","Funds returned.");}
      catch(e){Alert.alert("Error",e.response?.data?.message);}
      finally{setActLoad(false);}
    }}
  ]);

  const Row=({icon,label,val,color})=>(
    <View style={{flexDirection:"row",alignItems:"flex-start",gap:10}}>
      <Ionicons name={icon} size={15} color={C.primary} style={{marginTop:2}}/>
      <View style={{flex:1}}>
        <Text style={{fontSize:F.xs,color:C.t3,textTransform:"uppercase",letterSpacing:0.5}}>{label}</Text>
        <Text style={{fontSize:F.body,color:color||C.t1,marginTop:2,fontWeight:"500"}}>{val}</Text>
      </View>
    </View>
  );
  const Div=()=><View style={{height:1,backgroundColor:C.b2,marginVertical:10}}/>;

  return (
    <ScrollView style={[s.container,{backgroundColor:C.bg0}]} contentContainerStyle={{paddingBottom:40}}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>router.back()} style={[s.closeBtn,{backgroundColor:C.bg2,borderColor:C.b1}]}>
          <Ionicons name="close" size={20} color={C.t1}/>
        </TouchableOpacity>
        <Text style={[s.title,{color:C.t1}]}>Transaction</Text>
        <View style={{width:40}}/>
      </View>

      {/* Amount hero */}
      <View style={[s.amtHero,{backgroundColor:C.bg1,borderColor:C.b1}]}>
        <Image source={{uri:IMG.avatar(party?.name)}} style={[s.partyAvatar,{borderColor:C.b1}]}/>
        <Text style={[s.bigAmt,{color:isSender?C.danger:C.success}]}>{isSender?"-":"+"}₹{tx.amount.toLocaleString("en-IN")}</Text>
        <Text style={{fontSize:F.body,color:C.t3,marginTop:4}}>{isSender?"To":"From"} {party?.name}</Text>
        <View style={{marginTop:8}}><SPill status={tx.status}/></View>
        <Text style={{fontSize:F.xs,color:C.t4,marginTop:8}}>ID: {tx.id.slice(0,24)}...</Text>
      </View>

      {/* Escrow timer */}
      {tx.escrow&&tx.status==="ON_HOLD"&&!holdPassed&&(
        <PCard style={{marginHorizontal:S.lg,marginBottom:10,borderColor:C.warning+"40"}}>
          <View style={{flexDirection:"row",alignItems:"center",gap:8,marginBottom:4}}>
            <Ionicons name="time" size={18} color={C.warning}/>
            <Text style={{fontSize:F.body,fontWeight:"700",color:C.warning}}>Escrow Active</Text>
          </View>
          <Text style={{fontSize:F.sm,color:C.t2}}>Releases in <Text style={{color:C.warning,fontWeight:"700"}}>{formatDistanceToNow(new Date(tx.escrow.releaseAt))}</Text></Text>
          <Text style={{fontSize:F.xs,color:C.t4,marginTop:2}}>{format(new Date(tx.escrow.releaseAt),"dd MMM yyyy, hh:mm a")}</Text>
        </PCard>
      )}

      {/* Details */}
      <PCard style={{marginHorizontal:S.lg,marginBottom:10}}>
        <Row icon="person-outline"    label="From"    val={`${tx.sender?.name} (${tx.sender?.upiId})`}/>
        <Div/><Row icon="person-outline"  label="To"  val={`${tx.receiver?.name} (${tx.receiver?.upiId})`}/>
        {tx.description&&<><Div/><Row icon="chatbubble-outline" label="Note" val={tx.description}/></>}
        <Div/><Row icon="calendar-outline" label="Date" val={format(new Date(tx.createdAt),"dd MMM yyyy, hh:mm a")}/>
        {tx.riskScore>0&&<><Div/><Row icon="shield-outline" label="Risk Score" val={`${tx.riskScore}/100`} color={tx.riskScore>=70?C.danger:tx.riskScore>=40?C.warning:C.success}/></>}
      </PCard>

      {tx.dispute&&(
        <PCard style={{marginHorizontal:S.lg,marginBottom:10,borderColor:C.danger+"40"}}>
          <Text style={{fontSize:F.xs,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Dispute</Text>
          <Row icon="alert-circle-outline" label="Reason" val={tx.dispute.reason.replace(/_/g," ")}/>
          <Div/><Row icon="information-circle-outline" label="Status" val={tx.dispute.status.replace(/_/g," ")}/>
        </PCard>
      )}

      {tx.logs?.length>0&&(
        <PCard style={{marginHorizontal:S.lg,marginBottom:10}}>
          <Text style={{fontSize:F.xs,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Audit Trail</Text>
          {tx.logs.map((log,i)=>(
            <View key={log.id}>
              <View style={{flexDirection:"row",alignItems:"flex-start",gap:10}}>
                <View style={{width:8,height:8,borderRadius:4,backgroundColor:C.primary,marginTop:5}}/>
                <View style={{flex:1}}>
                  <Text style={{fontSize:F.sm,color:C.t2,fontWeight:"600"}}>{log.fromStatus} → {log.toStatus}</Text>
                  <Text style={{fontSize:F.xs,color:C.t3,marginTop:1}}>{log.triggeredBy} • {format(new Date(log.createdAt),"dd MMM, hh:mm a")}</Text>
                  {log.note&&<Text style={{fontSize:F.xs,color:C.t3,fontStyle:"italic",marginTop:2}}>{log.note}</Text>}
                </View>
              </View>
              {i<tx.logs.length-1&&<View style={{width:1,height:12,backgroundColor:C.b1,marginLeft:3.5,marginVertical:2}}/>}
            </View>
          ))}
        </PCard>
      )}

      {isSender&&(canCancel||canDispute)&&(
        <View style={{paddingHorizontal:S.lg,gap:10}}>
          {canCancel&&!holdPassed&&<PBtn variant="danger" title="Cancel Payment" onPress={handleCancel} loading={actLoad}/>}
          {canDispute&&<PBtn variant="outline" title="Raise Dispute" onPress={()=>router.push(`/dispute/${id}`)}/>}
        </View>
      )}
    </ScrollView>
  );
}
const s=StyleSheet.create({
  container:{flex:1},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:S.lg,paddingTop:S.xl},
  closeBtn:{width:40,height:40,borderRadius:20,alignItems:"center",justifyContent:"center",borderWidth:1},
  title:{fontSize:F.lg,fontWeight:"800"},
  amtHero:{alignItems:"center",padding:S.lg,marginHorizontal:S.lg,borderRadius:R.xl,marginBottom:12,borderWidth:1},
  partyAvatar:{width:60,height:60,borderRadius:30,marginBottom:12,borderWidth:1},
  bigAmt:{fontSize:42,fontWeight:"900",letterSpacing:-1},
});
