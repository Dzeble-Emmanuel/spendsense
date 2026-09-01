import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { useBiometric } from "../../src/hooks/useBiometric";
import { SUPPORTED_CURRENCIES, Currency } from "../../src/context/SettingsContext";

export default function Settings() {
  const { theme } = useTheme();
  const {
    darkMode,
    toggleDarkMode,
    notifications,
    toggleNotifications,
    biometricEnabled,
    setBiometricEnabled,
    currency,
    setCurrency,
  } = useSettings();
  const { isAvailable: biometricAvailable, biometricType, authenticate } = useBiometric();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  async function handleBiometricToggle() {
    if (!biometricEnabled) {
      const ok = await authenticate("Authenticate to enable biometric lock");
      if (ok) {
        setBiometricEnabled(true);
        Alert.alert("✅ Enabled", `${biometricType === "facial" ? "Face ID" : "Fingerprint"} lock is active.`);
      } else {
        Alert.alert("Failed", "Authentication failed. Biometric lock not enabled.");
      }
    } else {
      setBiometricEnabled(false);
      Alert.alert("Disabled", "Biometric lock turned off.");
    }
  }

  const biometricLabel = biometricType === "facial" ? "Face ID Lock" : "Fingerprint Lock";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.text }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Preferences Section */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.heading, { color: theme.text }]}>⚙️ Preferences</Text>

        {/* Currency Option */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowCurrencyModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Text style={styles.optionIcon}>💱</Text>
            <Text style={[styles.optionText, { color: theme.text }]}>Currency</Text>
          </View>
          <View style={styles.optionRight}>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {currency.code} ({currency.symbol})
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Dark Mode Option */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Text style={styles.optionIcon}>{darkMode ? "🌙" : "☀️"}</Text>
            <Text style={[styles.optionText, { color: theme.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
            thumbColor={darkMode ? "#FFFFFF" : "#F3F4F6"}
          />
        </View>

        {/* Notifications Option */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Text style={styles.optionIcon}>🔔</Text>
            <Text style={[styles.optionText, { color: theme.text }]}>Push Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
            thumbColor={notifications ? "#FFFFFF" : "#F3F4F6"}
          />
        </View>
      </View>

      {/* Security Section */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.heading, { color: theme.text }]}>🔒 Security</Text>

        {/* Biometric Toggle */}
        {biometricAvailable ? (
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>{biometricType === "facial" ? "🔓" : "👆"}</Text>
              <Text style={[styles.optionText, { color: theme.text }]}>{biometricLabel}</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: "#D1D5DB", true: "#7C3AED" }}
              thumbColor={biometricEnabled ? "#FFFFFF" : "#F3F4F6"}
            />
          </View>
        ) : (
          <Text style={[styles.subtext, { color: theme.textSecondary }]}>
            Biometric authentication is not supported or configured on this device.
          </Text>
        )}
      </View>

      {/* Data Management Section */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.heading, { color: theme.text }]}>💾 Data & Reports</Text>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => router.push("/(tabs)/reports")}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Text style={styles.optionIcon}>📄</Text>
            <Text style={[styles.optionText, { color: theme.text }]}>Export Reports & CSV</Text>
          </View>
          <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={[styles.card, { backgroundColor: theme.card, alignItems: "center" }]}>
        <Image
          source={require("../../assets/logo.png")}
          style={{ width: 180, height: 90, marginBottom: 8 }}
          resizeMode="contain"
        />
        <Text style={[styles.aboutText, { color: theme.text }]}>SpendSense v1.1.0</Text>
        <Text style={[styles.subtext, { color: theme.textSecondary, textAlign: "center" }]}>
          Intelligent Personal Finance Analytics and Prediction System Using Machine Learning
        </Text>
      </View>

      {/* Currency Selection Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Currency</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              All transaction amounts, balances, and reports will display in your chosen currency.
            </Text>

            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {SUPPORTED_CURRENCIES.map((c) => {
                const isSelected = currency.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyOption,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      setCurrency(c);
                      setShowCurrencyModal(false);
                    }}
                  >
                    <Text style={styles.currencySymbol}>{c.symbol}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.currencyName, { color: theme.text }]}>{c.name}</Text>
                      <Text style={[styles.currencyCode, { color: theme.textSecondary }]}>{c.code}</Text>
                    </View>
                    {isSelected && <Text style={{ color: theme.primary, fontSize: 18, fontWeight: "800" }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalBtn, { borderColor: theme.border }]}
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text style={[styles.closeModalText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 20 },
  backBtn: { paddingVertical: 6, paddingRight: 10 },
  backText: { fontSize: 16, fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "800" },

  card: { padding: 20, borderRadius: 20, marginBottom: 16 },
  heading: { fontSize: 17, fontWeight: "700", marginBottom: 16 },

  optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#334155" },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionIcon: { fontSize: 20 },
  optionText: { fontSize: 15, fontWeight: "600" },
  optionRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  arrow: { fontSize: 22, fontWeight: "300" },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: "700" },

  aboutText: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  subtext: { fontSize: 13, lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  modalSub: { fontSize: 13, marginBottom: 16, lineHeight: 18 },

  currencyOption: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1.5, gap: 14 },
  currencySymbol: { fontSize: 22, fontWeight: "700", width: 40, textAlign: "center" },
  currencyName: { fontSize: 15, fontWeight: "700" },
  currencyCode: { fontSize: 12, marginTop: 2 },
  closeModalBtn: { padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", marginTop: 16 },
  closeModalText: { fontWeight: "700" },
});