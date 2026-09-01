import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../src/types/finance";

export default function AddTransaction() {
  const { addTransaction } = useFinance();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function saveTransaction() {
    if (!title || !amount || !category) {
      Alert.alert("Missing Information", "Please fill title, amount, and select a category.");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount.");
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      title,
      amount: Number(amount),
      type,
      category,
      description,
      date: new Date().toISOString(),
    };

    addTransaction(transaction);
    router.back();
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={[styles.title, { color: theme.text }]}>Add Transaction</Text>

      {/* Type Selector */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "expense" && { backgroundColor: "#FEE2E2", borderColor: "#DC2626" },
            type !== "expense" && { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => { setType("expense"); setCategory(""); }}
        >
          <Text style={[
            styles.typeText,
            { color: type === "expense" ? "#DC2626" : theme.textSecondary }
          ]}>
            💸 Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "income" && { backgroundColor: "#D1FAE5", borderColor: "#059669" },
            type !== "income" && { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => { setType("income"); setCategory(""); }}
        >
          <Text style={[
            styles.typeText,
            { color: type === "income" ? "#059669" : theme.textSecondary }
          ]}>
            💰 Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={[styles.currencyLabel, { color: theme.textSecondary }]}>GH₵</Text>
        <TextInput
          placeholder="0.00"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          style={[styles.amountInput, { color: theme.text }]}
        />
      </View>

      {/* Title */}
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TITLE</Text>
      <TextInput
        placeholder="e.g., Jollof at Papaye"
        placeholderTextColor="#94A3B8"
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
      />

      {/* Category Picker */}
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
      <View style={styles.categoryGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.categoryChip,
              {
                backgroundColor: category === cat.name ? cat.color + "20" : theme.card,
                borderColor: category === cat.name ? cat.color : theme.border,
              },
            ]}
            onPress={() => setCategory(cat.name)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[
              styles.categoryText,
              { color: category === cat.name ? cat.color : theme.text }
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>DESCRIPTION (OPTIONAL)</Text>
      <TextInput
        placeholder="Add a note..."
        placeholderTextColor="#94A3B8"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
        ]}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveTransaction} activeOpacity={0.8}>
        <Text style={styles.saveText}>SAVE TRANSACTION</Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.border }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 16, marginBottom: 24 },

  typeRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  typeText: { fontSize: 16, fontWeight: "700" },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  currencyLabel: { fontSize: 20, fontWeight: "600", marginRight: 8 },
  amountInput: { fontSize: 42, fontWeight: "800", flex: 1 },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryIcon: { fontSize: 16 },
  categoryText: { fontSize: 13, fontWeight: "600" },

  saveButton: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 1 },

  cancelButton: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 1,
  },
  cancelText: { fontSize: 15, fontWeight: "600" },
});