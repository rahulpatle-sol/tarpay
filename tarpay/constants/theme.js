import { Platform } from 'react-native';

export const C = {
  bg0:"#050508", bg1:"#0C0C14", bg2:"#12121E", bg3:"#1A1A2E",
  mint:"#00F5B4", mintDim:"#00F5B420", mintGlow:"#00F5B450",
  blue:"#3D9EFF", blueDim:"#3D9EFF20",
  green:"#00F5B4", red:"#FF4567", orange:"#FF9F43", purple:"#A855F7",
  t1:"#FFFFFF", t2:"#C4C4D4", t3:"#6E6E8A", t4:"#3D3D5C",
  b1:"#252540", b2:"#1A1A30",
  grad:["#00F5B4","#3D9EFF"],
};

export const R = { xs:6, sm:10, md:16, lg:22, xl:30, full:999 };

export const S = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };

export const IMG = {
  avatar:(name)=>`https://picsum.photos/seed/${encodeURIComponent(name||"user")}/80/80`,
  banner:(seed)=>`https://picsum.photos/seed/${seed}/800/300`,
};

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});