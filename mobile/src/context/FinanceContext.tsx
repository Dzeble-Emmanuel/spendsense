import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, createContext, useState, ReactNode, useCallback, useMemo, useContext } from "react";
import { Transaction, Budget, Subscription, AnomalyItem } from "../types/finance";
import api from "../services/api";
import { useAuth } from "./AuthContext";

function getUserStorageKey(
  type: "tx" | "budgets" | "subs",
  user: { email?: string; id?: string } | null
): string | null {
  if (!user || !user.email) {
    return null;
  }
  const cleanEmail = user.email.toLowerCase().trim();
  if (cleanEmail === "demo@spendsense.app") {
    return `spendsense_demo_${type}`;
  }
  if (cleanEmail === "demo2@spendsense.app" || cleanEmail === "test@spendsense.app") {
    return `spendsense_demo2_${type}`;
  }
  const safeId = (user.id || user.email).toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `spendsense_user_${safeId}_${type}`;
}

function makeIsoDate(daysAgo: number, hours: number = 12, minutes: number = 0): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const INITIAL_BUDGETS: Budget[] = [
  { category: "Food & Dining", icon: "coffee", budget: 0 },
  { category: "Transport", icon: "navigation", budget: 0 },
  { category: "Shopping", icon: "shopping-bag", budget: 0 },
  { category: "Bills & Utilities", icon: "zap", budget: 0 },
  { category: "Entertainment", icon: "film", budget: 0 },
  { category: "Health & Wellness", icon: "activity", budget: 0 },
  { category: "Education", icon: "book", budget: 0 },
  { category: "Other", icon: "package", budget: 0 },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  // --- INFLOWS / INCOME ---
  {
    id: "tx-demo-1",
    title: "Monthly Salary Deposit",
    amount: 4500,
    type: "income",
    category: "Salary",
    description: "Corporate direct payroll deposit",
    date: makeIsoDate(2, 9, 30),
    merchant: "Employer Direct",
  },
  {
    id: "tx-demo-2",
    title: "Freelance UI & Web Project",
    amount: 850,
    type: "income",
    category: "Freelance",
    description: "Mobile app wireframing milestone payout",
    date: makeIsoDate(5, 14, 0),
    merchant: "Client Wire Transfer",
  },

  // --- TECH JUNCTION (Habitual Micro-Spending Sink - High Leak Risk) ---
  {
    id: "tx-demo-3",
    title: "Papaye Fast Food Combo",
    amount: 65,
    type: "expense",
    category: "Food & Dining",
    description: "Grilled chicken with fried rice & salad",
    date: makeIsoDate(1, 13, 15), // Afternoon Peak (12:00 - 15:00)
    merchant: "Papaye",
    locationLabel: "Tech Junction",
  },
  {
    id: "tx-demo-4",
    title: "Tech Junction Street Food",
    amount: 35,
    type: "expense",
    category: "Food & Dining",
    description: "Evening fried yam & grilled sausage",
    date: makeIsoDate(2, 18, 30), // Evening Commute (17:00 - 21:00)
    merchant: "Street Vendor",
    locationLabel: "Tech Junction",
  },
  {
    id: "tx-demo-5",
    title: "Fresh Fruit Juice & Pastries",
    amount: 25,
    type: "expense",
    category: "Food & Dining",
    description: "Pineapple-ginger blend & meat pie",
    date: makeIsoDate(3, 12, 45), // Afternoon Peak (12:00 - 15:00)
    merchant: "Tech Junction Juice Bar",
    locationLabel: "Tech Junction",
  },
  {
    id: "tx-demo-6",
    title: "TopUp Pharmacy & First Aid",
    amount: 75,
    type: "expense",
    category: "Health & Wellness",
    description: "Multivitamins and pain relief tablets",
    date: makeIsoDate(5, 17, 10), // Evening Commute (17:00 - 21:00)
    merchant: "TopUp Pharmacy",
    locationLabel: "Tech Junction",
  },
  {
    id: "tx-demo-7",
    title: "Tech Junction Kiosk Snacks",
    amount: 20,
    type: "expense",
    category: "Food & Dining",
    description: "Spring rolls & cold malt drink",
    date: makeIsoDate(6, 17, 45), // Evening Commute (17:00 - 21:00)
    merchant: "Kiosk Kessben",
    locationLabel: "Tech Junction",
  },
  {
    id: "tx-demo-8",
    title: "Tech Junction Evening Bread & Eggs",
    amount: 30,
    type: "expense",
    category: "Food & Dining",
    description: "Fresh tea bread, butter & boiled eggs",
    date: makeIsoDate(7, 19, 15), // Evening Commute (17:00 - 21:00)
    merchant: "Tech Junction Bakery",
    locationLabel: "Tech Junction",
  },
  {
    id: "tx-demo-9",
    title: "Mobile Money Family Support Transfer",
    amount: 200,
    type: "expense",
    category: "Other",
    description: "Monthly upkeep allowance support",
    date: makeIsoDate(9, 12, 10), // Afternoon Peak (12:00 - 15:00)
    merchant: "MTN MoMo Agent",
    locationLabel: "Tech Junction",
  },

  // --- AYIGYA COMMUTE (Morning & Evening Commute Outflows) ---
  {
    id: "tx-demo-10",
    title: "Bolt Ride to Work",
    amount: 32,
    type: "expense",
    category: "Transport",
    description: "Morning rush hour commute to Tech Junction",
    date: makeIsoDate(1, 8, 15), // Morning Rush (07:00 - 10:00)
    merchant: "Bolt",
    locationLabel: "Ayigya Commute",
  },
  {
    id: "tx-demo-11",
    title: "Trotro Commute to Adum",
    amount: 15,
    type: "expense",
    category: "Transport",
    description: "Ayigya to Adum central commercial ride",
    date: makeIsoDate(3, 8, 30), // Morning Rush (07:00 - 10:00)
    merchant: "GPRTU Trotro",
    locationLabel: "Ayigya Commute",
  },
  {
    id: "tx-demo-12",
    title: "Bolt Ride from Campus to Ayigya",
    amount: 28,
    type: "expense",
    category: "Transport",
    description: "Late evening commute from campus gate",
    date: makeIsoDate(7, 18, 45), // Evening Commute (17:00 - 21:00)
    merchant: "Bolt",
    locationLabel: "Ayigya Commute",
  },

  // --- KNUST CAMPUS (Academic & Campus Outflows) ---
  {
    id: "tx-demo-13",
    title: "Campus Academic Thesis Printing",
    amount: 35,
    type: "expense",
    category: "Education",
    description: "Final year project draft & spiral binding",
    date: makeIsoDate(2, 11, 20), // Mid-Day (10:00 - 12:00)
    merchant: "KNUST Commercial Center",
    locationLabel: "KNUST Campus",
  },
  {
    id: "tx-demo-14",
    title: "KNUST Commercial Center Lunch",
    amount: 45,
    type: "expense",
    category: "Food & Dining",
    description: "Jollof rice combo with beef & plantain",
    date: makeIsoDate(4, 13, 0), // Afternoon Peak (12:00 - 15:00)
    merchant: "Campus Canteen",
    locationLabel: "KNUST Campus",
  },
  {
    id: "tx-demo-15",
    title: "KNUST Stationery & Photocopy",
    amount: 25,
    type: "expense",
    category: "Education",
    description: "Lecture slides, notebook & highlighters",
    date: makeIsoDate(6, 14, 15), // Afternoon Peak (12:00 - 15:00)
    merchant: "Faculty Bookshop",
    locationLabel: "KNUST Campus",
  },
  {
    id: "tx-demo-16",
    title: "MTN 4G Campus Data Bundle",
    amount: 90,
    type: "expense",
    category: "Bills & Utilities",
    description: "50GB monthly student research data package",
    date: makeIsoDate(12, 10, 0), // Mid-Day (10:00 - 12:00)
    merchant: "MTN MoMo",
    locationLabel: "KNUST Campus",
  },

  // --- KEJETIA MARKET (Bulk Grocery Shopping & Retail) ---
  {
    id: "tx-demo-17",
    title: "Shoprite Supermarket Groceries",
    amount: 240,
    type: "expense",
    category: "Shopping",
    description: "Rice, cooking oil, canned goods & provisions",
    date: makeIsoDate(4, 15, 30), // Afternoon Casual (15:00 - 17:00)
    merchant: "Shoprite Kejetia",
    locationLabel: "Kejetia Market",
  },
  {
    id: "tx-demo-18",
    title: "Melcom Household Essentials",
    amount: 135,
    type: "expense",
    category: "Shopping",
    description: "Cleaning detergents, toiletries & storage tubs",
    date: makeIsoDate(9, 16, 0), // Afternoon Casual (15:00 - 17:00)
    merchant: "Melcom",
    locationLabel: "Kejetia Market",
  },
  {
    id: "tx-demo-19",
    title: "Silverbird Cinema Tickets & Popcorn",
    amount: 60,
    type: "expense",
    category: "Entertainment",
    description: "Weekend evening movie screening",
    date: makeIsoDate(8, 20, 0), // Evening Commute (17:00 - 21:00)
    merchant: "Silverbird Cinemas",
    locationLabel: "Kejetia Market",
  },

  // --- ADUM BUSINESS DISTRICT (Commercial & Transport Hub) ---
  {
    id: "tx-demo-20",
    title: "TotalEnergies Fuel Top-up",
    amount: 180,
    type: "expense",
    category: "Transport",
    description: "Commercial vehicle petrol recharge",
    date: makeIsoDate(5, 17, 30), // Evening Commute (17:00 - 21:00)
    merchant: "TotalEnergies Adum",
    locationLabel: "Adum Business District",
  },
  {
    id: "tx-demo-21",
    title: "Laptop Charger & Phone Cable",
    amount: 65,
    type: "expense",
    category: "Shopping",
    description: "Braided Type-C fast charging cable",
    date: makeIsoDate(11, 14, 0), // Afternoon Peak (12:00 - 15:00)
    merchant: "Adum Electronics Hub",
    locationLabel: "Adum Business District",
  },
  {
    // Pattern Anomaly (> 1.8x Average Expense)
    id: "tx-demo-22",
    title: "Sudden Laptop RAM & SSD Upgrade",
    amount: 520,
    type: "expense",
    category: "Shopping",
    description: "Hardware replacement and thermal paste servicing",
    date: makeIsoDate(10, 15, 0), // Afternoon Peak (12:00 - 15:00)
    merchant: "Adum Tech Repair",
    locationLabel: "Adum Business District",
  },

  // --- HOME / HOSTEL (Essential Baseline Utilities & Subscriptions) ---
  {
    id: "tx-demo-23",
    title: "ECG Prepaid Power Recharge",
    amount: 180,
    type: "expense",
    category: "Bills & Utilities",
    description: "Monthly residential power token recharge",
    date: makeIsoDate(3, 9, 0), // Morning Rush (07:00 - 10:00)
    merchant: "ECG PowerApp",
    locationLabel: "Home / Hostel",
  },
  {
    id: "tx-demo-24",
    title: "GWCL Domestic Water Bill",
    amount: 65,
    type: "expense",
    category: "Bills & Utilities",
    description: "Monthly residential water utility invoice",
    date: makeIsoDate(6, 10, 30), // Mid-Day (10:00 - 12:00)
    merchant: "GWCL Online",
    locationLabel: "Home / Hostel",
  },
  {
    id: "tx-demo-25",
    title: "MTN Fiber Home Broadband",
    amount: 250,
    type: "expense",
    category: "Bills & Utilities",
    description: "Monthly high-speed fiber internet subscription",
    date: makeIsoDate(15, 10, 0), // Mid-Day (10:00 - 12:00)
    merchant: "MTN Broadband",
    isSubscription: true,
    locationLabel: "Home / Hostel",
  },
  {
    id: "tx-demo-26",
    title: "Netflix Standard Subscription",
    amount: 45,
    type: "expense",
    category: "Entertainment",
    description: "Monthly video streaming package",
    date: makeIsoDate(14, 21, 0), // Night / Off-Hours (21:00 - 06:00)
    merchant: "Netflix",
    isSubscription: true,
    locationLabel: "Home / Hostel",
  },
  {
    id: "tx-demo-27",
    title: "Spotify Premium Plan",
    amount: 30,
    type: "expense",
    category: "Entertainment",
    description: "Monthly music streaming individual renewal",
    date: makeIsoDate(10, 20, 30), // Evening Commute (17:00 - 21:00)
    merchant: "Spotify",
    isSubscription: true,
    locationLabel: "Home / Hostel",
  },

  // --- UNTAGGED EXPENSES (Directly activates the newly built post-save tagging workflow) ---
  {
    id: "tx-demo-28",
    title: "Evening Street Waakye",
    amount: 30,
    type: "expense",
    category: "Food & Dining",
    description: "Waakye pack with egg, wele & spaghetti",
    date: makeIsoDate(2, 18, 0),
    merchant: "Street Food Vendor",
  },
  {
    id: "tx-demo-29",
    title: "Corner Provisions Store",
    amount: 45,
    type: "expense",
    category: "Food & Dining",
    description: "Mineral water pack and biscuit provisions",
    date: makeIsoDate(4, 9, 30),
    merchant: "Neighborhood Shop",
  },
  {
    id: "tx-demo-30",
    title: "MoMo Agent Cashout Fee",
    amount: 15,
    type: "expense",
    category: "Other",
    description: "Cash withdrawal service commission",
    date: makeIsoDate(6, 13, 0),
    merchant: "MoMo Agent",
  },
];

