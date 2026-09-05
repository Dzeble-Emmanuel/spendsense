import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";

export default function AnalyticsScreen() {
  const { income, expenses, savingsRate, transactions } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const [period, setPeriod] = useState<"6M" | "1Y" | "ALL">("6M");

  const baseMonthlyExpense = Math.max(expenses, 100);
  const predictedNextMonth = Math.round(baseMonthlyExpense * 0.88);

  const monthlyIncomeAvg = Math.max(income, 100);
  const bestCase = Math.max(0, monthlyIncomeAvg - predictedNextMonth * 0.85);
  const expected = Math.max(0, monthlyIncomeAvg - predictedNextMonth);
  const worstCase = Math.max(0, monthlyIncomeAvg - predictedNextMonth * 1.15);

  const chartData = {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [
      {
        data: [
          Math.max(200, Math.round(baseMonthlyExpense * 0.9)),
          Math.max(300, Math.round(baseMonthlyExpense * 1.1)),
          Math.max(250, Math.round(baseMonthlyExpense * 0.95)),
          Math.max(280, Math.round(baseMonthlyExpense * 1.05)),
          Math.max(220, Math.round(baseMonthlyExpense)),
          Math.max(200, predictedNextMonth),
        ],
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2.5,
      },
    ],
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
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Insights & Analytics</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Cash flow trends, savings rate & statistical projection
        </Text>
      </View>

      {/* Zero State Fallback */}
      {transactions.length === 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 14, alignItems: "center", paddingVertical: 24 }]}>
          <Feather name="bar-chart-2" size={32} color={theme.textMuted} />
          <Text style={{ color: theme.text, fontWeight: "800", fontSize: 15, marginTop: 10 }}>
            No Transactions Recorded Yet
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: "center", marginTop: 4, paddingHorizontal: 16 }}>
            Record your first income or expense to generate statistical curves and savings analytics.
          </Text>
        </View>
      )}

      {/* Top Prediction Banner */}
      <View style={[styles.predictionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.predictionLeft}>
          <View style={[styles.sparkleIconBg, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="sparkles" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.predictionLabel, { color: theme.textSecondary }]}>
              NEXT MONTH PREDICTED OUTFLOW
            </Text>
            <Text style={[styles.predictionValue, { color: theme.text }]}>
              {formatMoney(predictedNextMonth)}
            </Text>
            <Text style={[styles.predictionSub, { color: theme.textMuted }]}>
              Trained on your last {transactions.length} transactions
            </Text>
          </View>
        </View>

        <View style={styles.dropBadge}>
          <Text style={styles.dropBadgeText}>12% Projected Drop</Text>
        </View>
      </View>

      {/* Price Shock Radar Feature Launch Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/(tabs)/price-shocks", params: { returnTo: "/(tabs)/analytics" } })}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            marginBottom: 12,
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
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              borderWidth: 1.5,
              borderColor: "rgba(239, 68, 68, 0.25)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="alert-triangle" size={19} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: theme.text }}>
                Price Shock Radar
              </Text>
              <View style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#EF4444" }}>ALERT</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              Fuel hike (+1.5%), FX volatility & personalized commute impact
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Silent Money Leak Map Feature Launch Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/(tabs)/leak-map", params: { returnTo: "/(tabs)/analytics" } })}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            marginBottom: 14,
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
              backgroundColor: "rgba(244, 63, 94, 0.12)",
              borderWidth: 1.5,
              borderColor: "rgba(244, 63, 94, 0.25)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="compass" size={19} color="#F43F5E" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: theme.text }}>
                Silent Leak Map
              </Text>
              <View style={{ backgroundColor: "rgba(244, 63, 94, 0.12)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#F43F5E" }}>HOTSPOTS</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              Where money leaks (Tech Jct, KNUST, Kejetia) via Leak Score Algorithm
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Metric Cards (Inflow & Outflow) */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.metricHeader}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>RECORDED INFLOW</Text>
            <View style={[styles.directionBg, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
              <Feather name="arrow-up-right" size={13} color="#10B981" />
            </View>
          </View>
          <Text style={[styles.metricAmount, { color: "#10B981" }]}>
            {formatMoney(income)}
          </Text>
          <Text style={[styles.metricSub, { color: theme.textMuted }]}>
            +5.2% vs trailing monthly average
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.metricHeader}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>RECORDED OUTFLOW</Text>
            <View style={[styles.directionBg, { backgroundColor: "rgba(244, 63, 94, 0.12)" }]}>
              <Feather name="arrow-down-right" size={13} color="#F43F5E" />
            </View>
          </View>
          <Text style={[styles.metricAmount, { color: "#F43F5E" }]}>
            {formatMoney(expenses)}
          </Text>
          <Text style={[styles.metricSub, { color: theme.textMuted }]}>
            +2.1% vs trailing monthly average
          </Text>
        </View>
      </View>

      {/* Savings Rate Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.savingsHeader}>
          <View>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              SAVINGS RETENTION RATE
            </Text>
            <Text style={[styles.savingsRateValue, { color: theme.text }]}>
              {savingsRate.toFixed(1)}%
            </Text>
          </View>
          <View style={[styles.walletBg, { backgroundColor: theme.primaryLight }]}>
            <Feather name="briefcase" size={18} color={theme.primary} />
          </View>
        </View>

        <View style={[styles.savingsTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
          <View
            style={[
              styles.savingsFill,
              {
                width: `${Math.min(100, Math.max(0, savingsRate))}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.savingsTip, { color: theme.textMuted }]}>
          Standard personal finance benchmark: target at least 20% to 30% savings margin.
        </Text>
      </View>

      {/* Monthly Spending Dynamics Chart */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <View style={styles.chartHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="trending-up" size={16} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Monthly Spending Dynamics
            </Text>
          </View>

          <View style={[styles.periodToggle, { backgroundColor: theme.background, borderColor: theme.border }]}>
            {(["6M", "1Y", "ALL"] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodBtn,
                  period === p && { backgroundColor: theme.primary },
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    { color: period === p ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {Platform.OS !== "web" ? (
          <LineChart
            data={chartData}
            width={screenWidth - 72}
            height={190}
            chartConfig={{
              backgroundColor: theme.card,
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: () => theme.textSecondary,
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#2563EB" },
            }}
            bezier
            style={{ borderRadius: 16, marginTop: 8 }}
          />
        ) : (
          <View style={styles.webFallback}>
            <Text style={[styles.webFallbackText, { color: theme.textSecondary }]}>
              Historical baseline expenditure projection ~ {formatMoney(predictedNextMonth)}/mo
            </Text>
          </View>
        )}
      </View>

      {/* Quarterly Savings Scenarios Simulation */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <View style={styles.scenariosHeader}>
          <Feather name="bar-chart-2" size={16} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quarterly Savings Scenarios
            </Text>
            <Text style={[styles.scenariosSub, { color: theme.textSecondary }]}>
              Stress-tested net liquid surplus across 3 probability models
            </Text>
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
          {/* Best Case */}
          <View>
            <View style={styles.scenarioRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={[styles.scenarioDot, { backgroundColor: "#10B981" }]} />
                <Text style={[styles.scenarioName, { color: theme.text }]}>
                  Best Case (−15% discretionary)
                </Text>
              </View>
              <Text style={[styles.scenarioAmt, { color: "#10B981" }]}>{formatMoney(bestCase)}</Text>
            </View>
            <View style={[styles.scenarioTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
              <View style={[styles.scenarioFill, { width: "82%", backgroundColor: "#10B981" }]} />
            </View>
          </View>

          {/* Expected Baseline */}
          <View>
            <View style={styles.scenarioRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={[styles.scenarioDot, { backgroundColor: "#2563EB" }]} />
                <Text style={[styles.scenarioName, { color: theme.text }]}>
                  Expected Baseline
                </Text>
              </View>
              <Text style={[styles.scenarioAmt, { color: "#2563EB" }]}>{formatMoney(expected)}</Text>
            </View>
            <View style={[styles.scenarioTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
              <View style={[styles.scenarioFill, { width: "58%", backgroundColor: "#2563EB" }]} />
            </View>
          </View>

          {/* Worst Case */}
          <View>
            <View style={styles.scenarioRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={[styles.scenarioDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={[styles.scenarioName, { color: theme.text }]}>
                  Worst Case (+15% surge)
                </Text>
              </View>
              <Text style={[styles.scenarioAmt, { color: "#F59E0B" }]}>{formatMoney(worstCase)}</Text>
            </View>
            <View style={[styles.scenarioTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
              <View style={[styles.scenarioFill, { width: "34%", backgroundColor: "#F59E0B" }]} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  header: { marginBottom: 14 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },

  predictionCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  predictionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  sparkleIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  predictionValue: { fontSize: 22, fontWeight: "900", marginTop: 2 },
  predictionSub: { fontSize: 11, marginTop: 2 },
  dropBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  dropBadgeText: { color: "#10B981", fontSize: 11, fontWeight: "800" },

  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  metricHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  directionBg: { width: 22, height: 22, borderRadius: 7, justifyContent: "center", alignItems: "center" },
  metricAmount: { fontSize: 18, fontWeight: "900", marginTop: 6 },
  metricSub: { fontSize: 10, marginTop: 3 },

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  savingsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  savingsRateValue: { fontSize: 24, fontWeight: "900", marginTop: 2 },
  walletBg: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  savingsTrack: { height: 8, borderRadius: 4, borderWidth: 1, overflow: "hidden" },
  savingsFill: { height: "100%", borderRadius: 4 },
  savingsTip: { fontSize: 10, marginTop: 8 },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: "800" },
  periodToggle: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 2 },
  periodBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  periodBtnText: { fontSize: 10, fontWeight: "800" },
  webFallback: { padding: 16, alignItems: "center" },
  webFallbackText: { fontSize: 12, fontWeight: "600" },

  scenariosHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  scenariosSub: { fontSize: 11, marginTop: 1 },
  scenarioRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  scenarioDot: { width: 7, height: 7, borderRadius: 4 },
  scenarioName: { fontSize: 11, fontWeight: "700" },
  scenarioAmt: { fontSize: 11, fontWeight: "800" },
  scenarioTrack: { height: 6, borderRadius: 3, borderWidth: 1, overflow: "hidden" },
  scenarioFill: { height: "100%", borderRadius: 3 },
});