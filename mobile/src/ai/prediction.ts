import { Transaction } from "../types/finance";

export type PredictionResult = {
  predictedExpense: string;
  predictedSavings: string;
  trend: "Increasing" | "Decreasing" | "Stable";
  confidence: "High" | "Medium" | "Low";
  monthlyAverage: string;
  nextMonthEstimate: string;
  trendPercentage: string;
};

/**
 * Enhanced expense prediction using weighted moving average.
 * Groups transactions by month and uses recent months more heavily.
 */
export function predictExpenses(transactions: Transaction[]): PredictionResult {
  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  if (expenses.length === 0) {
    return {
      predictedExpense: "0.00",
      predictedSavings: "0.00",
      trend: "Stable",
      confidence: "Low",
      monthlyAverage: "0.00",
      nextMonthEstimate: "0.00",
      trendPercentage: "0",
    };
  }

  // Group expenses by month
  const monthlyExpenses: Record<string, number> = {};
  expenses.forEach((t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyExpenses[key] = (monthlyExpenses[key] || 0) + t.amount;
  });

  const months = Object.keys(monthlyExpenses).sort();
  const monthlyValues = months.map((m) => monthlyExpenses[m]);

  // Calculate average
  const totalExpense = monthlyValues.reduce((s, v) => s + v, 0);
  const monthlyAverage = totalExpense / monthlyValues.length;

  // Weighted moving average (recent months weighted more)
  let weightedSum = 0;
  let weightTotal = 0;
  monthlyValues.forEach((value, index) => {
    const weight = index + 1; // More recent = higher weight
    weightedSum += value * weight;
    weightTotal += weight;
  });
  const weightedAverage = weightTotal > 0 ? weightedSum / weightTotal : monthlyAverage;

  // Simple linear regression for trend
  let trend: "Increasing" | "Decreasing" | "Stable" = "Stable";
  let trendPercentage = 0;

  if (monthlyValues.length >= 2) {
    const n = monthlyValues.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += monthlyValues[i];
      sumXY += i * monthlyValues[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    if (avgY > 0) {
      trendPercentage = (slope / avgY) * 100;
    }

    if (trendPercentage > 5) trend = "Increasing";
    else if (trendPercentage < -5) trend = "Decreasing";
  }

  // Prediction: weighted average + trend adjustment
  const trendFactor = 1 + (trendPercentage / 100);
  const predictedExpense = weightedAverage * trendFactor;

  // Savings prediction
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = totalIncome / Math.max(months.length, 1);
  const predictedSavings = Math.max(0, monthlyIncome - predictedExpense);

  // Confidence based on data quantity
  let confidence: "High" | "Medium" | "Low" = "Low";
  if (monthlyValues.length >= 4) confidence = "High";
  else if (monthlyValues.length >= 2) confidence = "Medium";

  return {
    predictedExpense: predictedExpense.toFixed(2),
    predictedSavings: predictedSavings.toFixed(2),
    trend,
    confidence,
    monthlyAverage: monthlyAverage.toFixed(2),
    nextMonthEstimate: predictedExpense.toFixed(2),
    trendPercentage: trendPercentage.toFixed(1),
  };
}