export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-demo-1",
    name: "MTN Fiber Broadband",
    amount: 250,
    billingCycle: "monthly",
    category: "Bills & Utilities",
    icon: "wifi",
    color: "#F59E0B",
    nextDueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 120 * 86400000).toISOString().split("T")[0],
  },
  {
    id: "sub-demo-2",
    name: "Netflix Standard",
    amount: 45,
    billingCycle: "monthly",
    category: "Entertainment",
    icon: "film",
    color: "#E11D48",
    nextDueDate: new Date(Date.now() + 11 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0],
  },
  {
    id: "sub-demo-3",
    name: "Spotify Premium",
    amount: 30,
    billingCycle: "monthly",
    category: "Entertainment",
    icon: "music",
    color: "#10B981",
    nextDueDate: new Date(Date.now() + 17 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0],
  },
  {
    id: "sub-demo-4",
    name: "Apple iCloud Storage",
    amount: 18,
    billingCycle: "monthly",
    category: "Bills & Utilities",
    icon: "cloud",
    color: "#3B82F6",
    nextDueDate: new Date(Date.now() + 24 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 150 * 86400000).toISOString().split("T")[0],
  },
];

export const DEMO_BUDGETS: Budget[] = [
  { category: "Food & Dining", icon: "coffee", budget: 450 },
  { category: "Transport", icon: "navigation", budget: 350 },
  { category: "Shopping", icon: "shopping-bag", budget: 1100 },
  { category: "Bills & Utilities", icon: "zap", budget: 750 },
  { category: "Entertainment", icon: "film", budget: 200 },
  { category: "Health & Wellness", icon: "activity", budget: 150 },
  { category: "Education", icon: "book", budget: 150 },
  { category: "Other", icon: "package", budget: 300 },
];

