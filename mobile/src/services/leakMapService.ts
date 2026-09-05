import {
  Transaction,
  LocationSummary,
  LeakAnalysisReport,
  LeakRiskStatus,
} from "../types/finance";

/**
 * Categorizes a date timestamp into discrete behavioral temporal windows.
 */
export function binTimeWindow(dateString: string): string {
  try {
    const d = new Date(dateString);
    const hours = d.getHours();

    if (hours >= 6 && hours < 10) return "Morning Commute (06:00 - 10:00)";
    if (hours >= 10 && hours < 12) return "Mid-Morning Break (10:00 - 12:00)";
    if (hours >= 12 && hours < 15) return "Lunch & Peak (12:00 - 15:00)";
    if (hours >= 15 && hours < 17) return "Afternoon (15:00 - 17:00)";
    if (hours >= 17 && hours < 21) return "Evening Commute (17:00 - 21:00)";
    return "Night / Off-Hours (21:00 - 06:00)";
  } catch {
    return "Afternoon Peak (12:00 - 15:00)";
  }
}

/**
 * Returns a vector icon name for the semantic location.
 */
export function getIconForLocation(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("tech") || lower.includes("junction") || lower.includes("transit")) {
    return "navigation";
  }
  if (lower.includes("campus") || lower.includes("knust") || lower.includes("school")) {
    return "book-open";
  }
  if (lower.includes("market") || lower.includes("kejetia") || lower.includes("adum")) {
    return "shopping-cart";
  }
  if (lower.includes("home") || lower.includes("hostel")) {
    return "home";
  }
  if (lower.includes("work") || lower.includes("office")) {
    return "briefcase";
  }
  if (lower.includes("ayigya") || lower.includes("commute")) {
    return "compass";
  }
  return "map-pin";
}

/**
 * Resolves semantic location for an expense.
 * Strict Rule:
 * 1. User's explicit locationLabel is prioritized.
 * 2. Rent and utilities (ECG, water, power, rent, hostel, bills) are mapped to "Home / Hostel".
 * 3. If an explicit location keyword is found on the receipt or transaction text (e.g. "tech junction", "kejetia", "knust", "adum", "campus"), extract that specific name.
 * 4. Otherwise, return "Untagged" — do NOT guess or assign arbitrary locations on our own!
 */
export function inferLocation(tx: Transaction): string {
  // 1. User's explicit input
  if (tx.locationLabel && tx.locationLabel.trim().length > 0 && tx.locationLabel !== "Untagged") {
    return tx.locationLabel.trim();
  }

  const text = `${tx.title} ${tx.merchant || ""} ${tx.description || ""}`.toLowerCase();

  // 2. Rent & Utilities rule: automatically map to Home / Hostel
  if (
    text.includes("rent") ||
    text.includes("ecg") ||
    text.includes("power") ||
    text.includes("electricity") ||
    text.includes("water bill") ||
    text.includes("gwcl") ||
    text.includes("hostel fee") ||
    tx.category.toLowerCase().includes("bills & utilities")
  ) {
    return "Home / Hostel";
  }

  // 3. Explicit location mentioned in receipt or transaction notification text
  if (text.includes("tech junction") || text.includes("tech jct")) {
    return "Tech Junction";
  }
  if (text.includes("knust") || text.includes("campus")) {
    return "KNUST Campus";
  }
  if (text.includes("kejetia")) {
    return "Kejetia Market";
  }
  if (text.includes("ayigya")) {
    return "Ayigya Commute";
  }
  if (text.includes("adum")) {
    return "Adum Business District";
  }

  // 4. Do NOT determine on our own — return Untagged so the user can input it!
  return "Untagged";
}

/**
 * Calculates the mode (most frequent item) of a string array.
 */
function getMode(arr: string[]): string {
  if (arr.length === 0) return "General";
  const counts: Record<string, number> = {};
  let maxCount = 0;
  let mode = arr[0];

  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxCount = counts[item];
      mode = item;
    }
  }
  return mode;
}

