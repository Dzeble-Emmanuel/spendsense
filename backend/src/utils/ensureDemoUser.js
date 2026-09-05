const bcrypt = require("bcryptjs");
const prisma = require("../config/database");

async function ensureDemoUser() {
  try {
    // Guard: Disable automatic demo seeding in production or if explicitly configured
    if (process.env.DISABLE_DEMO_SEEDER === "true" || process.env.NODE_ENV === "production_clean") {
      console.log("ℹ️ Automatic demo seeder disabled by configuration.");
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: "demo@spendsense.app" },
    });

    if (existing) {
      console.log("✅ Demo account active: demo@spendsense.app");
      return;
    }

    console.log("🌱 Creating demo account on server startup...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        fullName: "Nana Kwame Konadu",
        email: "demo@spendsense.app",
        password: hashedPassword,
      },
    });

    const sampleData = [
      { title: "Monthly Salary", amount: 4500, type: "income", category: "Salary", description: "July salary", date: "2026-07-01" },
      { title: "Freelance Project", amount: 800, type: "income", category: "Freelance", description: "Website design project", date: "2026-07-10" },
      { title: "Jollof & Chicken", amount: 45, type: "expense", category: "Food", description: "Lunch at Papaye", date: "2026-07-02" },
      { title: "Trotro to campus", amount: 8, type: "expense", category: "Transport", description: "Daily trotro fare", date: "2026-07-02" },
      { title: "MTN Data Bundle", amount: 55, type: "expense", category: "Bills", description: "Monthly data subscription", date: "2026-07-03" },
      { title: "Waakye & Egg", amount: 30, type: "expense", category: "Food", description: "Breakfast from waakye joint", date: "2026-07-04" },
      { title: "Uber to Accra Mall", amount: 35, type: "expense", category: "Transport", description: "Ride to shopping center", date: "2026-07-05" },
      { title: "New Shirt", amount: 120, type: "expense", category: "Shopping", description: "Clothing purchase", date: "2026-07-05" },
      { title: "ECG Bill", amount: 180, type: "expense", category: "Bills", description: "Monthly electricity bill", date: "2026-07-06" },
      { title: "Banku & Tilapia", amount: 60, type: "expense", category: "Food", description: "Dinner at local spot", date: "2026-07-07" },
      { title: "Cinema Ticket", amount: 50, type: "expense", category: "Entertainment", description: "Movie at Silverbird", date: "2026-07-08" },
      { title: "Pharmacy", amount: 85, type: "expense", category: "Health", description: "Medication and vitamins", date: "2026-07-09" },
      { title: "Textbook", amount: 95, type: "expense", category: "Education", description: "Computer Science textbook", date: "2026-07-10" },
      { title: "MoMo Transfer", amount: 200, type: "expense", category: "Other", description: "Sent to family", date: "2026-07-12" },
      { title: "Fufu & Light Soup", amount: 40, type: "expense", category: "Food", description: "Weekend lunch", date: "2026-07-13" },
      { title: "June Salary", amount: 4500, type: "income", category: "Salary", description: "June salary", date: "2026-06-01" },
      { title: "Food expenses June", amount: 380, type: "expense", category: "Food", description: "June food", date: "2026-06-15" },
      { title: "Transport June", amount: 150, type: "expense", category: "Transport", description: "June transport", date: "2026-06-15" },
      { title: "Bills June", amount: 250, type: "expense", category: "Bills", description: "June bills", date: "2026-06-15" },
      { title: "Shopping June", amount: 200, type: "expense", category: "Shopping", description: "June shopping", date: "2026-06-20" },
      { title: "May Salary", amount: 4200, type: "income", category: "Salary", description: "May salary", date: "2026-05-01" },
      { title: "Food May", amount: 350, type: "expense", category: "Food", description: "May food", date: "2026-05-15" },
      { title: "Transport May", amount: 120, type: "expense", category: "Transport", description: "May transport", date: "2026-05-15" },
      { title: "Bills May", amount: 220, type: "expense", category: "Bills", description: "May bills", date: "2026-05-15" },
    ];

    for (const item of sampleData) {
      await prisma.transaction.create({
        data: {
          title: item.title,
          amount: item.amount,
          type: item.type,
          category: item.category,
          description: item.description,
          transactionDate: new Date(item.date),
          userId: user.id,
        },
      });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const defaultBudgets = [
      { category: "Food", amount: 500 },
      { category: "Transport", amount: 300 },
      { category: "Shopping", amount: 400 },
      { category: "Bills", amount: 600 },
      { category: "Entertainment", amount: 250 },
      { category: "Health", amount: 350 },
      { category: "Education", amount: 450 },
    ];

    // Seed budgets for July 2026 demo dataset
    for (const b of defaultBudgets) {
      await prisma.budget.upsert({
        where: {
          userId_category_month_year: {
            userId: user.id,
            category: b.category,
            month: 7,
            year: 2026,
          },
        },
        update: {},
        create: {
          category: b.category,
          amount: b.amount,
          month: 7,
          year: 2026,
          userId: user.id,
        },
      });
    }

    // Also seed budgets for current active month/year if different
    if (currentMonth !== 7 || currentYear !== 2026) {
      for (const b of defaultBudgets) {
        await prisma.budget.upsert({
          where: {
            userId_category_month_year: {
              userId: user.id,
              category: b.category,
              month: currentMonth,
              year: currentYear,
            },
          },
          update: {},
          create: {
            category: b.category,
            amount: b.amount,
            month: currentMonth,
            year: currentYear,
            userId: user.id,
          },
        });
      }
    }

    console.log("✅ Demo account created with 24 transactions & default budgets!");
  } catch (err) {
    console.log("Note: Demo user check skipped or already exists.", err.message);
  }
}

module.exports = ensureDemoUser;
