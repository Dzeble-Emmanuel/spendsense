import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { Transaction } from "../../src/types/finance";

type FilterType = "all" | "income" | "expense" | "subscription";

function getInitials(title: string, merchant?: string): string {
  const source = (merchant && merchant.trim()) || title.trim();
  const clean = source.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  if (!clean) return "TX";
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function TransactionsScreen() {
  const { transactions, updateTransaction, deleteTransaction, anomalies } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickTagTx, setQuickTagTx] = useState<Transaction | null>(null);
  const [quickLocInput, setQuickLocInput] = useState("");
  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter === "income" && t.type !== "income") return false;
      if (filter === "expense" && t.type !== "expense") return false;
      if (filter === "subscription" && !t.isSubscription && !t.category.toLowerCase().includes("sub")) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchMerchant = t.merchant?.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchDesc && !matchMerchant) return false;
      }

      return true;
    });
  }, [transactions, filter, searchQuery]);

  function confirmDelete(id: string, title: string) {
    Alert.alert("Delete Transaction", `Are you sure you want to remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction(id),
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPadding,
          paddingBottom: 100,
          paddingHorizontal: 18,
        }}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Transactions</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Review, search & categorize cash movements
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.scanBtn, { backgroundColor: theme.card, borderColor: theme.border, marginRight: 8 }]}
              onPress={() => router.push({ pathname: "/(tabs)/sms-import", params: { returnTo: "/(tabs)/transactions" } })}
              activeOpacity={0.8}
            >
              <Feather name="message-square" size={17} color={theme.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scanBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: "/(tabs)/receipt-scanner", params: { returnTo: "/(tabs)/transactions" } })}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Feather name="search" size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search title, category, merchant..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Feather name="x" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Segment Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { id: "all", label: "All" },
          { id: "income", label: "Income" },
          { id: "expense", label: "Expenses" },
          { id: "subscription", label: "Subscriptions" },
        ].map((f) => {
          const isActive = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? theme.primary : theme.card,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setFilter(f.id as FilterType)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: isActive ? "#FFFFFF" : theme.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Anomaly Alert Banner */}
      {anomalies.length > 0 && (
        <View style={styles.anomalyCard}>
          <View style={styles.anomalyIconBg}>
            <Feather name="alert-triangle" size={16} color="#F43F5E" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.anomalyBadgeRow}>
              <Text style={styles.anomalyTitle}>
                Pattern Anomaly: {anomalies[0].title} ({formatMoney(anomalies[0].amount)})
              </Text>
              <View style={styles.flaggedBadge}>
                <Text style={styles.flaggedText}>FLAGGED</Text>
              </View>
            </View>
            <Text style={styles.anomalyReason}>{anomalies[0].reason}</Text>
          </View>
        </View>
      )}

      {/* Records Count */}
      <View style={styles.recordsMetaRow}>
        <Text style={[styles.recordsCount, { color: theme.textMuted }]}>
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
        </Text>
        <Text style={[styles.recordsHint, { color: theme.textMuted }]}>Tap to edit, long press to delete</Text>
      </View>

      {/* Transaction Items */}
      {filtered.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Feather name="file-text" size={36} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No transactions match filters</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            Clear the search query or tap Add Entry to log a transaction.
          </Text>
        </View>
      ) : (
        filtered.map((item) => {
          const isIncome = item.type === "income";
          const initials = getInitials(item.title, item.merchant);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.txCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/edit-transaction",
                  params: { id: item.id, returnTo: "/(tabs)/transactions" },
                })
              }
              onLongPress={() => confirmDelete(item.id, item.title)}
              activeOpacity={0.7}
            >
              <View style={[styles.monogramBox, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                <Text style={[styles.monogramText, { color: theme.text }]}>{initials}</Text>
              </View>

              <View style={styles.txInfo}>
                <View style={styles.titleRow}>
                  <Text style={[styles.txTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.isSubscription && (
                    <View style={styles.subPill}>
                      <Text style={styles.subPillText}>Recurring</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.txSub, { color: theme.textSecondary }]}>
                  {item.category} • {new Date(item.date).toLocaleDateString()}
                  {item.description ? ` — "${item.description}"` : ""}
                </Text>

                {item.type === "expense" && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                    {item.locationLabel ? (
                      <TouchableOpacity
                        style={[styles.locBadge, { backgroundColor: theme.primaryLight }]}
                        onPress={() => {
                          setQuickTagTx(item);
                          setQuickLocInput(item.locationLabel || "");
                        }}
                      >
                        <Feather name="map-pin" size={10} color={theme.primary} />
                        <Text style={[styles.locBadgeText, { color: theme.primary }]}>
                          {item.locationLabel}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.untaggedBadge, { backgroundColor: theme.subCard, borderColor: theme.border }]}
                        onPress={() => {
                          setQuickTagTx(item);
                          setQuickLocInput("");
                        }}
                      >
                        <Feather name="plus" size={10} color={theme.textMuted} />
                        <Text style={[styles.untaggedBadgeText, { color: theme.textSecondary }]}>
                          Add Location
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.amountCol}>
                <Text
                  style={[
                    styles.amountText,
                    { color: isIncome ? theme.income : theme.text },
                  ]}
                >
                  {isIncome ? "+" : "-"}
                  {formatMoney(item.amount)}
                </Text>
                <Text style={[styles.merchantText, { color: theme.textMuted }]}>
                  {item.merchant || (isIncome ? "Deposit" : "Direct")}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
          },
        ]}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/add-transaction",
            params: { returnTo: "/(tabs)/transactions" },
          })
        }
        activeOpacity={0.85}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Quick Location Tagging Modal */}
      <Modal
        visible={Boolean(quickTagTx)}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickTagTx(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalSectionLabel, { color: theme.primary }]}>LOCATION TAGGING</Text>
                <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                  {quickTagTx?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setQuickTagTx(null)}>
                <Feather name="x" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Amount: {formatMoney(quickTagTx?.amount || 0)} • {quickTagTx?.category}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
              ]}
              placeholder="e.g. Tech Junction, KNUST Campus, or custom..."
              placeholderTextColor={theme.textMuted}
              value={quickLocInput}
              onChangeText={setQuickLocInput}
            />

            <Text style={[styles.modalSectionLabel, { color: theme.textSecondary }]}>
              QUICK PRESETS
            </Text>
            <View style={styles.presetsGrid}>
              {[
                "Home / Hostel",
                "KNUST Campus",
                "Tech Junction",
                "Kejetia Market",
                "Ayigya Commute",
                "Adum Business District",
              ].map((loc) => {
                const isSelected = quickLocInput === loc;
                return (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.modalLocChip,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      if (quickTagTx) {
                        updateTransaction({
                          ...quickTagTx,
                          locationLabel: loc,
                        });
                        setQuickTagTx(null);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.modalLocChipText,
                        { color: isSelected ? theme.primary : theme.text },
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalBtnRow}>
              {quickTagTx?.locationLabel && (
                <TouchableOpacity
                  style={[styles.modalClearBtn, { borderColor: theme.border }]}
                  onPress={() => {
                    if (quickTagTx) {
                      updateTransaction({
                        ...quickTagTx,
                        locationLabel: undefined,
                      });
                      setQuickTagTx(null);
                    }
                  }}
                >
                  <Text style={[styles.modalClearText, { color: "#F43F5E" }]}>Remove Tag</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: theme.primary, flex: quickTagTx?.locationLabel ? 1 : undefined, width: quickTagTx?.locationLabel ? undefined : "100%" },
                ]}
                onPress={() => {
                  if (quickTagTx) {
                    updateTransaction({
                      ...quickTagTx,
                      locationLabel: quickLocInput.trim() || undefined,
                    });
                    setQuickTagTx(null);
                  }
                }}
              >
                <Feather name="check" size={15} color="#FFFFFF" />
                <Text style={styles.modalSaveText}>Save Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  scanBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: "600" },

  filterScroll: { flexDirection: "row", marginBottom: 14 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: { fontSize: 12, fontWeight: "800" },

  anomalyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
    borderRadius: 16,
    padding: 12,
    gap: 10,
    marginBottom: 12,
  },
  anomalyIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  anomalyBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  anomalyTitle: { fontSize: 12, fontWeight: "800", color: "#F43F5E", flex: 1 },
  flaggedBadge: {
    backgroundColor: "#F43F5E",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  flaggedText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900" },
  anomalyReason: { fontSize: 11, color: "#E11D48", marginTop: 2 },

  recordsMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  recordsCount: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  recordsHint: { fontSize: 10, fontWeight: "600" },

  emptyBox: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 36,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 14, fontWeight: "800" },
  emptySub: { fontSize: 12, textAlign: "center", lineHeight: 18 },

  txCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  monogramBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monogramText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  txInfo: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  txTitle: { fontSize: 14, fontWeight: "800", flexShrink: 1 },
  subPill: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  subPillText: { color: "#8B5CF6", fontSize: 9, fontWeight: "800" },
  txSub: { fontSize: 11, marginTop: 2 },
  amountCol: { alignItems: "flex-end" },
  amountText: { fontSize: 14, fontWeight: "900" },
  merchantText: { fontSize: 10, marginTop: 2 },
  locBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  locBadgeText: { fontSize: 10, fontWeight: "700" },
  untaggedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    alignSelf: "flex-start",
  },
  untaggedBadgeText: { fontSize: 10, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", marginTop: 2 },
  modalSub: { fontSize: 12, marginBottom: 14 },
  modalInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalSectionLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  presetsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  modalLocChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalLocChipText: { fontSize: 11, fontWeight: "700" },
  modalBtnRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  modalClearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  modalClearText: { fontSize: 12, fontWeight: "700" },
  modalSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modalSaveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});