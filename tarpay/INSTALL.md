# TarPay Extra Packages

Run this inside your fresh Expo project:

```bash
npx expo install axios zustand date-fns expo-linear-gradient expo-blur expo-haptics expo-secure-store
```

Then copy all files from this zip into your project root.

## File placement:
- `app/` folder → replace/merge with your existing `app/` folder  
- `components/` → copy to project root
- `constants/` → merge (add theme.js, keep existing Colors.ts if needed)
- `services/` → copy to project root
- `store/` → copy to project root

## .env
Create `.env` in project root:
```
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:4000
```
Use your machine's LAN IP, not localhost!
