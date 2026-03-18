import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Keyboard, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { txAPI } from "../../services/api";
import { useAuth } from "../../store/auth";
import GBtn from "../../components/GBtn";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { C, S, R, IMG } from "../../constants/theme";
const QUICK = [50, 100, 500, 1000, 5000];

export default function SendScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [upi, setUpi] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [warn, setWarn] = useState(null);
  const [amt, setAmt] = useState("");
  const [desc, setDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    if (!upi) return; Keyboard.dismiss(); setLoading(true);
    try {
      const { data } = await txAPI.validate(upi);
      setReceiver(data.receiver); setWarn(data.warning || null);
      if (data.warning) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setStep(2);
    } catch (e) {
      Alert.alert("UPI Not Found", e.response?.data?.message || "Check UPI ID");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally { setLoading(false); }
  };

  const send = async () => {
    const n = parseFloat(amt);
    if (!n || n <= 0) { Alert.alert("Invalid Amount"); return; }
    if (n > user.balance) { Alert.alert("Insufficient Balance", `Your balance: ₹${user.balance}`); return; }
    setLoading(true);
    try {
      const { data } = await txAPI.send({ receiverUpiId: upi, amount: n, description: desc });
      setResult(data); setUser({ ...user, balance: user.balance - n });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(3);
    } catch (e) { Alert.alert("Payment Failed", e.response?.data?.message || "Try again"); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep(1); setUpi(""); setReceiver(null); setWarn(null); setAmt(""); setDesc(""); setResult(null); };

  if (step === 3 && result) return (
    <View style={[s.container, { justifyContent: "center", alignItems: "center", padding: S.lg }]}>
      <LinearGradient colors={C.grad} style={s.successIcon}>
        <Ionicons name="checkmark" size={52} color="#000" />
      </LinearGradient>
      <Text style={s.successTitle}>Payment Sent!</Text>
      <Text style={s.successAmt}>₹{parseFloat(amt).toLocaleString("en-IN")}</Text>
      <Text style={s.successTo}>to {receiver?.name}</Text>
      <Card style={{ width: "100%", marginTop: S.lg, gap: 8 }} glow>
        <Ionicons name="time" size={20} color={C.orange} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: C.orange }}>Held in Escrow — 24hrs</Text>
        <Text style={{ fontSize: 13, color: C.t3, lineHeight: 20 }}>
          {receiver?.name} receives funds after 24hrs. Cancel within 1hr or raise a dispute anytime.
        </Text>
        {result.isFlagged && <Text style={{ fontSize: 11, color: C.red }}>⚠ Auto-flagged: risk score {result.riskScore}/100</Text>}
      </Card>
      <GBtn title="View Transaction" onPress={() => { reset(); router.push(`/tx/${result.transaction.id}`); }} style={{ width: "100%", marginTop: S.lg }} />
      <GBtn variant="outline" title="Send Another" onPress={reset} style={{ width: "100%", marginTop: 10 }} />
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <Text style={s.title}>{step === 1 ? "Send Payment" : "Enter Amount"}</Text>
        <View style={s.stepRow}>
          {[1, 2].map(n => <View key={n} style={[s.stepDot, n <= step && s.stepOn]} />)}
        </View>
      </View>

      {step === 1 && (
        <View style={s.step}>
          <Text style={s.stepTitle}>Who are you paying?</Text>
          <Input icon="at" placeholder="e.g. samosa@tarpay" value={upi} onChange={setUpi} hint="TarPay UPI ID" />
          <View style={s.chips}>
            {["samosa@tarpay", "priya@tarpay"].map(id => (
              <TouchableOpacity key={id} style={s.chip} onPress={() => setUpi(id)}>
                <Text style={s.chipTxt}>{id}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <GBtn title="Verify Receiver →" onPress={validate} loading={loading} style={{ marginTop: S.lg }} />
        </View>
      )}

      {step === 2 && receiver && (
        <View style={s.step}>
          <Card style={s.recCard}>
            <View style={s.recRow}>
              <Image source={{ uri: IMG.avatar(receiver.name) }} style={s.recAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.recName}>{receiver.name}</Text>
                <Text style={s.recUpi}>{receiver.upiId}</Text>
                {receiver.businessName && <Text style={{ fontSize: 11, color: C.mint }}>{receiver.businessName}</Text>}
              </View>
              <Ionicons name="checkmark-circle" size={24} color={C.green} />
            </View>
          </Card>
          {warn && <View style={s.warnBox}><Ionicons name="warning" size={15} color={C.orange} /><Text style={s.warnTxt}>{warn}</Text></View>}
          <View style={s.amtRow}>
            <Text style={s.rupee}>₹</Text>
            <Text style={[s.amtBig, { color: parseFloat(amt) > 0 ? C.t1 : C.t4 }]}>{amt || "0"}</Text>
          </View>
          <Input placeholder="Amount" value={amt} onChange={setAmt} keyb="numeric" />
          <View style={s.quickRow}>
            {QUICK.map(q => <TouchableOpacity key={q} style={s.qChip} onPress={() => setAmt(String(q))}><Text style={s.qChipTxt}>₹{q}</Text></TouchableOpacity>)}
          </View>
          <Input icon="chatbubble-outline" placeholder="Add note (optional)" value={desc} onChange={setDesc} />
          <View style={s.escrowBox}>
            <Ionicons name="shield-checkmark" size={14} color={C.mint} />
            <Text style={s.escrowTxt}>Held in escrow 24hrs. Cancel within 1hr if needed.</Text>
          </View>
          <GBtn title={`Pay ₹${parseFloat(amt) || 0}`} onPress={send} loading={loading} disabled={!amt || parseFloat(amt) <= 0} />
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  content: { padding: S.lg, paddingBottom: 100 },
  header: { marginBottom: S.lg, marginTop: 12 },
  title: { fontSize: 22, fontWeight: "900", color: C.t1, marginBottom: 12 },
  stepRow: { flexDirection: "row", gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.b1 },
  stepOn: { backgroundColor: C.mint, width: 24 },
  step: { gap: 14 },
  stepTitle: { fontSize: 18, fontWeight: "800", color: C.t1 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: C.bg3, borderRadius: R.full, borderWidth: 1, borderColor: C.b1 },
  chipTxt: { fontSize: 12, color: C.t2 },
  recCard: { padding: 14 },
  recRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  recAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.bg3 },
  recName: { fontSize: 16, fontWeight: "700", color: C.t1 },
  recUpi: { fontSize: 11, color: C.t3, marginTop: 2 },
  warnBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: C.orange + "15", borderRadius: R.sm, padding: 12, borderWidth: 1, borderColor: C.orange + "30" },
  warnTxt: { fontSize: 12, color: C.orange, flex: 1 },
  amtRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: S.md },
  rupee: { fontSize: 32, fontWeight: "700", color: C.t3, marginRight: 6 },
  amtBig: { fontSize: 60, fontWeight: "900", letterSpacing: -2 },
  quickRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  qChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.bg3, borderRadius: R.full, borderWidth: 1, borderColor: C.b1 },
  qChipTxt: { fontSize: 12, color: C.t2, fontWeight: "600" },
  escrowBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: C.mintDim, borderRadius: R.sm, padding: 12, borderWidth: 1, borderColor: C.mint + "30" },
  escrowTxt: { fontSize: 11, color: C.mint, flex: 1 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", shadowColor: C.mint, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 16, marginBottom: S.lg },
  successTitle: { fontSize: 26, fontWeight: "900", color: C.t1 },
  successAmt: { fontSize: 44, fontWeight: "900", color: C.mint, letterSpacing: -1 },
  successTo: { fontSize: 14, color: C.t3, marginBottom: S.sm },
});
