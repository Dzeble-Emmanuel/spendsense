// Subscription types for SpendSense

export type BillingCycle = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextDueDate: string; // ISO date string
  category: string;
  icon: string;
  color: string;
  isActive: boolean;
  notes?: string;
  startedDate: string;
};

export const BILLING_CYCLES: { label: string; value: BillingCycle; multiplier: number }[] = [
  { label: "Daily",     value: "daily",     multiplier: 30 },
  { label: "Weekly",    value: "weekly",    multiplier: 4.33 },
  { label: "Monthly",   value: "monthly",   multiplier: 1 },
  { label: "Quarterly", value: "quarterly", multiplier: 1 / 3 },
  { label: "Yearly",    value: "yearly",    multiplier: 1 / 12 },
];

export const SUBSCRIPTION_TEMPLATES = [
  { name: "Netflix",    icon: "🎬", color: "#E50914", category: "Entertainment" },
  { name: "Spotify",    icon: "🎵", color: "#1DB954", category: "Entertainment" },
  { name: "YouTube Premium", icon: "▶️", color: "#FF0000", category: "Entertainment" },
  { name: "DSTV",       icon: "📺", color: "#0078D7", category: "Entertainment" },
  { name: "MTN Bundle", icon: "📱", color: "#FFCC00", category: "Bills" },
  { name: "Telecel Bundle", icon: "📶", color: "#E4002B", category: "Bills" },
  { name: "AirtelTigo", icon: "📡", color: "#E40046", category: "Bills" },
  { name: "ECG Prepaid",icon: "💡", color: "#F59E0B", category: "Bills" },
  { name: "Gym",        icon: "🏋️", color: "#8B5CF6", category: "Health" },
  { name: "iCloud",     icon: "☁️", color: "#3B82F6", category: "Technology" },
  { name: "Google One", icon: "🗄️", color: "#4285F4", category: "Technology" },
  { name: "Microsoft 365", icon: "💼", color: "#D83B01", category: "Technology" },
  { name: "Custom",     icon: "📦", color: "#6B7280", category: "Other" },
];

/** Returns monthly cost equivalent for any billing cycle */
export function getMonthlyEquivalent(amount: number, cycle: BillingCycle): number {
  const found = BILLING_CYCLES.find((c) => c.value === cycle);
  return found ? amount * found.multiplier : amount;
}

/** Calculates next due date from a given date and billing cycle */
export function calculateNextDueDate(fromDate: string, cycle: BillingCycle): string {
  const date = new Date(fromDate);
  switch (cycle) {
    case "daily":     date.setDate(date.getDate() + 1); break;
    case "weekly":    date.setDate(date.getDate() + 7); break;
    case "monthly":   date.setMonth(date.getMonth() + 1); break;
    case "quarterly": date.setMonth(date.getMonth() + 3); break;
    case "yearly":    date.setFullYear(date.getFullYear() + 1); break;
  }
  return date.toISOString().split("T")[0];
}

/** Days until next due date */
export function daysUntilDue(nextDueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
