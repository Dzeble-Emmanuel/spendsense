import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { FinanceProvider } from "../src/context/FinanceContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { SubscriptionProvider } from "../src/context/SubscriptionContext";

import { useTheme } from "../src/hooks/useTheme";

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