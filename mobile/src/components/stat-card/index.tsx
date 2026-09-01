import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
  subtext?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function StatCard({
  label,
  value,
  valueColor,
  subtext,
  icon,
  style,
}: StatCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
        {icon}
      </View>
      <Text
        style={[
          styles.value,
          { color: valueColor || theme.text },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {subtext && (
        <Text style={[styles.subtext, { color: theme.textMuted }]}>
          {subtext}
        </Text>
      )}
    </View>
  );
}
export default StatCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 17,
    fontWeight: "800",
  },
  subtext: {
    fontSize: 11,
    marginTop: 4,
  },
});
