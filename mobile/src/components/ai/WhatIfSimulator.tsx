import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFinance } from "../../hooks/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { useSettings } from "../../hooks/useSettings";

interface PresetScenario {
  id: string;
  label: string;
  category: string;
  action: "increase" | "decrease";
  amount: number;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "food-100",
    label: "+GH₵ 100 on Food",
    category: "Food & Dining",
    action: "increase",
    amount: 100,
  },
  {
    id: "transport-50",
    label: "+GH₵ 50 on Rides",
    category: "Transport",
    action: "increase",
    amount: 50,
  },
  {
    id: "shopping-150",
    label: "+GH₵ 150 Shopping",
    category: "Shopping",
    action: "increase",
    amount: 150,
  },
  {
    id: "cook-home",
    label: "-GH₵ 120 Cook at Home",
    category: "Food & Dining",
    action: "decrease",
    amount: 120,
  },
  {
    id: "cut-subs",
    label: "-GH₵ 45 Cut Subs",
    category: "Entertainment",
    action: "decrease",
    amount: 45,
  },
];

const CATEGORIES = [
  { name: "Food & Dining", icon: "coffee" as const },
  { name: "Transport", icon: "navigation" as const },
  { name: "Shopping", icon: "shopping-bag" as const },
  { name: "Bills & Utilities", icon: "zap" as const },
  { name: "Entertainment", icon: "film" as const },
  { name: "Health & Wellness", icon: "activity" as const },
  { name: "Education", icon: "book" as const },
  { name: "Other", icon: "package" as const },
];

