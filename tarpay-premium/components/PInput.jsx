/**
 * PInput — Premium animated input with focus glow
 * Light/dark mode aware, with icon support
 */
import React, { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { R, F } from "../constants/theme";

export default function PInput({ label, icon, placeholder, value, onChange, secure, keyb, hint, style, autoFocus, editable=true }) {
  const { C } = useTheme();
  const [show,  setShow]  = useState(false);
  const [focus, setFocus] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocus(true);
    Animated.timing(glow, { toValue:1, duration:200, useNativeDriver:false }).start();
  };
  const onBlur = () => {
    setFocus(false);
    Animated.timing(glow, { toValue:0, duration:200, useNativeDriver:false }).start();
  };

  const borderColor = glow.interpolate({ inputRange:[0,1], outputRange:[C.b1, C.primary] });
  const bgColor     = glow.interpolate({ inputRange:[0,1], outputRange:[C.bg2, C.primaryDim] });

  return (
    <View style={[{gap:5}, style]}>
      {label && <Text style={{fontSize:F.sm, fontWeight:"600", color:C.t3, textTransform:"uppercase", letterSpacing:0.8}}>{label}</Text>}
      <Animated.View style={[s.box, { borderColor, backgroundColor:bgColor }]}>
        {icon && <Ionicons name={icon} size={17} color={focus?C.primary:C.t3} style={s.icon}/>}
        <TextInput
          style={[s.input, { color:C.t1 }]}
          placeholder={placeholder}
          placeholderTextColor={C.t4}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure&&!show}
          keyboardType={keyb||"default"}
          autoCapitalize="none"
          autoFocus={autoFocus}
          editable={editable}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {secure && (
          <TouchableOpacity onPress={()=>setShow(!show)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <Ionicons name={show?"eye-off":"eye"} size={17} color={C.t3}/>
          </TouchableOpacity>
        )}
      </Animated.View>
      {hint && <Text style={{fontSize:F.xs, color:C.t3}}>{hint}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  box:   { flexDirection:"row", alignItems:"center", borderRadius:R.md, borderWidth:1.5, paddingHorizontal:14, height:54, overflow:"hidden" },
  icon:  { marginRight:10 },
  input: { flex:1, fontSize:F.body },
});
