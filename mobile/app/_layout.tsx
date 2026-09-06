import { LogBox, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AuthProvider } from "../src/context/AuthContext";
import { FinanceProvider } from "../src/context/FinanceContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { SubscriptionProvider } from "../src/context/SubscriptionContext";
import { useTheme } from "../src/hooks/useTheme";

LogBox.ignoreLogs([
  "ExpoAsset.downloadAsync",
  "Unable to download asset from url",
  "fontFamily",
]);

function RootContent() {
  const { theme } = useTheme();
  const isDark = theme.text === "#F8FAFC";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Feather.font,
    ...Ionicons.font,
  });

  return (
    <SettingsProvider>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <SubscriptionProvider>
              <RootContent />
            </SubscriptionProvider>
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}