import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../src/types/finance";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";

export default function EditTransactionScreen() {
  const { transactions, updateTransaction, deleteTransaction } = useFinance();
  const { theme } = useTheme();
  const { currency } = useSettings();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; returnTo?: string }>();
  const handleBack = useSubFeatureBack("/(tabs)/transactions");

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const tx = transactions.find((t) => t.id === params.id);

  const [type, setType] = useState<"income" | "expense">(tx?.type || "expense");
  const [title, setTitle] = useState(tx?.title || "");
  const [amount, setAmount] = useState(tx ? String(tx.amount) : "");
  const [category, setCategory] = useState(tx?.category || "Food & Dining");
  const [description, setDescription] = useState(tx?.description || "");
  const [merchant, setMerchant] = useState(tx?.merchant || "");
  const [isSubscription, setIsSubscription] = useState(tx?.isSubscription || false);
  const [locationLabel, setLocationLabel] = useState(tx?.locationLabel || "");

  if (!tx) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>Transaction not found.</Text>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.back()}>
          <Text style={{ color: theme.primary, fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    updateTransaction({
      ...tx,
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      description: description.trim() || undefined,
      merchant: merchant.trim() || undefined,
      isSubscription,
      locationLabel: type === "expense" ? (locationLabel.trim() || undefined) : undefined,
    });

    Alert.alert("Updated", "Transaction saved.", [
      { text: "OK", onPress: handleBack },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Delete Transaction", `Permanently delete "${tx.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTransaction(tx.id);
          handleBack();
        },
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Edit Transaction</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Feather name="trash-2" size={18} color="#F43F5E" />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Direction Toggle */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>DIRECTION</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              type === "expense"
                ? { backgroundColor: "rgba(244, 63, 94, 0.12)", borderColor: "#F43F5E" }
                : { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            onPress={() => {
              setType("expense");
              setCategory("Food & Dining");
            }}
          >
            <Text
              style={[
                styles.toggleText,
                { color: type === "expense" ? "#F43F5E" : theme.textSecondary },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              type === "income"
                ? { backgroundColor: "rgba(16, 185, 129, 0.12)", borderColor: "#10B981" }
                : { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            onPress={() => {
              setType("income");
              setCategory("Salary");
            }}
          >
            <Text
              style={[
                styles.toggleText,
                { color: type === "income" ? "#10B981" : theme.textSecondary },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={[styles.amountBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginBottom: 2 }]}>
            AMOUNT ({currency.code})
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>
              {currency.symbol}
            </Text>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>TITLE OR PURPOSE</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Picker */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
        <View style={styles.catGrid}>
          {categories.map((cat) => {
            const isSelected = category.toLowerCase() === cat.name.toLowerCase();
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isSelected ? theme.primaryLight : theme.background,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text
                  style={[
                    styles.catText,
                    {
                      color: isSelected ? theme.primary : theme.text,
                      fontWeight: isSelected ? "800" : "600",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Merchant & Recurring */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>MERCHANT / PAYEE</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          placeholder="e.g. Shoprite, ECG"
          placeholderTextColor={theme.textMuted}
          value={merchant}
          onChangeText={setMerchant}
        />

        <View style={[styles.recurringRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.recurringTitle, { color: theme.text }]}>Recurring Subscription</Text>
            <Text style={[styles.recurringSub, { color: theme.textSecondary }]}>
              Repeats automatically each cycle
            </Text>
          </View>
          <Switch
            value={isSubscription}
            onValueChange={setIsSubscription}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {/* Note / Memo */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>NOTE OR MEMO</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        {/* SPENDING LOCATION (EXPENSES) */}
        {type === "expense" && (
          <View style={{ marginTop: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
                SPENDING LOCATION {locationLabel ? `(${locationLabel})` : "(OPTIONAL / USER INPUT)"}
              </Text>
              {locationLabel ? (
                <TouchableOpacity onPress={() => setLocationLabel("")}>
                  <Text style={{ fontSize: 11, color: theme.primary, fontWeight: "700" }}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Tech Junction, KNUST Campus, or custom..."
              placeholderTextColor={theme.textMuted}
              value={locationLabel}
              onChangeText={setLocationLabel}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 6 }}>
              {["Home / Hostel", "KNUST Campus", "Tech Junction", "Kejetia Market", "Ayigya Commute", "Adum Business District"].map((loc) => {
                const isSelected = locationLabel === loc;
                return (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.locChip,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setLocationLabel(isSelected ? "" : loc)}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: isSelected ? theme.primary : theme.textSecondary }}>
                      {loc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          style={[styles.saveBtn, { backgroundColor: theme.primary, marginTop: 22 }]}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>UPDATE TRANSACTION</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  backText: { fontSize: 13, fontWeight: "700" },
  screenTitle: { fontSize: 18, fontWeight: "900" },

  card: { borderRadius: 24, borderWidth: 1, padding: 20 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 6,
  },

  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  toggleText: { fontSize: 13, fontWeight: "800" },

  amountBox: { borderRadius: 18, borderWidth: 1, padding: 14, marginTop: 14 },
  amountInputRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  currencySymbol: { fontSize: 26, fontWeight: "900" },
  amountInput: { flex: 1, fontSize: 28, fontWeight: "900", padding: 0 },

  input: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: "600",
  },

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catText: { fontSize: 12 },

  recurringRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  recurringTitle: { fontSize: 13, fontWeight: "800" },
  recurringSub: { fontSize: 10, marginTop: 1 },

  textArea: {
    minHeight: 70,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    fontWeight: "600",
    textAlignVertical: "top",
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  locChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
});