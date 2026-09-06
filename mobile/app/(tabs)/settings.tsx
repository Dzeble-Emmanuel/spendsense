import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { useFinance } from "../../src/hooks/useFinance";
import { useBiometric } from "../../src/hooks/useBiometric";
import { useAuth } from "../../src/context/AuthContext";
import { SUPPORTED_CURRENCIES, Currency } from "../../src/types/finance";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";

export default function SettingsScreen() {
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
    exchangeRates,
  } = useSettings();
  const { clearAllData } = useFinance();
  const { isAvailable: biometricAvailable, biometricType, authenticate } = useBiometric();
  const { user, deleteAccount } = useAuth();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/profile");

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const isDemoUser = Boolean(
    user?.email &&
      ["demo@spendsense.app", "demo2@spendsense.app", "test@spendsense.app"].includes(
        user.email.toLowerCase().trim()
      )
  );

  const handleDeleteAccount = () => {
    if (isDemoUser) {
      Alert.alert(
        "Demo Profile Protected",
        "Demo evaluation accounts are permanent preview profiles and cannot be deleted. You can sign out or switch accounts instead."
      );
      return;
    }

    Alert.alert(
      "Permanently Delete Account",
      "Are you sure you want to permanently delete your SpendSense account? All transactions, budgets, and saved ledger records will be wiped immediately from both this device and the server. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            const res = await deleteAccount();
            if (res.success) {
              Alert.alert(
                "Account Deleted",
                "Your account and all associated financial records have been permanently purged.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(auth)/login"),
                  },
                ]
              );
            } else {
              Alert.alert("Deletion Failed", res.error || "Could not delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleBiometricToggle = async () => {
    if (!biometricEnabled) {
      const ok = await authenticate("Authenticate to enable biometric protection");
      if (ok) {
        setBiometricEnabled(true);
        Alert.alert("Enabled", "Biometric app protection is active.");
      } else {
        Alert.alert("Failed", "Biometric verification unsuccessful.");
      }
    } else {
      setBiometricEnabled(false);
      Alert.alert("Disabled", "Biometric app protection turned off.");
    }
  };

  const handleClearVault = () => {
    Alert.alert(
      "Erase Vault Records",
      "Are you sure you want to permanently erase all transactions, recurring subscriptions, and budget limits? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase All Records",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Vault Cleared", "All local ledger records have been reset.");
          },
        },
      ]
    );
  };

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: topPadding,
        paddingBottom: 50,
        paddingHorizontal: 18,
      }}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Preferences & Settings</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* General Preferences */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          GENERAL PREFERENCES
        </Text>

        {/* Currency Picker */}
        <TouchableOpacity
          style={[styles.optionRow, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={() => setShowCurrencyModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <View style={[styles.optionIconBg, { backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
              <Feather name="dollar-sign" size={16} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Display Currency</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                Controls values across all screens
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={[styles.currencyBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.currencyBadgeText, { color: theme.primary }]}>
                {currency.code} ({currency.symbol})
              </Text>
            </View>
            <Feather name="chevron-right" size={15} color={theme.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Dark Theme Switch */}
        <View style={[styles.optionRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIconBg, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
              <Feather name={darkMode ? "moon" : "sun"} size={16} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Dark Theme</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                {darkMode ? "Obsidian slate canvas" : "Light mode canvas"}
              </Text>
            </View>
          </View>

          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {/* Push Notifications Switch */}
        <View style={[styles.optionRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIconBg, { backgroundColor: "rgba(139, 92, 246, 0.12)" }]}>
              <Feather name="bell" size={16} color="#8B5CF6" />
            </View>
            <View>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Alert Notifications</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                Renewals & budget overspending
              </Text>
            </View>
          </View>

          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      {/* Security & Biometrics */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          BIOMETRIC PROTECTION & SECURITY
        </Text>

        <View style={[styles.optionRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIconBg, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
              <Ionicons name="finger-print-outline" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Biometric App Lock</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                Verification required on launch
              </Text>
            </View>
          </View>

          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: theme.border, true: "#10B981" }}
          />
        </View>

        <TouchableOpacity
          style={[styles.testLockBtn, { backgroundColor: theme.subCard, borderColor: theme.border }]}
          onPress={() => router.push("/lock")}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color={theme.primary} />
          <Text style={[styles.testLockText, { color: theme.primary }]}>
            Test Biometric Lock Screen
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vault Data & Ledger Reset */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <Text style={[styles.sectionHeading, { color: "#F43F5E" }]}>
          VAULT DATA & LEDGER RESET
        </Text>
        <Text style={[styles.resetDesc, { color: theme.textSecondary }]}>
          Wipe all stored transactions, recurring subscriptions, and custom budget limits from
          storage.
        </Text>

        <TouchableOpacity
          style={styles.eraseBtn}
          onPress={handleClearVault}
          activeOpacity={0.8}
        >
          <Feather name="trash-2" size={15} color="#F43F5E" />
          <Text style={styles.eraseText}>Erase All Vault Records</Text>
        </TouchableOpacity>
      </View>

      {/* Permanent Account Deletion */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <Text style={[styles.sectionHeading, { color: "#F43F5E" }]}>
          PERMANENT ACCOUNT ACTIONS
        </Text>
        <Text style={{ color: theme.text, fontSize: 15, fontWeight: "800" }}>
          {user?.fullName || "Account User"}
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2, marginBottom: 12 }}>
          {user?.email || "user@spendsense.app"}
        </Text>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Feather name="trash-2" size={15} color="#EF4444" />
          <Text style={styles.deleteBtnText}>Permanently Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalTop}>
              <View>
                <Text style={[styles.modalHeading, { color: theme.text }]}>Select Base Currency</Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  Updated across all calculations
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Feather name="x" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {SUPPORTED_CURRENCIES.map((c) => {
                const isSelected = currency.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currRow,
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
                    <View style={styles.currLeft}>
                      <Text style={[styles.currSymbol, { color: theme.text }]}>{c.symbol}</Text>
                      <View>
                        <Text style={[styles.currName, { color: theme.text }]}>{c.name}</Text>
                        <Text style={[styles.currCode, { color: theme.textSecondary }]}>
                          {c.code === "GHS"
                            ? "GHS • Base Currency (1.0)"
                            : `${c.code} • 1 GHS ≈ ${(exchangeRates?.[c.code] ?? 1).toFixed(3)}`}
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Feather name="check" size={16} color={theme.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { fontSize: 13, fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "900" },

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  sectionHeading: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  optionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTitle: { fontSize: 13, fontWeight: "800" },
  optionSub: { fontSize: 10, marginTop: 1 },
  currencyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  currencyBadgeText: { fontSize: 11, fontWeight: "800" },

  testLockBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  testLockText: { fontSize: 12, fontWeight: "800" },

  resetDesc: { fontSize: 11, lineHeight: 16, marginBottom: 12 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    paddingVertical: 14,
    borderRadius: 14,
  },
  deleteBtnText: { color: "#EF4444", fontWeight: "800", fontSize: 13 },
  eraseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.4)",
    backgroundColor: "rgba(244, 63, 94, 0.08)",
  },
  eraseText: { color: "#F43F5E", fontSize: 12, fontWeight: "800" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: { borderRadius: 24, borderWidth: 1, padding: 20 },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalHeading: { fontSize: 16, fontWeight: "900" },
  modalSub: { fontSize: 11, marginTop: 2 },
  currRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
  },
  currLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  currSymbol: { fontSize: 18, fontWeight: "900", width: 35, textAlign: "center" },
  currName: { fontSize: 13, fontWeight: "700" },
  currCode: { fontSize: 10, marginTop: 1 },
});