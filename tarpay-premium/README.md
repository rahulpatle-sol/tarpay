# TarPay Premium v2.0 📱

> **Sacred Water** — Inspired by Tarpan (Hindu ritual of offering water to ancestors)
> *"Paise bhejo, darr nahi"*

## Premium Features
- 🌓 Full Light/Dark mode (system-aware)
- 🎨 Milk White + Forest Green + Sacred Gold palette
- ✨ Smooth animations throughout
- 🔐 UPI PIN (6-digit, like real UPI apps)
- 🔊 Sound effects on payment success/error
- 💫 Animated TarPay logo (water ripples)
- 📳 Haptic feedback on all interactions

## Quick Start
```bash
npm install --legacy-peer-deps
cp .env.example .env
# EXPO_PUBLIC_API_URL=https://tarpay.onrender.com
npx expo start --clear
```

## Screens
| Screen | Description |
|---|---|
| Splash (index.jsx) | Animated water ripples + brand reveal |
| Login | Milk-green themed, shake on error |
| Register | + Merchant toggle + UPI hint |
| PIN Screen | Real UPI-style 6-digit keypad |
| Home | Balance card, stats, quick actions |
| Send | 3-step: Validate → Amount → PIN → Success |
| History | Filter tabs + paginated list |
| Disputes | Status tracking |
| Profile | Avatar, balance, PIN settings |
| Notifications | Icon-mapped notif center |
| TX Detail | Full audit trail + escrow timer |
| Dispute Raise | Reason selector form |

## Logo Concept
**Tarpan** (तर्पण) = Hindu ritual of offering water to ancestors.
Logo: Concentric water ripples forming a sacred T shape + water drop.
Represents: Trust, offering, flow of money safely.

## Backend
https://tarpay.onrender.com
