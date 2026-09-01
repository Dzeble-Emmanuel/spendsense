import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Clipboard,
} from "react-native";
import { router } from "expo-router";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { parseFinancialSMS } from "../../src/sms/smsParser";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../src/types/finance";

export default function SMSImport() {
  const { addTransaction } = useFinance();
  const { theme } = useTheme();

  const [smsText, setSmsText] = useState("");
  const [parsed, setParsed] = useState<ReturnType<typeof parseFinancialSMS> | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Other");
  const [editType, setEditType] = useState<"income" | "expense">("expense");

  async function pasteSMS() {
    try {
      const text = await Clipboard.getString();
      if (text) setSmsText(text);
    } catch {
      Alert.alert("Clipboard Error", "Could not read clipboard. Please paste manually.");
    }
  }

  function analyzeSMS() {
    if (!smsText.trim()) {
      Alert.alert("Empty", "Please paste an SMS message first.");
      return;
    }
    const result = parseFinancialSMS(smsText);
    setParsed(result);
    if (result.isFinancial) {
      setEditAmount(result.amount ? result.amount.toString() : "");
      setEditTitle(result.title || "Mobile Transaction");
      setEditCategory(result.category || "Other");
      setEditType(result.type || "expense");
    }
  }

  function saveTransaction() {
    if (!editAmount || isNaN(parseFloat(editAmount))) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    addTransaction({
      id: Date.now().toString(),
      title: editTitle,
      amount: parseFloat(editAmount),
      type: editType,
      category: editCategory,
      description: `Imported from SMS: ${smsText.substring(0, 60)}`,
      date: new Date().toISOString(),
    });
    Alert.alert("✅ Saved!", "Transaction imported from SMS.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  const categories = editType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text }]}>📩 SMS Import</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Copy a financial SMS (MoMo, bank alert, etc.) and paste it here to auto-extract the transaction.
      </Text>

      {/* How-to guide */}
      <View style={[styles.guideCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.guideTitle, { color: theme.text }]}>How to use:</Text>
        <Text style={[styles.guideStep, { color: theme.textSecondary }]}>1. Open your SMS app</Text>
        <Text style={[styles.guideStep, { color: theme.textSecondary }]}>2. Long-press a MoMo or bank SMS</Text>
        <Text style={[styles.guideStep, { color: theme.textSecondary }]}>3. Tap "Copy" or "Select All"</Text>
        <Text style={[styles.guideStep, { color: theme.textSecondary }]}>4. Come back here and tap "Paste SMS"</Text>
      </View>

      {/* SMS Input */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>SMS MESSAGE</Text>
      <TextInput
        style={[styles.smsInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        value={smsText}
        onChangeText={setSmsText}
        placeholder="Paste your SMS text here..."
        placeholderTextColor={theme.textSecondary}
        multiline
        numberOfLines={5}
      />

      <View style={styles.smsButtons}>
        <TouchableOpacity
          style={[styles.pasteBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={pasteSMS}
        >
          <Text style={[styles.pasteBtnText, { color: theme.primary }]}>📋 Paste SMS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeSMS}>
          <Text style={styles.analyzeBtnText}>🔍 Analyze</Text>
        </TouchableOpacity>
      </View>

      {/* Result */}
      {parsed && (
        <>
          {!parsed.isFinancial ? (
            <View style={[styles.notFinancialCard, { backgroundColor: theme.card }]}>
              <Text style={styles.notFinancialIcon}>🤷</Text>
              <Text style={[styles.notFinancialText, { color: theme.textSecondary }]}>
                This doesn't look like a financial SMS. Try a MoMo, bank, or airtime message.
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.resultBanner, { backgroundColor: "#064E3B" }]}>
                <Text style={styles.resultBannerText}>
                  ✅ Financial SMS detected! Review details below.
                </Text>
              </View>

              {/* Type */}
              <Text style={[styles.label, { color: theme.textSecondary }]}>TYPE</Text>
              <View style={styles.typeRow}>
                {(["expense", "income"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, {
                      backgroundColor: editType === t
                        ? (t === "income" ? "#D1FAE5" : "#FEE2E2")
                        : theme.card,
                      borderColor: editType === t
                        ? (t === "income" ? "#059669" : "#DC2626")
                        : theme.border,
                    }]}
                    onPress={() => setEditType(t)}
                  >
                    <Text style={{ color: editType === t ? (t === "income" ? "#059669" : "#DC2626") : theme.text, fontWeight: "700" }}>
                      {t === "income" ? "💰 Income" : "💸 Expense"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>TITLE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Transaction title"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>AMOUNT (GH₵)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[styles.catChip, {
                      backgroundColor: editCategory === cat.name ? cat.color + "20" : theme.card,
                      borderColor: editCategory === cat.name ? cat.color : theme.border,
                    }]}
                    onPress={() => setEditCategory(cat.name)}
                  >
                    <Text>{cat.icon}</Text>
                    <Text style={{ color: editCategory === cat.name ? cat.color : theme.text, fontSize: 12, fontWeight: "600" }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveTransaction}>
                <Text style={styles.saveButtonText}>💾 Save Transaction</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "800", marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  input: { height: 50, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },

  guideCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  guideTitle: { fontWeight: "700", fontSize: 14, marginBottom: 10 },
  guideStep: { fontSize: 13, marginBottom: 4, paddingLeft: 4 },

  smsInput: { borderRadius: 14, padding: 14, fontSize: 14, borderWidth: 1, minHeight: 100, textAlignVertical: "top", lineHeight: 20 },
  smsButtons: { flexDirection: "row", gap: 10, marginTop: 12 },
  pasteBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  pasteBtnText: { fontWeight: "700", fontSize: 14 },
  analyzeBtn: { flex: 1, height: 46, borderRadius: 12, backgroundColor: "#7C3AED", justifyContent: "center", alignItems: "center" },
  analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  resultBanner: { padding: 14, borderRadius: 14, marginTop: 20, marginBottom: 4 },
  resultBannerText: { color: "#34D399", fontWeight: "600", fontSize: 13 },

  notFinancialCard: { borderRadius: 16, padding: 24, alignItems: "center", marginTop: 20 },
  notFinancialIcon: { fontSize: 40, marginBottom: 12 },
  notFinancialText: { fontSize: 14, textAlign: "center", lineHeight: 22 },

  typeRow: { flexDirection: "row", gap: 12 },
  typeBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1.5 },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 12, borderWidth: 1.5, gap: 6 },

  saveButton: { backgroundColor: "#059669", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
