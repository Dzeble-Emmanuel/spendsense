import {
  View, Text, StyleSheet, ScrollView, Dimensions, Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { predictExpenses } from "../../src/ai/prediction";
import { analyzeCategories } from "../../src/ai/categoryAnalysis";
import { detectAnomalies } from "../../src/ai/anomalyDetection";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getForecastMonths(count = 6): string[] {
  const today = new Date();
  const months: string[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push(MONTH_NAMES[d.getMonth()]);
  }
  return months;
}

function getHistoricalMonthlyExpenses(transactions: any[]): { labels: string[]; values: number[] } {
  const monthly: Record<string, number> = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthly[key] = (monthly[key] || 0) + t.amount;
  });
  const sorted = Object.keys(monthly).sort();
  const last3 = sorted.slice(-3);
  return {
    labels: last3.map(k => MONTH_NAMES[parseInt(k.split("-")[1])]),
    values: last3.map(k => monthly[k]),
  };
}

export default function Forecast() {
  const { transactions, income } = useFinance();
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  const prediction = predictExpenses(transactions);
  const categories = analyzeCategories(transactions);
  const anomalies = detectAnomalies(transactions);

  const historical = getHistoricalMonthlyExpenses(transactions);
  const forecastMonths = getForecastMonths(4);
  const predictedVal = parseFloat(prediction.predictedExpense);
  const trendPct = parseFloat(prediction.trendPercentage);

  // Build combined chart: historical (solid) + forecast (projected)
  const allLabels = [...historical.labels, ...forecastMonths];
  // For projected months, apply trend to each successive month
  const forecastValues = forecastMonths.map((_, i) =>
    Math.max(0, predictedVal * Math.pow(1 + trendPct / 100, i))
  );
  const allValues = [...historical.values, ...forecastValues];

  // Savings scenarios
  const monthlyIncome = income / Math.max(
    Object.keys((() => {
      const m: Record<string,boolean> = {};
      transactions.forEach(t => { const d = new Date(t.date); m[`${d.getFullYear()}-${d.getMonth()}`] = true; });
      return m;
    })()).length,
    1
  );
  const bestCase   = monthlyIncome - predictedVal * 0.85;
  const expected   = monthlyIncome - predictedVal;
  const worstCase  = monthlyIncome - predictedVal * 1.15;

  const hasData = transactions.length >= 3;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={[styles.title, { color: theme.text }]}>📈 Expense Forecast</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        ML-powered prediction based on your spending history
      </Text>

      {!hasData && (
        <View style={[styles.insufficientCard, { backgroundColor: theme.card }]}>
          <Text style={styles.insufficientIcon}>📊</Text>
          <Text style={[styles.insufficientText, { color: theme.textSecondary }]}>
            Add at least 5 transactions across multiple months to generate accurate forecasts.
          </Text>
        </View>
      )}

      {/* Trend indicator */}
      <View style={[styles.trendCard, { backgroundColor: theme.card }]}>
        <View style={styles.trendLeft}>
          <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>
            Next Month Forecast
          </Text>
          <Text style={[styles.trendValue, { color: theme.primary }]}>
            GH₵ {prediction.predictedExpense}
          </Text>
          <View style={[styles.badge, {
            backgroundColor:
              prediction.trend === "Increasing" ? "#FEE2E2" :
              prediction.trend === "Decreasing" ? "#D1FAE5" : "#DBEAFE",
          }]}>
            <Text style={{ fontSize: 12, fontWeight: "700", color:
              prediction.trend === "Increasing" ? "#DC2626" :
              prediction.trend === "Decreasing" ? "#059669" : "#2563EB"
            }}>
              {prediction.trend === "Increasing" ? "📈 Spending Rising" :
               prediction.trend === "Decreasing" ? "📉 Spending Falling" : "➡️ Spending Stable"}
            </Text>
          </View>
        </View>
        <View style={styles.trendRight}>
          <Text style={[styles.confLabel, { color: theme.textSecondary }]}>Confidence</Text>
          <Text style={[styles.confValue, {
            color: prediction.confidence === "High" ? "#059669" :
                   prediction.confidence === "Medium" ? "#D97706" : "#DC2626"
          }]}>
            {prediction.confidence}
          </Text>
        </View>
      </View>

      {/* Forecast Chart */}
      {allValues.length > 0 && Platform.OS !== "web" && (
        <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Historical + 4-Month Forecast
          </Text>
          <Text style={[styles.chartSub, { color: theme.textSecondary }]}>
            Solid = actual • Dashed = predicted
          </Text>
          <LineChart
            data={{ labels: allLabels, datasets: [{ data: allValues }] }}
            width={screenWidth - 60}
            height={220}
            fromZero
            chartConfig={{
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
              labelColor: () => theme.textSecondary,
              propsForDots: { r: "5", strokeWidth: "2", stroke: "#7C3AED" },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>
      )}

      {/* Savings Scenarios */}
      <View style={[styles.scenarioCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>💰 Savings Scenarios</Text>
        <Text style={[styles.chartSub, { color: theme.textSecondary }]}>
          Based on your monthly income vs predicted expenses
        </Text>

        <View style={styles.scenario}>
          <View style={[styles.scenarioDot, { backgroundColor: "#059669" }]} />
          <View style={styles.scenarioInfo}>
            <Text style={[styles.scenarioLabel, { color: theme.text }]}>Best Case (−15% spending)</Text>
          </View>
          <Text style={[styles.scenarioValue, { color: "#059669" }]}>
            GH₵ {Math.max(0, bestCase).toFixed(2)}
          </Text>
        </View>

        <View style={styles.scenario}>
          <View style={[styles.scenarioDot, { backgroundColor: "#2563EB" }]} />
          <View style={styles.scenarioInfo}>
            <Text style={[styles.scenarioLabel, { color: theme.text }]}>Expected</Text>
          </View>
          <Text style={[styles.scenarioValue, { color: "#2563EB" }]}>
            GH₵ {Math.max(0, expected).toFixed(2)}
          </Text>
        </View>

        <View style={styles.scenario}>
          <View style={[styles.scenarioDot, { backgroundColor: "#DC2626" }]} />
          <View style={styles.scenarioInfo}>
            <Text style={[styles.scenarioLabel, { color: theme.text }]}>Worst Case (+15% spending)</Text>
          </View>
          <Text style={[styles.scenarioValue, { color: "#DC2626" }]}>
            GH₵ {Math.max(0, worstCase).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Category Forecasts */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Category Forecast</Text>
      {categories.slice(0, 5).map((cat) => {
        const projected = cat.amount * (1 + trendPct / 100);
        const isUp = projected > cat.amount;
        return (
          <View key={cat.category} style={[styles.catCard, { backgroundColor: theme.card }]}>
            <Text style={styles.catIcon}>
              {cat.category === "Food" ? "🍔" :
               cat.category === "Transport" ? "🚕" :
               cat.category === "Shopping" ? "🛒" :
               cat.category === "Bills" ? "💡" :
               cat.category === "Entertainment" ? "🎮" : "📦"}
            </Text>
            <View style={styles.catInfo}>
              <Text style={[styles.catName, { color: theme.text }]}>{cat.category}</Text>
              <Text style={[styles.catCurrent, { color: theme.textSecondary }]}>
                Current: GH₵ {cat.amount.toFixed(0)} → Projected: GH₵ {projected.toFixed(0)}
              </Text>
            </View>
            <Text style={{ color: isUp ? "#DC2626" : "#059669", fontWeight: "700", fontSize: 13 }}>
              {isUp ? "+" : ""}{trendPct.toFixed(1)}%
            </Text>
          </View>
        );
      })}

      {/* Anomaly Warning */}
      {anomalies.length > 0 && (
        <View style={[styles.anomalyCard, { backgroundColor: "#7F1D1D" }]}>
          <Text style={styles.anomalyTitle}>⚠️ Forecast Note</Text>
          <Text style={styles.anomalyText}>
            {anomalies.length} unusual transaction{anomalies.length > 1 ? "s" : ""} detected which may be skewing your forecast. These outliers have been flagged in your AI Analytics tab.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },

  insufficientCard: { borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16 },
  insufficientIcon: { fontSize: 36, marginBottom: 12 },
  insufficientText: { fontSize: 14, textAlign: "center", lineHeight: 22 },

  trendCard: { borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  trendLeft: {},
  trendLabel: { fontSize: 13, marginBottom: 4 },
  trendValue: { fontSize: 32, fontWeight: "800" },
  badge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: "flex-start" },
  trendRight: { alignItems: "flex-end" },
  confLabel: { fontSize: 11 },
  confValue: { fontSize: 18, fontWeight: "800", marginTop: 4 },

  chartCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  chartSub: { fontSize: 12, marginBottom: 16 },

  scenarioCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  scenario: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0" },
  scenarioDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  scenarioInfo: { flex: 1 },
  scenarioLabel: { fontSize: 14, fontWeight: "600" },
  scenarioValue: { fontSize: 15, fontWeight: "800" },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  catCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, marginBottom: 8, gap: 12 },
  catIcon: { fontSize: 24 },
  catInfo: { flex: 1 },
  catName: { fontSize: 15, fontWeight: "700" },
  catCurrent: { fontSize: 12, marginTop: 2 },

  anomalyCard: { borderRadius: 16, padding: 16, marginTop: 8 },
  anomalyTitle: { color: "#FCA5A5", fontWeight: "700", marginBottom: 8 },
  anomalyText: { color: "#FCA5A5", fontSize: 13, lineHeight: 20 },
});