export const DEMO2_TRANSACTIONS: Transaction[] = [
  // --- INFLOWS / INCOME ---
  {
    id: "tx-demo2-1",
    title: "Monthly Tech Retainer Deposit",
    amount: 5200,
    type: "income",
    category: "Salary",
    description: "Remote software engineering monthly compensation",
    date: makeIsoDate(1, 9, 0),
    merchant: "Tech Partners West Africa",
  },
  {
    id: "tx-demo2-2",
    title: "Fintech Security Consulting",
    amount: 1200,
    type: "income",
    category: "Freelance",
    description: "API penetration test milestone fee",
    date: makeIsoDate(4, 15, 30),
    merchant: "Accra Fintech Lab",
  },

  // --- EXPENSES ---
  {
    id: "tx-demo2-3",
    title: "KNUST Bookstore & Tech Manuals",
    amount: 140,
    type: "expense",
    category: "Education",
    description: "Distributed Systems & Machine Learning books",
    date: makeIsoDate(2, 11, 20),
    merchant: "KNUST Central Bookshop",
    locationLabel: "KNUST Campus",
  },
  {
    id: "tx-demo2-4",
    title: "MTN TurboNet 4G Unlimited Data",
    amount: 240,
    type: "expense",
    category: "Bills & Utilities",
    description: "Monthly uncapped high-speed development bundle",
    date: makeIsoDate(3, 10, 0),
    merchant: "MTN Ghana",
    locationLabel: "Tech Junction",
  },
  {
    id: "tx-demo2-5",
    title: "Starbites Café Work Lunch",
    amount: 68,
    type: "expense",
    category: "Food & Dining",
    description: "Grilled chicken sandwich, fries & iced latte",
    date: makeIsoDate(2, 13, 30),
    merchant: "Starbites Accra",
    locationLabel: "Airport Residential",
  },
  {
    id: "tx-demo2-6",
    title: "Ayigya Spot Banku & Tilapia",
    amount: 75,
    type: "expense",
    category: "Food & Dining",
    description: "Evening dinner with engineering team",
    date: makeIsoDate(3, 19, 45),
    merchant: "Ayigya Local Joint",
    locationLabel: "Ayigya",
  },
  {
    id: "tx-demo2-7",
    title: "Bolt Ride to Kejetia Central",
    amount: 32,
    type: "expense",
    category: "Transport",
    description: "Ride to Kumasi commercial centre",
    date: makeIsoDate(4, 14, 15),
    merchant: "Bolt Ghana",
    locationLabel: "Kejetia",
  },
  {
    id: "tx-demo2-8",
    title: "Shell Fuel Station Ring Road",
    amount: 180,
    type: "expense",
    category: "Transport",
    description: "Shell V-Power fuel replenishment",
    date: makeIsoDate(5, 8, 30),
    merchant: "Shell Kumasi",
    locationLabel: "Kumasi",
  },
  {
    id: "tx-demo2-9",
    title: "MaxMart Supermarket Provisions",
    amount: 215,
    type: "expense",
    category: "Food & Dining",
    description: "Pantry restocking, olive oil, oats & dairy",
    date: makeIsoDate(6, 16, 20),
    merchant: "MaxMart Accra",
    locationLabel: "Cantonments",
  },
  {
    id: "tx-demo2-10",
    title: "ECG Smart Meter Power Units",
    amount: 150,
    type: "expense",
    category: "Bills & Utilities",
    description: "Prepaid electricity replenishment",
    date: makeIsoDate(7, 9, 15),
    merchant: "ECG Ghana",
  },
  {
    id: "tx-demo2-11",
    title: "Planet Fitness Gym Membership",
    amount: 120,
    type: "expense",
    category: "Health & Wellness",
    description: "Monthly gym and swimming pass",
    date: makeIsoDate(8, 7, 0),
    merchant: "Planet Fitness",
  },
  {
    id: "tx-demo2-12",
    title: "Silverbird Cinema IMAX Ticket",
    amount: 55,
    type: "expense",
    category: "Entertainment",
    description: "Weekend film & salted popcorn",
    date: makeIsoDate(8, 20, 0),
    merchant: "Silverbird Cinemas",
    locationLabel: "Accra Mall",
  },
  {
    id: "tx-demo2-13",
    title: "TopUp Pharmacy Vitamin C & First Aid",
    amount: 85,
    type: "expense",
    category: "Health & Wellness",
    description: "Immune support supplement and medical kit",
    date: makeIsoDate(9, 11, 40),
    merchant: "TopUp Pharmacy",
  },
  {
    id: "tx-demo2-14",
    title: "Emergency Family MoMo Transfer",
    amount: 150,
    type: "expense",
    category: "Other",
    description: "Sent support for school semester textbooks",
    date: makeIsoDate(10, 13, 0),
    merchant: "MTN MoMo",
  },
  {
    id: "tx-demo2-15",
    title: "Kumasi City Mall Tech Accessories",
    amount: 190,
    type: "expense",
    category: "Shopping",
    description: "Multiport USB-C docking station & cable",
    date: makeIsoDate(11, 15, 50),
    merchant: "CompuGhana",
    locationLabel: "Kumasi City Mall",
  },
];

