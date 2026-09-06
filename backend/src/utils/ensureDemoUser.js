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

  // --- SECOND DEMO ACCOUNT (demo2@spendsense.app - Kofi Mensah, Unverified) ---
  try {
    const existingDemo2 = await prisma.user.findUnique({
      where: { email: "demo2@spendsense.app" },
    });

    if (existingDemo2) {
      console.log("✅ Second demo account active: demo2@spendsense.app (Kofi Mensah)");
      return;
    }

    console.log("🌱 Creating second demo account (demo2@spendsense.app - Kofi Mensah)...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user2 = await prisma.user.create({
      data: {
        fullName: "Kofi Mensah",
        email: "demo2@spendsense.app",
        password: hashedPassword,
      },
    });

    const demo2Transactions = [
      { title: "Monthly Tech Retainer", amount: 5200, type: "income", category: "Salary", description: "Remote software engineering stipend", date: "2026-07-01" },
      { title: "Consulting & Code Audit", amount: 1200, type: "income", category: "Freelance", description: "Fintech security audit payout", date: "2026-07-08" },
      { title: "KNUST Bookstore & Research", amount: 140, type: "expense", category: "Education", description: "Software Architecture reference books", date: "2026-07-02" },
      { title: "MTN TurboNet 4G High-Speed", amount: 240, type: "expense", category: "Bills", description: "Monthly uncapped workspace broadband", date: "2026-07-03" },
      { title: "Starbites Café Lunch", amount: 68, type: "expense", category: "Food", description: "Grilled chicken sandwich & iced latte", date: "2026-07-04" },
      { title: "Ayigya Spot Banku & Tilapia", amount: 75, type: "expense", category: "Food", description: "Local spot dinner with friends", date: "2026-07-05" },
      { title: "Bolt Ride Kejetia Market", amount: 32, type: "expense", category: "Transport", description: "Ride to Kumasi central business hub", date: "2026-07-06" },
      { title: "Shell Fuel Kumasi Ring Road", amount: 180, type: "expense", category: "Transport", description: "V-Power fuel refill", date: "2026-07-07" },
      { title: "MaxMart Supermarket Grocery", amount: 215, type: "expense", category: "Food", description: "Weekly provisions & pantry stocking", date: "2026-07-08" },
      { title: "ECG Prepaid Meter Token", amount: 150, type: "expense", category: "Bills", description: "Household power replenishment", date: "2026-07-09" },
      { title: "Planet Fitness Gym Membership", amount: 120, type: "expense", category: "Health", description: "Monthly gym access pass", date: "2026-07-10" },
      { title: "Silverbird Cinema & Popcorn", amount: 55, type: "expense", category: "Entertainment", description: "Weekend movie ticket at mall", date: "2026-07-11" },
      { title: "TopUp Pharmacy Prescription", amount: 85, type: "expense", category: "Health", description: "Prescription allergy medicine & vitamins", date: "2026-07-12" },
      { title: "Emergency Family MoMo Transfer", amount: 150, type: "expense", category: "Other", description: "Sent to sister for school supplies", date: "2026-07-13" },
      { title: "Kumasi City Mall Tech Accessories", amount: 190, type: "expense", category: "Shopping", description: "USB-C hub & ergonomic mouse pad", date: "2026-07-14" },
    ];

    for (const item of demo2Transactions) {
      await prisma.transaction.create({
        data: {
          title: item.title,
          amount: item.amount,
          type: item.type,
          category: item.category,
          description: item.description,
          transactionDate: new Date(item.date),
          userId: user2.id,
        },
      });
    }

    const demo2Budgets = [
      { category: "Food", amount: 750 },
      { category: "Transport", amount: 400 },
      { category: "Shopping", amount: 400 },
      { category: "Bills", amount: 600 },
      { category: "Entertainment", amount: 200 },
      { category: "Health", amount: 300 },
      { category: "Education", amount: 250 },
    ];

    for (const b of demo2Budgets) {
      await prisma.budget.upsert({
        where: {
          userId_category_month_year: {
            userId: user2.id,
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
          userId: user2.id,
        },
      });
    }

    console.log("✅ Second demo account created with 15 transactions & default budgets: demo2@spendsense.app");
  } catch (err2) {
    console.log("Note: Demo2 user check skipped or already exists.", err2.message);
  }
}

module.exports = ensureDemoUser;
