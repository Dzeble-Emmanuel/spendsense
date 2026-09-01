import React from "react";
import { View, Text, StyleSheet, Image, ViewStyle } from "react-native";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
  style?: ViewStyle;
}

export function SpendSenseLogo({
  size = "medium",
  showTagline = false,
  style,
}: LogoProps) {
  const dimensions =
    size === "small"
      ? { width: 140, height: 70 }
      : size === "large"
      ? { width: 260, height: 130 }
      : { width: 200, height: 100 };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("../../../assets/logo.png")}
        style={[dimensions, styles.image]}
        resizeMode="contain"
      />
      {showTagline && (
        <Text style={styles.tagline}>Intelligent Finance Analytics</Text>
      )}
    </View>
  );
}
export default SpendSenseLogo;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  image: {
    marginBottom: -4,
  },
  tagline: {
    fontSize: 12,
    color: "#64748B",
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