export const DEMO2_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-demo2-1",
    title: "MTN TurboNet 4G Broadband",
    amount: 240,
    category: "Bills & Utilities",
    billingCycle: "monthly",
    icon: "wifi",
    color: "#F59E0B",
    nextDueDate: new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 180 * 86400000).toISOString().split("T")[0],
  },
  {
    id: "sub-demo2-2",
    title: "Spotify Individual Premium",
    amount: 35,
    category: "Entertainment",
    billingCycle: "monthly",
    icon: "music",
    color: "#10B981",
    nextDueDate: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 240 * 86400000).toISOString().split("T")[0],
  },
  {
    id: "sub-demo2-3",
    title: "Netflix Standard Plan",
    amount: 85,
    category: "Entertainment",
    billingCycle: "monthly",
    icon: "tv",
    color: "#F43F5E",
    nextDueDate: new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 120 * 86400000).toISOString().split("T")[0],
  },
  {
    id: "sub-demo2-4",
    title: "Planet Fitness Gym Pass",
    amount: 120,
    category: "Health & Wellness",
    billingCycle: "monthly",
    icon: "activity",
    color: "#3B82F6",
    nextDueDate: new Date(Date.now() + 22 * 86400000).toISOString().split("T")[0],
    isActive: true,
    startedDate: new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0],
  },
];

