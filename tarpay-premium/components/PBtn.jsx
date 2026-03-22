/**
 * PBtn — Premium animated button
 * Supports primary (gradient), outline, ghost, danger variants
 * Press animation + haptic feedback built in
 */
import React, { useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "../hooks/useTheme";
import { R, F } from "../constants/theme";

export default function PBtn({ title, onPress, loading, variant="primary", style, disabled, icon, size="md" }) {
  const { C } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue:0.96, useNativeDriver:true, speed:50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue:1,    useNativeDriver:true, speed:50 }).start();

  const handlePress = () => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const pv = size === "sm" ? 11 : size === "lg" ? 20 : 16;
  const fs = size === "sm" ? F.md : size === "lg" ? F.lg : F.body;

  if (variant === "outline") return (
    <Animated.View style={[{ transform:[{scale}] }, style]}>
      <TouchableOpacity onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={loading||disabled} activeOpacity={1}
        style={[s.outline, { borderColor:C.primary, paddingVertical:pv, opacity:disabled?0.5:1 }]}>
        {loading ? <ActivityIndicator color={C.primary} size="small"/>
          : <View style={s.row}>{icon}<Text style={[s.outTxt, {fontSize:fs, color:C.primary}]}>{title}</Text></View>}
      </TouchableOpacity>
    </Animated.View>
  );

  if (variant === "ghost") return (
    <Animated.View style={[{ transform:[{scale}] }, style]}>
      <TouchableOpacity onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={loading||disabled} activeOpacity={1}
        style={[s.ghost, { paddingVertical:pv, opacity:disabled?0.5:1 }]}>
        {loading ? <ActivityIndicator color={C.primary} size="small"/>
          : <Text style={[s.ghostTxt, {fontSize:fs, color:C.primary}]}>{title}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );

  if (variant === "danger") return (
    <Animated.View style={[{ transform:[{scale}] }, style]}>
      <TouchableOpacity onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={loading||disabled} activeOpacity={1}
        style={[s.outline, { borderColor:C.danger, paddingVertical:pv, opacity:disabled?0.5:1 }]}>
        {loading ? <ActivityIndicator color={C.danger} size="small"/>
          : <Text style={[s.outTxt, {fontSize:fs, color:C.danger}]}>{title}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Animated.View style={[{ transform:[{scale}] }, style]}>
      <TouchableOpacity onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={loading||disabled} activeOpacity={1} style={{opacity:disabled?0.5:1}}>
        <LinearGradient colors={C.grad} start={{x:0,y:0}} end={{x:1,y:0}} style={[s.grad, {paddingVertical:pv}]}>
          {loading ? <ActivityIndicator color="#fff" size="small"/>
            : <View style={s.row}>
                {icon && <View style={{marginRight:8}}>{icon}</View>}
                <Text style={[s.txt, {fontSize:fs}]}>{title}</Text>
              </View>}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  grad:    { borderRadius:R.full, alignItems:"center", shadowColor:"#00875A", shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:12, elevation:8 },
  outline: { borderRadius:R.full, alignItems:"center", borderWidth:1.5 },
  ghost:   { alignItems:"center", paddingHorizontal:8 },
  txt:     { color:"#fff", fontWeight:"700", letterSpacing:0.3 },
  outTxt:  { fontWeight:"700", letterSpacing:0.3 },
  ghostTxt:{ fontWeight:"600" },
  row:     { flexDirection:"row", alignItems:"center" },
});
