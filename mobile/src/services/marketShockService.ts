import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "../types/finance";

const MACRO_STORAGE_KEY = "@spendsense_macro_indicators_cache";

export interface MacroIndicator {
  id: "fuel" | "forex" | "inflation";
  title: string;
  categoryName: string;
  iconName: "droplet" | "dollar-sign" | "trending-up";
  currentValue: string;
  numericRate?: number;
  changePercent: number; // positive = increase, negative = decrease
  changePeriod: string;
  source: string;
  lastUpdated: string;
  description: string;
  isLive?: boolean;
}

export interface PersonalizedShock {
  indicatorId: "fuel" | "forex" | "inflation";
  category: string;
  title: string;
  iconName: "navigation" | "globe" | "shopping-cart";
  personalMonthlySpend: number;
  estimatedMonthlyImpact: number;
  unitImpactText: string;
  advice: string;
  severity: "high" | "medium" | "low";
}

export interface ShockAnalysisReport {
  indicators: MacroIndicator[];
  personalShocks: PersonalizedShock[];
  totalMonthlyBurden: number;
  highestRiskCategory: string;
  recommendedBudgetBuffer: number;
  isLiveFeed: boolean;
  lastSynced: string;
}

/**
 * Standard baseline Ghanaian macroeconomic benchmarks
 * Sourced from NPA bi-weekly pricing windows, Bank of Ghana interbank FX, and GSS CPI.
 */
export const BASELINE_MACRO_INDICATORS: MacroIndicator[] = [
  {
    id: "fuel",
    title: "Fuel Pump Price (Petrol / Diesel)",
    categoryName: "Transport & Commute",
    iconName: "droplet",
    currentValue: "GH₵ 14.85 / L",
    numericRate: 14.85,
    changePercent: 1.5,
    changePeriod: "NPA bi-weekly window",
    source: "National Petroleum Authority (NPA)",
    lastUpdated: "Bi-weekly Pricing Window",
    description: "Average retail petrol price across major OMCs (GOIL, Total, Shell) for the current regulatory window.",
    isLive: false,
  },
  {
    id: "forex",
    title: "Exchange Rate (USD / GHS)",
    categoryName: "Subscriptions & Tech",
    iconName: "dollar-sign",
    currentValue: "$1 = GH₵ 15.65",
    numericRate: 15.65,
    changePercent: 1.8,
    changePeriod: "Trailing 30 days",
    source: "Bank of Ghana Interbank FX",
    lastUpdated: "Daily Market Reference",
    description: "Commercial interbank exchange rate impacting foreign subscriptions and imported digital services.",
    isLive: false,
  },
  {
    id: "inflation",
    title: "Food & Consumer CPI Inflation",
    categoryName: "Food & Groceries",
    iconName: "trending-up",
    currentValue: "20.4% YoY",
    numericRate: 20.4,
    changePercent: 1.2,
    changePeriod: "Month-on-Month",
    source: "Ghana Statistical Service (GSS)",
    lastUpdated: "Monthly CPI Bulletin",
    description: "Food and non-alcoholic beverage consumer basket adjustment reported by the national statistical bureau.",
    isLive: false,
  },
];

/**
 * Fetches real-time exchange rates from open currency APIs and blends with NPA/GSS benchmarks.
 */
