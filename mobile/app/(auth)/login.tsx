import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/hooks/useAuth";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setError(result.error || "Login failed");
    }
  }

  return (
    <LinearGradient
      colors={["#0F172A", "#1E293B", "#0F172A"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Branding */}
          <View style={styles.brandSection}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>
              Intelligent Finance Analytics
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to continue managing your finances
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2563EB", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>SIGN IN</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                Don't have an account?{" "}
                <Text style={styles.linkAccent}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  // Brand
  brandSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoImage: {
    width: 240,
    height: 120,
  },
  tagline: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: -4,
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 24,
  },

  // Error
  errorBox: {
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 13,
    textAlign: "center",
  },

  // Input
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    backgroundColor: "#0F172A",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#334155",
  },

  // Button
  button: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },

  // Links
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  linkAccent: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});