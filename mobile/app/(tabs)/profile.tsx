import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { useFinance } from "../../src/hooks/useFinance";
import { useSettings } from "../../src/hooks/useSettings";

export default function ProfileScreen() {
  const { user, logout, sendVerificationOtp, verifyEmailOtp } = useAuth();
  const { theme } = useTheme();
  const { income, expenses, savingsRate, transactions, subscriptions } = useFinance();
  const { formatMoney, currency } = useSettings();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  // Email verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState("");

  const subMonthlyTotal = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  const menuItems = [
    {
      label: "Preferences & Currency",
      icon: "settings" as const,
      route: "/(tabs)/settings",
      badge: `${currency.code} (${currency.symbol})`,
    },
    {
      label: "Budget Tracker",
      icon: "pie-chart" as const,
      route: "/(tabs)/budget",
      isRestricted: !user?.isEmailVerified,
    },
    {
      label: "Subscriptions Manager",
      icon: "repeat" as const,
      route: "/(tabs)/subscriptions",
      badge: `${formatMoney(subMonthlyTotal)}/mo`,
    },
    {
      label: "SMS & MoMo Auto-Sync",
      icon: "message-square" as const,
      route: "/(tabs)/sms-import",
      isRestricted: !user?.isEmailVerified,
    },
    {
      label: "Reports & CSV Export",
      icon: "file-text" as const,
      route: "/(tabs)/reports",
      isRestricted: !user?.isEmailVerified,
    },
  ];

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of SpendSense?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleBadgePress = () => {
    if (user?.isEmailVerified) {
      Alert.alert(
        "Email Verified",
        `Your account email (${user?.email || ""}) is fully authenticated and protected.`
      );
    } else {
      openVerifyModal();
    }
  };

  const openVerifyModal = () => {
    setOtpCode("");
    setModalError("");
    setModalMessage("");
    setOtpDispatched(false);
    setShowVerifyModal(true);
  };

  const handleSendOtp = async () => {
    setModalError("");
    setModalMessage("");
    setIsSendingOtp(true);

    const res = await sendVerificationOtp();
    setIsSendingOtp(false);

    if (res.success) {
      setOtpDispatched(true);
      const clean = user?.email?.toLowerCase().trim();
      const isDemo = clean && ["demo@spendsense.app", "demo2@spendsense.app", "test@spendsense.app"].includes(clean);
      setModalMessage(
        isDemo
          ? `A 6-digit code has been dispatched to ${user?.email}.\n(Demo accounts can use master bypass code: 123456)`
          : `A 6-digit verification code has been dispatched to ${user?.email || "your email"}.`
      );
    } else {
      setModalError(res.error || "Could not dispatch verification code.");
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setModalError("Please enter the complete 6-digit code.");
      return;
    }

    setModalError("");
    setIsVerifyingOtp(true);

    const res = await verifyEmailOtp(otpCode.trim());
    setIsVerifyingOtp(false);

    if (res.success) {
      setModalMessage("Email address verified successfully!");
      setTimeout(() => {
        setShowVerifyModal(false);
      }, 1200);
    } else {
      setModalError(res.error || "Incorrect verification code. Try again.");
    }
  };

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
        <Text style={[styles.title, { color: theme.text }]}>Account Profile</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Personal identity, security settings & preferences
        </Text>
      </View>

      {/* User Hero Banner */}
      <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {(user?.fullName || "A").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.fullName || "Account User"}
            </Text>
            <TouchableOpacity
              style={[
                styles.verifiedBadge,
                user?.isEmailVerified
                  ? { backgroundColor: "rgba(16, 185, 129, 0.12)", borderColor: "rgba(16, 185, 129, 0.3)" }
                  : { backgroundColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" },
              ]}
              onPress={handleBadgePress}
              activeOpacity={0.7}
            >
              <Feather
                name={user?.isEmailVerified ? "check-circle" : "alert-circle"}
                size={10}
                color={user?.isEmailVerified ? "#10B981" : "#F59E0B"}
              />
              <Text
                style={[
                  styles.verifiedText,
                  { color: user?.isEmailVerified ? "#10B981" : "#F59E0B" },
                ]}
              >
                {user?.isEmailVerified ? "VERIFIED" : "UNVERIFIED"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {user?.email || "alex.mensah@example.com"}
          </Text>
          <Text style={[styles.memberSince, { color: theme.textMuted }]}>
            Personal Vault Active
          </Text>
        </View>
      </View>

      {/* Unverified Email Action Banner */}
      {!user?.isEmailVerified && (
        <TouchableOpacity
          style={[styles.unverifiedBanner, { backgroundColor: theme.card, borderColor: "rgba(245, 158, 11, 0.3)" }]}
          onPress={openVerifyModal}
          activeOpacity={0.8}
        >
          <View style={[styles.bannerIconBox, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
            <Feather name="shield" size={18} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: theme.text }]}>Email Not Verified</Text>
            <Text style={[styles.bannerSubtitle, { color: theme.textSecondary }]}>
              Verify for free with a 6-digit code to activate your verified badge.
            </Text>
          </View>
          <View style={styles.verifyActionBtn}>
            <Text style={styles.verifyActionText}>Verify</Text>
            <Feather name="chevron-right" size={14} color="#F59E0B" />
          </View>
        </TouchableOpacity>
      )}

      {/* 4-Grid Stats Overview */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOTAL INFLOWS</Text>
          <Text style={[styles.statValue, { color: "#10B981" }]}>{formatMoney(income)}</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOTAL OUTFLOWS</Text>
          <Text style={[styles.statValue, { color: "#F43F5E" }]}>{formatMoney(expenses)}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TRANSACTIONS</Text>
          <Text style={[styles.statValue, { color: theme.primary }]}>{transactions.length}</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>SAVINGS RATE</Text>
          <Text style={[styles.statValue, { color: theme.accent }]}>{savingsRate.toFixed(0)}%</Text>
        </View>
      </View>

      {/* Quick Access Tools */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Access & Tools</Text>

      <View style={{ gap: 8 }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuRow, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: item.route as any, params: { returnTo: "/(tabs)/profile" } })}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBg, { backgroundColor: theme.subCard }]}>
              <Feather name={item.icon} size={16} color={theme.primary} />
            </View>

            <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>

            {item.badge && (
              <View style={[styles.badgePill, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{item.badge}</Text>
              </View>
            )}

            {item.isRestricted && (
              <View style={[styles.badgePill, { backgroundColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)", flexDirection: "row", alignItems: "center", gap: 3 }]}>
                <Feather name="lock" size={9} color="#F59E0B" />
                <Text style={[styles.badgeText, { color: "#F59E0B" }]}>VERIFY</Text>
              </View>
            )}

            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: "rgba(244, 63, 94, 0.4)" }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Feather name="log-out" size={16} color="#F43F5E" />
        <Text style={styles.logoutText}>Sign Out of Account</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: theme.textMuted }]}>
        SpendSense Client v1.1.0 • Mobile-Optimized Finance
      </Text>

      {/* Free Email Verification Modal */}
      <Modal visible={showVerifyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalTop}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={[styles.modalIconBg, { backgroundColor: "rgba(37, 99, 235, 0.12)" }]}>
                  <Feather name="mail" size={18} color="#2563EB" />
                </View>
                <View>
                  <Text style={[styles.modalHeading, { color: theme.text }]}>Email Verification</Text>
                  <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                    100% Free OTP Confirmation
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowVerifyModal(false)}>
                <Feather name="x" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalInstructions, { color: theme.textSecondary }]}>
              Confirm ownership of <Text style={{ color: theme.text, fontWeight: "700" }}>{user?.email}</Text> to activate your verified status across your financial vault.
            </Text>

            {modalMessage ? (
              <View style={styles.messageBox}>
                <Feather name="info" size={15} color="#10B981" />
                <Text style={styles.messageText}>{modalMessage}</Text>
              </View>
            ) : null}

            {modalError ? (
              <View style={styles.errorBox}>
                <Feather name="alert-triangle" size={15} color="#F43F5E" />
                <Text style={styles.errorText}>{modalError}</Text>
              </View>
            ) : null}

            {!otpDispatched ? (
              <TouchableOpacity
                style={[styles.primaryActionBtn, isSendingOtp && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={isSendingOtp}
                activeOpacity={0.85}
              >
                {isSendingOtp ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="send" size={15} color="#FFFFFF" />
                    <Text style={styles.primaryActionBtnText}>Send Free 6-Digit Code</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 12 }}>
                <View style={[styles.inputWrap, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Feather name="key" size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.otpInput, { color: theme.text }]}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={theme.textMuted}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, isVerifyingOtp && styles.btnDisabled]}
                  onPress={handleConfirmOtp}
                  disabled={isVerifyingOtp}
                  activeOpacity={0.85}
                >
                  {isVerifyingOtp ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="check" size={16} color="#FFFFFF" />
                      <Text style={styles.primaryActionBtnText}>Verify & Activate</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleSendOtp}
                  disabled={isSendingOtp}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                    Didn't receive code? <Text style={{ color: theme.primary, fontWeight: "700" }}>Resend Code</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  header: { marginBottom: 14 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { fontSize: 16, fontWeight: "900" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  verifiedText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.4 },
  userEmail: { fontSize: 12, marginTop: 2 },
  memberSince: { fontSize: 10, marginTop: 2 },

  unverifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  bannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  bannerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  verifyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  verifyActionText: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800",
  },

  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statBox: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1 },
  statLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: "900", marginTop: 4 },

  sectionTitle: { fontSize: 14, fontWeight: "800", marginTop: 14, marginBottom: 10 },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: "700" },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 20,
  },
  logoutText: { color: "#F43F5E", fontSize: 13, fontWeight: "800" },
  versionText: { textAlign: "center", fontSize: 11, marginTop: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: "900",
  },
  modalSub: {
    fontSize: 11,
    marginTop: 1,
  },
  modalInstructions: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    padding: 12,
    borderRadius: 12,
  },
  messageText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: "#F43F5E",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  primaryActionBtn: {
    backgroundColor: "#2563EB",
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.65,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  otpInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 4,
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  resendText: {
    fontSize: 12,
  },
});