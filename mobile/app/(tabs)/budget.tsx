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
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";
import { useSettings } from "../../src/hooks/useSettings";
import { CATEGORY_PRACTICAL_TIPS } from "../../src/types/finance";
import { useSubFeatureBack } from "../../src/hooks/useSubFeatureBack";
import { useAuth } from "../../src/context/AuthContext";
import UnverifiedFeatureGate from "../../src/components/common/UnverifiedFeatureGate";

const CATEGORY_ICON_OPTIONS = [
  "tag",
  "shopping-bag",
  "coffee",
  "navigation",
  "zap",
  "film",
  "activity",
  "book",
  "package",
  "wifi",
  "home",
  "heart",
  "dollar-sign",
  "briefcase",
  "gift",
  "tool",
] as const;

export default function BudgetScreen() {
  const { user, verifyEmailOtp, sendVerificationOtp } = useAuth();
  const { budgets, updateBudget, addBudget, deleteBudget, transactions } = useFinance();
  const { theme } = useTheme();
  const { formatMoney, currency } = useSettings();
  const insets = useSafeAreaInsets();
  const handleBack = useSubFeatureBack("/(tabs)/profile");

  const topPadding = insets.top > 0 ? insets.top + 10 : 20;

  const [modalCategory, setModalCategory] = useState<string | null>(null);
  const [modalAmount, setModalAmount] = useState("");
  const [showGateModal, setShowGateModal] = useState(false);

  // Custom Category Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatAmount, setNewCatAmount] = useState("");
  const [newCatIcon, setNewCatIcon] = useState<string>("tag");

  // Inline Banner Verification State
  const [bannerOtp, setBannerOtp] = useState("");
  const [bannerVerifying, setBannerVerifying] = useState(false);
  const [bannerSending, setBannerSending] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [bannerErr, setBannerErr] = useState<string | null>(null);

  const handleBannerActivate = async () => {
    if (!bannerOtp.trim() || bannerOtp.trim().length < 6) {
      setBannerErr("Please enter the 6-digit code.");
      return;
    }
    setBannerErr(null);
    setBannerMsg(null);
    setBannerVerifying(true);
    const res = await verifyEmailOtp(bannerOtp.trim());
    setBannerVerifying(false);
    if (res.success) {
      setBannerMsg("Email verified successfully! Custom budgets unlocked.");
    } else {
      setBannerErr(res.error || "Incorrect code. Please try again.");
    }
  };

  const handleBannerResend = async () => {
    setBannerErr(null);
    setBannerMsg(null);
    setBannerSending(true);
    const res = await sendVerificationOtp();
    setBannerSending(false);
    if (res.success) {
      setBannerMsg("6-digit code dispatched to your email.");
    } else {
      setBannerErr(res.error || "Unable to dispatch code.");
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = Math.min(
    Math.round((totalSpent / Math.max(totalBudget, 1)) * 100),
    100
  );

  const overspentCategories = budgets.filter((item) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          (t.category.toLowerCase().includes(item.category.toLowerCase().split(" ")[0]) ||
            item.category.toLowerCase().includes(t.category.toLowerCase().split(" ")[0]))
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return item.budget > 0 && spent > item.budget * 0.7;
  });

  const openCreateModal = () => {
    if (!user?.isEmailVerified) {
      setShowGateModal(true);
      return;
    }
    setNewCatName("");
    setNewCatAmount("");
    setNewCatIcon("tag");
    setShowCreateModal(true);
  };

  const handleSaveNewCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      Alert.alert("Missing Name", "Please enter a category name.");
      return;
    }
    const val = parseFloat(newCatAmount || "0");
    if (isNaN(val) || val < 0) {
      Alert.alert("Invalid Limit", "Please enter a valid positive number.");
      return;
    }
    const exists = budgets.some(
      (b) => b.category.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      Alert.alert("Category Exists", `"${trimmed}" is already in your budget categories.`);
      return;
    }

    addBudget(trimmed, val, newCatIcon);
    setShowCreateModal(false);
    setNewCatName("");
    setNewCatAmount("");
  };

  const handleDeleteCategory = (category: string) => {
    if (!user?.isEmailVerified) {
      setShowGateModal(true);
      return;
    }
    Alert.alert(
      "Delete Budget Category",
      `Are you sure you want to remove "${category}" from your budget categories? Recorded transactions in this category will be preserved.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteBudget(category);
            if (modalCategory === category) {
              setModalCategory(null);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (category: string, currentLimit: number) => {
    if (!user?.isEmailVerified) {
      setShowGateModal(true);
      return;
    }
    setModalCategory(category);
    setModalAmount(currentLimit > 0 ? String(currentLimit) : "");
  };

  const handleSaveModal = () => {
    if (!modalCategory) return;
    const val = parseFloat(modalAmount);
    if (isNaN(val) || val < 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number.");
      return;
    }
    updateBudget(modalCategory, val);
    setModalCategory(null);
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
          <Text style={[styles.title, { color: theme.text }]}>Monthly Budget</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Set spending thresholds & get proactive alerts
          </Text>
        </View>
      </View>

      {/* Monthly Limit Overview Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Feather name="pie-chart" size={15} color={theme.primary} />
            <Text style={[styles.cardHeaderLabel, { color: theme.textSecondary }]}>
              CYCLE HEALTH
            </Text>
          </View>

          <View
            style={[
              styles.bufferPill,
              totalRemaining >= 0
                ? { backgroundColor: "rgba(16, 185, 129, 0.12)", borderColor: "#10B981" }
                : { backgroundColor: "rgba(244, 63, 94, 0.12)", borderColor: "#F43F5E" },
            ]}
          >
            <Feather
              name={totalRemaining >= 0 ? "check-circle" : "alert-circle"}
              size={12}
              color={totalRemaining >= 0 ? "#10B981" : "#F43F5E"}
            />
            <Text
              style={[
                styles.bufferPillText,
                { color: totalRemaining >= 0 ? "#10B981" : "#F43F5E" },
              ]}
            >
              {totalRemaining >= 0
                ? `${formatMoney(totalRemaining)} Safe Buffer`
                : `Over by ${formatMoney(Math.abs(totalRemaining))}`}
            </Text>
          </View>
        </View>

        {/* 3 Metric Capsules */}
        <View style={styles.metricGrid}>
          <View style={[styles.metricBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>TOTAL BUDGET</Text>
            <Text style={[styles.metricValue, { color: theme.text }]}>
              {formatMoney(totalBudget)}
            </Text>
          </View>

          <View style={[styles.metricBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>SPENT SO FAR</Text>
            <Text style={[styles.metricValue, { color: "#F43F5E" }]}>
              {formatMoney(totalSpent)}
            </Text>
          </View>

          <View style={[styles.metricBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>NET BUFFER</Text>
            <Text
              style={[
                styles.metricValue,
                { color: totalRemaining >= 0 ? "#10B981" : "#F43F5E" },
              ]}
            >
              {formatMoney(totalRemaining)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            Overall Budget Consumption
          </Text>
          <Text
            style={[
              styles.progressValue,
              { color: overallPercentage >= 100 ? "#F43F5E" : theme.primary },
            ]}
          >
            {overallPercentage}% used
          </Text>
        </View>

        <View style={[styles.progressBarTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${overallPercentage}%`,
                backgroundColor:
                  overallPercentage >= 100
                    ? "#F43F5E"
                    : overallPercentage >= 70
                    ? "#F59E0B"
                    : "#10B981",
              },
            ]}
          />
        </View>
      </View>

      {/* Category Limits & Allowances */}
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
            Category Limits & Allowances
          </Text>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
            {budgets.length} custom & tracked categories
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addCatBtn, { backgroundColor: theme.primary }]}
          onPress={openCreateModal}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={13} color="#FFFFFF" />
          <Text style={styles.addCatBtnText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Unverified Budget Creation Notice Banner with Direct Textbox & Activate Button */}
      {!user?.isEmailVerified && (
        <View
          style={[styles.budgetLockedBanner, { backgroundColor: theme.card, borderColor: "rgba(245, 158, 11, 0.25)" }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.budgetLockedIconBox, { backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
              <Feather name="lock" size={14} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.budgetLockedTitle, { color: theme.text }]}>Budget Creation Locked</Text>
              <Text style={[styles.budgetLockedSub, { color: theme.textSecondary }]}>
                Enter the 6-digit verification code sent to your email to activate custom budget creation.
              </Text>
            </View>
          </View>

          {bannerErr ? (
            <View style={[styles.bannerAlert, { backgroundColor: "rgba(244, 63, 94, 0.1)", borderColor: "rgba(244, 63, 94, 0.3)" }]}>
              <Feather name="alert-circle" size={12} color="#F43F5E" />
              <Text style={{ color: "#F43F5E", fontSize: 11, fontWeight: "700", flex: 1 }}>{bannerErr}</Text>
            </View>
          ) : null}

          {bannerMsg ? (
            <View style={[styles.bannerAlert, { backgroundColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" }]}>
              <Feather name="check-circle" size={12} color="#10B981" />
              <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700", flex: 1 }}>{bannerMsg}</Text>
            </View>
          ) : null}

          {/* Textbox and Activate button */}
          <View style={styles.bannerFormRow}>
            <View style={[styles.bannerInputWrap, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Feather name="key" size={13} color={theme.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.bannerInput, { color: theme.text }]}
                placeholder="123456"
                placeholderTextColor={theme.textMuted}
                value={bannerOtp}
                onChangeText={setBannerOtp}
                keyboardType="number-pad"
                maxLength={6}
                onSubmitEditing={handleBannerActivate}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              style={[styles.bannerActivateBtn, bannerVerifying && { opacity: 0.6 }]}
              onPress={handleBannerActivate}
              disabled={bannerVerifying}
              activeOpacity={0.85}
            >
              {bannerVerifying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="check" size={13} color="#FFFFFF" />
                  <Text style={styles.bannerActivateText}>Activate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bannerFooterRow}>
            <TouchableOpacity onPress={handleBannerResend} disabled={bannerSending} activeOpacity={0.7}>
              <Text style={{ color: theme.primary, fontSize: 11, fontWeight: "700" }}>
                {bannerSending ? "Sending code..." : "Resend Code"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowGateModal(true)} activeOpacity={0.7}>
              <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: "600" }}>
                More Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.categoriesGrid}>
        {budgets.length === 0 ? (
          <View style={[styles.emptyBudgetCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Feather name="pie-chart" size={32} color={theme.textMuted} />
            <Text style={[styles.emptyBudgetTitle, { color: theme.text }]}>No categories configured</Text>
            <Text style={[styles.emptyBudgetSub, { color: theme.textSecondary }]}>
              Create your own custom budget categories to track spending limits.
            </Text>
            <TouchableOpacity
              style={[styles.addCatBtn, { backgroundColor: theme.primary, marginTop: 10, paddingHorizontal: 16 }]}
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={13} color="#FFFFFF" />
              <Text style={styles.addCatBtnText}>Add First Category</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgets.map((item) => {
            const spent = transactions
              .filter(
                (t) =>
                  t.type === "expense" &&
                  (t.category.toLowerCase().includes(item.category.toLowerCase().split(" ")[0]) ||
                    item.category.toLowerCase().includes(t.category.toLowerCase().split(" ")[0]))
              )
              .reduce((sum, t) => sum + t.amount, 0);

            const hasLimit = item.budget > 0;
            const remaining = item.budget - spent;
            const percentage = hasLimit
              ? Math.min(Math.round((spent / item.budget) * 100), 100)
              : 0;

            const isOver = hasLimit && spent > item.budget;
            const isWarning = hasLimit && !isOver && spent >= item.budget * 0.7;

            return (
              <View
                key={item.category}
                style={[styles.catCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.catCardHeader}>
                  <TouchableOpacity
                    style={styles.catLeft}
                    onPress={() => openEditModal(item.category, item.budget)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.catIconBox, { backgroundColor: `${theme.primary}18` }]}>
                      <Feather name={(item.icon || "tag") as any} size={13} color={theme.primary} />
                    </View>
                    <Text style={[styles.catName, { color: theme.text }]} numberOfLines={1}>
                      {item.category}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.catRight}>
                    <Text style={[styles.catAmountText, { color: theme.textSecondary }]}>
                      {formatMoney(spent)} / {hasLimit ? formatMoney(item.budget) : "No limit"}
                    </Text>
                    <TouchableOpacity
                      style={styles.catActionIconBtn}
                      onPress={() => openEditModal(item.category, item.budget)}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    >
                      <Feather
                        name={user?.isEmailVerified ? "edit-2" : "lock"}
                        size={13}
                        color={user?.isEmailVerified ? theme.textMuted : "#F59E0B"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.catActionIconBtn}
                      onPress={() => handleDeleteCategory(item.category)}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    >
                      <Feather name="trash-2" size={13} color="#F43F5E" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Progress Bar */}
                <TouchableOpacity
                  onPress={() => openEditModal(item.category, item.budget)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.catTrack, { backgroundColor: theme.subCard, borderColor: theme.border }]}>
                    <View
                      style={[
                        styles.catFill,
                        {
                          width: `${hasLimit ? percentage : 0}%`,
                          backgroundColor: isOver
                            ? "#F43F5E"
                            : isWarning
                            ? "#F59E0B"
                            : "#10B981",
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.catFooter}>
                    <Text style={[styles.catUtilized, { color: theme.textMuted }]}>
                      {hasLimit ? `${percentage}% utilized` : "Tap to set budget"}
                    </Text>
                    {hasLimit && (
                      <Text
                        style={[
                          styles.catRemaining,
                          { color: remaining >= 0 ? "#10B981" : "#F43F5E" },
                        ]}
                      >
                        {remaining >= 0
                          ? `${formatMoney(remaining)} left`
                          : `Over by ${formatMoney(Math.abs(remaining))}`}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {/* Practical Budget Guidance Section */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <View style={styles.guidanceHeader}>
          <View style={[styles.guidanceIconBg, { backgroundColor: theme.accentLight }]}>
            <Ionicons name="sparkles" size={15} color={theme.primary} />
          </View>
          <Text style={[styles.guidanceTitle, { color: theme.text }]}>
            Practical Budget Guidance
          </Text>
        </View>

        <View style={{ gap: 8, marginTop: 10 }}>
          {overspentCategories.length > 0 ? (
            overspentCategories.map((item) => {
              const tip =
                CATEGORY_PRACTICAL_TIPS[item.category] || CATEGORY_PRACTICAL_TIPS["Other"];
              return (
                <View
                  key={item.category}
                  style={[styles.tipRow, { backgroundColor: theme.background, borderColor: theme.border }]}
                >
                  <View style={styles.tipDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tipTitle, { color: theme.primary }]}>
                      High {item.category} Spending Observed
                    </Text>
                    <Text style={[styles.tipBody, { color: theme.textSecondary }]}>
                      {tip.actionableStep}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.tipSafeRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.tipSafeText}>
                All category allocations are comfortably within monthly thresholds.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Edit Budget Modal */}
      <Modal visible={Boolean(modalCategory)} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Set Budget: {modalCategory}
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Enter monthly target limit in {currency.code} ({currency.symbol}).
            </Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={modalAmount}
              onChangeText={setModalAmount}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setModalCategory(null)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveModal}
              >
                <Text style={styles.modalSaveText}>Save Limit</Text>
              </TouchableOpacity>
            </View>

            {modalCategory && (
              <TouchableOpacity
                style={styles.modalDeleteCategoryBtn}
                onPress={() => {
                  const cat = modalCategory;
                  setModalCategory(null);
                  handleDeleteCategory(cat);
                }}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={13} color="#F43F5E" />
                <Text style={styles.modalDeleteCategoryText}>Delete Category</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Custom Category Modal */}
      <Modal visible={showCreateModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border, maxHeight: "85%" }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                New Budget Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Create a personalized category with a monthly limit and vector icon.
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>CATEGORY NAME</Text>
            <TextInput
              style={[styles.createInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. Groceries, Gym, Tech, Travel"
              placeholderTextColor={theme.textMuted}
              value={newCatName}
              onChangeText={setNewCatName}
              maxLength={24}
              autoFocus
            />

            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>MONTHLY LIMIT ({currency.symbol})</Text>
            <TextInput
              style={[styles.createInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0.00 (optional)"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={newCatAmount}
              onChangeText={setNewCatAmount}
            />

            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>SELECT ICON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.iconGrid}>
                {CATEGORY_ICON_OPTIONS.map((iconName) => {
                  const isSelected = newCatIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconChoice,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.subCard,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setNewCatIcon(iconName)}
                    >
                      <Feather
                        name={iconName as any}
                        size={16}
                        color={isSelected ? "#FFFFFF" : theme.text}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveNewCategory}
              >
                <Text style={styles.modalSaveText}>Create Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Verification Gate Modal for Budget Creation */}
      <Modal visible={showGateModal} animationType="fade" transparent={false}>
        <UnverifiedFeatureGate
          featureName="Custom Budget Creation"
          featureDescription="Email verification is required to establish custom budget thresholds, create category limits, and activate overspending warnings."
          iconName="pie-chart"
          onVerified={() => setShowGateModal(false)}
          onBack={() => setShowGateModal(false)}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  header: {
    flexDirection: "row",
    alignItems: "center",
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

  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardHeaderLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },

  bufferPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  bufferPillText: { fontSize: 11, fontWeight: "800" },

  metricGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metricBox: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  metricValue: { fontSize: 13, fontWeight: "900", marginTop: 4 },

  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: "700" },
  progressValue: { fontSize: 11, fontWeight: "800" },
  progressBarTrack: { height: 10, borderRadius: 5, borderWidth: 1, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 5 },

  sectionTitle: { fontSize: 15, fontWeight: "800", marginTop: 6, marginBottom: 10 },
  sectionSub: { fontSize: 11, marginTop: 2 },
  categoriesGrid: { gap: 8 },
  catCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  catCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  catName: { fontSize: 13, fontWeight: "800" },
  catRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  catAmountText: { fontSize: 11, fontWeight: "700" },
  catTrack: { height: 6, borderRadius: 3, borderWidth: 1, overflow: "hidden" },
  catFill: { height: "100%", borderRadius: 3 },
  catFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 6,
  },
  catUtilized: { fontSize: 10, fontWeight: "600" },
  catRemaining: { fontSize: 10, fontWeight: "800" },

  guidanceHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  guidanceIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  guidanceTitle: { fontSize: 13, fontWeight: "800" },

  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F59E0B", marginTop: 5 },
  tipTitle: { fontSize: 12, fontWeight: "800" },
  tipBody: { fontSize: 11, marginTop: 2, lineHeight: 16 },

  tipSafeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 14,
  },
  tipSafeText: { color: "#10B981", fontSize: 11, fontWeight: "700", flex: 1 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: "900" },
  modalSub: { fontSize: 12, marginTop: 4, marginBottom: 14 },
  modalInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  modalBtnRow: { flexDirection: "row", gap: 10 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 13, fontWeight: "700" },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  modalSaveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  // Gating & Minimalist Lock Elements
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  miniLockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniLockText: {
    color: "#F59E0B",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  budgetLockedBanner: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  budgetLockedIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  budgetLockedTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  budgetLockedSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  verifyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  verifyPillText: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "800",
  },
  bannerAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  bannerFormRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  bannerInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 38,
  },
  bannerInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  bannerActivateBtn: {
    backgroundColor: "#2563EB",
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bannerActivateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  bannerFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  addCatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addCatBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  catIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  catActionIconBtn: {
    padding: 4,
    borderRadius: 6,
  },
  modalDeleteCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(244, 63, 94, 0.15)",
  },
  modalDeleteCategoryText: {
    color: "#F43F5E",
    fontSize: 12,
    fontWeight: "700",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  createInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  iconChoice: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBudgetCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  emptyBudgetTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  emptyBudgetSub: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});