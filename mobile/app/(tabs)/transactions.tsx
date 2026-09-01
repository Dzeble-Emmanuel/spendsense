import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { TransactionTile } from "../../src/components/transaction-tile";
import { PrimaryButton, SecondaryButton } from "../../src/components/button";

type FilterType = "all" | "income" | "expense" | "subscription";

export default function Transactions() {
  const { transactions, deleteTransaction } = useFinance();
  const { theme } = useTheme();
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "subscription") return t.category.toLowerCase().includes("sub");
    return t.type === filter;
  });

  function handleDelete(id: string, title: string) {
    Alert.alert("Delete Transaction", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction(id),
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Transactions</Text>
        <TouchableOpacity
          style={[
            styles.searchBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Dual Primary Action Bar */}
      <View style={styles.actionRow}>
        <PrimaryButton
          label="Add Expense"
          icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          onPress={() => router.push("/(tabs)/add-transaction")}
          style={{ flex: 1 }}
        />
        <SecondaryButton
          label="Scan Receipt"
          icon={<Ionicons name="scan-outline" size={18} color={theme.primary} />}
          onPress={() => router.push("/(tabs)/receipt-scanner")}
          style={{ flex: 1 }}
        />
      </View>

      {/* Filter Row Chips */}
      <View style={styles.filterRow}>
        {(
          [
            { id: "all", label: "All" },
            { id: "income", label: "Income" },
            { id: "expense", label: "Expenses" },
            { id: "subscription", label: "Subscriptions" },
          ] as { id: FilterType; label: string }[]
        ).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === item.id ? theme.primary : theme.card,
                borderColor: filter === item.id ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilter(item.id)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === item.id ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inline AI Anomaly Alert Card */}
      <View
        style={[
          styles.aiAlertCard,
          { backgroundColor: theme.card, borderColor: theme.accentLight },
        ]}
      >
        <View style={styles.aiAlertHeader}>
          <Ionicons name="sparkles" size={18} color={theme.accent} />
          <Text style={[styles.aiAlertTitle, { color: theme.text }]}>
            Unusual Dining Pattern
          </Text>
        </View>
        <Text style={[styles.aiAlertText, { color: theme.textSecondary }]}>
          You've spent 40% more on dining this week than your 30-day average. Consider cooking at home tonight.
        </Text>
      </View>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No transactions recorded yet
          </Text>
        </View>
      ) : (
        filtered.map((item) => (
          <TransactionTile
            key={item.id}
            transaction={item}
            onLongPress={() => handleDelete(item.id, item.title)}
          />
        ))
      )}

      <Text style={[styles.hint, { color: theme.textMuted }]}>
        Tip: Long-press any transaction to delete it
      </Text>
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
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "700" },

  aiAlertCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  aiAlertHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  aiAlertTitle: { fontSize: 15, fontWeight: "700" },
  aiAlertText: { fontSize: 13, lineHeight: 19 },

  emptyCard: {
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 14 },

  hint: { textAlign: "center", fontSize: 12, marginTop: 16 },
});