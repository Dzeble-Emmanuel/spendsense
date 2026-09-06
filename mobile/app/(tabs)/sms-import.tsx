import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Clipboard,
  Switch,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";
import { useMoMoListener } from "../../src/hooks/useMoMoListener";
import { useAuth } from "../../src/context/AuthContext";
import UnverifiedFeatureGate from "../../src/components/common/UnverifiedFeatureGate";
import { parseFinancialSMS, ParsedSMSResult } from "../../src/sms/smsParser";
import { SAMPLE_MOMO_ALERTS } from "../../src/services/smsService";

export default function SMSImportScreen() {
  const { user } = useAuth();
  const { addTransaction } = useFinance();
  const { theme } = useTheme();
  const { formatMoney } = useSettings();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/profile");

  if (!user?.isEmailVerified) {
    return (
      <UnverifiedFeatureGate
        featureName="MoMo SMS Auto-Sync"
        featureDescription="Email verification is required to enable automated Mobile Money SMS background parsing and live payment synchronization."
        iconName="message-square"
        onBack={handleBack}
      />
    );
  }

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const {
    permissions,
    autoSync,
    recentImports,
    requestPermissions,
    toggleAutoSync,
    simulateIncomingAlert,
  } = useMoMoListener();

  const [smsText, setSmsText] = useState("");
  const [parsed, setParsed] = useState<ParsedSMSResult | null>(null);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setSmsText(text);
        const res = parseFinancialSMS(text);
        setParsed(res);
      } else {
        Alert.alert("Clipboard Empty", "No text found on clipboard.");
      }
    } catch {
      Alert.alert("Clipboard", "Please paste your message directly into the box.");
    }
  };

  const handleAnalyze = () => {
    if (!smsText.trim()) {
      Alert.alert("Empty", "Please paste an SMS alert first.");
      return;
    }
    const res = parseFinancialSMS(smsText);
    setParsed(res);
  };

  const handleSave = () => {
    if (!parsed || !parsed.isFinancial || !parsed.amount) return;

    addTransaction({
      title: parsed.title,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      description: `SMS Import (${parsed.provider}): ${smsText.slice(0, 60)}...`,
      date: new Date().toISOString(),
      locationLabel: parsed.type === "expense" ? (parsed.locationLabel?.trim() || undefined) : undefined,
    });

    Alert.alert("Added", "Transaction saved directly to ledger.", [
      { text: "View Transactions", onPress: () => router.push("/(tabs)/transactions") },
      { text: "OK", style: "cancel" },
    ]);
  };

  const handleTriggerSimulation = async (index: number) => {
    const { sample, result } = await simulateIncomingAlert(index);
    if (result.success) {
      setSimulationToast(`Detected & Logged: ${result.parsed.title} (${formatMoney(result.parsed.amount || 0)})`);
      setTimeout(() => setSimulationToast(null), 4000);
    } else if (result.isDuplicate) {
      setSimulationToast(`Already logged: ${result.parsed.title}`);
      setTimeout(() => setSimulationToast(null), 3000);
    }
  };

  const isPermissionsActive = permissions.isFullyGranted;

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>SMS & MoMo Sync</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* Simulation Feedback Toast */}
      {simulationToast && (
        <View style={[styles.toastCard, { backgroundColor: theme.card, borderColor: "#10B981" }]}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={[styles.toastText, { color: theme.text }]} numberOfLines={2}>
            {simulationToast}
          </Text>
        </View>
      )}

      {/* AUTOMATIC MOMO & BANK SMS DETECTION CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardTopRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>AUTOMATIC DETECTION</Text>
              <Text style={[styles.cardHeading, { color: theme.text }]}>MoMo & Bank SMS Sync</Text>
            </View>
          </View>
          <Switch
            value={autoSync}
            onValueChange={toggleAutoSync}
            trackColor={{ false: "rgba(100, 116, 139, 0.2)", true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={[styles.guideText, { color: theme.textSecondary }]}>
          SpendSense automatically reads incoming transactional SMS from MTN MoMo, Telecel Cash,
          AT Money, and bank alerts so they appear instantly in your ledger without manual entry.
        </Text>

        {/* Permission Status Pill */}
        <View style={[styles.statusBanner, { backgroundColor: isPermissionsActive ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)" }]}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isPermissionsActive ? "#10B981" : "#F59E0B" },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isPermissionsActive ? "#10B981" : "#F59E0B" },
            ]}
          >
            {isPermissionsActive
              ? autoSync
                ? "Active & Monitoring Incoming SMS"
                : "SMS Permission Granted (Auto-sync disabled)"
              : "SMS Read & Receive Permission Required"}
          </Text>
        </View>

        {/* Grant Permission Button (if not granted) */}
        {!isPermissionsActive && (
          <TouchableOpacity
            style={[styles.permissionBtn, { backgroundColor: theme.primary }]}
            onPress={requestPermissions}
          >
            <Feather name="shield" size={15} color="#FFFFFF" />
            <Text style={styles.permissionBtnText}>Grant SMS Permission</Text>
          </TouchableOpacity>
        )}

        {/* Test Alert Simulator Row */}
        <View style={{ marginTop: 14 }}>
          <Text style={[styles.sectionSubLabel, { color: theme.textSecondary }]}>
            TEST INCOMING MOMO DETECTION:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
            {SAMPLE_MOMO_ALERTS.map((sample, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.samplePill,
                  { backgroundColor: theme.background, borderColor: theme.border },
                ]}
                onPress={() => handleTriggerSimulation(idx)}
              >
                <Feather
                  name={sample.type === "income" ? "arrow-down-left" : "arrow-up-right"}
                  size={12}
                  color={sample.type === "income" ? "#10B981" : "#F43F5E"}
                />
                <Text style={[styles.sampleText, { color: theme.text }]}>
                  {sample.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* RECENT AUTO-DETECTED ALERTS */}
      {recentImports.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
          <View style={styles.recentHeader}>
            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>
              RECENT DETECTED ALERTS
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View Ledger</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 8, marginTop: 8 }}>
            {recentImports.slice(0, 3).map((item, i) => (
              <View
                key={i}
                style={[styles.recentItem, { backgroundColor: theme.background, borderColor: theme.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recentTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.recentProvider, { color: theme.textSecondary }]}>
                    {item.provider} • {item.category}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.recentAmount,
                    { color: item.type === "income" ? "#10B981" : "#F43F5E" },
                  ]}
                >
                  {item.type === "income" ? "+" : "-"}
                  {formatMoney(item.amount || 0)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* MANUAL SMS PASTE & PARSING */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <View style={styles.inputHeader}>
          <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>
            MANUAL SMS PARSER
          </Text>
          <TouchableOpacity
            style={[styles.pasteBtn, { backgroundColor: theme.primaryLight }]}
            onPress={handlePasteClipboard}
          >
            <Feather name="clipboard" size={13} color={theme.primary} />
            <Text style={[styles.pasteBtnText, { color: theme.primary }]}>Paste</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[
            styles.smsInput,
            { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
          ]}
          placeholder="Paste SMS alert from MTN MoMo, Telecel Cash, or bank here..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={4}
          value={smsText}
          onChangeText={setSmsText}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.analyzeBtn, { backgroundColor: theme.primary }]}
            onPress={handleAnalyze}
          >
            <Ionicons name="sparkles" size={15} color="#FFFFFF" />
            <Text style={styles.analyzeText}>Analyze SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => {
              setSmsText("");
              setParsed(null);
            }}
          >
            <Text style={[styles.clearText, { color: theme.textSecondary }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PARSED RESULT PREVIEW */}
      {parsed && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
          {parsed.isFinancial ? (
            <>
              <View style={styles.resultHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={styles.resultDot} />
                  <Text style={[styles.metaLabel, { color: "#10B981" }]}>
                    {parsed.provider.toUpperCase()} PARSED
                  </Text>
                </View>
                <View
                  style={[
                    styles.typePill,
                    {
                      backgroundColor:
                        parsed.type === "income"
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(244, 63, 94, 0.12)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      { color: parsed.type === "income" ? "#10B981" : "#F43F5E" },
                    ]}
                  >
                    {parsed.type.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 10, marginVertical: 10 }}>
                <View>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>TITLE / RECIPIENT</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                    ]}
                    value={parsed.title}
                    onChangeText={(v: string) => setParsed({ ...parsed, title: v })}
                  />
                </View>

                <View>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>AMOUNT (GHS)</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: parsed.type === "income" ? "#10B981" : "#F43F5E",
                        fontWeight: "900",
                      },
                    ]}
                    keyboardType="decimal-pad"
                    value={String(parsed.amount || "")}
                    onChangeText={(v: string) =>
                      setParsed({ ...parsed, amount: parseFloat(v) || 0 })
                    }
                  />
                </View>

                <View>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                    ]}
                    value={parsed.category}
                    onChangeText={(v: string) => setParsed({ ...parsed, category: v })}
                  />
                </View>

                {parsed.type === "expense" && (
                  <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                        SPENDING LOCATION {parsed.locationLabel ? `(${parsed.locationLabel})` : "(OPTIONAL / USER INPUT)"}
                      </Text>
                      {parsed.locationLabel ? (
                        <TouchableOpacity onPress={() => setParsed({ ...parsed, locationLabel: undefined })}>
                          <Text style={{ fontSize: 11, color: theme.primary, fontWeight: "700" }}>Clear</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <TextInput
                      style={[
                        styles.fieldInput,
                        { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                      ]}
                      placeholder="Input location or tap chip below..."
                      placeholderTextColor={theme.textMuted}
                      value={parsed.locationLabel || ""}
                      onChangeText={(v: string) => setParsed({ ...parsed, locationLabel: v })}
                    />
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 6 }}
                      contentContainerStyle={{ gap: 6 }}
                    >
                      {["Home / Hostel", "KNUST Campus", "Tech Junction", "Kejetia Market", "Ayigya Commute", "Adum Business District"].map((loc) => {
                        const isSelected = parsed.locationLabel === loc;
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
                            onPress={() => setParsed({ ...parsed, locationLabel: isSelected ? undefined : loc })}
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

                {parsed.transactionId && (
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>TRANSACTION ID</Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>{parsed.transactionId}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.saveDirectBtn, { backgroundColor: "#10B981" }]}
                onPress={handleSave}
              >
                <Feather name="check" size={16} color="#FFFFFF" />
                <Text style={styles.saveDirectText}>SAVE TO TRANSACTIONS</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ padding: 16, alignItems: "center" }}>
              <Feather name="alert-circle" size={24} color="#F43F5E" />
              <Text style={[styles.noFinText, { color: theme.textSecondary }]}>
                Could not detect financial fields. Try another MoMo or bank alert.
              </Text>
            </View>
          )}
        </View>
      )}
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
  cardHeading: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  metaLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  sectionSubLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  guideText: { fontSize: 12, lineHeight: 18, marginTop: 10 },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "800" },

  permissionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 10,
  },
  permissionBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  samplePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  sampleText: { fontSize: 11, fontWeight: "700" },

  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  toastText: { fontSize: 12, fontWeight: "700", flex: 1 },

  recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewAllText: { fontSize: 11, fontWeight: "800" },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  recentTitle: { fontSize: 12, fontWeight: "800" },
  recentProvider: { fontSize: 10, marginTop: 2 },
  recentAmount: { fontSize: 13, fontWeight: "900" },

  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pasteBtnText: { fontSize: 11, fontWeight: "800" },

  smsInput: {
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    fontWeight: "600",
    textAlignVertical: "top",
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  analyzeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  analyzeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  clearBtn: {
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  clearText: { fontSize: 13, fontWeight: "700" },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(100, 116, 139, 0.15)",
  },
  resultDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typePillText: { fontSize: 10, fontWeight: "900" },

  fieldLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5, marginBottom: 3 },
  fieldInput: { height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, fontSize: 13 },
  metaValue: { fontSize: 12, fontWeight: "700", marginTop: 2 },

  saveDirectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 6,
  },
  saveDirectText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  noFinText: { fontSize: 12, marginTop: 8, textAlign: "center" },
  locChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
});
