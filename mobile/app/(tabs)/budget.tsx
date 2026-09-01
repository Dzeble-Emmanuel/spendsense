import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { CATEGORY_PRACTICAL_TIPS } from "../../src/ai/insights";

const COLORS = {
  green: "#16A34A",
  red: "#DC2626",
  orange: "#F59E0B",
};

export default function Budget() {
  const { transactions = [] } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();

  const budgets = [
    { category: "Food", icon: "🍔", budget: 500 },
    { category: "Transport", icon: "🚕", budget: 300 },
    { category: "Shopping", icon: "🛒", budget: 400 },
    { category: "Bills", icon: "💡", budget: 600 },
    { category: "Entertainment", icon: "🎮", budget: 250 },
    { category: "Health", icon: "❤️", budget: 350 },
    { category: "Education", icon: "📚", budget: 450 },
    { category: "Other", icon: "📦", budget: 200 },
  ];

  const totalBudget = budgets.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = Math.min((totalSpent / totalBudget) * 100, 100);

  // Identify overspent or high-spending categories for targeted practical tips
  const overspentCategories = budgets.filter((item) => {
    const spent = transactions
      .filter((t) => t.category === item.category && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return spent > item.budget * 0.7; // > 70% of budget spent
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.text }]}>Budget Tracker</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Track your monthly spending limits & AI advice
      </Text>

      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.summaryTitle, { color: theme.text }]}>
          Monthly Budget Overview
        </Text>
        <Text style={[styles.summaryText, { color: theme.text }]}>
          Total Budget: {formatMoney(totalBudget)}
        </Text>
        <Text style={[styles.summaryText, { color: theme.text }]}>
          Total Spent: {formatMoney(totalSpent)}
        </Text>
        <Text style={[styles.summaryText, { color: totalRemaining >= 0 ? COLORS.green : COLORS.red }]}>
          Remaining: {formatMoney(totalRemaining)}
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progress,
              {
                width: `${overallPercentage}%` as `${number}%`,
                backgroundColor: overallPercentage >= 100 ? COLORS.red : COLORS.green,
              },
            ]}
          />
        </View>

        <Text style={[styles.remaining, { color: theme.textSecondary }]}>
          {overallPercentage.toFixed(0)}% of monthly budget used
        </Text>
      </View>

      {/* Category Budgets */}
      {budgets.map((item) => {
        const spent = transactions
          .filter((t) => t.category === item.category && t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const remaining = item.budget - spent;
        const percentage = Math.min((spent / item.budget) * 100, 100);
        const progressColor =
          percentage >= 100 ? COLORS.red : percentage >= 70 ? COLORS.orange : COLORS.green;

        return (
          <View key={item.category} style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
              <Text style={[styles.category, { color: theme.text }]}>
                {item.icon} {item.category}
              </Text>
              <Text style={{ color: theme.text }}>
                {formatMoney(spent)} / {formatMoney(item.budget)}
              </Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progress,
                  { width: `${percentage}%` as `${number}%`, backgroundColor: progressColor },
                ]}
              />
            </View>

            <Text style={[styles.remaining, { color: theme.textSecondary }]}>
              {percentage.toFixed(0)}% Used
            </Text>

            <Text style={[styles.remaining, { color: remaining >= 0 ? COLORS.green : COLORS.red }]}>
              {remaining >= 0
                ? `${formatMoney(remaining)} remaining`
                : `Over budget by ${formatMoney(Math.abs(remaining))}`}
            </Text>
          </View>
        );
      })}

      {/* Actionable AI Advice Section */}
      <View style={[styles.aiCard, { backgroundColor: "#0F172A", borderLeftWidth: 4, borderLeftColor: "#3B82F6" }]}>
        <Text style={styles.aiTitle}>🤖 SpendSense AI Actionable Tips</Text>
        {overspentCategories.length > 0 ? (
          overspentCategories.map((item) => {
            const tip = CATEGORY_PRACTICAL_TIPS[item.category] || CATEGORY_PRACTICAL_TIPS["Other"];
            return (
              <View key={item.category} style={styles.tipBox}>
                <Text style={styles.tipHeader}>
                  {tip.icon} High {item.category} Spending Detected
                </Text>
                <Text style={styles.tipText}>
                  💡 {tip.actionableStep}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.tipText}>
            🎉 Great job! All category expenditures are within healthy limits. Keep up your disciplined spending habits!
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", marginTop: 16 },
  subtitle: { marginTop: 4, marginBottom: 20, fontSize: 14 },

  summaryCard: { padding: 20, borderRadius: 20, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  summaryText: { fontSize: 16, marginBottom: 8 },

  card: { padding: 18, borderRadius: 18, marginBottom: 15 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  category: { fontSize: 17, fontWeight: "600" },
  progressBackground: { height: 10, backgroundColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", marginTop: 15 },
  progress: { height: "100%", borderRadius: 10 },
  remaining: { marginTop: 8, fontSize: 14 },

  aiCard: { padding: 20, borderRadius: 20, marginTop: 10 },
  aiTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", marginBottom: 14 },
  tipBox: { marginBottom: 14, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: "#334155" },
  tipHeader: { color: "#60A5FA", fontWeight: "700", fontSize: 14, marginBottom: 4 },
  tipText: { color: "#CBD5E1", fontSize: 13, lineHeight: 20 },
});