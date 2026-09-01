import { useEffect } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    async function checkState() {
      const [token, biometric] = await Promise.all([
        AsyncStorage.getItem("spendsense_token"),
        AsyncStorage.getItem("biometricEnabled"),
      ]);

      if (token && biometric === "true") {
        // Logged in + biometric on → show lock screen
        setTarget("/lock");
      } else if (token) {
        // Logged in but no biometric → go straight to tabs
        setTarget("/(tabs)");
      } else {
        // Not logged in → go to login
        setTarget("/(auth)/login");
      }
    }
    checkState();
  }, []);

  if (!target) return null; // splash
  return <Redirect href={target as any} />;
}