import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { predictExpenses } from "../../src/ai/prediction";
import { calculateHealthScore } from "../../src/ai/healthScore";
import { detectAnomalies } from "../../src/ai/anomalyDetection";
import { getPracticalTips } from "../../src/ai/insights";

export default function Predictions() {
  const { transactions } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();

  const prediction = predictExpenses(transactions);
  const healthScore = calculateHealthScore(transactions);
  const anomalies = detectAnomalies(transactions);
  const practicalTips = getPracticalTips(transactions);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>
          AI Analytics & Tips
        </Text>
        <TouchableOpacity
          style={[
            styles.bellBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Next Month Expected Total Card */}
      <View
        style={[
          styles.predictionCard,
          { backgroundColor: theme.card, borderColor: theme.accentLight },
        ]}
      >
        <View style={styles.predHeader}>
          <Text style={[styles.predLabel, { color: theme.text }]}>
            Next Month Expected Total
          </Text>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Ionicons name="sparkles" size={14} color={theme.accent} />
            <Text style={[styles.confidenceText, { color: theme.accent }]}>
              {prediction.confidence} Confidence
            </Text>
          </View>
        </View>

        <Text style={[styles.bigAmount, { color: theme.text }]}>
          {formatMoney(parseFloat(prediction.predictedExpense))}
        </Text>
      </View>

      {/* Anomaly Detection Banner */}
      {anomalies.length > 0 ? (
        <View
          style={[
            styles.anomalyCard,
            {
              backgroundColor: theme.card,
              borderColor: "rgba(220, 38, 38, 0.4)",
            },
          ]}
        >
          <View style={styles.anomalyHeader}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={[styles.anomalyTitle, { color: theme.text }]}>
              {anomalies[0].reason}
            </Text>
          </View>
          <Text style={[styles.anomalyText, { color: theme.textSecondary }]}>
            Your spending on this item is higher than average this month.
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.anomalyCard,
            {
              backgroundColor: theme.card,
              borderColor: "rgba(220, 38, 38, 0.4)",
            },
          ]}
        >
          <View style={styles.anomalyHeader}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={[styles.anomalyTitle, { color: theme.text }]}>
              Unusual Dining Pattern
            </Text>
          </View>
          <Text style={[styles.anomalyText, { color: theme.textSecondary }]}>
            Your spending on food out is 40% higher than average this month.
          </Text>
        </View>
      )}

      {/* Financial Health Score Bar Card */}
      <View
        style={[
          styles.healthCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.healthHeader}>
          <Text style={[styles.healthLabel, { color: theme.text }]}>
            Financial Health Score
          </Text>
          <Text style={[styles.healthScoreText, { color: theme.text }]}>
            {healthScore.score}/100
          </Text>
        </View>

        <View style={[styles.healthBarBg, { backgroundColor: theme.subCard }]}>
          <View
            style={[
              styles.healthBarFill,
              {
                width: `${healthScore.score}%` as any,
                backgroundColor: theme.accent,
              },
            ]}
          />
        </View>

        <Text style={[styles.healthTip, { color: theme.textSecondary }]}>
          You're doing great! Reducing transport costs could boost your savings by 5%.
        </Text>
      </View>

      {/* Actionable Advice Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Actionable Advice
      </Text>

      {practicalTips.map((tip) => (
        <View
          key={tip.category}
          style={[
            styles.adviceTile,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.adviceIconBg,
              { backgroundColor: theme.subCard },
            ]}
          >
            <Ionicons
              name={
                tip.category.toLowerCase().includes("trans")
                  ? "car-outline"
                  : tip.category.toLowerCase().includes("food")
                  ? "fast-food-outline"
                  : tip.category.toLowerCase().includes("bill")
                  ? "flash-outline"
                  : "cart-outline"
              }
              size={20}
              color={theme.primary}
            />
          </View>
          <View style={styles.adviceContent}>
            <Text style={[styles.adviceCategory, { color: theme.text }]}>
              {tip.category}
            </Text>
            <Text
              style={[styles.adviceDescription, { color: theme.textSecondary }]}
            >
              {tip.actionableStep}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  content: { paddingBottom: 40 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "800" },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Expected Total Card
  predictionCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  predHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  predLabel: { fontSize: 15, fontWeight: "700" },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  confidenceText: { fontSize: 11, fontWeight: "700" },
  bigAmount: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },

  // Anomaly Banner
  anomalyCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  anomalyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  anomalyTitle: { fontSize: 15, fontWeight: "700" },
  anomalyText: { fontSize: 13, lineHeight: 19 },

  // Health Card
  healthCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  healthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  healthLabel: { fontSize: 16, fontWeight: "700" },
  healthScoreText: { fontSize: 16, fontWeight: "800" },
  healthBarBg: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  healthBarFill: { height: "100%", borderRadius: 4 },
  healthTip: { fontSize: 13, lineHeight: 19 },

  // Advice
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 14 },
  adviceTile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  adviceIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  adviceContent: { flex: 1 },
  adviceCategory: { fontSize: 15, fontWeight: "700" },
  adviceDescription: { fontSize: 12, lineHeight: 18, marginTop: 2 },
});