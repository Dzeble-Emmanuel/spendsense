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

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        category,
        description: description || null,
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

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(type && { type }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
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