export function WhatIfSimulator() {
  const { transactions, budgets, expenses, income, healthScore } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();

  const [selectedCategory, setSelectedCategory] = useState("Food & Dining");
  const [action, setAction] = useState<"increase" | "decrease">("increase");
  const [amountInput, setAmountInput] = useState("100");

  const simAmount = parseFloat(amountInput) || 0;

  // 1. Calculate current baseline spending for the selected category
  const currentCategorySpent = useMemo(() => {
    const catPrefix = selectedCategory.toLowerCase().split(" ")[0];
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          (t.category.toLowerCase().includes(catPrefix) ||
            selectedCategory.toLowerCase().includes(t.category.toLowerCase().split(" ")[0]))
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedCategory]);

  // 2. Find allocated budget for category (fallback to reasonable ceiling if unset)
  const categoryBudget = useMemo(() => {
    const b = budgets.find((item) =>
      item.category.toLowerCase().includes(selectedCategory.toLowerCase().split(" ")[0])
    );
    return b && b.budget > 0 ? b.budget : Math.max(currentCategorySpent * 1.3, 300);
  }, [budgets, selectedCategory, currentCategorySpent]);

  // 3. Simulated Category Spend
  const simulatedCategorySpent = Math.max(
    0,
    action === "increase"
      ? currentCategorySpent + simAmount
      : currentCategorySpent - simAmount
  );

  const baselineBudgetPct = Math.round((currentCategorySpent / categoryBudget) * 100);
  const simulatedBudgetPct = Math.round((simulatedCategorySpent / categoryBudget) * 100);

  // 4. Simulated Total Expenses and Savings
  const simulatedTotalExpenses = Math.max(
    0,
    action === "increase" ? expenses + simAmount : expenses - simAmount
  );

  const baselineSavings = income - expenses;
  const simulatedSavings = income - simulatedTotalExpenses;

  // 5. Simulated Health Score Calculation
  const simulatedHealthScore = useMemo(() => {
    if (income === 0) return healthScore.score;

    const simSavingsRatio = simulatedSavings / income;
    let score = 50;

    if (simSavingsRatio >= 0.5) score += 30;
    else if (simSavingsRatio >= 0.2) score += 20;
    else if (simSavingsRatio < 0) score -= 30;

    if (simulatedTotalExpenses < income * 0.5) score += 15;
    else if (simulatedTotalExpenses > income) score -= 20;

    if (transactions.length >= 5) score += 5;

    return Math.min(100, Math.max(0, score));
  }, [income, simulatedSavings, simulatedTotalExpenses, transactions.length, healthScore.score]);

  const scoreDiff = simulatedHealthScore - healthScore.score;

  // 6. Dynamic AI Trade-off Verdict
  const aiVerdict = useMemo(() => {
    if (simAmount === 0) {
      return "Enter an amount above to simulate your budget variance and health score impact.";
    }

    if (action === "increase") {
      const isOver = simulatedCategorySpent > categoryBudget;
      const overAmount = simulatedCategorySpent - categoryBudget;

      if (isOver) {
        return `⚠️ Spending ${formatMoney(simAmount)} more on ${selectedCategory} will breach your budget ceiling by ${formatMoney(overAmount)} (${simulatedBudgetPct}% capacity). To stay balanced, consider reallocating ${formatMoney(simAmount * 0.6)} from Entertainment or Shopping.`;
      } else {
        return `Spending ${formatMoney(simAmount)} more on ${selectedCategory} pushes utilization from ${baselineBudgetPct}% to ${simulatedBudgetPct}%. Your monthly savings cushion will compress by ${formatMoney(simAmount)}.`;
      }
    } else {
      const annualSavings = simAmount * 12;
      return `Trimming ${formatMoney(simAmount)} from ${selectedCategory} frees up cashflow and saves ${formatMoney(annualSavings)} annually. Your budget utilization drops from ${baselineBudgetPct}% to ${simulatedBudgetPct}%, bolstering your health index by ${Math.abs(scoreDiff)} pts.`;
    }
  }, [
    simAmount,
    action,
    selectedCategory,
    simulatedCategorySpent,
    categoryBudget,
    simulatedBudgetPct,
    baselineBudgetPct,
    formatMoney,
    scoreDiff,
  ]);

  const handleApplyPreset = (preset: PresetScenario) => {
    setSelectedCategory(preset.category);
    setAction(preset.action);
    setAmountInput(String(preset.amount));
  };

  const handleQuickAdd = (val: number) => {
    setAmountInput(String((parseFloat(amountInput) || 0) + val));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Header with Professional Question Mark Symbol */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {/* Professional Question Mark Badge (Inspired by clean uiverse card badges) */}
          <View style={[styles.questionMarkBadge, { backgroundColor: theme.primaryLight, borderColor: "rgba(37, 99, 235, 0.25)" }]}>
            <Feather name="help-circle" size={19} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.sectionMeta, { color: theme.primary }]}>PREDICTIVE SANDBOX</Text>
            <Text style={[styles.title, { color: theme.text }]}>What-If Simulator</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setAmountInput("100");
            setSelectedCategory("Food & Dining");
            setAction("increase");
          }}
          style={[styles.resetBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
          <Feather name="rotate-ccw" size={12} color={theme.textSecondary} />
          <Text style={[styles.resetText, { color: theme.textSecondary }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Simulate financial decisions and preview budget impacts before spending a cedi.
      </Text>

      {/* Preset 1-Tap Scenarios */}
      <View style={{ marginTop: 14 }}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>POPULAR SCENARIOS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
          {PRESET_SCENARIOS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetChip,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
              onPress={() => handleApplyPreset(preset)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.presetDot,
                  { backgroundColor: preset.action === "increase" ? "#F43F5E" : "#10B981" },
                ]}
              />
              <Text style={[styles.presetText, { color: theme.text }]}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Direction Switcher: Increase Outflow vs Reduce Outflow */}
      <View style={[styles.directionContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.directionTab,
            action === "increase" && [styles.directionTabActive, { backgroundColor: "#F43F5E" }],
          ]}
          onPress={() => setAction("increase")}
          activeOpacity={0.8}
        >
          <Feather
            name="arrow-up-right"
            size={14}
            color={action === "increase" ? "#FFFFFF" : theme.textSecondary}
          />
          <Text
            style={[
              styles.directionText,
              { color: action === "increase" ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            Spend More (+Outflow)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.directionTab,
            action === "decrease" && [styles.directionTabActive, { backgroundColor: "#10B981" }],
          ]}
          onPress={() => setAction("decrease")}
          activeOpacity={0.8}
        >
          <Feather
            name="arrow-down-left"
            size={14}
            color={action === "decrease" ? "#FFFFFF" : theme.textSecondary}
          />
          <Text
            style={[
              styles.directionText,
              { color: action === "decrease" ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            Save More (-Cut Back)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Horizontal Selector */}
      <View style={{ marginTop: 14 }}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TARGET CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.background, borderColor: theme.border },
                ]}
                onPress={() => setSelectedCategory(cat.name)}
                activeOpacity={0.8}
              >
                <Feather
                  name={cat.icon}
                  size={12}
                  color={isSelected ? "#FFFFFF" : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: isSelected ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Amount Input & Increments */}
      <View style={{ marginTop: 14 }}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>SIMULATED AMOUNT (GHS)</Text>
        <View style={[styles.inputBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.currencyPrefix, { color: theme.textSecondary }]}>GH₵</Text>
          <TextInput
            style={[styles.amountInput, { color: theme.text }]}
            keyboardType="decimal-pad"
            value={amountInput}
            onChangeText={setAmountInput}
            placeholder="100"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Quick Stepper Pills */}
        <View style={styles.quickAddRow}>
          {[20, 50, 100, 200, 500].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.quickAddBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => setAmountInput(String(val))}
            >
              <Text style={[styles.quickAddText, { color: theme.text }]}>GH₵{val}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SIMULATED IMPACT RESULTS MATRIX */}
      <View style={[styles.resultsMatrix, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.matrixHeader}>
          <Text style={[styles.matrixTitle, { color: theme.text }]}>Simulation Impact Matrix</Text>
          <View style={[styles.pillTag, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.pillTagText, { color: theme.primary }]}>LIVE PREVIEW</Text>
          </View>
        </View>

        {/* 4 Key Comparison Cards */}
        <View style={styles.grid}>
          {/* Card 1: Category Spend */}
          <View style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>CATEGORY SPEND</Text>
            <View style={styles.diffRow}>
              <Text style={[styles.beforeText, { color: theme.textMuted }]}>
                {formatMoney(currentCategorySpent)}
              </Text>
              <Feather name="arrow-right" size={11} color={theme.textMuted} />
              <Text
                style={[
                  styles.afterText,
                  { color: action === "increase" ? "#F43F5E" : "#10B981" },
                ]}
              >
                {formatMoney(simulatedCategorySpent)}
              </Text>
            </View>
            <Text style={[styles.subNote, { color: theme.textSecondary }]}>
              {action === "increase" ? "+" : "-"}
              {formatMoney(simAmount)} variance
            </Text>
          </View>

          {/* Card 2: Budget Utilization */}
          <View style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>BUDGET LOAD</Text>
            <View style={styles.diffRow}>
              <Text style={[styles.beforeText, { color: theme.textMuted }]}>{baselineBudgetPct}%</Text>
              <Feather name="arrow-right" size={11} color={theme.textMuted} />
              <Text
                style={[
                  styles.afterText,
                  {
                    color:
                      simulatedBudgetPct > 100
                        ? "#F43F5E"
                        : simulatedBudgetPct > 80
                        ? "#F59E0B"
                        : "#10B981",
                  },
                ]}
              >
                {simulatedBudgetPct}%
              </Text>
            </View>
            {/* Mini Progress Bar */}
            <View style={[styles.miniTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.miniFill,
                  {
                    width: `${Math.min(100, simulatedBudgetPct)}%`,
                    backgroundColor:
                      simulatedBudgetPct > 100
                        ? "#F43F5E"
                        : simulatedBudgetPct > 80
                        ? "#F59E0B"
                        : "#10B981",
                  },
                ]}
              />
            </View>
          </View>

          {/* Card 3: Monthly Net Savings */}
          <View style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>PROJECTED SAVINGS</Text>
            <View style={styles.diffRow}>
              <Text style={[styles.beforeText, { color: theme.textMuted }]}>
                {formatMoney(baselineSavings)}
              </Text>
              <Feather name="arrow-right" size={11} color={theme.textMuted} />
              <Text
                style={[
                  styles.afterText,
                  { color: simulatedSavings >= baselineSavings ? "#10B981" : "#F43F5E" },
                ]}
              >
                {formatMoney(simulatedSavings)}
              </Text>
            </View>
            <Text style={[styles.subNote, { color: theme.textSecondary }]}>
              {action === "increase" ? "Compresses" : "Expands"} reserve
            </Text>
          </View>

          {/* Card 4: Financial Health Index */}
          <View style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>HEALTH INDEX</Text>
            <View style={styles.diffRow}>
              <Text style={[styles.beforeText, { color: theme.textMuted }]}>
                {healthScore.score}
              </Text>
              <Feather name="arrow-right" size={11} color={theme.textMuted} />
              <Text
                style={[
                  styles.afterText,
                  {
                    color:
                      simulatedHealthScore >= 75
                        ? "#10B981"
                        : simulatedHealthScore >= 50
                        ? "#F59E0B"
                        : "#F43F5E",
                  },
                ]}
              >
                {simulatedHealthScore}/100
              </Text>
            </View>
            <Text style={[styles.subNote, { color: theme.textSecondary }]}>
              {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} score impact
            </Text>
          </View>
        </View>

        {/* AI Trade-off Verdict Box */}
        <View style={[styles.verdictBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Ionicons name="sparkles" size={13} color={theme.primary} />
            <Text style={[styles.verdictTitle, { color: theme.primary }]}>AI TRADE-OFF ANALYSIS</Text>
          </View>
          <Text style={[styles.verdictText, { color: theme.text }]}>{aiVerdict}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  questionMarkBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionMeta: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 1,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 11,
    fontWeight: "700",
  },

  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  presetScroll: {
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  presetText: {
    fontSize: 11,
    fontWeight: "700",
  },

  directionContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    gap: 6,
  },
  directionTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 9,
  },
  directionTabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  directionText: {
    fontSize: 12,
    fontWeight: "800",
  },

  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: "800",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
  },

  quickAddRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  quickAddBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  quickAddText: {
    fontSize: 10,
    fontWeight: "800",
  },

  resultsMatrix: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  matrixHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matrixTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  pillTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillTagText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridCard: {
    width: "48.5%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  diffRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  beforeText: {
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "line-through",
  },
  afterText: {
    fontSize: 13,
    fontWeight: "900",
  },
  subNote: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: "600",
  },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: 2,
  },

  verdictBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  verdictTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  verdictText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
});
