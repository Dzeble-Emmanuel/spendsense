import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";

export default function InsightsScreen() {
  const { expenses, income, savingsRate } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/predictions");

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const insights = [
    {
      title: "Optimizing Discretionary Outflows",
      tag: "OPTIMIZATION",
      text: "Dining out accounts for a notable portion of weekend variable spending. Preparing lunches 3 days a week preserves estimated GH₵ 180 weekly.",
      icon: "coffee" as const,
      color: "#F97316",
    },
    {
      title: "Savings Retention Momentum",
      tag: "SAVINGS",
      text: `Your current savings rate is ${savingsRate.toFixed(1)}%. Maintaining above 20% comfortably secures an emergency safety cushion.`,
      icon: "shield" as const,
      color: "#10B981",
    },
    {
      title: "Utility Power & Standby Waste",
      tag: "UTILITY",
      text: "High-drain appliances left on standby draw vampire power. Auditing AC timers can save estimated GH₵ 85 monthly.",
      icon: "zap" as const,
      color: "#EAB308",
    },
    {
      title: "Impulse Purchase 72-Hour Rule",
      tag: "BEHAVIOR",
      text: "Holding non-essential cart items for 72 hours before payment drastically lowers buyer remorse by over 40%.",
      icon: "shopping-bag" as const,
      color: "#EC4899",
    },
  ];

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
        <TouchableOpacity
          onPress={handleBack}
          style={{ marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <Feather name="arrow-left" size={18} color={theme.text} />
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: "600" }}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>AI Financial Insights</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Contextual diagnostics & smart recommendations
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {insights.map((item) => (
          <View
            key={item.title}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconBg, { backgroundColor: `${item.color}18` }]}>
                <Feather name={item.icon} size={16} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.tagRow}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                  <View style={[styles.tagPill, { backgroundColor: theme.subCard }]}>
                    <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={[styles.cardBody, { color: theme.textSecondary }]}>{item.text}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },

  card: { padding: 16, borderRadius: 20, borderWidth: 1 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  tagRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  cardTitle: { fontSize: 13, fontWeight: "800", flex: 1 },
  tagPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  cardBody: { fontSize: 11, marginTop: 4, lineHeight: 16 },
});