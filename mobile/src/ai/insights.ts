import { Transaction } from "../types/finance";

export type PracticalTip = {
  category: string;
  advice: string;
  actionableStep: string;
  icon: string;
};

export const CATEGORY_PRACTICAL_TIPS: Record<string, { advice: string; actionableStep: string; icon: string }> = {
  Food: {
    icon: "🍔",
    advice: "Food expenditure is your largest spending driver.",
    actionableStep: "Try buying non-perishable foodstuffs (rice, oil, spices) in bulk at local markets (e.g. Makola or Kejetia) to reduce food expenses by ~25%.",
  },
  Transport: {
    icon: "🚕",
    advice: "Transport costs are taking up a substantial portion of your budget.",
    actionableStep: "For short distances, take short walks instead of short-drop trotros or ride-hailing (Uber/Bolt) to save over GH₵150 monthly.",
  },
  Bills: {
    icon: "💡",
    advice: "Utility and recurring bills are consuming a significant chunk of income.",
    actionableStep: "Unplug idle electronics, use LED lights, and limit air conditioning during peak hours to lower your ECG electricity bill.",
  },
  Shopping: {
    icon: "🛒",
    advice: "Shopping expenses account for a large portion of overall spending.",
    actionableStep: "Institute a 48-hour pause rule before any non-essential purchase to curb impulse spending.",
  },
  Entertainment: {
    icon: "🎮",
    advice: "Leisure and entertainment expenses are climbing.",
    actionableStep: "Host movie or game nights at home with friends rather than frequent cinema or club outings.",
  },
  Health: {
    icon: "❤️",
    advice: "Health expenses are notable this month.",
    actionableStep: "Enroll in preventive wellness checkups and ask your pharmacy for generic medicine alternatives.",
  },
  Education: {
    icon: "📚",
    advice: "Education and course material costs are high.",
    actionableStep: "Utilize digital open-source e-books and shared study group resources to minimize printing costs.",
  },
  Other: {
    icon: "📦",
    advice: "Miscellaneous expenses are building up.",
    actionableStep: "Categorize every expense promptly to keep track of untagged cash outlays.",
  },
};

export function generateInsight(transactions: Transaction[]): string {
  const expenses = transactions.filter((t) => t.type === "expense");
  if (expenses.length === 0) {
    return "No expense data available yet. Start adding transactions to get personalized SpendSense AI advice.";
  }

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });

  let topCategory = "Food";
  let topAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  });

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const percentage = totalExpense > 0 ? ((topAmount / totalExpense) * 100).toFixed(1) : "0";

  const tip = CATEGORY_PRACTICAL_TIPS[topCategory] || CATEGORY_PRACTICAL_TIPS["Other"];

  if (Number(percentage) > 35) {
    return `${tip.advice} (${percentage}% of total expenses). 💡 Tip: ${tip.actionableStep}`;
  }

  return `Your spending is well balanced! ${topCategory} is your top category at ${percentage}%. 💡 Tip: ${tip.actionableStep}`;
}

export function getPracticalTips(transactions: Transaction[]): PracticalTip[] {
  const expenses = transactions.filter((t) => t.type === "expense");
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return sortedCategories.map(([category]) => {
    const info = CATEGORY_PRACTICAL_TIPS[category] || CATEGORY_PRACTICAL_TIPS["Other"];
    return {
      category,
      advice: info.advice,
      actionableStep: info.actionableStep,
      icon: info.icon,
    };
  });
}