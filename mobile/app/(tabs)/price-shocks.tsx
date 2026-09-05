import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";
import {
  analyzePersonalPriceShocks,
  fetchLiveMacroIndicators,
  BASELINE_MACRO_INDICATORS,
  MacroIndicator,
} from "../../src/services/marketShockService";

export default function PriceShocksScreen() {
  const { transactions } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/analytics");

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const [indicators, setIndicators] = useState<MacroIndicator[]>(BASELINE_MACRO_INDICATORS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const live = await fetchLiveMacroIndicators();
      setIndicators(live);
      setLastSyncTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute real-time personal price shock metrics
  const shockReport = useMemo(() => {
    return analyzePersonalPriceShocks(transactions, indicators);
  }, [transactions, indicators]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: topPadding,
        paddingBottom: 60,
        paddingHorizontal: 18,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Insights</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Price Shock Radar</Text>

        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={loadData}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Feather name="refresh-cw" size={15} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Hero Explainer Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardTopRow}>
          <View style={styles.heroBadgeRow}>
            {/* Professional Minimalist Badge (uiverse-inspired, vector symbol, zero emojis) */}
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  borderColor: "rgba(239, 68, 68, 0.25)",
                },
              ]}
            >
              <Feather name="alert-triangle" size={19} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.metaLabel, { color: "#EF4444" }]}>
                MACROECONOMIC RADAR
              </Text>
              <Text style={[styles.heroHeading, { color: theme.text }]}>
                Price Shock Diagnostics
              </Text>
            </View>
          </View>

          <View style={[styles.livePill, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>
              {shockReport.isLiveFeed ? "LIVE INTERNET FEED" : "VERIFIED BENCHMARK"}
            </Text>
          </View>
        </View>

        <Text style={[styles.guideText, { color: theme.textSecondary }]}>
          Monitors live fuel pump revisions, exchange rate volatility, and inflation indices from
          official internet sources and computes the personalized financial impact on your specific
          cash flow.
        </Text>
      </View>

      {/* Projected Monthly Drain Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <View style={styles.burdenHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            PROJECTED MONTHLY CASH SHOCK
          </Text>
          <View style={[styles.severityTag, { backgroundColor: "rgba(244, 63, 94, 0.12)" }]}>
            <Text style={styles.severityTagText}>OUTFLOW RISK</Text>
          </View>
        </View>

        <Text style={[styles.burdenAmount, { color: "#F43F5E" }]}>
          +{formatMoney(shockReport.totalMonthlyBurden)} / mo
        </Text>

        <Text style={[styles.burdenSub, { color: theme.textSecondary }]}>
          Estimated additional expense load across commute, foreign services, and groceries based
          on recent market price adjustments.
        </Text>

        <View style={[styles.bufferBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Feather name="shield" size={15} color={theme.primary} />
          <Text style={[styles.bufferText, { color: theme.text }]}>
            Suggested Safety Cushion:{" "}
            <Text style={{ fontWeight: "900", color: theme.primary }}>
              +{formatMoney(shockReport.recommendedBudgetBuffer)}
            </Text>
          </Text>
        </View>
      </View>

      {/* SECTION 1: LIVE MARKET INDICATORS (INTERNET BENCHMARKS) */}
      <View style={{ marginTop: 18 }}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>
            Macroeconomic Indicators
          </Text>
          <Text style={[styles.sourceNote, { color: theme.textSecondary }]}>
            Synced {lastSyncTime}
          </Text>
        </View>

        <View style={{ gap: 10, marginTop: 10 }}>
          {shockReport.indicators.map((item) => (
            <View
              key={item.id}
              style={[styles.indicatorCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.indicatorTop}>
                <View style={styles.indicatorLeft}>
                  <View style={[styles.symbolBox, { backgroundColor: theme.primaryLight }]}>
                    <Feather name={item.iconName} size={16} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.indicatorTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.indicatorCategory, { color: theme.textSecondary }]}>
                      {item.categoryName} • {item.source}
                    </Text>
                  </View>
                </View>

                <View style={styles.rateCol}>
                  <Text style={[styles.rateValue, { color: theme.text }]}>{item.currentValue}</Text>
                  <View style={styles.changeRow}>
                    <Feather
                      name={item.changePercent >= 0 ? "arrow-up-right" : "arrow-down-right"}
                      size={12}
                      color={item.changePercent >= 0 ? "#F43F5E" : "#10B981"}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        { color: item.changePercent >= 0 ? "#F43F5E" : "#10B981" },
                      ]}
                    >
                      {item.changePercent >= 0 ? "+" : ""}
                      {item.changePercent}%
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.indicatorDesc, { color: theme.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* SECTION 2: PERSONALIZED WALLET IMPACT & AI ACTION STEPS */}
      <View style={{ marginTop: 20 }}>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>
          Personalized Wallet Impact
        </Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
          Tailored adjustments calculated against your past {transactions.length} logged transactions
        </Text>

        <View style={{ gap: 12, marginTop: 12 }}>
          {shockReport.personalShocks.map((shock, idx) => (
            <View
              key={idx}
              style={[styles.shockCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              {/* Shock Card Header */}
              <View style={styles.shockTopRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <View
                    style={[
                      styles.symbolBox,
                      {
                        backgroundColor:
                          shock.severity === "high"
                            ? "rgba(244, 63, 94, 0.12)"
                            : "rgba(245, 158, 11, 0.12)",
                      },
                    ]}
                  >
                    <Feather
                      name={shock.iconName}
                      size={16}
                      color={shock.severity === "high" ? "#F43F5E" : "#F59E0B"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shockCategory, { color: theme.textSecondary }]}>
                      {shock.category}
                    </Text>
                    <Text style={[styles.shockTitle, { color: theme.text }]}>{shock.title}</Text>
                  </View>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.shockAmount, { color: "#F43F5E" }]}>
                    +{formatMoney(shock.estimatedMonthlyImpact)}
                  </Text>
                  <Text style={[styles.shockUnit, { color: theme.textSecondary }]}>
                    {shock.unitImpactText}
                  </Text>
                </View>
              </View>

              {/* Actionable Advice Box */}
              <View
                style={[
                  styles.adviceBox,
                  { backgroundColor: theme.background, borderColor: theme.border },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Feather name="shield" size={13} color={theme.primary} />
                  <Text style={[styles.adviceLabel, { color: theme.primary }]}>
                    MITIGATION STRATEGY
                  </Text>
                </View>
                <Text style={[styles.adviceText, { color: theme.text }]}>{shock.advice}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* SECTION 3: DATA ACCURACY & SOURCES DISCLOSURE */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 20 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <View style={[styles.symbolBox, { backgroundColor: theme.primaryLight }]}>
            <Feather name="check-circle" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              DATA ACCURACY & METHODOLOGY
            </Text>
            <Text style={[styles.testHeading, { color: theme.text }]}>
              Verified Data Pipeline
            </Text>
          </View>
        </View>

        <Text style={[styles.accuracyText, { color: theme.textSecondary }]}>
          • <Text style={{ fontWeight: "800", color: theme.text }}>Exchange Rates:</Text> Polled from
          live financial API feeds cross-referenced with Bank of Ghana daily interbank benchmarks.
        </Text>
        <Text style={[styles.accuracyText, { color: theme.textSecondary }]}>
          • <Text style={{ fontWeight: "800", color: theme.text }}>Petroleum Benchmarks:</Text> Tied
          to National Petroleum Authority (NPA) bi-weekly deregulated pricing windows across major
          OMCs (GOIL, Shell, TotalEnergies).
        </Text>
        <Text style={[styles.accuracyText, { color: theme.textSecondary }]}>
          • <Text style={{ fontWeight: "800", color: theme.text }}>Consumer Inflation:</Text> Sourced
          from the Ghana Statistical Service (GSS) monthly Consumer Price Index (CPI) bulletin.
        </Text>
        <Text style={[styles.accuracyText, { color: theme.textSecondary, marginTop: 4 }]}>
          • <Text style={{ fontWeight: "800", color: theme.text }}>Personalized Math:</Text> Surcharges
          are computed by calculating your actual frequency of rides, grocery purchases, and foreign
          recurring subscriptions rather than applying generic estimates.
        </Text>

        <TouchableOpacity
          style={[styles.simBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/what-if",
              params: { returnTo: "/(tabs)/price-shocks" },
            })
          }
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={15} color="#FFFFFF" />
          <Text style={styles.simBtnText}>LAUNCH WHAT-IF SIMULATOR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { fontSize: 13, fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "900" },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroBadgeRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },

  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  metaLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  heroHeading: { fontSize: 15, fontWeight: "900", marginTop: 2 },
  guideText: { fontSize: 12, lineHeight: 18, marginTop: 10 },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  livePillText: { fontSize: 9, fontWeight: "900", color: "#10B981", letterSpacing: 0.5 },

  burdenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  severityTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityTagText: { fontSize: 9, fontWeight: "900", color: "#F43F5E", letterSpacing: 0.5 },
  burdenAmount: { fontSize: 26, fontWeight: "900", marginVertical: 4 },
  burdenSub: { fontSize: 12, lineHeight: 17 },

  bufferBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  bufferText: { fontSize: 12, fontWeight: "600" },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionHeading: { fontSize: 15, fontWeight: "900" },
  sectionSub: { fontSize: 12, marginTop: 2 },
  sourceNote: { fontSize: 10, fontWeight: "700" },

  indicatorCard: { padding: 14, borderRadius: 16, borderWidth: 1 },
  indicatorTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicatorLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  symbolBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorTitle: { fontSize: 13, fontWeight: "800" },
  indicatorCategory: { fontSize: 11, marginTop: 1 },
  rateCol: { alignItems: "flex-end" },
  rateValue: { fontSize: 13, fontWeight: "900" },
  changeRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  changeText: { fontSize: 11, fontWeight: "800" },
  indicatorDesc: { fontSize: 11, lineHeight: 16, marginTop: 8 },

  shockCard: { padding: 14, borderRadius: 16, borderWidth: 1 },
  shockTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shockCategory: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  shockTitle: { fontSize: 13, fontWeight: "800", marginTop: 1 },
  shockAmount: { fontSize: 15, fontWeight: "900" },
  shockUnit: { fontSize: 10, marginTop: 2 },

  adviceBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  adviceLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
  adviceText: { fontSize: 11, lineHeight: 16, fontWeight: "600" },

  testHeading: { fontSize: 14, fontWeight: "900", marginTop: 2 },
  accuracyText: { fontSize: 11, lineHeight: 17, marginTop: 6 },
  simBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  simBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
});