export async function fetchLiveMacroIndicators(): Promise<MacroIndicator[]> {
  try {
    // Attempt to fetch real-time USD/GHS rate from free live API with 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const liveGhs = data?.rates?.GHS;

      if (typeof liveGhs === "number" && liveGhs > 0) {
        const updatedIndicators: MacroIndicator[] = BASELINE_MACRO_INDICATORS.map((item) => {
          if (item.id === "forex") {
            const formattedRate = liveGhs.toFixed(2);
            return {
              ...item,
              currentValue: `$1 = GH₵ ${formattedRate}`,
              numericRate: liveGhs,
              source: "Live Market FX (Bank of Ghana / Open API)",
              lastUpdated: "Live Feed",
              isLive: true,
              description: `Real-time spot rate: $1 equals GH₵ ${formattedRate}. Cross-border subscriptions reflect this current interbank valuation.`,
            };
          }
          return item;
        });

        // Cache for offline usage
        await AsyncStorage.setItem(MACRO_STORAGE_KEY, JSON.stringify(updatedIndicators));
        return updatedIndicators;
      }
    }
  } catch (error) {
    // Graceful offline fallback
    console.log("Live macro feed fetch fallback to cached/baseline indicators");
  }

  // Check cached data
  try {
    const cached = await AsyncStorage.getItem(MACRO_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return BASELINE_MACRO_INDICATORS;
}

/**
 * Computes personalized financial shock impact based on user's real transactions.
 */
export function analyzePersonalPriceShocks(
  transactions: Transaction[],
  indicators: MacroIndicator[] = BASELINE_MACRO_INDICATORS
): ShockAnalysisReport {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // 1. Analyze Transport Spend
  const transportTx = expenseTransactions.filter(
    (t) =>
      t.category.toLowerCase().includes("transport") ||
      t.category.toLowerCase().includes("fuel") ||
      t.title.toLowerCase().includes("bolt") ||
      t.title.toLowerCase().includes("uber") ||
      t.title.toLowerCase().includes("ride") ||
      t.title.toLowerCase().includes("commute")
  );
  const transportTotal = transportTx.reduce((sum, t) => sum + t.amount, 0);
  const transportRidesCount = transportTx.length || 1;
  const avgRideCost = transportTotal > 0 ? transportTotal / transportRidesCount : 30;

  // 1.5% fuel hike cascades to 3.5% - 5% transport fare surcharge
  const fuelIndicator = indicators.find((i) => i.id === "fuel");
  const fuelPct = fuelIndicator?.changePercent || 1.5;
  const transportMultiplier = (fuelPct * 2.8) / 100;
  const estTransportImpact = Math.round(transportTotal * transportMultiplier) || Math.round(transportRidesCount * 5);
  const tripSurcharge = Math.max(2, Math.round(avgRideCost * transportMultiplier * 10) / 10);

  // 2. Analyze Foreign / Digital Subscriptions & Tech
  const subTx = expenseTransactions.filter(
    (t) =>
      t.isSubscription ||
      t.category.toLowerCase().includes("subscription") ||
      t.category.toLowerCase().includes("entertainment") ||
      t.title.toLowerCase().includes("netflix") ||
      t.title.toLowerCase().includes("spotify") ||
      t.title.toLowerCase().includes("apple") ||
      t.title.toLowerCase().includes("google") ||
      t.title.toLowerCase().includes("cloud")
  );
  const subTotal = subTx.reduce((sum, t) => sum + t.amount, 0);
  const forexIndicator = indicators.find((i) => i.id === "forex");
  const forexPct = forexIndicator?.changePercent || 1.8;
  const estForexImpact = Math.round(subTotal * (forexPct / 100)) || 15;

  // 3. Analyze Food & Groceries
  const foodTx = expenseTransactions.filter(
    (t) =>
      t.category.toLowerCase().includes("food") ||
      t.category.toLowerCase().includes("dining") ||
      t.category.toLowerCase().includes("grocery") ||
      t.title.toLowerCase().includes("supermarket") ||
      t.title.toLowerCase().includes("shoprite") ||
      t.title.toLowerCase().includes("melcom")
  );
  const foodTotal = foodTx.reduce((sum, t) => sum + t.amount, 0);
  const inflationIndicator = indicators.find((i) => i.id === "inflation");
  const inflationPct = inflationIndicator?.changePercent || 1.2;
  const estFoodImpact = Math.round(foodTotal * (inflationPct / 100)) || 35;

  const totalMonthlyBurden = estTransportImpact + estForexImpact + estFoodImpact;
  const isAnyLive = indicators.some((i) => i.isLive);

  const personalShocks: PersonalizedShock[] = [
    {
      indicatorId: "fuel",
      category: "Transport & Rides",
      title: "Fuel Surcharge on Daily Commute",
      iconName: "navigation",
      personalMonthlySpend: transportTotal,
      estimatedMonthlyImpact: estTransportImpact,
      unitImpactText: `+GH₵ ${tripSurcharge.toFixed(2)} per trip (~${transportRidesCount} trips)`,
      advice: "Shift 2 morning commute rides per week to off-peak hours (before 7:15 AM or after 9:00 AM) to avoid peak surge multipliers.",
      severity: estTransportImpact > 40 ? "high" : "medium",
    },
    {
      indicatorId: "forex",
      category: "Subscriptions & Tech",
      title: "USD FX Impact on Digital Services",
      iconName: "globe",
      personalMonthlySpend: subTotal,
      estimatedMonthlyImpact: estForexImpact,
      unitImpactText: `+GH₵ ${estForexImpact.toFixed(2)} added across active plans`,
      advice: "Audit active recurring digital services. Consider annual family plans or local cedi-denominated payment gateways.",
      severity: estForexImpact > 25 ? "medium" : "low",
    },
    {
      indicatorId: "inflation",
      category: "Food & Groceries",
      title: "Food Basket Price Creep",
      iconName: "shopping-cart",
      personalMonthlySpend: foodTotal,
      estimatedMonthlyImpact: estFoodImpact,
      unitImpactText: `+GH₵ ${estFoodImpact.toFixed(2)} monthly pantry creep`,
      advice: "Batch bulk staple grocery purchases (rice, oil, grains) monthly rather than paying retail spot prices weekly.",
      severity: estFoodImpact > 50 ? "high" : "medium",
    },
  ];

  return {
    indicators,
    personalShocks,
    totalMonthlyBurden,
    highestRiskCategory: "Transport & Rides",
    recommendedBudgetBuffer: Math.round(totalMonthlyBurden * 1.15),
    isLiveFeed: isAnyLive,
    lastSynced: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}
