import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { useFinance } from "../../src/hooks/useFinance";
import { useSettings } from "../../src/hooks/useSettings";
import { useSubscriptions } from "../../src/hooks/useSubscriptions";

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { transactions, income, expenses, savingsRate } = useFinance();
  const { formatMoney, currency } = useSettings();
  const { monthlyTotal: subMonthlyTotal } = useSubscriptions();

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  type MenuItem = {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    route: string;
    badge?: string;
  };
  const menuItems: MenuItem[] = [
    {
      iconName: "settings-outline",
      label: "Settings",
      route: "/(tabs)/settings",
      badge: `${currency.code} ${currency.symbol}`,
    },
    {
      iconName: "pie-chart-outline",
      label: "Budget Tracker",
      route: "/(tabs)/budget",
    },
    {
      iconName: "repeat-outline",
      label: "Subscriptions",
      route: "/(tabs)/subscriptions",
      badge: `${formatMoney(subMonthlyTotal)}/mo`,
    },
    {
      iconName: "scan-outline",
      label: "Receipt Scanner",
      route: "/(tabs)/receipt-scanner",
    },
    {
      iconName: "mail-outline",
      label: "SMS Import",
      route: "/(tabs)/sms-import",
    },
    {
      iconName: "trending-up-outline",
      label: "Expense Forecast",
      route: "/(tabs)/forecast",
    },
    {
      iconName: "document-text-outline",
      label: "Reports & CSV",
      route: "/(tabs)/reports",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <TouchableOpacity
          style={[
            styles.bellBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* User Hero Banner */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {(user?.fullName || "A").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>
          {user?.fullName || "Alex Mensah"}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {user?.email || "alex.mensah@example.com"}
        </Text>
      </View>

      {/* 4-Grid Stats Overview */}
      <View style={styles.statsGrid}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.statTop}>
            <Ionicons name="arrow-down-circle" size={18} color="#059669" />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Income
            </Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {formatMoney(income)}
          </Text>
        </View>

        <View
          style={[
            styles.statBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.statTop}>
            <Ionicons name="arrow-up-circle" size={18} color="#DC2626" />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Expenses
            </Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {formatMoney(expenses)}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.statTop}>
            <Ionicons name="receipt-outline" size={18} color={theme.primary} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Transactions
            </Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {transactions.length}
          </Text>
        </View>

        <View
          style={[
            styles.statBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.statTop}>
            <Ionicons name="wallet-outline" size={18} color={theme.accent} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Savings Rate
            </Text>
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {savingsRate.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Main Menu Navigation items */}
      <View style={{ marginTop: 12 }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.iconName}
              size={20}
              color={theme.primary}
              style={{ marginRight: 14 }}
            />
            <Text style={[styles.menuLabel, { color: theme.text }]}>
              {item.label}
            </Text>
            {item.badge && (
              <View
                style={[
                  styles.badgeContainer,
                  { backgroundColor: theme.subCard || theme.background },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: theme.textSecondary }]}
                >
                  {item.badge}
                </Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: "rgba(220, 38, 38, 0.4)" }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: theme.textMuted }]}>v1.0.4</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800" },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: "#FFFFFF" },
  name: { fontSize: 22, fontWeight: "800" },
  email: { fontSize: 13, marginTop: 4 },

  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  statTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  statLabel: { fontSize: 12, fontWeight: "600" },
  statValue: { fontSize: 18, fontWeight: "800" },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "700" },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },

  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  logoutText: { color: "#DC2626", fontSize: 15, fontWeight: "700" },

  version: { textAlign: "center", marginTop: 16, fontSize: 12 },
});