import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/hooks/useTheme";
import { isDemoEmail } from "../../src/services/verificationService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { forgotPassword, resetPassword } = useAuth();

  // Step 1: "request" (email), Step 2: "reset" (otp & new password), Step 3: "done" (success confirmation)
  const [step, setStep] = useState<"request" | "reset" | "done">("request");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Resend cooldown timer
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOtp = async () => {
    setError("");
    setSuccessInfo("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const res = await forgotPassword(cleanEmail);
    setIsLoading(false);

    if (res.success) {
      setStep("reset");
      setCountdown(60);
      const isDemo = isDemoEmail(cleanEmail);
      setSuccessInfo(
        isDemo
          ? "Code dispatched! (Demo accounts can use master bypass code: 123456)"
          : "A 6-digit recovery code has been dispatched to your email address."
      );
    } else {
      setError(res.error || "Unable to send reset code. Please check your email.");
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setSuccessInfo("");
    setIsLoading(true);
    const cleanEmail = email.trim();
    const res = await forgotPassword(cleanEmail);
    setIsLoading(false);

    if (res.success) {
      setCountdown(60);
      const isDemo = isDemoEmail(cleanEmail);
      setSuccessInfo(
        isDemo
          ? "New code dispatched! (Demo accounts can use master bypass code: 123456)"
          : "A fresh verification code has been dispatched to your email address."
      );
    } else {
      setError(res.error || "Failed to resend code. Please try again shortly.");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccessInfo("");

    if (!otpCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email.trim(), otpCode.trim(), newPassword);
    setIsLoading(false);

    if (res.success) {
      setStep("done");
    } else {
      setError(res.error || "Invalid or expired reset code. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar Navigation */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={20} color={theme.textMuted} />
            <Text style={[styles.backText, { color: theme.textSecondary }]}>Back to Sign In</Text>
          </TouchableOpacity>

          {/* Step: DONE (Success Screen) */}
          {step === "done" ? (
            <View style={styles.successContainer}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={56} color="#10B981" />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Password Reset</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: "center" }]}>
                Your SpendSense vault password has been updated securely. You can now sign in with your new credentials.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Sign In Now</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoBadge}>
                  <Ionicons name="key-outline" size={26} color="#2563EB" />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>
                  {step === "request" ? "Forgot password?" : "Set new password"}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {step === "request"
                    ? "Enter your registered email address and we'll send you a 6-digit recovery code."
                    : `Enter the code sent to ${email} and your new password.`}
                </Text>
              </View>

              {/* Error Notice */}
              {error ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={16} color="#F43F5E" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Info Notice */}
              {successInfo ? (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
                  <Text style={styles.infoText}>{successInfo}</Text>
                </View>
              ) : null}

              {/* Form: Step 1 (Request Code) */}
              {step === "request" ? (
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
                    <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Feather name="mail" size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="you@example.com"
                        placeholderTextColor={theme.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoFocus
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                    onPress={handleRequestOtp}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Send Recovery Code</Text>
                        <Feather name="arrow-right" size={16} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Testing Helper Tip */}
                  <View style={[styles.tipBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
                    <Text style={[styles.tipText, { color: theme.textMuted }]}>
                      Testing or grading? Demo accounts support instant bypass verification with master code{" "}
                      <Text style={{ color: "#10B981", fontWeight: "700" }}>123456</Text>.
                    </Text>
                  </View>
                </View>
              ) : (
                /* Form: Step 2 (Enter OTP & New Password) */
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>6-DIGIT RECOVERY CODE</Text>
                    <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Feather name="hash" size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text, letterSpacing: 4, fontWeight: "700" }]}
                        placeholder="123456"
                        placeholderTextColor={theme.textMuted}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>NEW PASSWORD</Text>
                    <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Feather name="lock" size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Min 6 characters"
                        placeholderTextColor={theme.textMuted}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Feather
                          name={showPassword ? "eye" : "eye-off"}
                          size={18}
                          color={theme.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CONFIRM NEW PASSWORD</Text>
                    <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Feather name="shield" size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Re-enter new password"
                        placeholderTextColor={theme.textMuted}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Feather
                          name={showConfirmPassword ? "eye" : "eye-off"}
                          size={18}
                          color={theme.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Update Password</Text>
                        <Feather name="check" size={16} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Resend Code Action */}
                  <View style={styles.resendRow}>
                    <Text style={[styles.resendPrompt, { color: theme.textMuted }]}>Didn't receive code?</Text>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.resendAction, countdown > 0 && styles.resendDisabled]}>
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Footer Back Link */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            style={styles.footerLink}
            activeOpacity={0.7}
          >
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Remembered your password?{" "}
              <Text style={styles.footerAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090D16",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 4,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  header: {
    marginBottom: 26,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
    padding: 12,
    borderRadius: 14,
    marginBottom: 18,
  },
  errorText: {
    color: "#F43F5E",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.3)",
    padding: 12,
    borderRadius: 14,
    marginBottom: 18,
  },
  infoText: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  resendPrompt: {
    fontSize: 13,
  },
  resendAction: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "700",
  },
  resendDisabled: {
    opacity: 0.5,
  },
  successContainer: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
    gap: 16,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  footerLink: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  footerAccent: {
    color: "#3B82F6",
    fontWeight: "800",
  },
});
