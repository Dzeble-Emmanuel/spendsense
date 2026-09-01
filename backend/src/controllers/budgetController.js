const prisma = require("../config/database");

exports.getBudgets = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.id,
        year: currentYear,
        month: currentMonth,
      },
    });

    const expenses = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        type: "expense",
      },
    });

    // Compute spent for each category
    const result = budgets.map((b) => {
      const spent = expenses
        .filter((e) => e.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        ...b,
        spent,
        remaining: b.amount - spent,
        percentage: b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Get budgets error:", error);
    res.status(500).json({ message: "Error fetching budgets" });
  }
};

exports.setBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || (new Date().getMonth() + 1);

    if (!category || amount === undefined) {
      return res.status(400).json({ message: "Category and amount are required" });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId: req.user.id,
          category,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: { amount: parseFloat(amount) },
      create: {
        userId: req.user.id,
        category,
        amount: parseFloat(amount),
        month: currentMonth,
        year: currentYear,
      },
    });

    res.json(budget);
  } catch (error) {
    console.error("Set budget error:", error);
    res.status(500).json({ message: "Error setting budget" });
  }
};
