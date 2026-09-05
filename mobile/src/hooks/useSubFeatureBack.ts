import { useCallback } from "react";
import { BackHandler } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

/**
 * Handles back navigation for sub-features within the Tabs group.
 * - Prioritizes the explicit `returnTo` query parameter passed during navigation.
 * - Intercepts Android hardware back button & swipe gestures via BackHandler.
 * - Falls back to `fallbackRoute` if history is empty.
 */
export function useSubFeatureBack(fallbackRoute: string) {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const handleBack = useCallback(() => {
    if (returnTo) {
      router.replace(returnTo as any);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  }, [returnTo, fallbackRoute]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true; // Prevents default Android behavior (which jumps to the first tab / Home)
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [handleBack])
  );

  return handleBack;
}
