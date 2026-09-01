import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useSettings } from "../../hooks/useSettings";
import { getCategoryInfo, Transaction } from "../../types/finance";

interface TransactionTileProps {
  transaction: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export function TransactionTile({
  transaction,
  onPress,
  onLongPress,
  style,
}: TransactionTileProps) {
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const catInfo = getCategoryInfo(transaction.category, transaction.type);

  function formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  }

  const isIncome = transaction.type === "income";

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.subCard || theme.background },
          ]}
        >
          <Text style={styles.icon}>{catInfo.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {transaction.title}
          </Text>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {transaction.category.toUpperCase()} • {formatDate(transaction.date)}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? theme.income : theme.expense },
          ]}
        >
          {isIncome ? "+" : "-"}{formatMoney(transaction.amount)}
        </Text>
        <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}
export default TransactionTile;

const styles = StyleSheet.create({
  tile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
  },
  chevron: {
    fontSize: 18,
    fontWeight: "300",
  },
});
