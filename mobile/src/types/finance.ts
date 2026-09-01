// Core financial data types for SpendSense

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description?: string;
  date: string;
  userId?: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
  userId?: string;
};

export type Prediction = {
  id?: string;
  predictionType: "expense" | "savings" | "income";
  predictedValue: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
  period: string;
  createdAt?: string;
};

export type Recommendation = {
  id?: string;
  message: string;
  category: string;
  priority: "high" | "medium" | "low";
  icon: string;
  createdAt?: string;
};

export type FinancialHealthScore = {
  score: number;
  status: "Excellent" | "Good" | "Fair" | "Needs Improvement";
  factors: {
    savingsRate: number;
    expenseToIncomeRatio: number;
    budgetAdherence: number;
    spendingStability: number;
    anomalyCount: number;
  };
  tips: string[];
};

export type CategoryBreakdown = {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  icon: string;
  color: string;
};

export type MonthlyTrend = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
};

export type FinancialSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
  topCategory: string;
  topCategoryAmount: number;
};

// Category definitions with icons and colors
export const EXPENSE_CATEGORIES = [
  { name: "Food", icon: "🍔", color: "#EF4444" },
  { name: "Transport", icon: "🚕", color: "#F59E0B" },
  { name: "Shopping", icon: "🛒", color: "#8B5CF6" },
  { name: "Bills", icon: "💡", color: "#3B82F6" },
  { name: "Entertainment", icon: "🎮", color: "#EC4899" },
  { name: "Health", icon: "❤️", color: "#10B981" },
  { name: "Education", icon: "📚", color: "#6366F1" },
  { name: "Housing", icon: "🏠", color: "#14B8A6" },
  { name: "Other", icon: "📦", color: "#6B7280" },
] as const;

export const INCOME_CATEGORIES = [
  { name: "Salary", icon: "💰", color: "#10B981" },
  { name: "Freelance", icon: "💼", color: "#3B82F6" },
  { name: "Business", icon: "🏪", color: "#8B5CF6" },
  { name: "Investment", icon: "📈", color: "#F59E0B" },
  { name: "Gift", icon: "🎁", color: "#EC4899" },
  { name: "Other", icon: "📦", color: "#6B7280" },
] as const;

export function getCategoryInfo(categoryName: string, type: "income" | "expense") {
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(c => c.name === categoryName) || { name: categoryName, icon: "📦", color: "#6B7280" };
}