const prisma = require("../config/database");

exports.getPredictions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { transactionDate: "asc" },
    });

    const expenses = transactions.filter((t) => t.type === "expense");
    const incomes = transactions.filter((t) => t.type === "income");

    if (expenses.length === 0) {
      return res.json({
        predictedExpense: 0,
        predictedSavings: 0,
        confidence: "Low",
        trend: "Stable",
        message: "Add more transactions to generate predictions.",
      });
    }

    // Attempt calling Python FastAPI ML service if configured
    const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${mlUrl}/predict/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: transactions.map((t) => ({
            amount: t.amount,
            type: t.type,
            category: t.category,
            date: t.transactionDate.toISOString(),
          })),
        }),
      });

      if (response.ok) {
        const mlData = await response.json();
        return res.json(mlData);
      }
    } catch (e) {
      // Fallback to internal analytics logic if ML service is offline
    }

    // Fallback predictive calculation
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const avgExpense = totalExpense / expenses.length;
    const predictedExpense = parseFloat((avgExpense * 1.05 * (expenses.length > 5 ? 1.0 : 1.1)).toFixed(2));

    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const predictedSavings = Math.max(0, parseFloat((avgIncome - predictedExpense).toFixed(2)));

    const confidence = expenses.length >= 10 ? "High" : expenses.length >= 4 ? "Medium" : "Low";
    const trend = predictedExpense > avgExpense ? "Increasing" : "Stable";

    res.json({
      predictedExpense,
      predictedSavings,
      confidence,
      trend,
      period: "Next Month",
      source: "Built-in Analytics Engine",
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ message: "Error calculating predictions" });
  }
};
