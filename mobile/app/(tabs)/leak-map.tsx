import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";
import { calculateLocationLeakMetrics } from "../../src/services/leakMapService";
import { Transaction } from "../../src/types/finance";

export default function LeakMapScreen() {
  const { transactions, updateTransaction } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/analytics");

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showUntaggedModal, setShowUntaggedModal] = useState(false);
  const [activeTaggingId, setActiveTaggingId] = useState<string | null>(null);
  const [customLocInput, setCustomLocInput] = useState("");

  // Compute spatial leak metrics
  const leakReport = useMemo(() => {
    return calculateLocationLeakMetrics(transactions);
  }, [transactions]);

  const untaggedExpenses = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.type === "expense" &&
        (!t.locationLabel || t.locationLabel.trim() === "" || t.locationLabel === "Untagged")
    );
  }, [transactions]);

  const activeZone = useMemo(() => {
    if (!selectedLocation) return leakReport.highestLeakZone;
    return (
      leakReport.locations.find((l) => l.locationLabel === selectedLocation) ||
      leakReport.highestLeakZone
    );
  }, [selectedLocation, leakReport]);

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
        <Text style={[styles.title, { color: theme.text }]}>Silent Leak Map</Text>
        <View style={{ width: 45 }} />
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
                  backgroundColor: "rgba(244, 63, 94, 0.12)",
                  borderColor: "rgba(244, 63, 94, 0.25)",
                },
              ]}
            >
              <Feather name="compass" size={20} color="#F43F5E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.metaLabel, { color: "#F43F5E" }]}>
                BEHAVIORAL SPATIAL ENGINE
              </Text>
              <Text style={[styles.heroHeading, { color: theme.text }]}>
                Silent Money Leak Map
              </Text>
            </View>
          </View>

          <View style={[styles.privacyBadge, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
            <Feather name="shield" size={11} color="#10B981" />
            <Text style={styles.privacyText}>ZERO-GPS</Text>
          </View>
        </View>

        <Text style={[styles.guideText, { color: theme.textSecondary }]}>
          Reveals WHERE and WHEN you lose money, not just what you bought. Tempered by the
          logarithmic Leak Score Algorithm to isolate habitual micro-spending sinks.
        </Text>
      </View>

      {/* Top Prescriptive AI Nudge Card */}
      <View style={[styles.nudgeCard, { backgroundColor: theme.card, borderColor: "#F43F5E", marginTop: 14 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <View style={[styles.nudgeIconBox, { backgroundColor: "rgba(244, 63, 94, 0.15)" }]}>
            <Feather name="alert-circle" size={15} color="#F43F5E" />
          </View>
          <Text style={[styles.nudgeTitle, { color: "#F43F5E" }]}>PRESCRIPTIVE ACTION PLAN</Text>
        </View>
        <Text style={[styles.nudgeBody, { color: theme.text }]}>
          {leakReport.prescriptiveNudge}
        </Text>
      </View>

      {/* Untagged Transactions Action Card */}
      {untaggedExpenses.length > 0 && (
        <View style={[styles.untaggedCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
              <View style={[styles.untaggedIconBox, { backgroundColor: theme.primaryLight }]}>
                <Feather name="map-pin" size={16} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.untaggedTitle, { color: theme.text }]}>
                  {untaggedExpenses.length} Untagged {untaggedExpenses.length === 1 ? "Expense" : "Expenses"} ({formatMoney(leakReport.untaggedAmount)})
                </Text>
                <Text style={[styles.untaggedSub, { color: theme.textSecondary }]}>
                  Tag locations to sharpen your spatial money leak insights
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.tagNowBtn, { backgroundColor: theme.primary }]}
              onPress={() => setShowUntaggedModal(true)}
            >
              <Text style={styles.tagNowText}>Tag Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Primary Summary Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>HIGH-LEAK ZONES</Text>
          <Text style={[styles.statValue, { color: "#F43F5E" }]}>{leakReport.highRiskCount}</Text>
          <Text style={[styles.statSub, { color: theme.textMuted }]}>Requiring intervention</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOP LEAK HOTSPOT</Text>
          <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
            {leakReport.highestLeakZone?.locationLabel || "None"}
          </Text>
          <Text style={[styles.statSub, { color: theme.textMuted }]}>
            Score: {leakReport.highestLeakZone?.leakScore || 0}
          </Text>
        </View>
      </View>

      {/* Active Zone Detail Inspector */}
      {activeZone && (
        <View style={[styles.inspectorCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
          <View style={styles.inspectorHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.symbolBox, { backgroundColor: theme.primaryLight }]}>
                <Feather name={activeZone.iconName} size={16} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.inspectorZoneName, { color: theme.text }]}>
                  {activeZone.locationLabel}
                </Text>
                <Text style={[styles.inspectorSub, { color: theme.textSecondary }]}>
                  {activeZone.dominantCategory} • {activeZone.spendPercentage}% of total outflow
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    activeZone.leakStatus === "HIGH"
                      ? "rgba(244, 63, 94, 0.12)"
                      : activeZone.leakStatus === "MODERATE"
                      ? "rgba(245, 158, 11, 0.12)"
                      : "rgba(16, 185, 129, 0.12)",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  {
                    color:
                      activeZone.leakStatus === "HIGH"
                        ? "#F43F5E"
                        : activeZone.leakStatus === "MODERATE"
                        ? "#F59E0B"
                        : "#10B981",
                  },
                ]}
              >
                {activeZone.leakStatus} LEAK
              </Text>
            </View>
          </View>

          {/* Inspector Metrics Grid */}
          <View style={[styles.miniGrid, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={styles.miniCol}>
              <Text style={[styles.miniLabel, { color: theme.textSecondary }]}>TOTAL DRAIN</Text>
              <Text style={[styles.miniValue, { color: theme.text }]}>
                {formatMoney(activeZone.totalAmount)}
              </Text>
            </View>
            <View style={styles.miniCol}>
              <Text style={[styles.miniLabel, { color: theme.textSecondary }]}>VISIT COUNT</Text>
              <Text style={[styles.miniValue, { color: theme.text }]}>
                {activeZone.transactionCount} times
              </Text>
            </View>
            <View style={styles.miniCol}>
              <Text style={[styles.miniLabel, { color: theme.textSecondary }]}>AVG / VISIT</Text>
              <Text style={[styles.miniValue, { color: theme.text }]}>
                {formatMoney(activeZone.averagePerVisit)}
              </Text>
            </View>
          </View>

          {/* Dominant Time Window */}
          <View style={styles.timeWindowRow}>
            <Feather name="clock" size={13} color={theme.textSecondary} />
            <Text style={[styles.timeWindowText, { color: theme.textSecondary }]}>
              Peak Outflow Window:{" "}
              <Text style={{ fontWeight: "800", color: theme.text }}>
                {activeZone.dominantTimeWindow}
              </Text>
            </Text>
          </View>
        </View>
      )}

      {/* SPATIAL LEAK DENSITY CARDS */}
      <View style={{ marginTop: 18 }}>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>
          Semantic Location Hotspots
        </Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
          Tap any hotspot to inspect its temporal patterns and behavioral burn rate
        </Text>

        <View style={{ gap: 10, marginTop: 12 }}>
          {leakReport.locations.map((loc) => {
            const isSelected = activeZone?.locationLabel === loc.locationLabel;
            const isHigh = loc.leakStatus === "HIGH";
            const isMod = loc.leakStatus === "MODERATE";

            return (
              <TouchableOpacity
                key={loc.locationLabel}
                activeOpacity={0.8}
                onPress={() => setSelectedLocation(loc.locationLabel)}
                style={[
                  styles.locationCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isSelected
                      ? theme.primary
                      : isHigh
                      ? "rgba(244, 63, 94, 0.4)"
                      : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View
                      style={[
                        styles.symbolBox,
                        {
                          backgroundColor: isHigh
                            ? "rgba(244, 63, 94, 0.12)"
                            : isMod
                            ? "rgba(245, 158, 11, 0.12)"
                            : "rgba(16, 185, 129, 0.12)",
                        },
                      ]}
                    >
                      <Feather
                        name={loc.iconName}
                        size={16}
                        color={isHigh ? "#F43F5E" : isMod ? "#F59E0B" : "#10B981"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.locName, { color: theme.text }]}>
                        {loc.locationLabel}
                      </Text>
                      <Text style={[styles.locCategory, { color: theme.textSecondary }]}>
                        {loc.dominantCategory} • {loc.transactionCount} visits
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.locAmount, { color: theme.text }]}>
                      {formatMoney(loc.totalAmount)}
                    </Text>
                    <View style={styles.leakBadgeRow}>
                      <Text
                        style={[
                          styles.leakScoreText,
                          { color: isHigh ? "#F43F5E" : isMod ? "#F59E0B" : "#10B981" },
                        ]}
                      >
                        Score: {loc.leakScore}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Proportional Intensity Bar */}
                <View style={[styles.intensityTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.intensityFill,
                      {
                        width: `${Math.min(100, Math.max(8, loc.spendPercentage))}%`,
                        backgroundColor: isHigh ? "#F43F5E" : isMod ? "#F59E0B" : "#10B981",
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    {loc.spendPercentage}% of total outflow
                  </Text>
                  <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    Avg {formatMoney(loc.averagePerVisit)} / trip
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Untagged Transactions Tagging Modal */}
      <Modal
        visible={showUntaggedModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUntaggedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.metaLabel, { color: theme.primary }]}>LOCATIONS PENDING</Text>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Tag Untagged Expenses
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowUntaggedModal(false)}>
                <Feather name="x" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Assign locations below to sharpen spatial leak scores in real-time.
            </Text>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {untaggedExpenses.length === 0 ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Feather name="check-circle" size={28} color="#10B981" />
                  <Text style={{ color: theme.text, fontWeight: "700", marginTop: 8 }}>
                    All expenses are tagged!
                  </Text>
                </View>
              ) : (
                untaggedExpenses.map((tx) => {
                  const isExpanded = activeTaggingId === tx.id;
                  return (
                    <View
                      key={tx.id}
                      style={[
                        styles.untaggedItemCard,
                        { backgroundColor: theme.background, borderColor: theme.border },
                      ]}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.untaggedItemTitle, { color: theme.text }]} numberOfLines={1}>
                            {tx.title}
                          </Text>
                          <Text style={[styles.untaggedItemSub, { color: theme.textSecondary }]}>
                            {tx.category} • {new Date(tx.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={[styles.untaggedItemAmount, { color: "#F43F5E" }]}>
                          -{formatMoney(tx.amount)}
                        </Text>
                      </View>

                      {/* Quick Location Chips */}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 8 }}
                        contentContainerStyle={{ gap: 6 }}
                      >
                        {[
                          "Home / Hostel",
                          "KNUST Campus",
                          "Tech Junction",
                          "Kejetia Market",
                          "Ayigya Commute",
                          "Adum Business District",
                        ].map((loc) => (
                          <TouchableOpacity
                            key={loc}
                            style={[
                              styles.miniLocChip,
                              { backgroundColor: theme.card, borderColor: theme.border },
                            ]}
                            onPress={() => {
                              updateTransaction({
                                ...tx,
                                locationLabel: loc,
                              });
                            }}
                          >
                            <Text style={[styles.miniLocText, { color: theme.textSecondary }]}>
                              {loc}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      {/* Custom Input Toggle */}
                      {isExpanded ? (
                        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                          <TextInput
                            style={[
                              styles.miniInput,
                              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                            ]}
                            placeholder="Type custom location..."
                            placeholderTextColor={theme.textMuted}
                            value={customLocInput}
                            onChangeText={setCustomLocInput}
                          />
                          <TouchableOpacity
                            style={[styles.miniSaveBtn, { backgroundColor: theme.primary }]}
                            onPress={() => {
                              if (customLocInput.trim()) {
                                updateTransaction({
                                  ...tx,
                                  locationLabel: customLocInput.trim(),
                                });
                                setCustomLocInput("");
                                setActiveTaggingId(null);
                              }
                            }}
                          >
                            <Feather name="check" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={{ marginTop: 6 }}
                          onPress={() => {
                            setActiveTaggingId(tx.id);
                            setCustomLocInput("");
                          }}
                        >
                          <Text style={{ fontSize: 11, color: theme.primary, fontWeight: "700" }}>
                            + Custom Location...
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalDoneBtn, { backgroundColor: theme.primary, marginTop: 14 }]}
              onPress={() => setShowUntaggedModal(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  card: { padding: 18, borderRadius: 24, borderWidth: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroBadgeRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },

  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  metaLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  heroHeading: { fontSize: 15, fontWeight: "900", marginTop: 2 },
  guideText: { fontSize: 12, lineHeight: 18, marginTop: 10 },

  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  privacyText: { fontSize: 9, fontWeight: "900", color: "#10B981", letterSpacing: 0.5 },

  nudgeCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  nudgeIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  nudgeTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  nudgeBody: { fontSize: 12, lineHeight: 18, fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statBox: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1 },
  statLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  statSub: { fontSize: 10, marginTop: 2 },

  inspectorCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  inspectorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inspectorZoneName: { fontSize: 15, fontWeight: "900" },
  inspectorSub: { fontSize: 11, marginTop: 1 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPillText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },

  miniGrid: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  miniCol: { flex: 1, alignItems: "center" },
  miniLabel: { fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  miniValue: { fontSize: 13, fontWeight: "900", marginTop: 3 },

  timeWindowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.1)",
  },
  timeWindowText: { fontSize: 11 },

  sectionHeading: { fontSize: 15, fontWeight: "900" },
  sectionSub: { fontSize: 12, marginTop: 2 },

  locationCard: { padding: 14, borderRadius: 18 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  symbolBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  locName: { fontSize: 13, fontWeight: "800" },
  locCategory: { fontSize: 11, marginTop: 1 },
  locAmount: { fontSize: 14, fontWeight: "900" },
  leakBadgeRow: { marginTop: 2 },
  leakScoreText: { fontSize: 10, fontWeight: "900" },

  intensityTrack: {
    height: 5,
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  intensityFill: { height: "100%", borderRadius: 3 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: { fontSize: 10, fontWeight: "600" },

  untaggedCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  untaggedIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  untaggedTitle: { fontSize: 13, fontWeight: "800" },
  untaggedSub: { fontSize: 10, marginTop: 1 },
  tagNowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tagNowText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", marginTop: 2 },
  modalSub: { fontSize: 11, marginBottom: 14 },
  untaggedItemCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  untaggedItemTitle: { fontSize: 13, fontWeight: "800" },
  untaggedItemSub: { fontSize: 10, marginTop: 1 },
  untaggedItemAmount: { fontSize: 13, fontWeight: "900" },
  miniLocChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniLocText: { fontSize: 10, fontWeight: "700" },
  miniInput: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  miniSaveBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDoneBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDoneText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
