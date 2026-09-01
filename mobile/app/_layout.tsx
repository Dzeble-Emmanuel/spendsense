import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { FinanceProvider } from "../src/context/FinanceContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { SubscriptionProvider } from "../src/context/SubscriptionContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <SubscriptionProvider>
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                }}
              />
            </SubscriptionProvider>
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}