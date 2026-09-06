import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useAuth } from "../../src/hooks/useAuth";
import { useSettings } from "../../src/hooks/useSettings";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";
import UnverifiedFeatureGate from "../../src/components/common/UnverifiedFeatureGate";

type ReportPeriod = "this_month" | "last_month" | "last_3_months" | "all_time";

export default function ReportsScreen() {
  const { transactions } = useFinance();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { formatMoney, currency } = useSettings();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/profile");

  if (!user?.isEmailVerified) {
    return (
      <UnverifiedFeatureGate
        featureName="Financial Reports & Export"
        featureDescription="Email verification is required to generate, download, and export official CSV and PDF financial statements."
        iconName="file-text"
        onBack={handleBack}
      />
    );
  }

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("this_month");
  const [isExporting, setIsExporting] = useState(false);

  const periods: { label: string; value: ReportPeriod }[] = [
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
    { label: "Last 3 Months", value: "last_3_months" },
    { label: "All Time", value: "all_time" },
  ];

  const filterByPeriod = (period: ReportPeriod) => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      switch (period) {
        case "this_month":
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case "last_month": {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        }
        case "last_3_months": {
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          return d >= threeMonthsAgo;
        }
        case "all_time":
        default:
          return true;
      }
    });
  };

  const filtered = filterByPeriod(selectedPeriod);
  const periodIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const periodExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const periodBalance = periodIncome - periodExpense;
  const periodSavingsRate =
    periodIncome > 0 ? ((periodBalance / periodIncome) * 100).toFixed(1) : "0.0";

  const catMap: Record<string, number> = {};
  filtered
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  const handleExportCSV = async () => {
    if (filtered.length === 0) {
      Alert.alert("No Data", "No transactions found for the selected period.");
      return;
    }

    setIsExporting(true);
    try {
      const periodLabel =
        periods.find((p) => p.value === selectedPeriod)?.label || "Report";
      const exportedAt = new Date().toLocaleString();
      const userName = user?.fullName || "SpendSense User";

      const csvLines: string[] = [
        `SpendSense Financial Report`,
        `Exported Date,${exportedAt}`,
        `Account Holder,${userName}`,
        `Report Period,${periodLabel}`,
        `Active Currency,${currency.name} (${currency.symbol})`,
        ``,
        `FINANCIAL SUMMARY`,
        `Total Inflows (Income),${formatMoney(periodIncome)}`,
        `Total Outflows (Expenses),${formatMoney(periodExpense)}`,
        `Net Surplus (Balance),${formatMoney(periodBalance)}`,
        `Savings Retention Rate,${periodSavingsRate}%`,
        `Total Transactions Audited,${filtered.length}`,
        ``,
        `DETAILED TRANSACTION LEDGER`,
        `Date,Title,Type,Category,Amount (${currency.symbol}),Merchant,Description`,
        ...filtered.map((t) =>
          [
            new Date(t.date).toLocaleDateString("en-GB"),
            `"${t.title.replace(/"/g, '""')}"`,
            t.type,
            `"${t.category}"`,
            t.amount.toFixed(2),
            `"${(t.merchant || "").replace(/"/g, '""')}"`,
            `"${(t.description || "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
        ``,
        `CATEGORY EXPENSE DISTRIBUTION`,
        `Category,Amount (${currency.symbol}),Percentage of Total Expenses`,
        ...categories.map(
          ([cat, amt]) =>
            `"${cat}",${amt.toFixed(2)},${
              periodExpense > 0 ? ((amt / periodExpense) * 100).toFixed(1) : "0"
            }%`
        ),
      ];

      const csvContent = csvLines.join("\n");
      const fileName = `SpendSense_${periodLabel.replace(/\s+/g, "_")}_${Date.now()}.csv`;

      if (Platform.OS === "web") {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        if (Paths && Paths.document) {
          const file = new File(Paths.document, fileName);
          file.write(csvContent);
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(file.uri, {
              mimeType: "text/csv",
              dialogTitle: `Share ${fileName}`,
            });
          } else {
            Alert.alert("Saved", `CSV file generated: ${fileName}`);
          }
        }
      }
    } catch (error) {
      Alert.alert("Export Error", "Could not export CSV file.");
    }
    setIsExporting(false);
  };

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
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { color: theme.text }]}>Reports & Export</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Review period summaries & export CSV spreadsheets
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: "#10B981" }]}
          onPress={handleExportCSV}
          disabled={isExporting}
          activeOpacity={0.8}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather name="download" size={14} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Period Chips */}
      <View style={styles.periodRow}>
        {periods.map((p) => {
          const isSelected = selectedPeriod === p.value;
          return (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.periodCard,
                {
                  backgroundColor: isSelected ? theme.primaryLight : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setSelectedPeriod(p.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodCardLabel,
                  { color: isSelected ? theme.primary : theme.text },
                ]}
              >
                {p.label}
              </Text>
              <Text style={[styles.periodCardSub, { color: theme.textMuted }]}>Audited period</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4-Grid Summary */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOTAL INCOME</Text>
          <Text style={[styles.statValue, { color: "#10B981" }]}>{formatMoney(periodIncome)}</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOTAL OUTFLOW</Text>
          <Text style={[styles.statValue, { color: "#F43F5E" }]}>{formatMoney(periodExpense)}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>NET SURPLUS</Text>
          <Text
            style={[
              styles.statValue,
              { color: periodBalance >= 0 ? "#10B981" : "#F43F5E" },
            ]}
          >
            {formatMoney(periodBalance)}
          </Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>SAVINGS RATE</Text>
          <Text style={[styles.statValue, { color: theme.accent }]}>{periodSavingsRate}%</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Expense Allocation Breakdown
          </Text>

          <View style={{ gap: 10, marginTop: 12 }}>
            {categories.map(([cat, amt]) => {
              const pct = periodExpense > 0 ? Math.round((amt / periodExpense) * 100) : 0;
              return (
                <View key={cat}>
                  <View style={styles.catRowHeader}>
                    <Text style={[styles.catName, { color: theme.text }]}>{cat}</Text>
                    <Text style={[styles.catAmount, { color: theme.textSecondary }]}>
                      {formatMoney(amt)} ({pct}%)
                    </Text>
                  </View>
                  <View style={[styles.catTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                    <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: theme.primary }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Transactions Table Preview */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Audited Transactions ({filtered.length})
        </Text>

        <View style={{ marginTop: 8 }}>
          {filtered.slice(0, 6).map((t) => (
            <View key={t.id} style={styles.previewRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={1}>
                  {t.title}
                </Text>
                <Text style={[styles.previewMeta, { color: theme.textMuted }]}>
                  {t.category} • {new Date(t.date).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.previewAmount,
                  { color: t.type === "income" ? "#10B981" : theme.text },
                ]}
              >
                {t.type === "income" ? "+" : "-"}
                {formatMoney(t.amount)}
              </Text>
            </View>
          ))}
        </View>

        {filtered.length > 6 && (
          <Text style={[styles.moreText, { color: theme.textMuted }]}>
            +{filtered.length - 6} additional transactions included in export file
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingRight: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: "600",
  },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  exportBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },

  periodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  periodCard: {
    width: "48%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodCardLabel: { fontSize: 13, fontWeight: "800" },
  periodCardSub: { fontSize: 10, marginTop: 2 },

  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statBox: { flex: 1, padding: 14, borderRadius: 18, borderWidth: 1 },
  statLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  statValue: { fontSize: 17, fontWeight: "900", marginTop: 4 },

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: "800" },

  catRowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  catName: { fontSize: 12, fontWeight: "700" },
  catAmount: { fontSize: 11, fontWeight: "600" },
  catTrack: { height: 6, borderRadius: 3, borderWidth: 1, overflow: "hidden" },
  catFill: { height: "100%", borderRadius: 3 },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(100, 116, 139, 0.12)",
  },
  previewTitle: { fontSize: 13, fontWeight: "700" },
  previewMeta: { fontSize: 10, marginTop: 1 },
  previewAmount: { fontSize: 13, fontWeight: "900" },
  moreText: { textAlign: "center", fontSize: 11, marginTop: 10 },
});