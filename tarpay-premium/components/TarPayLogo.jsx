/**
 * TarPayLogo — Sacred Water inspired logo
 * Tarpan = offering water to ancestors in Hindu tradition
 * Design: Water ripples forming T shape + lotus/drop motif
 */
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import Svg, { Circle, Path, Ellipse, Text as SvgText } from "react-native-svg";
import { useTheme } from "../hooks/useTheme";

export default function TarPayLogo({ size = 80, animated = false, showText = false }) {
  const { C } = useTheme();
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const animate = (val, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, { toValue:1, duration:1800, useNativeDriver:true }),
        Animated.timing(val, { toValue:0, duration:0, useNativeDriver:true }),
      ])
    ).start();
    animate(ripple1, 0);
    animate(ripple2, 600);
    animate(ripple3, 1200);
  }, [animated]);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <View style={{ width:s, height:s+( showText ? 24 : 0 ), alignItems:"center" }}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Water ripple rings */}
        <Circle cx={cx} cy={cy} r={s*0.46} fill="none" stroke={C.primary} strokeWidth={1} strokeOpacity={0.2}/>
        <Circle cx={cx} cy={cy} r={s*0.36} fill="none" stroke={C.primary} strokeWidth={1.5} strokeOpacity={0.35}/>
        <Circle cx={cx} cy={cy} r={s*0.26} fill="none" stroke={C.primary} strokeWidth={2} strokeOpacity={0.5}/>

        {/* Filled center disc */}
        <Circle cx={cx} cy={cy} r={s*0.22} fill={C.primary}/>

        {/* Water drop / T shape inside */}
        {/* Horizontal bar of T */}
        <Path
          d={`M ${cx-s*0.10} ${cy-s*0.04} L ${cx+s*0.10} ${cy-s*0.04} L ${cx+s*0.10} ${cy+s*0.01} L ${cx-s*0.10} ${cy+s*0.01} Z`}
          fill="white"
        />
        {/* Vertical stem of T */}
        <Path
          d={`M ${cx-s*0.025} ${cy+s*0.01} L ${cx+s*0.025} ${cy+s*0.01} L ${cx+s*0.025} ${cy+s*0.09} L ${cx-s*0.025} ${cy+s*0.09} Z`}
          fill="white"
        />

        {/* Small water drop above T */}
        <Ellipse cx={cx} cy={cy-s*0.09} rx={s*0.025} ry={s*0.03} fill="white" opacity={0.85}/>

        {/* Gold accent dot */}
        <Circle cx={cx+s*0.15} cy={cy-s*0.15} r={s*0.03} fill={C.gold} opacity={0.9}/>
      </Svg>
      {showText && (
        <Svg width={s} height={24} viewBox={`0 0 ${s} 24`}>
          <SvgText
            x={s/2} y={18}
            textAnchor="middle"
            fontSize={13}
            fontWeight="bold"
            fill={C.primary}
            letterSpacing={3}
          >
            TARPAY
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
