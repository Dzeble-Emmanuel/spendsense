import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/hooks/useTheme";

export default function EntryGatekeeper() {
  const { isAuthenticated, hasSeenTour, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // 1. User is already authenticated -> Go directly to Dashboard tabs
      router.replace("/(tabs)");
    } else if (!hasSeenTour) {
      // 2. First-time user -> Show Welcome Tour
      router.replace("/(auth)/welcome");
    } else {
      // 3. Returning logged-out user -> Go to Sign In
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, hasSeenTour, isLoading]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
      }}
    >
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}