/**
 * The Leak Score Algorithm (LSA)
 * Evaluates capital share tempered by habitual frequency:
 * Leak Score = (Total Spent at Location / Total Monthly Outflow) * ln(1 + Frequency) * 100
 */
export function calculateLocationLeakMetrics(transactions: Transaction[]): LeakAnalysisReport {
  const expenseTx = transactions.filter((t) => t.type === "expense");
  const totalOutflow = expenseTx.reduce((sum, t) => sum + t.amount, 0);

  if (totalOutflow === 0 || expenseTx.length === 0) {
    return {
      locations: [],
      totalTrackedSpend: 0,
      highestLeakZone: null,
      highRiskCount: 0,
      prescriptiveNudge: "No expense data logged yet. Tag expenses with locations to detect silent leaks.",
      untaggedCount: 0,
      untaggedAmount: 0,
    };
  }

  // 1. Group transactions by semantic location, counting untagged separately
  const locationBuckets: Record<string, Transaction[]> = {};
  let untaggedCount = 0;
  let untaggedAmount = 0;

  for (const tx of expenseTx) {
    const loc = inferLocation(tx);
    if (loc === "Untagged") {
      untaggedCount++;
      untaggedAmount += tx.amount;
      continue;
    }
    if (!locationBuckets[loc]) {
      locationBuckets[loc] = [];
    }
    locationBuckets[loc].push(tx);
  }

  // 2. Compute metrics for each verified location
  const summaries: LocationSummary[] = Object.keys(locationBuckets).map((loc) => {
    const list = locationBuckets[loc];
    const totalAmount = list.reduce((sum, t) => sum + t.amount, 0);
    const count = list.length;
    const avgPerVisit = count > 0 ? totalAmount / count : 0;
    const spendPercentage = (totalAmount / totalOutflow) * 100;

    // Research Contribution: Log-damped Leak Score
    const rawScore = (totalAmount / totalOutflow) * Math.log(1 + count) * 100;
    const leakScore = Math.round(rawScore * 10) / 10;

    let leakStatus: LeakRiskStatus = "LOW";
    if (leakScore >= 30.0) {
      leakStatus = "HIGH";
    } else if (leakScore >= 15.0) {
      leakStatus = "MODERATE";
    }

    const categories = list.map((t) => t.category);
    const timeWindows = list.map((t) => binTimeWindow(t.date));

    return {
      locationLabel: loc,
      totalAmount,
      spendPercentage: Math.round(spendPercentage * 10) / 10,
      transactionCount: count,
      averagePerVisit: Math.round(avgPerVisit * 10) / 10,
      leakScore,
      dominantCategory: getMode(categories),
      dominantTimeWindow: getMode(timeWindows),
      leakStatus,
      iconName: getIconForLocation(loc),
    };
  });

  // 3. Sort descending by Leak Score
  summaries.sort((a, b) => b.leakScore - a.leakScore);

  const highestLeakZone = summaries.length > 0 ? summaries[0] : null;
  const highRiskCount = summaries.filter((s) => s.leakStatus === "HIGH").length;

  // 4. Generate Prescriptive Intervention Nudge
  let prescriptiveNudge = "Your spending across locations is balanced with low repetitive leaks.";
  if (highestLeakZone && highestLeakZone.leakStatus === "HIGH") {
    const potentialMonthlySavings = Math.round(highestLeakZone.totalAmount * 0.45);
    prescriptiveNudge = `${highestLeakZone.locationLabel} represents ${highestLeakZone.spendPercentage}% of your total outflow (${highestLeakZone.transactionCount} visits, peak at ${highestLeakZone.dominantTimeWindow}). Packing meals or batching trips 3 days a week preserves ~GH₵ ${potentialMonthlySavings} / month.`;
  } else if (highestLeakZone) {
    prescriptiveNudge = `${highestLeakZone.locationLabel} is your most active tagged zone at ${highestLeakZone.spendPercentage}% of spend.`;
  }

  return {
    locations: summaries,
    totalTrackedSpend: totalOutflow,
    highestLeakZone,
    highRiskCount,
    prescriptiveNudge,
    untaggedCount,
    untaggedAmount,
  };
}
