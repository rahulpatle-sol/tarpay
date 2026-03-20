import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const C = { bg0:"#050508", mint:"#00F5B4", mintDim:"#00F5B420", blue:"#3D9EFF", t1:"#FFFFFF", t2:"#C4C4D4", t3:"#6E6E8A", grad:["#00F5B4","#3D9EFF"] };
const S = { lg:24, xl:32, xxl:48 };

export default function WelcomeScreen() {
  const router = useRouter();
  const logoScale  = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;
  const btnTranslate = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo animate in
      Animated.parallel([
        Animated.spring(logoScale,   { toValue:1, tension:60, friction:7, useNativeDriver:true }),
        Animated.timing(logoOpacity, { toValue:1, duration:600, useNativeDriver:true }),
      ]),
      // Text fade in
      Animated.timing(textOpacity, { toValue:1, duration:500, delay:100, useNativeDriver:true }),
      // Button slide up
      Animated.parallel([
        Animated.timing(btnOpacity,    { toValue:1, duration:400, useNativeDriver:true }),
        Animated.timing(btnTranslate,  { toValue:0, duration:400, useNativeDriver:true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={s.container}>
      {/* Background image */}
      <Image
        source={{uri:"https://picsum.photos/seed/tarpay-welcome/800/1600"}}
        style={s.bgImage}
        blurRadius={6}
      />

      {/* Dark overlay */}
      <LinearGradient
        colors={["#050508CC", "#050508DD", "#050508"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow circle behind logo */}
      <View style={s.glowCircle}/>

      {/* Top content */}
      <View style={s.topContent}>
        {/* Logo */}
        <Animated.View style={{ transform:[{scale:logoScale}], opacity:logoOpacity }}>
          <LinearGradient colors={C.grad} start={{x:0,y:0}} end={{x:1,y:1}} style={s.logo}>
            <Text style={s.logoTxt}>T</Text>
          </LinearGradient>
        </Animated.View>

        {/* Brand + tagline */}
        <Animated.View style={{ opacity:textOpacity, alignItems:"center", marginTop:S.xl }}>
          <Text style={s.brand}>TarPay</Text>
          <Text style={s.tagline}>Paise bhejo, darr nahi 💚</Text>

          {/* Feature pills */}
          <View style={s.pillsRow}>
            {["🔒 Escrow Protected", "⚡ Instant Alerts", "🛡️ Fraud Detection"].map(f => (
              <View key={f} style={s.pill}>
                <Text style={s.pillTxt}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <Animated.View style={[s.bottomContent, { opacity:btnOpacity, transform:[{translateY:btnTranslate}] }]}>
        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { n:"300M+", l:"UPI Users" },
            { n:"24hr",  l:"Escrow Hold" },
            { n:"₹0",    l:"Third Party Fee" },
          ].map(st => (
            <View key={st.l} style={s.statItem}>
              <Text style={s.statNum}>{st.n}</Text>
              <Text style={s.statLabel}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Get Started button */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <LinearGradient colors={C.grad} start={{x:0,y:0}} end={{x:1,y:0}} style={s.getStartedBtn}>
            <Text style={s.getStartedTxt}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#000"/>
          </LinearGradient>
        </TouchableOpacity>

        {/* Already have account */}
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={s.loginLink}>
          <Text style={s.loginLinkTxt}>
            Already have account? <Text style={{color:C.mint, fontWeight:"700"}}>Sign In</Text>
          </Text>
        </TouchableOpacity>

        <Text style={s.footerTxt}>Built for HACK HUSTLE 2.0 🏆</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex:1, backgroundColor:C.bg0, alignItems:"center" },
  bgImage:      { position:"absolute", width, height, resizeMode:"cover" },
  glowCircle:   { position:"absolute", top:height*0.2, width:300, height:300, borderRadius:150, backgroundColor:C.mint+"08" },
  topContent:   { flex:1, alignItems:"center", justifyContent:"center", paddingTop:60 },
  logo:         { width:100, height:100, borderRadius:28, alignItems:"center", justifyContent:"center", shadowColor:C.mint, shadowOffset:{width:0,height:8}, shadowOpacity:0.6, shadowRadius:24, elevation:20 },
  logoTxt:      { fontSize:56, fontWeight:"900", color:"#000" },
  brand:        { fontSize:42, fontWeight:"900", color:C.t1, letterSpacing:-1.5 },
  tagline:      { fontSize:15, color:C.t3, marginTop:8, marginBottom:S.xl },
  pillsRow:     { gap:10, alignItems:"center" },
  pill:         { backgroundColor:C.mintDim, borderRadius:999, paddingHorizontal:16, paddingVertical:8, borderWidth:1, borderColor:C.mint+"30" },
  pillTxt:      { fontSize:13, color:C.mint, fontWeight:"600" },
  bottomContent:{ width:"100%", paddingHorizontal:S.lg, paddingBottom:48, gap:16 },
  statsRow:     { flexDirection:"row", justifyContent:"space-around", backgroundColor:"#0C0C14", borderRadius:20, padding:S.lg, borderWidth:1, borderColor:"#252540" },
  statItem:     { alignItems:"center" },
  statNum:      { fontSize:20, fontWeight:"900", color:C.mint },
  statLabel:    { fontSize:11, color:C.t3, marginTop:3 },
  getStartedBtn:{ borderRadius:999, paddingVertical:18, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:10, shadowColor:C.mint, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:16, elevation:12 },
  getStartedTxt:{ fontSize:18, fontWeight:"900", color:"#000" },
  loginLink:    { alignItems:"center", paddingVertical:4 },
  loginLinkTxt: { fontSize:14, color:C.t3 },
  footerTxt:    { fontSize:11, color:"#3D3D5C", textAlign:"center" },
});