import { Transaction } from "../types/finance";

export type AnomalyResult = {
  transaction: Transaction;
  reason: string;
  severity: "high" | "medium" | "low";
  zScore: number;
};

/**
 * Z-score based anomaly detection.
 * Flags transactions that are significantly higher than the user's
 * normal spending in that category.
 */
export function detectAnomalies(transactions: Transaction[]): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];

  const expenses = transactions.filter((t) => t.type === "expense");
  if (expenses.length < 3) return anomalies;

  // Group by category
  const categoryGroups: Record<string, number[]> = {};
  expenses.forEach((t) => {
    if (!categoryGroups[t.category]) {
      categoryGroups[t.category] = [];
    }
    categoryGroups[t.category].push(t.amount);
  });

  // Check each transaction against its category stats
  expenses.forEach((t) => {
    const amounts = categoryGroups[t.category];
    if (!amounts || amounts.length < 2) return;

    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return;

    const zScore = (t.amount - mean) / stdDev;

    if (zScore > 2.0) {
      anomalies.push({
        transaction: t,
        zScore: Number(zScore.toFixed(2)),
        severity: zScore > 3 ? "high" : zScore > 2.5 ? "medium" : "low",
        reason: `Your ${t.category} expense of GH₵${t.amount.toFixed(2)} is ${zScore.toFixed(1)}x standard deviations above your average of GH₵${mean.toFixed(2)}.`,
      });
    }
  });

  // Also check for overall spending anomalies
  const allAmounts = expenses.map((t) => t.amount);
  const overallMean = allAmounts.reduce((s, a) => s + a, 0) / allAmounts.length;
  const overallVariance =
    allAmounts.reduce((s, a) => s + Math.pow(a - overallMean, 2), 0) / allAmounts.length;
  const overallStdDev = Math.sqrt(overallVariance);

  if (overallStdDev > 0) {
    expenses.forEach((t) => {
      const z = (t.amount - overallMean) / overallStdDev;
      if (z > 2.5 && !anomalies.find((a) => a.transaction.id === t.id)) {
        anomalies.push({
          transaction: t,
          zScore: Number(z.toFixed(2)),
          severity: z > 3.5 ? "high" : "medium",
          reason: `This transaction of GH₵${t.amount.toFixed(2)} is unusually high compared to your overall spending pattern (average GH₵${overallMean.toFixed(2)}).`,
        });
      }
    });
  }

  return anomalies.sort((a, b) => b.zScore - a.zScore);
}
