import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useAuth } from "../../src/hooks/useAuth";
import { useSettings } from "../../src/hooks/useSettings";

type ReportPeriod = "this_month" | "last_month" | "last_3_months" | "all_time";

const PERIODS: { label: string; value: ReportPeriod; icon: string }[] = [
  { label: "This Month",    value: "this_month",    icon: "📅" },
  { label: "Last Month",    value: "last_month",    icon: "🗓️" },
  { label: "Last 3 Months", value: "last_3_months", icon: "📆" },
  { label: "All Time",      value: "all_time",      icon: "🗂️" },
];

export default function Reports() {
  const { transactions } = useFinance();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { formatMoney, currency } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("this_month");
  const [isExporting, setIsExporting] = useState(false);

  function filterByPeriod(period: ReportPeriod) {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      switch (period) {
        case "this_month":
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case "last_month": {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1);
          return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        }
        case "last_3_months": {
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3);
          return d >= threeMonthsAgo;
        }
        case "all_time":
        default:
          return true;
      }
    });
  }

  const filtered = filterByPeriod(selectedPeriod);
  const periodIncome  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const periodExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const periodBalance = periodIncome - periodExpense;
  const periodSavingsRate = periodIncome > 0 ? ((periodBalance / periodIncome) * 100).toFixed(1) : "0";

  // Category breakdown
  const catMap: Record<string, number> = {};
  filtered.filter(t => t.type === "expense").forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  async function exportCSV() {
    if (filtered.length === 0) {
      Alert.alert("No Data", "No transactions found for the selected period.");
      return;
    }

    setIsExporting(true);
    try {
      const periodLabel = PERIODS.find(p => p.value === selectedPeriod)?.label || "Report";
      const exportedAt = new Date().toLocaleString();
      const userName = user?.fullName || "SpendSense User";

      const csvLines: string[] = [
        `SpendSense Financial Report`,
        `Exported: ${exportedAt}`,
        `User: ${userName}`,
        `Period: ${periodLabel}`,
        `Currency: ${currency.name} (${currency.symbol})`,
        ``,
        `SUMMARY`,
        `Total Income,${formatMoney(periodIncome)}`,
        `Total Expenses,${formatMoney(periodExpense)}`,
        `Net Balance,${formatMoney(periodBalance)}`,
        `Savings Rate,${periodSavingsRate}%`,
        `Transaction Count,${filtered.length}`,
        ``,
        `TRANSACTIONS`,
        `Date,Title,Type,Category,Amount (${currency.symbol}),Description`,
        ...filtered.map(t =>
          [
            new Date(t.date).toLocaleDateString("en-GB"),
            `"${t.title.replace(/"/g, '""')}"`,
            t.type,
            t.category,
            t.amount.toFixed(2),
            `"${(t.description || "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
        ``,
        `CATEGORY BREAKDOWN`,
        `Category,Amount (${currency.symbol}),% of Expenses`,
        ...categories.map(([cat, amt]) =>
          `${cat},${amt.toFixed(2)},${periodExpense > 0 ? ((amt / periodExpense) * 100).toFixed(1) : 0}%`
        ),
      ];

      const csvContent = csvLines.join("\n");
      const fileName = `SpendSense_${periodLabel.replace(/\s/g, "_")}_${Date.now()}.csv`;

      if (Platform.OS === "web") {
        // Web export using Blob link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Native export (iOS / Android)
        let fileUri = "";
        if (Paths && Paths.document) {
          const file = new File(Paths.document, fileName);
          file.write(csvContent);
          fileUri = file.uri;
        }

        if (fileUri) {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(fileUri, {
              mimeType: "text/csv",
              dialogTitle: `Share ${fileName}`,
              UTI: "public.comma-separated-values-text",
            });
          } else {
            Alert.alert("Saved!", `Report saved to:\n${fileUri}`);
          }
        }
      }
    } catch (error) {
      Alert.alert("Export Error", "Could not export the report. Please try again.");
      console.error("CSV Export Error:", error);
    }
    setIsExporting(false);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.text }]}>📄 Reports</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Financial summaries you can export as CSV
      </Text>

      {/* Period Selector */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>SELECT PERIOD</Text>
      <View style={styles.periodGrid}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodChip, {
              backgroundColor: selectedPeriod === p.value ? "#2563EB" : theme.card,
              borderColor: selectedPeriod === p.value ? "#2563EB" : theme.border,
            }]}
            onPress={() => setSelectedPeriod(p.value)}
          >
            <Text style={styles.periodIcon}>{p.icon}</Text>
            <Text style={[styles.periodLabel, { color: selectedPeriod === p.value ? "#fff" : theme.text }]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Income</Text>
          <Text style={[styles.statValue, { color: "#059669" }]}>{formatMoney(periodIncome)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Expenses</Text>
          <Text style={[styles.statValue, { color: "#DC2626" }]}>{formatMoney(periodExpense)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Net</Text>
          <Text style={[styles.statValue, { color: periodBalance >= 0 ? "#059669" : "#DC2626" }]}>
            {formatMoney(periodBalance)}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Savings Rate</Text>
          <Text style={[styles.statValue, { color: "#7C3AED" }]}>{periodSavingsRate}%</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <View style={[styles.catCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.catTitle, { color: theme.text }]}>📊 Expense Breakdown</Text>
          {categories.map(([cat, amt]) => (
            <View key={cat} style={styles.catRow}>
              <Text style={[styles.catName, { color: theme.text }]}>{cat}</Text>
              <View style={styles.catBar}>
                <View style={[styles.catBarFill, {
                  width: `${periodExpense > 0 ? (amt / periodExpense) * 100 : 0}%` as any,
                  backgroundColor: "#7C3AED",
                }]} />
              </View>
              <Text style={[styles.catAmt, { color: theme.text }]}>{formatMoney(amt)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Transactions Preview */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        TRANSACTIONS ({filtered.length})
      </Text>
      {filtered.slice(0, 5).map((t) => (
        <View key={t.id} style={[styles.txRow, { backgroundColor: theme.card }]}>
          <View>
            <Text style={[styles.txTitle, { color: theme.text }]}>{t.title}</Text>
            <Text style={[styles.txMeta, { color: theme.textSecondary }]}>
              {t.category} • {new Date(t.date).toLocaleDateString("en-GB")}
            </Text>
          </View>
          <Text style={t.type === "income" ? styles.txIncome : styles.txExpense}>
            {t.type === "income" ? "+" : "-"}{formatMoney(t.amount)}
          </Text>
        </View>
      ))}
      {filtered.length > 5 && (
        <Text style={[styles.moreText, { color: theme.textSecondary }]}>
          +{filtered.length - 5} more in the exported CSV
        </Text>
      )}

      {/* Export Button */}
      <TouchableOpacity
        style={[styles.exportButton, isExporting && styles.exportButtonDim]}
        onPress={exportCSV}
        disabled={isExporting}
        activeOpacity={0.8}
      >
        {isExporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.exportButtonText}>⬇️ Download CSV Report</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        The CSV includes all transactions, category breakdown, and summary for the selected period.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 16, marginBottom: 10 },

  periodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  periodChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, gap: 6 },
  periodIcon: { fontSize: 16 },
  periodLabel: { fontSize: 13, fontWeight: "600" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", padding: 14, borderRadius: 16 },
  statLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "800" },

  catCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  catTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  catRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 10 },
  catName: { width: 90, fontSize: 13, fontWeight: "600" },
  catBar: { flex: 1, height: 6, backgroundColor: "#E2E8F0", borderRadius: 4, overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 4 },
  catAmt: { width: 85, textAlign: "right", fontSize: 12, fontWeight: "600" },

  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 14, marginBottom: 6 },
  txTitle: { fontSize: 14, fontWeight: "600" },
  txMeta: { fontSize: 11, marginTop: 2 },
  txIncome: { color: "#059669", fontWeight: "700", fontSize: 14 },
  txExpense: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  moreText: { textAlign: "center", fontSize: 12, marginTop: 4, marginBottom: 8 },

  exportButton: { backgroundColor: "#059669", padding: 18, borderRadius: 16, alignItems: "center", marginTop: 24 },
  exportButtonDim: { opacity: 0.7 },
  exportButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  hint: { textAlign: "center", fontSize: 12, marginTop: 14, lineHeight: 18 },
});