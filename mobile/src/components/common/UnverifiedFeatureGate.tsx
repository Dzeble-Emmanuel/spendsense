import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { isDemoEmail } from "../../services/verificationService";

interface UnverifiedFeatureGateProps {
  featureName: string;
  featureDescription?: string;
  iconName?: keyof typeof Feather.glyphMap;
  onVerified?: () => void;
  onBack?: () => void;
}

export default function UnverifiedFeatureGate({
  featureName,
  featureDescription,
  iconName = "lock",
  onVerified,
  onBack,
}: UnverifiedFeatureGateProps) {
  const { user, sendVerificationOtp, verifyEmailOtp } = useAuth();
  const { theme } = useTheme();

  const [isVerifying, setIsVerifying] = useState(true);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cleanEmail = user?.email || "";
  const isDemo = isDemoEmail(cleanEmail);

  React.useEffect(() => {
    handleSendCode();
  }, []);

  const handleSendCode = async () => {
    setLoading(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    try {
      const res = await sendVerificationOtp();
      if (res.success) {
        setIsVerifying(true);
        setFeedbackMessage(
          isDemo
            ? "Verification code dispatched. (Demo master bypass code: 123456)"
            : "Verification code sent to your registered inbox."
        );
      } else {
        setErrorMessage(res.error || "Unable to send verification code.");
      }
    } catch {
      setErrorMessage("Network timeout while dispatching verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setErrorMessage("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    try {
      const res = await verifyEmailOtp(code.trim());
      if (res.success) {
        setFeedbackMessage("Email verified successfully.");
        if (onVerified) {
          onVerified();
        }
      } else {
        setErrorMessage(res.error || "Invalid verification code.");
      }
    } catch {
      setErrorMessage("Verification service encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Back Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={16} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Return</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerWrap}>
        {/* Main Minimalist Uiverse-Style Card */}
        <View style={[styles.gateCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Minimalist Icon Badge with Glow */}
          <View style={[styles.iconOuterGlow, { backgroundColor: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.2)" }]}>
            <View style={[styles.iconBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.4)" }]}>
              <Feather name={iconName} size={24} color="#F59E0B" />
            </View>
          </View>

          {/* Micro Tag Label */}
          <View style={[styles.microTag, { backgroundColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" }]}>
            <View style={styles.microDot} />
            <Text style={styles.microTagText}>VERIFICATION REQUIRED</Text>
          </View>

          {/* Header */}
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {featureName} Locked
          </Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            {featureDescription ||
              `Confirm your email address (${cleanEmail}) to unlock this capability and secure your financial ledger.`}
          </Text>

          {/* Minimalist Benefit Indicators */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                <Feather name="shield" size={12} color="#10B981" />
              </View>
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                Tamper-resistant ledger synchronization
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                <Feather name="cpu" size={12} color={theme.primary} />
              </View>
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                Full access to machine learning forecasting models
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                <Feather name="file-text" size={12} color="#F59E0B" />
              </View>
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                Automated statement ingestion & export capabilities
              </Text>
            </View>
          </View>

          {/* Error / Info Feedback */}
          {errorMessage ? (
            <View style={styles.alertError}>
              <Feather name="alert-circle" size={14} color="#F43F5E" />
              <Text style={styles.alertErrorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {feedbackMessage ? (
            <View style={styles.alertSuccess}>
              <Feather name="check-circle" size={14} color="#10B981" />
              <Text style={styles.alertSuccessText}>{feedbackMessage}</Text>
            </View>
          ) : null}

          {/* Interactive In-Place Verification Box - Always unconditionally present */}
          <View style={styles.codeForm}>
            <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>ENTER 6-DIGIT VERIFICATION CODE</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Feather name="key" size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.inputField, { color: theme.text }]}
                placeholder="123456"
                placeholderTextColor={theme.textMuted}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                onSubmitEditing={handleVerifyCode}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryActionBtn, loading && styles.btnDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>Activate</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendCode}
              disabled={loading}
              style={styles.resendBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, { color: theme.primary }]}>Resend Code</Text>
            </TouchableOpacity>
          </View>

          {/* Minimalist Demo Account Helper Note */}
          {isDemo && (
            <View style={[styles.demoNote, { borderColor: theme.border, backgroundColor: theme.subCard }]}>
              <Ionicons name="information-circle-outline" size={14} color="#F59E0B" />
              <Text style={[styles.demoNoteText, { color: theme.textMuted }]}>
                Demo Account: Use bypass code <Text style={{ color: "#F59E0B", fontWeight: "700" }}>123456</Text> to unlock instantly.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topBar: {
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  backText: {
    fontSize: 12,
    fontWeight: "700",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },
  gateCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  iconOuterGlow: {
    width: 68,
    height: 68,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  microTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 12,
  },
  microDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
  },
  microTagText: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  benefitsList: {
    width: "100%",
    gap: 8,
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  alertError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
    padding: 10,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
  },
  alertErrorText: {
    color: "#F43F5E",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  alertSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    padding: 10,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
  },
  alertSuccessText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
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
    width: "100%",
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.65,
  },
  codeForm: {
    width: "100%",
    gap: 10,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 4,
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 12,
    fontWeight: "700",
  },
  demoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    width: "100%",
    marginTop: 14,
  },
  demoNoteText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
