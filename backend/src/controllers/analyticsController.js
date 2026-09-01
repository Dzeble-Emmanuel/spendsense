const prisma = require("../config/database");

exports.getSummary = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
    });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savings = balance;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Categories
    const categoryTotals = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    let topCategory = "None";
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    res.json({
      income,
      expenses,
      balance,
      savings,
      savingsRate: Number(savingsRate.toFixed(2)),
      transactionCount: transactions.length,
      topCategory,
      topCategoryAmount,
      categories: Object.entries(categoryTotals).map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: expenses > 0 ? Number(((amt / expenses) * 100).toFixed(1)) : 0,
      })),
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ message: "Error calculating analytics summary" });
  }
};

exports.getMonthlyTrends = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { transactionDate: "asc" },
    });

    const monthlyMap = {};

    transactions.forEach((t) => {
      const d = new Date(t.transactionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, income: 0, expenses: 0, savings: 0 };
      }

      if (t.type === "income") {
        monthlyMap[key].income += t.amount;
      } else {
        monthlyMap[key].expenses += t.amount;
      }
      monthlyMap[key].savings = monthlyMap[key].income - monthlyMap[key].expenses;
    });

    const trends = Object.values(monthlyMap);
    res.json(trends);
  } catch (error) {
    console.error("Monthly trends error:", error);
    res.status(500).json({ message: "Error calculating monthly trends" });
  }
};
