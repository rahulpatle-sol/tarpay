import { useColorScheme } from "react-native";
import { Light, Dark } from "../constants/theme";
export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return { C: isDark ? Dark : Light, isDark };
}
