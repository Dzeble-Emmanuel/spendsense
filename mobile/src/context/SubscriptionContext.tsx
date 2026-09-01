import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Subscription,
  calculateNextDueDate,
  daysUntilDue,
  getMonthlyEquivalent,
} from "../types/subscription";

const STORAGE_KEY = "spendsense_subscriptions";

type SubscriptionContextType = {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, "id">) => void;
  updateSubscription: (sub: Subscription) => void;
  deleteSubscription: (id: string) => void;
  monthlyTotal: number;
  yearlyTotal: number;
  dueSoon: Subscription[]; // due within 3 days
  checkAndAutoLog: (addTransaction: (t: any) => void) => void;
};

export const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    if (subscriptions.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    }
  }, [subscriptions]);

  async function loadSubscriptions() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setSubscriptions(JSON.parse(saved));
    } catch {}
  }

  function addSubscription(sub: Omit<Subscription, "id">) {
    const newSub: Subscription = { ...sub, id: Date.now().toString() };
    setSubscriptions((prev) => [newSub, ...prev]);
  }

  function updateSubscription(sub: Subscription) {
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
  }

  function deleteSubscription(id: string) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  /** Called on app start — checks for overdue/due-today subscriptions and auto-logs them */
  const checkAndAutoLog = useCallback(
    (addTransaction: (t: any) => void) => {
      const today = new Date().toISOString().split("T")[0];
      const updated: Subscription[] = [];
      let changed = false;

      subscriptions.forEach((sub) => {
        if (!sub.isActive) { updated.push(sub); return; }

        const days = daysUntilDue(sub.nextDueDate);
        if (days <= 0) {
          // Auto-log as expense
          addTransaction({
            id: `sub-${sub.id}-${today}`,
            title: `${sub.name} Subscription`,
            amount: sub.amount,
            type: "expense",
            category: sub.category,
            description: `Auto-logged: ${sub.billingCycle} subscription`,
            date: today,
          });
          // Advance next due date
          const next = calculateNextDueDate(sub.nextDueDate, sub.billingCycle);
          updated.push({ ...sub, nextDueDate: next });
          changed = true;
        } else {
          updated.push(sub);
        }
      });

      if (changed) setSubscriptions(updated);
    },
    [subscriptions]
  );

  const monthlyTotal = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.amount, s.billingCycle), 0);

  const yearlyTotal = monthlyTotal * 12;

  const dueSoon = subscriptions
    .filter((s) => s.isActive && daysUntilDue(s.nextDueDate) <= 3);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        monthlyTotal,
        yearlyTotal,
        dueSoon,
        checkAndAutoLog,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
