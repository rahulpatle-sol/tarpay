import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const C = { mint:"#00F5B4", bg2:"#12121E", bg3:"#1A1A2E", b1:"#252540", t1:"#FFFFFF", t3:"#6E6E8A", t4:"#3D3D5C" };
const R = { md:16 };

export default function Input({ label, icon, placeholder, value, onChange, secure, keyb, hint, style }) {
  const [show,  setShow]  = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <View style={[s.wrap,style]}>
      {label && <Text style={s.label}>{label}</Text>}
      <View style={[s.box, focus&&s.boxFocus]}>
        {icon && <Ionicons name={icon} size={17} color={focus?C.mint:C.t3} style={s.icon}/>}
        <TextInput
          style={s.input} placeholder={placeholder} placeholderTextColor={C.t4}
          value={value} onChangeText={onChange} secureTextEntry={secure&&!show}
          keyboardType={keyb||"default"} autoCapitalize="none"
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        />
        {secure && (
          <TouchableOpacity onPress={()=>setShow(!show)}>
            <Ionicons name={show?"eye-off":"eye"} size={17} color={C.t3}/>
          </TouchableOpacity>
        )}
      </View>
      {hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}
const s = StyleSheet.create({
  wrap:     { gap:6 },
  label:    { fontSize:11, fontWeight:"700", color:C.t3, textTransform:"uppercase", letterSpacing:0.8 },
  box:      { flexDirection:"row", alignItems:"center", backgroundColor:C.bg3, borderRadius:R.md, borderWidth:1.5, borderColor:C.b1, paddingHorizontal:14, height:54 },
  boxFocus: { borderColor:C.mint, backgroundColor:C.bg2 },
  icon:     { marginRight:10 },
  input:    { flex:1, color:C.t1, fontSize:15 },
  hint:     { fontSize:11, color:C.t3, marginTop:2 },
});