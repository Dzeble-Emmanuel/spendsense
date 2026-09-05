import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { SUBSCRIPTION_TEMPLATES, Subscription } from "../../src/types/finance";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";

export default function SubscriptionsScreen() {
  const {
    subscriptions,
    addSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
  } = useFinance();
  const { theme } = useTheme();
  const { formatMoney, currency } = useSettings();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/profile");

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCycle, setFormCycle] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [formCategory, setFormCategory] = useState("Entertainment");
  const [formColor, setFormColor] = useState("#2563EB");
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split("T")[0]
  );
  const [formNotes, setFormNotes] = useState("");

  const activeSubs = subscriptions.filter((s) => s.isActive);
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (s.billingCycle === "weekly") return sum + s.amount * 4.33;
    if (s.billingCycle === "yearly") return sum + s.amount / 12;
    return sum + s.amount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const dueSoon = activeSubs.filter((s) => {
    const days = Math.ceil(
      (new Date(s.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days >= 0 && days <= 5;
  });

  const getDueLabel = (nextDueDate: string) => {
    const days = Math.ceil(
      (new Date(nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return { text: `Overdue ${Math.abs(days)}d`, color: "#F43F5E", bg: "rgba(244, 63, 94, 0.12)" };
    if (days === 0) return { text: "Due today!", color: "#F43F5E", bg: "rgba(244, 63, 94, 0.12)" };
    if (days <= 3) return { text: `Due in ${days}d`, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" };
    return { text: `Due in ${days}d`, color: theme.textSecondary, bg: theme.subCard };
  };

  const selectTemplate = (tpl: (typeof SUBSCRIPTION_TEMPLATES)[0]) => {
    setFormName(tpl.name);
    setFormAmount(String(tpl.amount));
    setFormColor(tpl.color);
    setFormCategory(tpl.category);
    setFormCycle(tpl.billingCycle);
  };

  const handleSave = () => {
    if (!formName.trim() || !formAmount) {
      Alert.alert("Missing Details", "Please provide a name and amount.");
      return;
    }
    const val = parseFloat(formAmount);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    addSubscription({
      name: formName.trim(),
      amount: val,
      billingCycle: formCycle,
      category: formCategory,
      icon: formName.slice(0, 2).toUpperCase(),
      color: formColor,
      nextDueDate: formDueDate,
      notes: formNotes.trim() || undefined,
      isActive: true,
      startedDate: new Date().toISOString().split("T")[0],
    });

    setShowModal(false);
    setFormName("");
    setFormAmount("");
    setFormNotes("");
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("Remove Subscription", `Remove "${name}" from recurring list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => deleteSubscription(id),
      },
    ]);
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
      {/* Title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { color: theme.text }]}>Subscriptions & Bills</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Monitor renewals & projected monthly obligations
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Due Soon Warning */}
      {dueSoon.length > 0 && (
        <View style={styles.dueSoonCard}>
          <Feather name="alert-triangle" size={16} color="#F59E0B" />
          <View style={{ flex: 1 }}>
            <Text style={styles.dueSoonTitle}>
              {dueSoon.length} Renewal{dueSoon.length > 1 ? "s" : ""} Approaching
            </Text>
            <Text style={styles.dueSoonSub}>
              {dueSoon.map((s) => `${s.name} (${formatMoney(s.amount)})`).join(" • ")}
            </Text>
          </View>
        </View>
      )}

      {/* Summary Metrics */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              MONTHLY OBLIGATION
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {formatMoney(monthlyTotal)}
            </Text>
            <Text style={[styles.summarySub, { color: theme.textMuted }]}>
              {activeSubs.length} active recurring
            </Text>
          </View>
          <View style={[styles.summaryIconBg, { backgroundColor: theme.primaryLight }]}>
            <Feather name="repeat" size={18} color={theme.primary} />
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              ANNUALIZED TOTAL
            </Text>
            <Text style={[styles.summaryValue, { color: theme.accent }]}>
              {formatMoney(yearlyTotal)}
            </Text>
            <Text style={[styles.summarySub, { color: theme.textMuted }]}>
              12-month projection
            </Text>
          </View>
          <View style={[styles.summaryIconBg, { backgroundColor: theme.accentLight }]}>
            <Feather name="credit-card" size={18} color={theme.accent} />
          </View>
        </View>
      </View>

      {/* Subscriptions List */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Subscriptions</Text>

      {subscriptions.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Feather name="repeat" size={36} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No subscriptions tracked yet</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            Add recurring subscriptions like Netflix, Spotify, or MTN to track cycles.
          </Text>
        </View>
      ) : (
        subscriptions.map((sub) => {
          const due = getDueLabel(sub.nextDueDate);
          const monthlyEquiv =
            sub.billingCycle === "yearly"
              ? sub.amount / 12
              : sub.billingCycle === "weekly"
              ? sub.amount * 4.33
              : sub.amount;
          const initials = sub.name.slice(0, 2).toUpperCase();

          return (
            <View
              key={sub.id}
              style={[
                styles.subItemCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  opacity: sub.isActive ? 1 : 0.65,
                },
              ]}
            >
              <View style={styles.subItemLeft}>
                <View
                  style={[
                    styles.subMonogram,
                    { backgroundColor: `${sub.color || "#2563EB"}20`, borderColor: `${sub.color || "#2563EB"}50` },
                  ]}
                >
                  <Text style={[styles.subMonogramText, { color: sub.color || theme.primary }]}>
                    {initials}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.subTitleRow}>
                    <Text style={[styles.subTitle, { color: theme.text }]} numberOfLines={1}>
                      {sub.name}
                    </Text>
                    <View style={[styles.dueBadge, { backgroundColor: due.bg }]}>
                      <Text style={[styles.dueBadgeText, { color: due.color }]}>{due.text}</Text>
                    </View>
                  </View>

                  <Text style={[styles.subDetails, { color: theme.textSecondary }]}>
                    {sub.billingCycle.toUpperCase()} • {sub.category} • Renews {sub.nextDueDate}
                  </Text>
                </View>
              </View>

              <View style={styles.subItemRight}>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.subAmount, { color: theme.text }]}>
                    {formatMoney(sub.amount)}
                  </Text>
                  <Text style={[styles.subMonthlyEquiv, { color: theme.textMuted }]}>
                    ~{formatMoney(monthlyEquiv)}/mo
                  </Text>
                </View>

                <View style={styles.subActions}>
                  <TouchableOpacity
                    style={[
                      styles.statusPill,
                      sub.isActive
                        ? { backgroundColor: "rgba(16, 185, 129, 0.12)", borderColor: "#10B981" }
                        : { backgroundColor: theme.subCard, borderColor: theme.border },
                    ]}
                    onPress={() => toggleSubscriptionActive(sub.id)}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: sub.isActive ? "#10B981" : theme.textMuted },
                      ]}
                    >
                      {sub.isActive ? "Active" : "Paused"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(sub.id, sub.name)}
                  >
                    <Feather name="trash-2" size={15} color="#F43F5E" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })
      )}

      {/* Add Subscription Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalTop}>
              <Text style={[styles.modalHeading, { color: theme.text }]}>Add Subscription</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>POPULAR SERVICES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {SUBSCRIPTION_TEMPLATES.map((tpl) => (
                <TouchableOpacity
                  key={tpl.name}
                  style={[styles.presetChip, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => selectTemplate(tpl)}
                >
                  <View style={[styles.presetMonogram, { backgroundColor: `${tpl.color}25` }]}>
                    <Text style={[styles.presetMonogramText, { color: tpl.color }]}>
                      {tpl.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.presetName, { color: theme.text }]} numberOfLines={1}>
                    {tpl.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>SERVICE NAME</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g., Netflix, Spotify, MTN Fiber"
              placeholderTextColor={theme.textMuted}
              value={formName}
              onChangeText={setFormName}
            />

            <View style={styles.inputSplitRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>AMOUNT ({currency.code})</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="decimal-pad"
                  value={formAmount}
                  onChangeText={setFormAmount}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>BILLING CYCLE</Text>
                <View style={styles.cycleBtnRow}>
                  {(["monthly", "yearly", "weekly"] as const).map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.cycleBtn,
                        formCycle === c
                          ? { backgroundColor: theme.primary, borderColor: theme.primary }
                          : { backgroundColor: theme.background, borderColor: theme.border },
                      ]}
                      onPress={() => setFormCycle(c)}
                    >
                      <Text
                        style={[
                          styles.cycleBtnText,
                          { color: formCycle === c ? "#FFFFFF" : theme.textSecondary },
                        ]}
                      >
                        {c.slice(0, 2).toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>NEXT RENEWAL DATE (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              value={formDueDate}
              onChangeText={setFormDueDate}
            />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Shared with family"
              placeholderTextColor={theme.textMuted}
              value={formNotes}
              onChangeText={setFormNotes}
            />

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.modalSubmitText}>Save Subscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  dueSoonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    marginBottom: 14,
  },
  dueSoonTitle: { fontSize: 12, fontWeight: "800", color: "#F59E0B" },
  dueSoonSub: { fontSize: 11, color: "#D97706", marginTop: 1 },

  summaryGrid: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  summaryLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  summaryValue: { fontSize: 16, fontWeight: "900", marginTop: 3 },
  summarySub: { fontSize: 10, marginTop: 2 },
  summaryIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },

  emptyBox: {
    padding: 36,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 14, fontWeight: "800" },
  emptySub: { fontSize: 12, textAlign: "center", lineHeight: 18 },

  subItemCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  subItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  subMonogram: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subMonogramText: { fontSize: 13, fontWeight: "900" },
  subTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  subTitle: { fontSize: 14, fontWeight: "800", flexShrink: 1 },
  dueBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  dueBadgeText: { fontSize: 9, fontWeight: "800" },
  subDetails: { fontSize: 11, marginTop: 2 },

  subItemRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.15)",
    paddingTop: 8,
  },
  subAmount: { fontSize: 14, fontWeight: "900" },
  subMonthlyEquiv: { fontSize: 10, marginTop: 1 },
  subActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: { fontSize: 10, fontWeight: "800" },
  deleteBtn: { padding: 6 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: "90%",
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalHeading: { fontSize: 16, fontWeight: "900" },
  modalLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 5 },
  presetChip: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 64,
    marginRight: 6,
  },
  presetMonogram: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  presetMonogramText: { fontSize: 10, fontWeight: "900" },
  presetName: { fontSize: 10, fontWeight: "700" },

  modalInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  inputSplitRow: { flexDirection: "row", gap: 10 },
  cycleBtnRow: { flexDirection: "row", gap: 4 },
  cycleBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cycleBtnText: { fontSize: 11, fontWeight: "800" },
  modalSubmitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  modalSubmitText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
