const prisma = require("../config/database");

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { transactionDate: "desc" },
    });

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Error retrieving transactions" });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, description, date } = req.body;

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({ message: "Title, amount, type, and category are required" });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "Type must be either 'income' or 'expense'" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: title.trim().slice(0, 150),
        amount: numAmount,
        type,
        category: category.trim().slice(0, 80),
        description: description ? description.trim().slice(0, 500) : null,
        transactionDate: date ? new Date(date) : new Date(),
        userId: req.user.id,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ message: "Error adding transaction" });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, category, description, date } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    let numAmount = undefined;
    if (amount !== undefined) {
      numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
    }

    if (type !== undefined && type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "Type must be either 'income' or 'expense'" });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(title && { title: title.trim().slice(0, 150) }),
        ...(numAmount !== undefined && { amount: numAmount }),
        ...(type && { type }),
        ...(category && { category: category.trim().slice(0, 80) }),
        ...(description !== undefined && { description: description ? description.trim().slice(0, 500) : null }),
        ...(date && { transactionDate: new Date(date) }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ message: "Error updating transaction" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Error deleting transaction" });
  }
};