export const DEMO2_BUDGETS: Budget[] = [
  { category: "Food & Dining", icon: "coffee", budget: 750 },
  { category: "Transport", icon: "navigation", budget: 400 },
  { category: "Shopping", icon: "shopping-bag", budget: 400 },
  { category: "Bills & Utilities", icon: "zap", budget: 600 },
  { category: "Entertainment", icon: "film", budget: 200 },
  { category: "Health & Wellness", icon: "activity", budget: 300 },
  { category: "Education", icon: "book", budget: 250 },
  { category: "Other", icon: "package", budget: 300 },
];

export type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id"> | Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;

  budgets: Budget[];
  updateBudget: (category: string, newLimit: number) => void;

  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, "id"> | Subscription) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscriptionActive: (id: string) => void;

  income: number;
  expenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
  anomalies: AnomalyItem[];
  healthScore: { score: number; status: string };

  isLoading: boolean;
  syncWithBackend: () => Promise<void>;
  clearAllData: () => Promise<void>;
  seedDemoData: () => Promise<void>;
  seedDemo2Data: () => Promise<void>;
};

export const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync data whenever authenticated session changes
  useEffect(() => {
    loadAllData();
  }, [user?.email, user?.id]);

  // Persist transactions exclusively to the logged-in account
  useEffect(() => {
    if (!isLoaded || !user) return;
    const key = getUserStorageKey("tx", user);
    if (key) {
      AsyncStorage.setItem(key, JSON.stringify(transactions)).catch(() => {});
    }
  }, [transactions, isLoaded, user]);

  // Persist budgets exclusively to the logged-in account
  useEffect(() => {
    if (!isLoaded || !user) return;
    const key = getUserStorageKey("budgets", user);
    if (key) {
      AsyncStorage.setItem(key, JSON.stringify(budgets)).catch(() => {});
    }
  }, [budgets, isLoaded, user]);

  // Persist subscriptions exclusively to the logged-in account
  useEffect(() => {
    if (!isLoaded || !user) return;
    const key = getUserStorageKey("subs", user);
    if (key) {
      AsyncStorage.setItem(key, JSON.stringify(subscriptions)).catch(() => {});
    }
  }, [subscriptions, isLoaded, user]);

  async function loadAllData() {
    setIsLoading(true);
    setIsLoaded(false);

    try {
      // 1. Purge legacy global un-isolated keys so old unlinked data never surfaces
      await AsyncStorage.multiRemove([
        "spendsense_transactions",
        "spendsense_budgets",
        "spendsense_subscriptions",
      ]).catch(() => {});

      // 2. Resolve active authenticated identity
      let activeUser = user;
      if (!activeUser?.email) {
        const savedUserStr = await AsyncStorage.getItem("spendsense_user");
        if (savedUserStr) {
          try {
            activeUser = JSON.parse(savedUserStr);
          } catch {}
        }
      }

      // 3. If NO LOGIN exists, strictly keep the app 100% EMPTY (zero data in the app)
      if (!activeUser || !activeUser.email) {
        setTransactions([]);
        setBudgets(INITIAL_BUDGETS);
        setSubscriptions([]);
        setIsLoading(false);
        setIsLoaded(true);
        return;
      }

      const cleanEmail = activeUser.email.toLowerCase().trim();
      const isDemo1 = cleanEmail === "demo@spendsense.app";
      const isDemo2 = cleanEmail === "demo2@spendsense.app" || cleanEmail === "test@spendsense.app";
      const txKey = getUserStorageKey("tx", activeUser)!;
      const budgetsKey = getUserStorageKey("budgets", activeUser)!;
      const subsKey = getUserStorageKey("subs", activeUser)!;

      if (isDemo1) {
        // DEMO LOGIN 1 (Nana Kwame Konadu - Pre-verified Account)
        const savedTx = await AsyncStorage.getItem(txKey);
        let parsedTx: Transaction[] = [];
        try {
          parsedTx = savedTx ? JSON.parse(savedTx) : [];
        } catch {}

        if (parsedTx.length > 0) {
          setTransactions(parsedTx);
        } else {
          setTransactions(DEMO_TRANSACTIONS);
          await AsyncStorage.setItem(txKey, JSON.stringify(DEMO_TRANSACTIONS));
        }

        const savedBudgets = await AsyncStorage.getItem(budgetsKey);
        let parsedBudgets: Budget[] = [];
        try {
          parsedBudgets = savedBudgets ? JSON.parse(savedBudgets) : [];
        } catch {}

        if (parsedBudgets.length > 0) {
          setBudgets(parsedBudgets);
        } else {
          setBudgets(DEMO_BUDGETS);
          await AsyncStorage.setItem(budgetsKey, JSON.stringify(DEMO_BUDGETS));
        }

        const savedSubs = await AsyncStorage.getItem(subsKey);
        let parsedSubs: Subscription[] = [];
        try {
          parsedSubs = savedSubs ? JSON.parse(savedSubs) : [];
        } catch {}

        if (parsedSubs.length > 0) {
          setSubscriptions(parsedSubs);
        } else {
          setSubscriptions(DEMO_SUBSCRIPTIONS);
          await AsyncStorage.setItem(subsKey, JSON.stringify(DEMO_SUBSCRIPTIONS));
        }
      } else if (isDemo2) {
        // DEMO LOGIN 2 (Kofi Mensah - Unverified Account)
        const savedTx = await AsyncStorage.getItem(txKey);
        let parsedTx: Transaction[] = [];
        try {
          parsedTx = savedTx ? JSON.parse(savedTx) : [];
        } catch {}

        if (parsedTx.length > 0) {
          setTransactions(parsedTx);
        } else {
          setTransactions(DEMO2_TRANSACTIONS);
          await AsyncStorage.setItem(txKey, JSON.stringify(DEMO2_TRANSACTIONS));
        }

        const savedBudgets = await AsyncStorage.getItem(budgetsKey);
        let parsedBudgets: Budget[] = [];
        try {
          parsedBudgets = savedBudgets ? JSON.parse(savedBudgets) : [];
        } catch {}

        if (parsedBudgets.length > 0) {
          setBudgets(parsedBudgets);
        } else {
          setBudgets(DEMO2_BUDGETS);
          await AsyncStorage.setItem(budgetsKey, JSON.stringify(DEMO2_BUDGETS));
        }

        const savedSubs = await AsyncStorage.getItem(subsKey);
        let parsedSubs: Subscription[] = [];
        try {
          parsedSubs = savedSubs ? JSON.parse(savedSubs) : [];
        } catch {}

        if (parsedSubs.length > 0) {
          setSubscriptions(parsedSubs);
        } else {
          setSubscriptions(DEMO2_SUBSCRIPTIONS);
          await AsyncStorage.setItem(subsKey, JSON.stringify(DEMO2_SUBSCRIPTIONS));
        }
      } else {
        // PERSONAL REGISTERED ACCOUNT: Strictly user-owned data only; starts clean
        const savedTx = await AsyncStorage.getItem(txKey);
        if (savedTx) {
          try {
            const parsed = JSON.parse(savedTx);
            const userOnly = Array.isArray(parsed)
              ? parsed.filter((t: Transaction) => !t.id?.startsWith("tx-demo-") && !t.id?.startsWith("tx-demo2-"))
              : [];
            setTransactions(userOnly);
          } catch {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }

        const savedBudgets = await AsyncStorage.getItem(budgetsKey);
        if (savedBudgets) {
          try {
            const parsed = JSON.parse(savedBudgets);
            setBudgets(Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BUDGETS);
          } catch {
            setBudgets(INITIAL_BUDGETS);
          }
        } else {
          setBudgets(INITIAL_BUDGETS);
        }

        const savedSubs = await AsyncStorage.getItem(subsKey);
        if (savedSubs) {
          try {
            const parsed = JSON.parse(savedSubs);
            const userOnly = Array.isArray(parsed)
              ? parsed.filter((s: Subscription) => !s.id?.startsWith("sub-demo-") && !s.id?.startsWith("sub-demo2-"))
              : [];
            setSubscriptions(userOnly);
          } catch {
            setSubscriptions([]);
          }
        } else {
          setSubscriptions([]);
        }
      }
    } catch (error) {
      console.error("Failed to load user-scoped finance storage:", error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }

  async function seedDemoData() {
    setTransactions(DEMO_TRANSACTIONS);
    setSubscriptions(DEMO_SUBSCRIPTIONS);
    setBudgets(DEMO_BUDGETS);

    const demoUser = { email: "demo@spendsense.app", id: "demo" };
    const txKey = getUserStorageKey("tx", demoUser)!;
    const budgetsKey = getUserStorageKey("budgets", demoUser)!;
    const subsKey = getUserStorageKey("subs", demoUser)!;

    await Promise.all([
      AsyncStorage.setItem(txKey, JSON.stringify(DEMO_TRANSACTIONS)),
      AsyncStorage.setItem(subsKey, JSON.stringify(DEMO_SUBSCRIPTIONS)),
      AsyncStorage.setItem(budgetsKey, JSON.stringify(DEMO_BUDGETS)),
    ]);
  }

  async function seedDemo2Data() {
    setTransactions(DEMO2_TRANSACTIONS);
    setSubscriptions(DEMO2_SUBSCRIPTIONS);
    setBudgets(DEMO2_BUDGETS);

    const demo2User = { email: "demo2@spendsense.app", id: "demo2" };
    const txKey = getUserStorageKey("tx", demo2User)!;
    const budgetsKey = getUserStorageKey("budgets", demo2User)!;
    const subsKey = getUserStorageKey("subs", demo2User)!;

    await Promise.all([
      AsyncStorage.setItem(txKey, JSON.stringify(DEMO2_TRANSACTIONS)),
      AsyncStorage.setItem(subsKey, JSON.stringify(DEMO2_SUBSCRIPTIONS)),
      AsyncStorage.setItem(budgetsKey, JSON.stringify(DEMO2_BUDGETS)),
    ]);
  }

  // Transaction mutations
  function addTransaction(tx: Omit<Transaction, "id"> | Transaction) {
    const newTx: Transaction = {
      ...tx,
      id: "id" in tx && tx.id ? tx.id : `tx-${Date.now()}`,
      date: tx.date || new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    (async () => {
      try {
        const token = await AsyncStorage.getItem("spendsense_token");
        if (token && token !== "local-token" && token !== "demo-token") {
          await api.post("/transactions", {
            title: newTx.title,
            amount: newTx.amount,
            type: newTx.type,
            category: newTx.category,
            description: newTx.description,
            date: newTx.date,
          });
        }
      } catch (err) {
        console.log("Could not sync transaction to cloud, stored locally:", err);
      }
    })();
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    (async () => {
      try {
        const token = await AsyncStorage.getItem("spendsense_token");
        if (token && token !== "local-token" && token !== "demo-token") {
          await api.delete(`/transactions/${id}`);
        }
      } catch (err) {
        console.log("Cloud delete skipped:", err);
      }
    })();
  }

  function updateTransaction(updatedTx: Transaction) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  }

  // Budget mutations
  function updateBudget(category: string, newLimit: number) {
    setBudgets((prev) =>
      prev.map((b) =>
        b.category.toLowerCase() === category.toLowerCase()
          ? { ...b, budget: newLimit }
          : b
      )
    );
  }

  // Subscription mutations
  function addSubscription(sub: Omit<Subscription, "id"> | Subscription) {
    const newSub: Subscription = {
      ...sub,
      id: "id" in sub && sub.id ? sub.id : `sub-${Date.now()}`,
    };
    setSubscriptions((prev) => [...prev, newSub]);
  }

  function deleteSubscription(id: string) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  function toggleSubscriptionActive(id: string) {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  }

  // Cloud sync
  const syncWithBackend = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("spendsense_token");
      if (!token || token === "local-token" || token === "demo-token") return;

      const res = await api.get("/transactions");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTransactions(res.data);
      }
    } catch (e) {
      console.log("Sync skipped (offline or server error):", e);
    }
  }, []);

  // Erase all records (Ledger Reset action)
  const clearAllData = async () => {
    setTransactions([]);
    setSubscriptions([]);
    setBudgets(INITIAL_BUDGETS);
    if (user) {
      const txKey = getUserStorageKey("tx", user);
      const budgetsKey = getUserStorageKey("budgets", user);
      const subsKey = getUserStorageKey("subs", user);
      const keysToRemove = [txKey, budgetsKey, subsKey].filter(Boolean) as string[];
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    }
  };

  // Calculations
  const income = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const expenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const balance = useMemo(() => {
    return income - expenses;
  }, [income, expenses]);

  const savings = useMemo(() => {
    return balance > 0 ? balance : 0;
  }, [balance]);

  const savingsRate = useMemo(() => {
    if (income <= 0) return 0;
    return Math.max(0, Math.round(((income - expenses) / income) * 100));
  }, [income, expenses]);

  const healthScore = useMemo(() => {
    if (income === 0 && expenses === 0) {
      return { score: 70, status: "Ready for first transaction" };
    }

    let score = 50;
    if (savingsRate > 40) score += 30;
    else if (savingsRate > 20) score += 20;

    if (expenses > income) score -= 30;
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    let status = "Excellent Health";
    if (score < 50) status = "Needs Immediate Attention";
    else if (score < 75) status = "Fair / Balanced";
    else if (score < 90) status = "Good Financial Standing";

    return { score, status };
  }, [savingsRate, expenses, income]);

  const anomalies = useMemo<AnomalyItem[]>(() => {
    const expenseTxs = transactions.filter((t) => t.type === "expense");
    if (expenseTxs.length === 0) return [];
    const avgExpense =
      expenseTxs.reduce((sum, t) => sum + t.amount, 0) / expenseTxs.length;

    return expenseTxs
      .filter((t) => t.amount > avgExpense * 1.8)
      .map((t) => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        category: t.category,
        reason: `Unusually large single expense (${Math.round(
          (t.amount / Math.max(avgExpense, 1)) * 100 - 100
        )}% above your average)`,
        date: t.date,
      }));
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        budgets,
        updateBudget,
        subscriptions,
        addSubscription,
        deleteSubscription,
        toggleSubscriptionActive,
        income,
        expenses,
        balance,
        savings,
        savingsRate,
        anomalies,
        healthScore,
        isLoading,
        syncWithBackend,
        clearAllData,
        seedDemoData,
        seedDemo2Data,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return ctx;
}