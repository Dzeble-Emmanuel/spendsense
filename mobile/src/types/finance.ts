export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date: string;
  merchant?: string;
  isSubscription?: boolean;
  locationLabel?: string;
}

export type LeakRiskStatus = "HIGH" | "MODERATE" | "LOW";

export interface LocationSummary {
  locationLabel: string;
  totalAmount: number;
  spendPercentage: number;
  transactionCount: number;
  averagePerVisit: number;
  leakScore: number;
  dominantCategory: string;
  dominantTimeWindow: string;
  leakStatus: LeakRiskStatus;
  iconName: string;
}

export interface LeakAnalysisReport {
  locations: LocationSummary[];
  totalTrackedSpend: number;
  highestLeakZone: LocationSummary | null;
  highRiskCount: number;
  prescriptiveNudge: string;
  untaggedCount: number;
  untaggedAmount: number;
}

export const PREDEFINED_LOCATIONS = [
  "Tech Junction",
  "KNUST Campus",
  "Kejetia Market",
  "Home / Hostel",
  "Work / Office",
  "Ayigya Commute",
  "Other",
] as const;

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
  bgLight?: string;
}

export interface Budget {
  category: string;
  icon: string;
  budget: number;
}

export interface Subscription {
  id: string;
  name: string;
  title?: string;
  amount: number;
  billingCycle: "weekly" | "monthly" | "yearly";
  category: string;
  icon: string;
  color: string;
  nextDueDate: string;
  notes?: string;
  isActive: boolean;
  startedDate: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateToGHS: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  joinedDate: string;
}

export interface PracticalTip {
  category: string;
  icon: string;
  actionableStep: string;
}

export interface AnomalyItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  reason: string;
  date: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", rateToGHS: 1 },
  { code: "USD", symbol: "$", name: "US Dollar", rateToGHS: 0.065 },
  { code: "EUR", symbol: "€", name: "Euro", rateToGHS: 0.060 },
  { code: "GBP", symbol: "£", name: "British Pound", rateToGHS: 0.051 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rateToGHS: 98.5 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rateToGHS: 8.4 },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", rateToGHS: 0.088 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rateToGHS: 1.18 },
];

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { name: "Food & Dining", icon: "🍔", color: "#F97316", bgLight: "rgba(249, 115, 22, 0.15)" },
  { name: "Transport", icon: "🚕", color: "#0EA5E9", bgLight: "rgba(14, 165, 233, 0.15)" },
  { name: "Shopping", icon: "🛒", color: "#EC4899", bgLight: "rgba(236, 72, 153, 0.15)" },
  { name: "Bills & Utilities", icon: "💡", color: "#EAB308", bgLight: "rgba(234, 179, 8, 0.15)" },
  { name: "Entertainment", icon: "🎮", color: "#8B5CF6", bgLight: "rgba(139, 92, 246, 0.15)" },
  { name: "Health & Wellness", icon: "❤️", color: "#EF4444", bgLight: "rgba(239, 68, 68, 0.15)" },
  { name: "Education", icon: "📚", color: "#06B6D4", bgLight: "rgba(6, 182, 212, 0.15)" },
  { name: "Other", icon: "📦", color: "#64748B", bgLight: "rgba(100, 116, 139, 0.15)" },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { name: "Salary", icon: "💰", color: "#10B981", bgLight: "rgba(16, 185, 129, 0.15)" },
  { name: "Freelance & Projects", icon: "💼", color: "#3B82F6", bgLight: "rgba(59, 130, 246, 0.15)" },
  { name: "Investments", icon: "📈", color: "#8B5CF6", bgLight: "rgba(139, 92, 246, 0.15)" },
  { name: "Gifts & Transfers", icon: "🎁", color: "#EC4899", bgLight: "rgba(236, 72, 153, 0.15)" },
  { name: "Side Business", icon: "🏪", color: "#F59E0B", bgLight: "rgba(245, 158, 11, 0.15)" },
  { name: "Other Income", icon: "📦", color: "#14B8A6", bgLight: "rgba(20, 184, 166, 0.15)" },
];

