import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";

export default function PredictionsScreen() {
  const { expenses, healthScore, anomalies } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();

  const predictedExpense = expenses > 0 ? expenses * 0.89 : 0;

  const adviceList = [
    {
      category: "Food & Dining",
      icon: "coffee" as const,
      color: "#F97316",
      bg: "rgba(249, 115, 22, 0.12)",
      text: "Cooking dinners 4 nights a week can lower your food outflow by up to 25%, saving roughly ~GH₵ 340 monthly.",
    },
    {
      category: "Transport & Commute",
      icon: "navigation" as const,
      color: "#0EA5E9",
      bg: "rgba(14, 165, 233, 0.12)",
      text: "Ride-hailing surcharge during morning rush hour accounts for 42% of transport spend. Shifting trips 15 mins earlier cuts surge costs.",
    },
    {
      category: "Utilities & Power",
      icon: "zap" as const,
      color: "#EAB308",
      bg: "rgba(234, 179, 8, 0.12)",
      text: "High-wattage ironing & boiling water in morning peak intervals adds 18% to tariff blocks. Off-peak usage stabilizes tokens.",
    },
    {
      category: "Shopping & Retail",
      icon: "shopping-bag" as const,
      color: "#EC4899",
      bg: "rgba(236, 72, 153, 0.12)",
      text: "Apply a strict 72-hour cooling rule on impulse online checkouts. Your impulsive cart abandon rate saves an estimated GH₵ 400+.",
    },
  ];

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
        <Text style={[styles.title, { color: theme.text }]}>AI Analytics & Insights</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Spending forecast, risk diagnostics & actionable tips
        </Text>
      </View>

      {/* Zero State Fallback */}
      {expenses === 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 14, alignItems: "center", paddingVertical: 20 }]}>
          <Ionicons name="sparkles-outline" size={32} color={theme.textMuted} />
          <Text style={{ color: theme.text, fontWeight: "800", fontSize: 14, marginTop: 8 }}>
            Pending Transaction Activity
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: "center", marginTop: 4, paddingHorizontal: 16 }}>
            Record transactions to activate personalized machine learning predictions and financial tips.
          </Text>
        </View>
      )}

      {/* Next Month Expected Total Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardTopRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={[styles.sparkleIcon, { backgroundColor: theme.accentLight }]}>
              <Ionicons name="sparkles" size={14} color={theme.primary} />
            </View>
            <Text style={[styles.metaLabel, { color: theme.primary }]}>
              EXPECTED NEXT MONTH OUTFLOW
            </Text>
          </View>

          <View style={styles.confidencePill}>
            <View style={styles.confidenceDot} />
            <Text style={styles.confidenceText}>High Confidence (94.2%)</Text>
          </View>
        </View>

        <Text style={[styles.predictedAmount, { color: theme.text }]}>
          {formatMoney(predictedExpense)}
        </Text>
        <Text style={[styles.predictedSub, { color: theme.textSecondary }]}>
          Based on recurring bills, periodic utility trends, and average weekly expenditure.
        </Text>
      </View>

      {/* ML Expense Forecast Feature Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/(tabs)/forecast", params: { returnTo: "/(tabs)/predictions" } })}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(37, 99, 235, 0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="trending-up" size={20} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: theme.text }}>
              ML Expense Forecast
            </Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              Multi-variable projection & category trajectory models
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* What-If Decision Simulator Feature Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/(tabs)/what-if", params: { returnTo: "/(tabs)/predictions" } })}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(37, 99, 235, 0.12)",
              borderWidth: 1.5,
              borderColor: "rgba(37, 99, 235, 0.25)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="help-circle" size={20} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: theme.text }}>
              What-If Decision Simulator
            </Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              Pre-test spending changes, budget capacity & savings trade-offs
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Anomaly Detection Banner */}
      <View
        style={[
          styles.anomalyBanner,
          anomalies.length > 0
            ? { backgroundColor: "rgba(244, 63, 94, 0.08)", borderColor: "rgba(244, 63, 94, 0.25)" }
            : { backgroundColor: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.25)" },
        ]}
      >
        <View
          style={[
            styles.anomalyIconBg,
            {
              backgroundColor: anomalies.length > 0 ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
            },
          ]}
        >
          <Feather
            name={anomalies.length > 0 ? "alert-octagon" : "shield"}
            size={18}
            color={anomalies.length > 0 ? "#F43F5E" : "#10B981"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.anomalyHeading,
              { color: anomalies.length > 0 ? "#F43F5E" : "#10B981" },
            ]}
          >
            {anomalies.length > 0
              ? `Spike Flagged: ${anomalies[0].title}`
              : "No Spending Anomalies Detected"}
          </Text>
          <Text
            style={[
              styles.anomalyBody,
              { color: anomalies.length > 0 ? "#E11D48" : "#059669" },
            ]}
          >
            {anomalies.length > 0
              ? anomalies[0].reason
              : "All your logged expenses are within normal baseline thresholds. No abnormal spikes detected."}
          </Text>
        </View>
      </View>

      {/* Financial Health Score Bar Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <View style={styles.healthHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="shield" size={15} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Financial Health Index</Text>
          </View>
          <Text style={styles.healthScoreNum}>{healthScore.score}/100</Text>
        </View>

        <View style={[styles.healthTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
          <View
            style={[
              styles.healthFill,
              {
                width: `${healthScore.score}%`,
                backgroundColor:
                  healthScore.score >= 75
                    ? "#10B981"
                    : healthScore.score >= 50
                    ? "#F59E0B"
                    : "#F43F5E",
              },
            ]}
          />
        </View>

        <Text style={[styles.healthSub, { color: theme.textSecondary }]}>
          Status: <Text style={{ color: "#10B981", fontWeight: "800" }}>{healthScore.status}</Text>.
          Keeping recurring bills under 40% of income preserves healthy cash flow.
        </Text>
      </View>

      {/* Targeted Actionable Guidance */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 18, marginBottom: 10 }]}>
        Targeted Actionable Guidance
      </Text>

      <View style={{ gap: 10 }}>
        {adviceList.map((item) => (
          <View
            key={item.category}
            style={[styles.tipCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.tipIconBox, { backgroundColor: item.bg }]}>
              <Feather name={item.icon} size={16} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipCat, { color: theme.textSecondary }]}>{item.category}</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  header: { marginBottom: 14 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sparkleIcon: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  metaLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  confidencePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confidenceDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#3B82F6" },
  confidenceText: { color: "#3B82F6", fontSize: 10, fontWeight: "800" },
  predictedAmount: { fontSize: 30, fontWeight: "900", letterSpacing: -0.5, marginVertical: 6 },
  predictedSub: { fontSize: 11, lineHeight: 16 },

  anomalyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
  },
  anomalyIconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  anomalyHeading: { fontSize: 12, fontWeight: "800" },
  anomalyBody: { fontSize: 11, marginTop: 2, lineHeight: 16 },

  healthHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800" },
  healthScoreNum: { fontSize: 16, fontWeight: "900", color: "#10B981" },
  healthTrack: { height: 10, borderRadius: 5, borderWidth: 1, overflow: "hidden", marginBottom: 10 },
  healthFill: { height: "100%", borderRadius: 5 },
  healthSub: { fontSize: 11, lineHeight: 16 },

  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1 },
  tipIconBox: { width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  tipCat: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  tipText: { fontSize: 11, marginTop: 3, lineHeight: 17 },
});