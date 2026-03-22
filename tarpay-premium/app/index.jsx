/**
 * SplashScreen — Sacred Water animated welcome
 * Tarpan-inspired ripple animation + brand reveal
 */
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../store/auth";
import TarPayLogo from "../components/TarPayLogo";
import PBtn from "../components/PBtn";
import { F, S, R } from "../constants/theme";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const { C, isDark } = useTheme();
  const router = useRouter();
  const { user, ready, restore } = useAuth();

  // Animations
  const ripple1 = useRef(new Animated.Value(0.3)).current;
  const ripple2 = useRef(new Animated.Value(0.3)).current;
  const ripple3 = useRef(new Animated.Value(0.3)).current;
  const logoY    = useRef(new Animated.Value(30)).current;
  const logoO    = useRef(new Animated.Value(0)).current;
  const contentO = useRef(new Animated.Value(0)).current;
  const btnY     = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    restore();
    // Ripple animation
    const rippleSeq = (val, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, { toValue:1, duration:2000, useNativeDriver:true }),
        Animated.timing(val, { toValue:0.3, duration:1000, useNativeDriver:true }),
      ])
    );
    rippleSeq(ripple1, 0).start();
    rippleSeq(ripple2, 700).start();
    rippleSeq(ripple3, 1400).start();

    // Content reveal
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoY,  { toValue:0, useNativeDriver:true, tension:60, friction:8 }),
        Animated.timing(logoO,  { toValue:1, duration:600, useNativeDriver:true }),
      ]),
      Animated.parallel([
        Animated.timing(contentO, { toValue:1, duration:500, useNativeDriver:true }),
        Animated.spring(btnY,     { toValue:0, useNativeDriver:true, tension:50, friction:8 }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (ready && user) router.replace("/tabs/");
  }, [ready, user]);

  const rippleStyle = (val, size) => ({
    width:size, height:size, borderRadius:size/2,
    borderWidth:1.5, borderColor:C.primary,
    position:"absolute",
    opacity: val.interpolate({ inputRange:[0.3,1], outputRange:[0,0.4] }),
    transform:[{ scale: val }],
  });

  return (
    <View style={[s.container, { backgroundColor:C.bg0 }]}>
      {/* Sacred water ripples */}
      <View style={s.rippleCenter}>
        <Animated.View style={rippleStyle(ripple1, width*0.9)}/>
        <Animated.View style={rippleStyle(ripple2, width*0.65)}/>
        <Animated.View style={rippleStyle(ripple3, width*0.42)}/>
      </View>

      {/* Top section */}
      <View style={s.top}>
        <Animated.View style={{ transform:[{translateY:logoY}], opacity:logoO, alignItems:"center" }}>
          <TarPayLogo size={90} animated showText={false}/>
          <View style={s.brandRow}>
            <Text style={[s.brand, {color:C.t1}]}>Tar</Text>
            <Text style={[s.brand, {color:C.primary}]}>Pay</Text>
          </View>
          <Text style={[s.sanskrit, {color:C.gold}]}>॥ तर्पण ॥</Text>
          <Text style={[s.tagline, {color:C.t3}]}>Paise bhejo, darr nahi</Text>
        </Animated.View>
      </View>

      {/* Stats row */}
      <Animated.View style={[s.statsRow, { opacity:contentO }]}>
        {[
          { n:"300M+", l:"UPI Users" },
          { n:"₹0",    l:"Gateway Fees" },
          { n:"24hr",  l:"Escrow Safety" },
        ].map((st,i)=>(
          <View key={i} style={[s.statItem, {borderColor:C.b1, backgroundColor:C.bg1}]}>
            <Text style={[s.statNum, {color:C.primary}]}>{st.n}</Text>
            <Text style={[s.statLabel, {color:C.t3}]}>{st.l}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Feature list */}
      <Animated.View style={[s.features, {opacity:contentO}]}>
        {[
          { icon:"shield-checkmark", text:"Escrow protected payments" },
          { icon:"time",             text:"Smart hold — cancel anytime" },
          { icon:"alert-circle",     text:"Instant dispute resolution" },
        ].map((f,i)=>(
          <View key={i} style={s.featureRow}>
            <View style={[s.featureIcon, {backgroundColor:C.primaryDim}]}>
              <Ionicons name={f.icon} size={16} color={C.primary}/>
            </View>
            <Text style={[s.featureTxt, {color:C.t2}]}>{f.text}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTA Buttons */}
      <Animated.View style={[s.btns, { transform:[{translateY:btnY}], opacity:contentO }]}>
        <PBtn title="Get Started" onPress={()=>router.push("/auth/register")} size="lg" style={s.btnFull}/>
        <PBtn title="I already have an account" onPress={()=>router.push("/auth/login")} variant="ghost" style={{marginTop:10}}/>
      </Animated.View>

      <Text style={[s.footer, {color:C.t4}]}>Built for HACK HUSTLE 2.0 🏆</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex:1, paddingHorizontal:S.lg, paddingBottom:S.xl },
  rippleCenter:{ position:"absolute", top:height*0.18, left:0, right:0, alignItems:"center", justifyContent:"center" },
  top:         { flex:1, alignItems:"center", justifyContent:"center", paddingTop:60 },
  brandRow:    { flexDirection:"row", marginTop:12 },
  brand:       { fontSize:F.hero, fontWeight:"900", letterSpacing:-2 },
  sanskrit:    { fontSize:F.md, fontWeight:"600", marginTop:4, letterSpacing:3 },
  tagline:     { fontSize:F.body, marginTop:6 },
  statsRow:    { flexDirection:"row", gap:8, marginBottom:S.lg },
  statItem:    { flex:1, alignItems:"center", paddingVertical:12, borderRadius:R.md, borderWidth:1 },
  statNum:     { fontSize:F.xl, fontWeight:"900" },
  statLabel:   { fontSize:F.xs, marginTop:2, textAlign:"center" },
  features:    { gap:10, marginBottom:S.lg },
  featureRow:  { flexDirection:"row", alignItems:"center", gap:10 },
  featureIcon: { width:32, height:32, borderRadius:8, alignItems:"center", justifyContent:"center" },
  featureTxt:  { fontSize:F.body, fontWeight:"500", flex:1 },
  btns:        { gap:4 },
  btnFull:     {},
  footer:      { textAlign:"center", fontSize:F.xs, marginTop:S.md },
});
