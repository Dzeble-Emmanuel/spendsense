import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../src/hooks/useTheme";
import { useBiometric } from "../src/hooks/useBiometric";
import { useAuth } from "../src/hooks/useAuth";

export default function LockScreen() {
  const { theme, toggleDarkMode, isDark } = useTheme();
  const { authenticate, biometricType } = useBiometric();
  const { logout } = useAuth();

  const [pinMode, setPinMode] = useState(false);
  const [pin, setPin] = useState("");
  const [failed, setFailed] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    handleBiometricUnlock();
  }, []);

  const handleBiometricUnlock = async () => {
    setIsAuthenticating(true);
    setFailed(false);
    const ok = await authenticate("Unlock SpendSense Personal Vault");
    setIsAuthenticating(false);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      setFailed(true);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length >= 4) {
      router.replace("/(tabs)");
    } else {
      setFailed(true);
      Alert.alert("Invalid PIN", "Please enter a 4-digit PIN.");
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Controls Bar */}
      <View style={styles.topBar}>
        <View style={[styles.securityBadge, { backgroundColor: theme.primaryLight }]}>
          <Feather name="shield" size={13} color={theme.primary} />
          <Text style={[styles.securityBadgeText, { color: theme.primary }]}>
            Biometric Protection Active
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={toggleDarkMode}
        >
          <Feather name={isDark ? "sun" : "moon"} size={13} color={theme.text} />
          <Text style={[styles.themeBtnText, { color: theme.text }]}>
            {isDark ? "Dark" : "Light"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Lock Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.brandBox}>
          <View style={[styles.brandLogo, { backgroundColor: theme.primary }]}>
            <Ionicons name="wallet" size={26} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>SpendSense</Text>
          <Text style={[styles.appSub, { color: theme.textSecondary }]}>
            Personal finance vault is locked
          </Text>
        </View>

        {/* Biometric Sensor Circle */}
        <TouchableOpacity
          style={[styles.sensorCircle, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={handleBiometricUnlock}
          activeOpacity={0.8}
        >
          <Ionicons
            name={biometricType === "facial" ? "scan" : "finger-print"}
            size={44}
            color={theme.primary}
          />
        </TouchableOpacity>

        {/* Instructions */}
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.modeTitle, { color: theme.text }]}>
            {pinMode ? "Enter Device PIN" : "Biometric Authentication"}
          </Text>
          <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>
            {pinMode
              ? "Enter your 4-digit security PIN to unlock"
              : "Scan fingerprint or face to access records"}
          </Text>
        </View>

        {/* Error Feedback */}
        {failed && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={14} color="#F43F5E" />
            <Text style={styles.errorText}>Authentication unsuccessful. Try PIN or rescan.</Text>
          </View>
        )}

        {/* Controls */}
        {!pinMode ? (
          <View style={{ gap: 10, marginTop: 6 }}>
            <TouchableOpacity
              style={[styles.unlockBtn, { backgroundColor: theme.primary }]}
              onPress={handleBiometricUnlock}
              disabled={isAuthenticating}
            >
              <Ionicons name="finger-print" size={18} color="#FFFFFF" />
              <Text style={styles.unlockBtnText}>
                {isAuthenticating ? "Scanning..." : "Unlock with Biometrics"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pinToggleBtn}
              onPress={() => {
                setPinMode(true);
                setFailed(false);
              }}
            >
              <Feather name="key" size={13} color={theme.textSecondary} />
              <Text style={[styles.pinToggleText, { color: theme.textSecondary }]}>
                Use 4-digit PIN instead
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 6 }}>
            <TextInput
              style={[styles.pinInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.unlockBtn, { backgroundColor: theme.primary }]}
              onPress={handlePinSubmit}
            >
              <Text style={styles.unlockBtnText}>Confirm PIN & Unlock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pinToggleBtn}
              onPress={() => {
                setPinMode(false);
                setPin("");
                setFailed(false);
              }}
            >
              <Text style={[styles.pinToggleText, { color: theme.textSecondary }]}>
                Back to Biometric Sensor
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Switch Account */}
        <TouchableOpacity style={styles.switchAccountBtn} onPress={handleSignOut}>
          <Feather name="log-out" size={12} color={theme.textMuted} />
          <Text style={[styles.switchAccountText, { color: theme.textMuted }]}>
            Switch Account / Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  securityBadgeText: { fontSize: 10, fontWeight: "800" },
  themeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeBtnText: { fontSize: 11, fontWeight: "700" },

  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 14,
  },
  brandBox: { alignItems: "center" },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  appName: { fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  appSub: { fontSize: 11, marginTop: 2 },

  sensorCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
  },

  modeTitle: { fontSize: 14, fontWeight: "900" },
  modeDesc: { fontSize: 11, textAlign: "center", marginTop: 2, paddingHorizontal: 10 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  errorText: { color: "#F43F5E", fontSize: 11, fontWeight: "700" },

  unlockBtn: {
    width: 280,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  unlockBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },

  pinToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  pinToggleText: { fontSize: 12, fontWeight: "700" },

  pinInput: {
    width: 280,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 8,
  },

  switchAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.15)",
    width: "100%",
    justifyContent: "center",
  },
  switchAccountText: { fontSize: 11, fontWeight: "700" },
});
