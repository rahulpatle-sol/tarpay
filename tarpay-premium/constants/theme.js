/**
 * TarPay Premium Design System v2.0 — "Sacred Water"
 * Inspired by Tarpan (Hindu ritual water offering to ancestors)
 * Milk White + Forest Green + Sacred Gold
 * Full Light + Dark mode support
 */

export const Light = {
  bg0:"#FFFFFF", bg1:"#F8FDF9", bg2:"#EEF8F2", bg3:"#E2F5E9", bg4:"#F0FAF4",
  primary:"#00875A", primaryDim:"#00875A18", primaryMid:"#00875A30",
  accent:"#00C47D", accentDim:"#00C47D15",
  gold:"#C9962C", goldDim:"#C9962C15",
  success:"#00875A", danger:"#E53935", warning:"#F57C00", info:"#1565C0",
  t1:"#0D1F17", t2:"#2D5A3D", t3:"#6B8F76", t4:"#A8C5B0",
  b1:"#D4EDE0", b2:"#E8F5EE",
  card:"#FFFFFF", cardBorder:"#D4EDE0",
  grad:["#00875A","#00C47D"], gradGold:["#C9962C","#F0C040"],
  tabBg:"rgba(255,255,255,0.95)",
  shadow: { shadowColor:"#00875A", shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:12, elevation:6 },
};

export const Dark = {
  bg0:"#080F0B", bg1:"#0F1A13", bg2:"#162219", bg3:"#1D2E22", bg4:"#243528",
  primary:"#00C47D", primaryDim:"#00C47D18", primaryMid:"#00C47D30",
  accent:"#00F5A0", accentDim:"#00F5A015",
  gold:"#F0C040", goldDim:"#F0C04015",
  success:"#00C47D", danger:"#FF5252", warning:"#FF9F43", info:"#42A5F5",
  t1:"#F0FFF6", t2:"#A8D5B5", t3:"#6B9E7A", t4:"#3D5E47",
  b1:"#1E3328", b2:"#152A1E",
  card:"#0F1A13", cardBorder:"#1E3328",
  grad:["#00875A","#00C47D"], gradGold:["#C9962C","#F0C040"],
  tabBg:"rgba(8,15,11,0.95)",
  shadow: { shadowColor:"#00C47D", shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:12, elevation:6 },
};

export const R = { xs:6, sm:10, md:16, lg:20, xl:28, full:999 };
export const S = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };
export const F = { xs:10, sm:12, md:14, body:15, lg:17, xl:20, xxl:26, display:36, hero:44 };
export const IMG = { avatar:(n)=>`https://picsum.photos/seed/${encodeURIComponent(n||"u")}/80/80` };
