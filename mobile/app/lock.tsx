import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useBiometric } from "../src/hooks/useBiometric";

export default function LockScreen() {
  const { biometricType, authenticate } = useBiometric();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [failed, setFailed] = useState(false);

  const icon = biometricType === "facial" ? "🔓" : "👆";
  const label =
    biometricType === "facial" ? "Unlock with Face ID" :
    biometricType === "iris"   ? "Unlock with Iris" :
    "Unlock with Fingerprint";

  async function handleUnlock() {
    setIsAuthenticating(true);
    setFailed(false);
    const success = await authenticate();
    setIsAuthenticating(false);
    if (success) {
      router.replace("/(tabs)");
    } else {
      setFailed(true);
    }
  }

  return (
    <LinearGradient colors={["#0F172A", "#1E293B", "#0F172A"]} style={styles.container}>
      {/* Official SpendSense Logo */}
      <Image
        source={require("../assets/logo.png")}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Your finances, secured.</Text>

      {/* Lock Icon */}
      <View style={styles.lockCircle}>
        <Text style={styles.lockIcon}>🔒</Text>
      </View>

      <Text style={styles.subtitle}>
        App is locked{"\n"}Authenticate to continue
      </Text>

      {/* Error */}
      {failed && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            ⚠️ Authentication failed. Please try again.
          </Text>
        </View>
      )}

      {/* Unlock Button */}
      <TouchableOpacity
        style={[styles.unlockButton, isAuthenticating && styles.buttonDim]}
        onPress={handleUnlock}
        disabled={isAuthenticating}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#2563EB", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>{icon}</Text>
              <Text style={styles.buttonText}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.hint}>
        You can also use your device PIN as a fallback
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoImage: {
    width: 220,
    height: 110,
    marginBottom: 4,
  },
  tagline: { fontSize: 13, color: "#64748B", marginBottom: 36 },

  lockCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  lockIcon: { fontSize: 42 },

  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },

  errorBox: {
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
    width: "100%",
  },
  errorText: { color: "#FCA5A5", fontSize: 13, textAlign: "center" },

  unlockButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  buttonDim: { opacity: 0.7 },
  buttonGradient: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonIcon: { fontSize: 22 },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  hint: { color: "#475569", fontSize: 12, textAlign: "center", lineHeight: 18 },
});