export const SUBSCRIPTION_TEMPLATES = [
  { name: "Netflix Premium", amount: 95, icon: "🎬", color: "#E50914", category: "Entertainment", billingCycle: "monthly" as const },
  { name: "Spotify Duo", amount: 45, icon: "🎵", color: "#1DB954", category: "Entertainment", billingCycle: "monthly" as const },
  { name: "MTN Fiber Broadband", amount: 280, icon: "📶", color: "#FFCC00", category: "Bills & Utilities", billingCycle: "monthly" as const },
  { name: "Apple iCloud+ 200GB", amount: 35, icon: "☁️", color: "#007AFF", category: "Bills & Utilities", billingCycle: "monthly" as const },
  { name: "Gym & Fitness Center", amount: 150, icon: "🏋️", color: "#10B981", category: "Health & Wellness", billingCycle: "monthly" as const },
  { name: "ChatGPT Plus", amount: 260, icon: "🤖", color: "#10A37F", category: "Education", billingCycle: "monthly" as const },
  { name: "Amazon Prime Video", amount: 65, icon: "📦", color: "#00A8E1", category: "Entertainment", billingCycle: "monthly" as const },
  { name: "LinkedIn Learning", amount: 120, icon: "💼", color: "#0077B5", category: "Education", billingCycle: "monthly" as const },
];

export const CATEGORY_PRACTICAL_TIPS: Record<string, PracticalTip> = {
  "Food & Dining": {
    category: "Food & Dining",
    icon: "🍔",
    actionableStep: "Meal prepping lunches on Sundays can save an estimated GH₵ 180 every week compared to takeout.",
  },
  Food: {
    category: "Food & Dining",
    icon: "🍔",
    actionableStep: "Meal prepping lunches on Sundays can save an estimated GH₵ 180 every week compared to takeout.",
  },
  Transport: {
    category: "Transport",
    icon: "🚕",
    actionableStep: "Grouping weekend errands or carpooling with colleagues during peak rush hours reduces ride-hailing fares by ~25%.",
  },
  Shopping: {
    category: "Shopping",
    icon: "🛒",
    actionableStep: "Implement a 48-hour cooling rule for impulsive non-essential purchases over GH₵ 100.",
  },
  "Bills & Utilities": {
    category: "Bills & Utilities",
    icon: "💡",
    actionableStep: "Audit active mobile bundles and turn off AC when leaving the room to lower utility bills.",
  },
  Bills: {
    category: "Bills & Utilities",
    icon: "💡",
    actionableStep: "Audit active mobile bundles and turn off AC when leaving the room to lower utility bills.",
  },
  Entertainment: {
    category: "Entertainment",
    icon: "🎮",
    actionableStep: "Review unused subscription services; canceling one inactive streaming plan saves GH₵ 500+ annually.",
  },
  "Health & Wellness": {
    category: "Health & Wellness",
    icon: "❤️",
    actionableStep: "Leverage corporate health insurance perks or seasonal gym discounts for maximum long-term value.",
  },
  Health: {
    category: "Health & Wellness",
    icon: "❤️",
    actionableStep: "Leverage corporate health insurance perks or seasonal gym discounts for maximum long-term value.",
  },
  Education: {
    category: "Education",
    icon: "📚",
    actionableStep: "Check whether your employer or alumni association offers subsidized access to digital certification libraries.",
  },
  Other: {
    category: "Other",
    icon: "📦",
    actionableStep: "Set aside a 10% emergency buffer from random side incomes before spending on leisure.",
  },
};

export function getCategoryInfo(categoryName: string, type: "income" | "expense") {
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (
    categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()) ||
    categories.find((c) => c.name.toLowerCase().includes(categoryName.toLowerCase())) ||
    { name: categoryName, icon: "📦", color: "#64748B" }
  );
}