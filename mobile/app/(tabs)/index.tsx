import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useAuth } from "../../src/hooks/useAuth";
import { useSettings } from "../../src/hooks/useSettings";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTransactionInitials(title: string, merchant?: string): string {
  const source = (merchant && merchant.trim()) || title.trim();
  const clean = source.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  if (!clean) return "TX";
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function Dashboard() {
  const { transactions, income, expenses, balance, healthScore } = useFinance();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const recentTxs = transactions.slice(0, 5);

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
    "#06B6D4",
    "#F43F5E",
    "#64748B",
  ];
  const pieData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amount], i) => ({
      name,
      amount,
      color: pieColors[i % pieColors.length],
      legendFontColor: theme.text,
      legendFontSize: 11,
    }));

  const topPadding = insets.top > 0 ? insets.top + 10 : 24;

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
      {/* Top Welcome Header */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <View style={styles.statusPulse} />
            <Text style={styles.statusBadgeText}>Personal Vault Active</Text>
          </View>
          <Text style={[styles.greetingText, { color: theme.text }]}>
            {getGreeting()}, {firstName}
          </Text>
          <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>
            Here is your financial snapshot & predicted cash flow.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.avatarBtn, { backgroundColor: theme.primaryLight }]}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          <Text style={[styles.avatarText, { color: theme.primary }]}>
            {(user?.fullName || "U").charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Solid Slate Hero Balance Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.cardElevated || "#1E293B",
            borderColor: theme.border,
            borderWidth: 1,
          },
        ]}
      >
        <View style={styles.heroHeader}>
          <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>TOTAL LEDGER BALANCE</Text>
          <View style={[styles.livePill, { backgroundColor: "rgba(16, 185, 129, 0.12)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" }} />
            <Text style={[styles.liveText, { color: "#10B981" }]}>Active</Text>
          </View>
        </View>

        <Text style={[styles.heroAmount, { color: theme.text }]}>{formatMoney(balance)}</Text>

        {/* Inflow & Outflow Capsules */}
        <View style={styles.pillGrid}>
          <View style={[styles.frostedPill, { backgroundColor: theme.subCard, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.pillTitleRow}>
              <Feather name="arrow-up-right" size={13} color="#10B981" />
              <Text style={[styles.incomePillLabel, { color: "#10B981" }]}>INFLOW</Text>
            </View>
            <Text style={[styles.incomeValue, { color: "#10B981" }]}>+{formatMoney(income)}</Text>
          </View>

          <View style={[styles.frostedPill, { backgroundColor: theme.subCard, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.pillTitleRow}>
              <Feather name="arrow-down-left" size={13} color="#F43F5E" />
              <Text style={[styles.expensePillLabel, { color: "#F43F5E" }]}>OUTFLOW</Text>
            </View>
            <Text style={[styles.expenseValue, { color: "#F43F5E" }]}>-{formatMoney(expenses)}</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Shortcut Cards */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push({ pathname: "/(tabs)/add-transaction", params: { type: "income", returnTo: "/(tabs)" } })}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
            <Feather name="plus" size={18} color="#10B981" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push({ pathname: "/(tabs)/add-transaction", params: { type: "expense", returnTo: "/(tabs)" } })}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(244, 63, 94, 0.12)" }]}>
            <Feather name="minus" size={18} color="#F43F5E" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push({ pathname: "/(tabs)/budget", params: { returnTo: "/(tabs)" } })}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(37, 99, 235, 0.12)" }]}>
            <Feather name="pie-chart" size={18} color="#2563EB" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push({ pathname: "/(tabs)/receipt-scanner", params: { returnTo: "/(tabs)" } })}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(139, 92, 246, 0.12)" }]}>
            <Ionicons name="scan-outline" size={18} color="#8B5CF6" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* AI Insight Sparkle Card */}
      <TouchableOpacity
        style={[styles.aiCard, { backgroundColor: theme.card, borderColor: theme.accentLight }]}
        onPress={() => router.push("/(tabs)/predictions")}
        activeOpacity={0.8}
      >
        <View style={styles.aiHeader}>
          <View style={[styles.sparkleBg, { backgroundColor: theme.accentLight }]}>
            <Ionicons name="sparkles" size={16} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.aiTitleRow}>
              <Text style={[styles.aiTitle, { color: theme.text }]}>SpendSense AI Insight</Text>
              <View style={[styles.optBadge, { backgroundColor: theme.accentLight }]}>
                <Text style={[styles.optBadgeText, { color: theme.primary }]}>OPTIMIZATION</Text>
              </View>
            </View>
            <Text style={[styles.aiText, { color: theme.textSecondary }]}>
              {healthScore.status}. Review your forecast to preserve capital this cycle.
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textMuted} />
        </View>
      </TouchableOpacity>

      {/* Recent Activity List with Typographic Monogram Initials */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
            <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
              Latest deposits and purchases
            </Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push("/(tabs)/transactions")}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
            <Feather name="chevron-right" size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {recentTxs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={32} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No transactions recorded yet
            </Text>
          </View>
        ) : (
          recentTxs.map((t) => {
            const isIncome = t.type === "income";
            const initials = getTransactionInitials(t.title, t.merchant);
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.txRow, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => router.push("/(tabs)/transactions")}
                activeOpacity={0.7}
              >
                <View style={[styles.monogramBox, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                  <Text style={[styles.monogramText, { color: theme.text }]}>{initials}</Text>
                </View>

                <View style={styles.txMeta}>
                  <Text style={[styles.txTitle, { color: theme.text }]} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={[styles.txDetails, { color: theme.textSecondary }]}>
                    {t.category} • {new Date(t.date).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.txAmountCol}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isIncome ? theme.income : theme.text },
                    ]}
                  >
                    {isIncome ? "+" : "-"}
                    {formatMoney(t.amount)}
                  </Text>
                  <Text style={[styles.txSubtype, { color: theme.textMuted }]}>
                    {t.merchant || t.type}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Spending Breakdown Donut Chart */}
      {pieData.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Expense Distribution</Text>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
                Monthly breakdown by category
              </Text>
            </View>
            <Feather name="pie-chart" size={18} color={theme.textMuted} />
          </View>

          {Platform.OS !== "web" ? (
            <PieChart
              data={pieData}
              width={screenWidth - 72}
              height={180}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
              chartConfig={{
                color: () => theme.text,
              }}
            />
          ) : (
            <View style={{ padding: 12 }}>
              {pieData.map((item) => (
                <View key={item.name} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.legendAmt, { color: theme.textSecondary }]}>
                    {formatMoney(item.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.budgetNavBtn, { backgroundColor: theme.subCard }]}
            onPress={() => router.push({ pathname: "/(tabs)/budget", params: { returnTo: "/(tabs)" } })}
          >
            <Text style={[styles.budgetNavText, { color: theme.primary }]}>
              View Budget Tracker & Limits
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  statusPulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10B981" },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#10B981",
    textTransform: "uppercase",
  },
  greetingText: { fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  greetingSub: { fontSize: 12, marginTop: 2 },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "900" },

  // Hero Card
  heroCard: {
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroLabel: { color: "#93C5FD", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginVertical: 14,
  },
  pillGrid: { flexDirection: "row", gap: 10 },
  frostedPill: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  pillTitleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  incomePillLabel: { color: "#6EE7B7", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  expensePillLabel: { color: "#FCA5A5", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  incomeValue: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginTop: 4 },
  expenseValue: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginTop: 4 },

  // Actions
  actionsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  actionCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: { fontSize: 11, fontWeight: "700" },

  // AI Card
  aiCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sparkleBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  aiTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  aiTitle: { fontSize: 13, fontWeight: "800" },
  optBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  optBadgeText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  aiText: { fontSize: 11, marginTop: 2, lineHeight: 16 },

  // Transactions Card
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  sectionSub: { fontSize: 11, marginTop: 1 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 12, fontWeight: "800" },

  emptyContainer: { padding: 30, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 12, fontWeight: "600" },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  monogramBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monogramText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
  txMeta: { flex: 1 },
  txTitle: { fontSize: 13, fontWeight: "700" },
  txDetails: { fontSize: 11, marginTop: 2 },
  txAmountCol: { alignItems: "flex-end" },
  txAmount: { fontSize: 14, fontWeight: "800" },
  txSubtype: { fontSize: 10, marginTop: 2 },

  // Chart
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendName: { flex: 1, fontSize: 12, fontWeight: "600" },
  legendAmt: { fontSize: 12, fontWeight: "700" },
  budgetNavBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  budgetNavText: { fontSize: 12, fontWeight: "800" },
});