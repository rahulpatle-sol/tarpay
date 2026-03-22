import { Tabs } from "expo-router";
import { View, StyleSheet, Text } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../hooks/useTheme";

export default function TabsLayout() {
  const { C, isDark } = useTheme();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { position:"absolute", borderTopWidth:0, height:82, backgroundColor:"transparent", elevation:0 },
      tabBarBackground: () => (
        <BlurView intensity={95} tint={isDark?"dark":"light"} style={StyleSheet.absoluteFill}>
          <View style={{flex:1, borderTopWidth:1, borderTopColor:C.b1}}/>
        </BlurView>
      ),
      tabBarActiveTintColor:   C.primary,
      tabBarInactiveTintColor: C.t3,
      tabBarShowLabel: true,
      tabBarLabelStyle: { fontSize:10, fontWeight:"600", marginBottom:4 },
    }}>
      <Tabs.Screen name="index"    options={{ title:"Home",     tabBarIcon:({color,focused})=><Ionicons name={focused?"home":"home-outline"} size={23} color={color}/> }}/>
      <Tabs.Screen name="history"  options={{ title:"Payments", tabBarIcon:({color,focused})=><Ionicons name={focused?"receipt":"receipt-outline"} size={23} color={color}/> }}/>
      <Tabs.Screen name="send"     options={{ title:"Send",     tabBarIcon:({color})=><SendTab color={color}/> }}/>
      <Tabs.Screen name="disputes" options={{ title:"Disputes", tabBarIcon:({color,focused})=><Ionicons name={focused?"shield":"shield-outline"} size={23} color={color}/> }}/>
      <Tabs.Screen name="profile"  options={{ title:"Profile",  tabBarIcon:({color,focused})=><Ionicons name={focused?"person-circle":"person-circle-outline"} size={24} color={color}/> }}/>
    </Tabs>
  );
}

function SendTab({ color }) {
  const { C } = useTheme();
  return (
    <View style={{ marginTop:-16 }}>
      <LinearGradient colors={C.grad} style={{ width:52, height:52, borderRadius:26, alignItems:"center", justifyContent:"center", shadowColor:C.primary, shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:10, elevation:10 }}>
        <Ionicons name="send" size={22} color="#fff"/>
      </LinearGradient>
    </View>
  );
}
