import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { getMonthlyTrend } from "../../src/ai/trendAnalysis";
import { predictExpenses } from "../../src/ai/prediction";
import { StatCard } from "../../src/components/stat-card";

export default function Analytics() {
  const { transactions, income, expenses, savingsRate } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const screenWidth = Dimensions.get("window").width;

  const [period, setPeriod] = useState<"6M" | "1Y" | "ALL">("6M");

  const trend = getMonthlyTrend(transactions);
  const prediction = predictExpenses(transactions);

  const activeMonths: number[] = [];
  trend.data.forEach((val, idx) => {
    if (val > 0) activeMonths.push(idx);
  });
  const chartLabels =
    activeMonths.length > 0
      ? activeMonths.map((i) => trend.labels[i])
      : ["No data"];
  const chartData =
    activeMonths.length > 0
      ? activeMonths.map((i) => trend.data[i])
      : [0];

  const predictedVal = parseFloat(prediction.predictedExpense);
  const monthlyIncome = income / Math.max(chartLabels.length, 1);
  const bestCase = Math.max(0, monthlyIncome - predictedVal * 0.85);
  const expected = Math.max(0, monthlyIncome - predictedVal);
  const worstCase = Math.max(0, monthlyIncome - predictedVal * 1.15);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Insights</Text>
        <TouchableOpacity
          style={[
            styles.bellBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Top Prediction Banner */}
      <View
        style={[
          styles.predictionCard,
          { backgroundColor: theme.card, borderColor: theme.accentLight },
        ]}
      >
        <View style={styles.predLeft}>
          <View
            style={[styles.sparkleBg, { backgroundColor: theme.accentLight }]}
          >
            <Ionicons name="sparkles" size={18} color={theme.accent} />
          </View>
          <View>
            <Text style={[styles.predLabel, { color: theme.textSecondary }]}>
              Next Month Prediction
            </Text>
            <Text style={[styles.predValue, { color: theme.text }]}>
              {formatMoney(predictedVal)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: "rgba(5, 150, 105, 0.15)" },
          ]}
        >
          <Text style={{ color: "#059669", fontSize: 12, fontWeight: "700" }}>
            ↘ 12%
          </Text>
        </View>
      </View>

      {/* Side-by-Side Metric Cards */}
      <View style={styles.statsRow}>
        <StatCard
          label="Income"
          value={formatMoney(income)}
          valueColor={theme.income}
          subtext="+5.2% vs last mo"
        />
        <StatCard
          label="Expenses"
          value={formatMoney(expenses)}
          valueColor={theme.expense}
          subtext="+2.1% vs last mo"
        />
      </View>

      {/* Savings Rate Progress Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Savings Rate
          </Text>
          <Ionicons name="wallet-outline" size={20} color={theme.primary} />
        </View>
        <Text style={[styles.savingsRateValue, { color: theme.text }]}>
          {savingsRate.toFixed(1)} %
        </Text>
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: theme.subCard || "#E2E8F0" },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(0, savingsRate))}%` as any,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Spending Trends Chart */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.chartHeader}>
          <View style={styles.iconTitleRow}>
            <Ionicons name="trending-up-outline" size={20} color={theme.primary} />
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Spending Trends
            </Text>
          </View>
          <View style={styles.periodRow}>
            {(["6M", "1Y", "ALL"] as ("6M" | "1Y" | "ALL")[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.periodBtn,
                  {
                    backgroundColor:
                      period === p ? theme.primary : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
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
            data={{
              labels: chartLabels,
              datasets: [{ data: chartData }],
            }}
            width={screenWidth - 72}
            height={180}
            fromZero
            chartConfig={{
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: () => theme.textSecondary,
              propsForDots: { r: "4", strokeWidth: "2", stroke: theme.primary },
            }}
            bezier
            style={{ borderRadius: 16, marginTop: 12 }}
          />
        ) : (
          <Text
            style={{
              color: theme.textSecondary,
              textAlign: "center",
              padding: 20,
            }}
          >
            Charts are available on mobile app.
          </Text>
        )}
      </View>

      {/* ML Forecast Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.iconTitleRow}>
          <Ionicons name="hardware-chip-outline" size={20} color={theme.accent} />
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            ML Forecast
          </Text>
        </View>
        <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
          Projected expenses based on semantic behavior models.
        </Text>
      </View>

      {/* Savings Scenarios */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={[styles.iconTitleRow, { marginBottom: 16 }]}>
          <Ionicons name="stats-chart-outline" size={20} color={theme.text} />
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Savings Scenarios (Q3)
          </Text>
        </View>

        <View style={styles.scenarioRow}>
          <View style={styles.scenarioLabelRow}>
            <View style={[styles.dot, { backgroundColor: "#059669" }]} />
            <Text style={[styles.scenarioName, { color: theme.text }]}>
              Best Case
            </Text>
          </View>
          <Text style={[styles.scenarioVal, { color: theme.text }]}>
            {formatMoney(bestCase)}
          </Text>
        </View>
        <View style={[styles.scenarioBarBg, { backgroundColor: theme.subCard }]}>
          <View
            style={[
              styles.scenarioBarFill,
              { width: "80%", backgroundColor: "#059669" },
            ]}
          />
        </View>

        <View style={[styles.scenarioRow, { marginTop: 14 }]}>
          <View style={styles.scenarioLabelRow}>
            <View style={[styles.dot, { backgroundColor: "#2563EB" }]} />
            <Text style={[styles.scenarioName, { color: theme.text }]}>
              Expected
            </Text>
          </View>
          <Text style={[styles.scenarioVal, { color: theme.text }]}>
            {formatMoney(expected)}
          </Text>
        </View>
        <View style={[styles.scenarioBarBg, { backgroundColor: theme.subCard }]}>
          <View
            style={[
              styles.scenarioBarFill,
              { width: "55%", backgroundColor: "#2563EB" },
            ]}
          />
        </View>

        <View style={[styles.scenarioRow, { marginTop: 14 }]}>
          <View style={styles.scenarioLabelRow}>
            <View style={[styles.dot, { backgroundColor: "#D97706" }]} />
            <Text style={[styles.scenarioName, { color: theme.text }]}>
              Worst Case
            </Text>
          </View>
          <Text style={[styles.scenarioVal, { color: theme.text }]}>
            {formatMoney(worstCase)}
          </Text>
        </View>
        <View style={[styles.scenarioBarBg, { backgroundColor: theme.subCard }]}>
          <View
            style={[
              styles.scenarioBarFill,
              { width: "30%", backgroundColor: "#D97706" },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800" },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  predictionCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  predLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  sparkleBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  predLabel: { fontSize: 12, fontWeight: "600" },
  predValue: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },

  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: { fontSize: 13, fontWeight: "600" },
  cardSub: { fontSize: 13, marginTop: 4 },

  savingsRateValue: { fontSize: 28, fontWeight: "800", marginVertical: 8 },
  progressBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chartTitle: { fontSize: 17, fontWeight: "700" },
  periodRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 10,
    padding: 2,
  },
  periodBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  periodText: { fontSize: 11, fontWeight: "700" },

  scenarioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scenarioLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scenarioName: { fontSize: 14, fontWeight: "600" },
  scenarioVal: { fontSize: 14, fontWeight: "800" },
  scenarioBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  scenarioBarFill: { height: "100%", borderRadius: 3 },
});