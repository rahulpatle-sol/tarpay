import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { disputeAPI } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";
import PBtn from "../../components/PBtn";
import { F, S, R } from "../../constants/theme";
const REASONS=[
  {k:"WRONG_RECIPIENT",l:"Wrong Recipient",i:"person-remove-outline",d:"Sent to wrong UPI ID"},
  {k:"DUPLICATE_PAYMENT",l:"Duplicate Payment",i:"copy-outline",d:"Paid twice by mistake"},
  {k:"FRAUD_SUSPECTED",l:"Fraud Suspected",i:"warning-outline",d:"Suspicious activity"},
  {k:"SERVICE_NOT_RECEIVED",l:"No Service",i:"close-circle-outline",d:"Did not receive service"},
  {k:"OTHER",l:"Other",i:"help-circle-outline",d:"Something else happened"},
];
export default function DisputeScreen() {
  const{id}=useLocalSearchParams();
  const{C}=useTheme();
  const router=useRouter();
  const[reason,setReason]=useState("");
  const[desc,setDesc]=useState("");
  const[loading,setLoading]=useState(false);
  const submit=async()=>{
    if(!reason){Alert.alert("Select Reason","Please select a reason for the dispute.");return;}
    setLoading(true);
    try{
      await disputeAPI.raise({transactionId:id,reason,description:desc});
      Alert.alert("Dispute Raised ✅","Escrow is frozen. Funds are safe until resolved.",[{text:"OK",onPress:()=>router.replace("/tabs/disputes")}]);
    }catch(e){Alert.alert("Error",e.response?.data?.message||"Failed to raise dispute");}
    finally{setLoading(false);}
  };
  return (
    <ScrollView style={[s.container,{backgroundColor:C.bg0}]} contentContainerStyle={s.content}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>router.back()} style={[s.closeBtn,{backgroundColor:C.bg2,borderColor:C.b1}]}>
          <Ionicons name="close" size={20} color={C.t1}/>
        </TouchableOpacity>
        <Text style={[s.title,{color:C.t1}]}>Raise Dispute</Text>
        <View style={{width:40}}/>
      </View>
      <Text style={{fontSize:F.xs,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>What went wrong?</Text>
      <View style={{gap:8,marginBottom:S.lg}}>
        {REASONS.map(r=>(
          <TouchableOpacity key={r.k} onPress={()=>setReason(r.k)} activeOpacity={0.82}
            style={[s.reasonItem,{backgroundColor:reason===r.k?C.primaryDim:C.bg2,borderColor:reason===r.k?C.primary:C.b1}]}>
            <View style={[s.rIcon,{backgroundColor:(reason===r.k?C.primary:C.t3)+"20"}]}>
              <Ionicons name={r.i} size={18} color={reason===r.k?C.primary:C.t3}/>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.body,fontWeight:"600",color:reason===r.k?C.primary:C.t1}}>{r.l}</Text>
              <Text style={{fontSize:F.xs,color:C.t3,marginTop:1}}>{r.d}</Text>
            </View>
            {reason===r.k&&<Ionicons name="checkmark-circle" size={20} color={C.primary}/>}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{fontSize:F.xs,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Additional Details</Text>
      <TextInput style={[s.textArea,{backgroundColor:C.bg2,borderColor:C.b1,color:C.t1}]}
        placeholder="Describe what happened..." placeholderTextColor={C.t4}
        value={desc} onChangeText={setDesc} multiline numberOfLines={4} textAlignVertical="top"/>
      <View style={[s.noteBox,{backgroundColor:C.primaryDim,borderColor:C.b1}]}>
        <Ionicons name="shield-checkmark" size={14} color={C.primary}/>
        <Text style={{fontSize:F.xs,color:C.primary,flex:1}}> Escrow freezes immediately. Funds are safe until resolved.</Text>
      </View>
      <PBtn title="Submit Dispute" onPress={submit} loading={loading}/>
    </ScrollView>
  );
}
const s=StyleSheet.create({
  container:{flex:1},
  content:{padding:S.lg,paddingBottom:40},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:S.lg,paddingTop:12},
  closeBtn:{width:40,height:40,borderRadius:20,alignItems:"center",justifyContent:"center",borderWidth:1},
  title:{fontSize:F.lg,fontWeight:"800"},
  reasonItem:{flexDirection:"row",alignItems:"center",gap:12,padding:14,borderRadius:R.md,borderWidth:1.5},
  rIcon:{width:38,height:38,borderRadius:10,alignItems:"center",justifyContent:"center"},
  textArea:{borderRadius:R.md,borderWidth:1.5,padding:14,fontSize:F.body,minHeight:100,marginBottom:S.md},
  noteBox:{flexDirection:"row",alignItems:"flex-start",padding:12,borderRadius:R.sm,borderWidth:1,marginBottom:S.lg},
});
