import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/hooks/useTheme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Precision Spending Analytics",
    desc: "Track income, expenses, and cashflow in real-time with automatic categorisation and dynamic balances.",
    icon: "activity" as const,
  },
  {
    title: "Dynamic Custom Budgeting",
    desc: "Create, delete, and customize personalized category limits with custom vector icons and overspending alerts.",
    icon: "pie-chart" as const,
  },
  {
    title: "AI Receipt OCR Scanner",
    desc: "Snap a photo of any receipt to instantly extract itemized expenses, merchant details, and tax amounts into your ledger.",
    icon: "camera" as const,
  },
  {
    title: "MoMo SMS Auto-Sync",
    desc: "Extract financial records directly from Mobile Money (MTN, Telecel, AT) and bank alert texts without manual entry.",
    icon: "message-square" as const,
  },
  {
    title: "What-If Decision Simulator",
    desc: "Pre-test financial choices, simulate spending changes, and project the impact on your Financial Health Score.",
    icon: "help-circle" as const,
  },
  {
    title: "Subscriptions & Reports Export",
    desc: "Audit recurring memberships with renewal radars and export comprehensive CSV financial statements anytime.",
    icon: "file-text" as const,
  },
];

export default function WelcomeTourScreen() {
  const [slide, setSlide] = useState(0);
  const router = useRouter();
  const { completeTour } = useAuth();
  const { theme } = useTheme();

  const handleGetStarted = async () => {
    await completeTour();
    router.replace("/(auth)/register");
  };

  const handleSignIn = async () => {
    await completeTour();
    router.replace("/(auth)/login");
  };

  const handleNext = () => {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1);
    } else {
      handleGetStarted();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>SPENDSENSE</Text>
        <TouchableOpacity onPress={handleSignIn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.skipText, { color: theme.textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <View style={styles.slideContainer}>
        <View style={[styles.iconCircle, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Feather name={SLIDES[slide].icon} size={40} color="#2563EB" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{SLIDES[slide].title}</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>{SLIDES[slide].desc}</Text>

        {/* Step Indicator Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: theme.border },
                i === slide && { backgroundColor: "#2563EB", width: 24 },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>
            {slide === SLIDES.length - 1 ? "Get Started" : "Next Step"}
          </Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn} activeOpacity={0.7}>
          <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
            Already have an account? <Text style={{ color: "#2563EB", fontWeight: "bold" }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090D16",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  brand: {
    color: "#3B82F6",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 13,
  },
  skipText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  slideContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  desc: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#334155",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#3B82F6",
  },
  footer: {
    padding: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#94A3B8",
    fontSize: 13,
  },
});
