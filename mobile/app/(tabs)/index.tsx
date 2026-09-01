import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-chart-kit";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useAuth } from "../../src/hooks/useAuth";
import { useSettings } from "../../src/hooks/useSettings";
import { generateInsight } from "../../src/ai/insights";
import { calculateHealthScore } from "../../src/ai/healthScore";
import { TransactionTile } from "../../src/components/transaction-tile";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { transactions, income, expenses, balance } = useFinance();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { formatMoney } = useSettings();
  const screenWidth = Dimensions.get("window").width;

  const insight = generateInsight(transactions);
  const healthScore = calculateHealthScore(transactions);

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const pieColors = [
    "#2563EB",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#8B5CF6",
    "#14B8A6",
    "#EF4444",
    "#6366F1",
  ];
  const pieData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amount], i) => ({
      name,
      amount,
      color: pieColors[i % pieColors.length],
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {(user?.fullName || "A").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.greetingText, { color: theme.text }]}>
              {getGreeting()}, {user?.fullName?.split(" ")[0] || "User"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.bellBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Hero Balance Card */}
      <LinearGradient
        colors={theme.heroGradient || ["#1E40AF", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroLabel}>Total Balance</Text>
        <Text style={styles.heroAmount}>{formatMoney(balance)}</Text>

        <View style={styles.pillContainer}>
          <View style={styles.frostedPill}>
            <View style={styles.pillTextRow}>
              <Ionicons name="arrow-up" size={14} color="#34D399" />
              <Text style={styles.pillLabel}>INCOME (THIS MONTH)</Text>
            </View>
            <Text style={styles.pillValueGreen}>+{formatMoney(income)}</Text>
          </View>

          <View style={styles.frostedPill}>
            <View style={styles.pillTextRow}>
              <Ionicons name="arrow-down" size={14} color="#F87171" />
              <Text style={styles.pillLabel}>EXPENSE (THIS MONTH)</Text>
            </View>
            <Text style={styles.pillValueRed}>-{formatMoney(expenses)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Health Score Widget */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Health Score
        </Text>
        <View style={styles.healthScoreCenter}>
          <View style={styles.ringGauge}>
            <Text style={[styles.scoreValue, { color: theme.text }]}>
              {healthScore.score}
            </Text>
            <Text style={[styles.scoreTotal, { color: theme.textSecondary }]}>
              / 100
            </Text>
          </View>
          <View
            style={[
              styles.healthBadgePill,
              {
                backgroundColor:
                  healthScore.score >= 80
                    ? theme.successLight
                    : healthScore.score >= 50
                    ? theme.warningLight
                    : theme.dangerLight,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={
                healthScore.score >= 80
                  ? theme.success
                  : healthScore.score >= 50
                  ? theme.warning
                  : theme.danger
              }
            />
            <Text
              style={[
                styles.healthBadgeText,
                {
                  color:
                    healthScore.score >= 80
                      ? theme.success
                      : healthScore.score >= 50
                      ? theme.warning
                      : theme.danger,
                },
              ]}
            >
              {healthScore.status}
            </Text>
          </View>
        </View>
      </View>

      {/* AI Insight Card */}
      <TouchableOpacity
        style={[
          styles.aiCard,
          { backgroundColor: theme.card, borderColor: theme.accentLight },
        ]}
        onPress={() => router.push("/(tabs)/predictions")}
        activeOpacity={0.8}
      >
        <View style={styles.aiHeader}>
          <View
            style={[styles.sparkleBg, { backgroundColor: theme.accentLight }]}
          >
            <Ionicons name="sparkles" size={18} color={theme.accent} />
          </View>
          <Text style={[styles.aiTitle, { color: theme.text }]}>AI Insight</Text>
          <Ionicons name="arrow-forward" size={18} color={theme.textSecondary} />
        </View>
        <Text style={[styles.aiText, { color: theme.textSecondary }]}>
          {insight}
        </Text>
      </TouchableOpacity>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => router.push("/(tabs)/add-transaction")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.actionIconBg,
              { backgroundColor: "rgba(5, 150, 105, 0.12)" },
            ]}
          >
            <Ionicons name="add" size={24} color="#059669" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Add Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => router.push("/(tabs)/add-transaction")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.actionIconBg,
              { backgroundColor: "rgba(220, 38, 38, 0.12)" },
            ]}
          >
            <Ionicons name="remove" size={24} color="#DC2626" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Add Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => router.push("/(tabs)/budget")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.actionIconBg,
              { backgroundColor: "rgba(37, 99, 235, 0.12)" },
            ]}
          >
            <Ionicons name="pie-chart" size={22} color="#2563EB" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recent Transactions
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      {transactions.slice(0, 5).map((item) => (
        <TransactionTile
          key={item.id}
          transaction={item}
          onPress={() => router.push("/(tabs)/transactions")}
        />
      ))}

      {/* Spending Overview Chart */}
      {pieData.length > 0 && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              marginTop: 16,
            },
          ]}
        >
          <View style={styles.chartTitleRow}>
            <Ionicons name="pie-chart-outline" size={20} color={theme.text} />
            <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 0 }]}>
              Spending Breakdown
            </Text>
          </View>
          {Platform.OS !== "web" ? (
            <PieChart
              data={pieData}
              width={screenWidth - 72}
              height={190}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
              chartConfig={{
                color: () => theme.text,
              }}
            />
          ) : (
            <Text
              style={{
                color: theme.textSecondary,
                textAlign: "center",
                padding: 20,
              }}
            >
              Charts available on mobile app
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  greetingText: { fontSize: 20, fontWeight: "800" },

  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  heroLabel: { color: "#BFDBFE", fontSize: 13, fontWeight: "600" },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  pillContainer: { gap: 10 },
  frostedPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  pillTextRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillLabel: { color: "#E0F2FE", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  pillValueGreen: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 4 },
  pillValueRed: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 4 },

  // Health Score Card
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  chartTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  healthScoreCenter: { alignItems: "center", paddingVertical: 8 },
  ringGauge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 8,
    borderColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreValue: { fontSize: 28, fontWeight: "800" },
  scoreTotal: { fontSize: 12, marginTop: -2 },
  healthBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  healthBadgeText: { fontSize: 13, fontWeight: "700" },

  // AI Card
  aiCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sparkleBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  aiTitle: { fontSize: 16, fontWeight: "700", flex: 1 },
  aiText: { fontSize: 14, lineHeight: 21 },

  // Actions
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionCard: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: { fontSize: 12, fontWeight: "700" },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "700" },
});