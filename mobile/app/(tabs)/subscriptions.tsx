import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert,
} from "react-native";
import { useSubscriptions } from "../../src/hooks/useSubscriptions";
import { useTheme } from "../../src/hooks/useTheme";
import {
  Subscription, BILLING_CYCLES, SUBSCRIPTION_TEMPLATES,
  daysUntilDue, getMonthlyEquivalent,
} from "../../src/types/subscription";

type FormState = {
  name: string;
  amount: string;
  billingCycle: Subscription["billingCycle"];
  category: string;
  icon: string;
  color: string;
  nextDueDate: string;
  notes: string;
};

const DEFAULT_FORM: FormState = {
  name: "", amount: "", billingCycle: "monthly",
  category: "Entertainment", icon: "📦", color: "#6B7280",
  nextDueDate: new Date().toISOString().split("T")[0], notes: "",
};

export default function Subscriptions() {
  const { subscriptions, addSubscription, deleteSubscription, monthlyTotal, yearlyTotal, dueSoon } = useSubscriptions();
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  function selectTemplate(tpl: typeof SUBSCRIPTION_TEMPLATES[0]) {
    setForm(f => ({ ...f, name: tpl.name, icon: tpl.icon, color: tpl.color, category: tpl.category }));
  }

  function saveSubscription() {
    if (!form.name || !form.amount) {
      Alert.alert("Missing Info", "Please fill in the name and amount.");
      return;
    }
    addSubscription({
      name: form.name,
      amount: parseFloat(form.amount),
      billingCycle: form.billingCycle,
      category: form.category,
      icon: form.icon,
      color: form.color,
      nextDueDate: form.nextDueDate,
      notes: form.notes,
      isActive: true,
      startedDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(false);
    setForm(DEFAULT_FORM);
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete Subscription", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSubscription(id) },
    ]);
  }

  function getDueLabel(sub: Subscription) {
    const days = daysUntilDue(sub.nextDueDate);
    if (days < 0) return { text: `Overdue by ${Math.abs(days)}d`, color: "#DC2626" };
    if (days === 0) return { text: "Due today!", color: "#DC2626" };
    if (days <= 3) return { text: `Due in ${days}d`, color: "#D97706" };
    return { text: `Due in ${days}d`, color: "#64748B" };
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={[styles.title, { color: theme.text }]}>Subscriptions</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Track your recurring payments</Text>

      {/* Due soon alert */}
      {dueSoon.length > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertText}>
            ⚠️ {dueSoon.length} subscription{dueSoon.length > 1 ? "s" : ""} due soon:{" "}
            {dueSoon.map(s => s.name).join(", ")}
          </Text>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#1E293B" }]}>
          <Text style={styles.summaryLabel}>Monthly</Text>
          <Text style={styles.summaryValue}>GH₵ {monthlyTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#1E293B" }]}>
          <Text style={styles.summaryLabel}>Yearly</Text>
          <Text style={styles.summaryValue}>GH₵ {yearlyTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>+ Add Subscription</Text>
      </TouchableOpacity>

      {/* Subscription List */}
      {subscriptions.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No subscriptions yet</Text>
          <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>Track Netflix, Spotify, MTN bundles & more</Text>
        </View>
      ) : (
        subscriptions.map((sub) => {
          const dueInfo = getDueLabel(sub);
          const monthly = getMonthlyEquivalent(sub.amount, sub.billingCycle);
          return (
            <TouchableOpacity
              key={sub.id}
              style={[styles.subCard, { backgroundColor: theme.card }]}
              onLongPress={() => confirmDelete(sub.id, sub.name)}
              activeOpacity={0.8}
            >
              <View style={[styles.subIconBg, { backgroundColor: sub.color + "20" }]}>
                <Text style={styles.subIcon}>{sub.icon}</Text>
              </View>
              <View style={styles.subInfo}>
                <Text style={[styles.subName, { color: theme.text }]}>{sub.name}</Text>
                <Text style={[styles.subMeta, { color: theme.textSecondary }]}>
                  {sub.billingCycle.charAt(0).toUpperCase() + sub.billingCycle.slice(1)} • {sub.category}
                </Text>
                <Text style={[styles.subDue, { color: dueInfo.color }]}>{dueInfo.text}</Text>
              </View>
              <View style={styles.subRight}>
                <Text style={[styles.subAmount, { color: theme.text }]}>GH₵ {sub.amount.toFixed(2)}</Text>
                <Text style={[styles.subMonthly, { color: theme.textSecondary }]}>
                  GH₵ {monthly.toFixed(2)}/mo
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Subscription</Text>

              {/* Templates */}
              <Text style={[styles.label, { color: theme.textSecondary }]}>QUICK SELECT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
                {SUBSCRIPTION_TEMPLATES.map((tpl) => (
                  <TouchableOpacity
                    key={tpl.name}
                    style={[styles.templateChip, { backgroundColor: form.icon === tpl.icon ? tpl.color + "30" : theme.background, borderColor: form.icon === tpl.icon ? tpl.color : theme.border }]}
                    onPress={() => selectTemplate(tpl)}
                  >
                    <Text>{tpl.icon}</Text>
                    <Text style={[styles.templateName, { color: theme.text }]}>{tpl.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.textSecondary }]}>NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={form.name}
                onChangeText={(v) => setForm(f => ({ ...f, name: v }))}
                placeholder="e.g. Netflix"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>AMOUNT (GH₵)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={form.amount}
                onChangeText={(v) => setForm(f => ({ ...f, amount: v }))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>BILLING CYCLE</Text>
              <View style={styles.cycleRow}>
                {BILLING_CYCLES.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.cycleChip, { backgroundColor: form.billingCycle === c.value ? "#2563EB" : theme.background, borderColor: form.billingCycle === c.value ? "#2563EB" : theme.border }]}
                    onPress={() => setForm(f => ({ ...f, billingCycle: c.value }))}
                  >
                    <Text style={{ color: form.billingCycle === c.value ? "#fff" : theme.text, fontSize: 12, fontWeight: "600" }}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>NEXT DUE DATE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={form.nextDueDate}
                onChangeText={(v) => setForm(f => ({ ...f, nextDueDate: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setShowModal(false)}>
                  <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveSubscription}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },

  alertCard: { backgroundColor: "#78350F", padding: 14, borderRadius: 14, marginBottom: 16 },
  alertText: { color: "#FDE68A", fontSize: 13 },

  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 18, alignItems: "center" },
  summaryLabel: { color: "#94A3B8", fontSize: 12, marginBottom: 4 },
  summaryValue: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },

  addButton: { backgroundColor: "#2563EB", padding: 16, borderRadius: 14, alignItems: "center", marginBottom: 20 },
  addButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },

  emptyCard: { padding: 40, borderRadius: 20, alignItems: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptyHint: { fontSize: 13, marginTop: 6, textAlign: "center" },

  subCard: { flexDirection: "row", padding: 16, borderRadius: 16, marginBottom: 8, alignItems: "center" },
  subIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 12 },
  subIcon: { fontSize: 22 },
  subInfo: { flex: 1 },
  subName: { fontSize: 15, fontWeight: "700" },
  subMeta: { fontSize: 12, marginTop: 2 },
  subDue: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  subRight: { alignItems: "flex-end" },
  subAmount: { fontSize: 15, fontWeight: "700" },
  subMonthly: { fontSize: 11, marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, borderWidth: 1, marginBottom: 4 },
  templateScroll: { marginBottom: 8 },
  templateChip: { flexDirection: "column", alignItems: "center", padding: 10, borderRadius: 14, marginRight: 8, borderWidth: 1.5, minWidth: 64 },
  templateName: { fontSize: 10, fontWeight: "600", marginTop: 4, textAlign: "center" },
  cycleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cycleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  cancelBtnText: { fontWeight: "600" },
  saveBtn: { flex: 2, height: 48, borderRadius: 12, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
