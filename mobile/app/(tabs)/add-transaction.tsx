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
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PREDEFINED_LOCATIONS } from "../../src/types/finance";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";

export default function AddTransactionScreen() {
  const { addTransaction, updateTransaction, transactions } = useFinance();
  const { theme } = useTheme();
  const { currency } = useSettings();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; type?: string; returnTo?: string }>();
  const handleBack = useSubFeatureBack("/(tabs)/transactions");

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const existingTx = params.id ? transactions.find((t) => t.id === params.id) : null;
  const isEditing = Boolean(existingTx);

  const [type, setType] = useState<"income" | "expense">(
    (existingTx?.type as "income" | "expense") ||
      (params.type === "income" ? "income" : "expense")
  );
  const [title, setTitle] = useState(existingTx?.title || "");
  const [amount, setAmount] = useState(existingTx ? String(existingTx.amount) : "");
  const [category, setCategory] = useState(
    existingTx?.category || (type === "income" ? "Salary" : "Food & Dining")
  );
  const [description, setDescription] = useState(existingTx?.description || "");
  const [merchant, setMerchant] = useState(existingTx?.merchant || "");
  const [isSubscription, setIsSubscription] = useState(existingTx?.isSubscription || false);
  const [locationLabel, setLocationLabel] = useState(
    existingTx?.locationLabel || (existingTx?.category === "Bills & Utilities" ? "Home / Hostel" : "")
  );
  const [customLocInput, setCustomLocInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategory(newType === "income" ? "Salary" : "Food & Dining");
  };

  const handleCategorySelect = (catName: string) => {
    setCategory(catName);
    // Only auto-determine Home / Hostel for rent and utilities
    if (catName === "Bills & Utilities" && !locationLabel) {
      setLocationLabel("Home / Hostel");
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title or purpose for this entry.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    if (isEditing && existingTx) {
      updateTransaction({
        ...existingTx,
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        description: description.trim() || undefined,
        merchant: merchant.trim() || undefined,
        isSubscription,
        locationLabel: type === "expense" ? (locationLabel.trim() || undefined) : undefined,
      });
      Alert.alert("Updated", "Transaction has been updated.", [
        { text: "OK", onPress: handleBack },
      ]);
    } else {
      addTransaction({
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        description: description.trim() || undefined,
        merchant: merchant.trim() || undefined,
        date: new Date().toISOString(),
        isSubscription,
        locationLabel: type === "expense" ? (locationLabel.trim() || undefined) : undefined,
      });
      Alert.alert("Saved", "Transaction saved successfully.", [
        { text: "OK", onPress: handleBack },
      ]);
    }
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
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: theme.text }]}>
          {isEditing ? "Edit Transaction" : "New Entry"}
        </Text>
        <View style={{ width: 45 }} />
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
            onPress={() => handleTypeChange("expense")}
            activeOpacity={0.8}
          >
            <Feather
              name="arrow-down-left"
              size={15}
              color={type === "expense" ? "#F43F5E" : theme.textSecondary}
            />
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
            onPress={() => handleTypeChange("income")}
            activeOpacity={0.8}
          >
            <Feather
              name="arrow-up-right"
              size={15}
              color={type === "income" ? "#10B981" : theme.textSecondary}
            />
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

        {/* Amount Box */}
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
          placeholder="e.g., Shoprite, ECG Bill, Freelance salary"
          placeholderTextColor={theme.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Picker with Color Dots */}
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
                onPress={() => handleCategorySelect(cat.name)}
                activeOpacity={0.7}
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
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>MERCHANT / PAYEE (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          placeholder="e.g., Shoprite, Bolt, ECG"
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

        {/* Semantic Location Tagging (User-inputted) */}
        {type === "expense" && (
          <View style={{ marginTop: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
                LOCATION (OPTIONAL)
              </Text>
              <Text style={{ fontSize: 9, fontWeight: "900", color: "#10B981" }}>USER-INPUT ONLY</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {PREDEFINED_LOCATIONS.map((loc) => {
                const isSelected = !showCustomInput && locationLabel === loc;
                return (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => {
                      setShowCustomInput(false);
                      setLocationLabel(isSelected ? "" : loc);
                    }}
                    style={[
                      styles.locChip,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Feather
                      name="map-pin"
                      size={11}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.locChipText,
                        {
                          color: isSelected ? theme.primary : theme.text,
                          fontWeight: isSelected ? "800" : "600",
                        },
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Custom Location Chip */}
              <TouchableOpacity
                onPress={() => setShowCustomInput(!showCustomInput)}
                style={[
                  styles.locChip,
                  {
                    backgroundColor: showCustomInput ? theme.primaryLight : theme.background,
                    borderColor: showCustomInput ? theme.primary : theme.border,
                  },
                ]}
              >
                <Feather
                  name="edit-3"
                  size={11}
                  color={showCustomInput ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.locChipText,
                    {
                      color: showCustomInput ? theme.primary : theme.text,
                      fontWeight: showCustomInput ? "800" : "600",
                    },
                  ]}
                >
                  Custom Location...
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Custom Location Text Input */}
            {showCustomInput && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                    marginTop: 8,
                    height: 42,
                    fontSize: 13,
                  },
                ]}
                placeholder="Enter custom location (e.g., Ahodwo, Asafo Market, Bantama)..."
                placeholderTextColor={theme.textMuted}
                value={customLocInput}
                onChangeText={(t) => {
                  setCustomLocInput(t);
                  setLocationLabel(t);
                }}
              />
            )}
          </View>
        )}

        {/* Note / Memo */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>NOTE OR MEMO (OPTIONAL)</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          placeholder="Add comments, receipt reference or notes..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          style={[styles.saveBtn, { backgroundColor: theme.primary, marginTop: 22 }]}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>
            {isEditing ? "UPDATE TRANSACTION" : "SAVE TRANSACTION"}
          </Text>
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

  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  toggleText: { fontSize: 13, fontWeight: "800" },

  amountBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 14,
  },
  amountInputRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  currencySymbol: { fontSize: 26, fontWeight: "900" },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    padding: 0,
  },

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

  locChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  locChipText: { fontSize: 11 },

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
});