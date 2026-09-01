import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, createContext, useState, ReactNode, useCallback } from "react";
import { Transaction, Budget } from "../types/finance";
import api from "../services/api";

// ─── Sample transactions (Ghanaian context) for first-time demo ───

const sampleTransactions: Transaction[] = [
  {
    id: "sample-1",
    title: "Monthly Salary",
    amount: 4500,
    type: "income",
    category: "Salary",
    description: "July salary from work",
    date: "2026-07-01",
  },
  {
    id: "sample-2",
    title: "Freelance Project",
    amount: 800,
    type: "income",
    category: "Freelance",
    description: "Website design project",
    date: "2026-07-10",
  },
  {
    id: "sample-3",
    title: "Jollof & Chicken",
    amount: 45,
    type: "expense",
    category: "Food",
    description: "Lunch at Papaye",
    date: "2026-07-02",
  },
  {
    id: "sample-4",
    title: "Trotro to campus",
    amount: 8,
    type: "expense",
    category: "Transport",
    description: "Daily trotro fare",
    date: "2026-07-02",
  },
  {
    id: "sample-5",
    title: "MTN Data Bundle",
    amount: 55,
    type: "expense",
    category: "Bills",
    description: "Monthly data subscription",
    date: "2026-07-03",
  },
  {
    id: "sample-6",
    title: "Waakye & Egg",
    amount: 30,
    type: "expense",
    category: "Food",
    description: "Breakfast from waakye joint",
    date: "2026-07-04",
  },
  {
    id: "sample-7",
    title: "Uber to Accra Mall",
    amount: 35,
    type: "expense",
    category: "Transport",
    description: "Ride to shopping center",
    date: "2026-07-05",
  },
  {
    id: "sample-8",
    title: "New Shirt",
    amount: 120,
    type: "expense",
    category: "Shopping",
    description: "Clothing purchase at mall",
    date: "2026-07-05",
  },
  {
    id: "sample-9",
    title: "ECG Bill",
    amount: 180,
    type: "expense",
    category: "Bills",
    description: "Monthly electricity bill",
    date: "2026-07-06",
  },
  {
    id: "sample-10",
    title: "Banku & Tilapia",
    amount: 60,
    type: "expense",
    category: "Food",
    description: "Dinner at local spot",
    date: "2026-07-07",
  },
  {
    id: "sample-11",
    title: "Cinema Ticket",
    amount: 50,
    type: "expense",
    category: "Entertainment",
    description: "Movie at Silverbird",
    date: "2026-07-08",
  },
  {
    id: "sample-12",
    title: "Pharmacy",
    amount: 85,
    type: "expense",
    category: "Health",
    description: "Medication and vitamins",
    date: "2026-07-09",
  },
  {
    id: "sample-13",
    title: "Textbook",
    amount: 95,
    type: "expense",
    category: "Education",
    description: "Computer Science textbook",
    date: "2026-07-10",
  },
  {
    id: "sample-14",
    title: "MoMo Transfer",
    amount: 200,
    type: "expense",
    category: "Other",
    description: "Sent to family",
    date: "2026-07-12",
  },
  {
    id: "sample-15",
    title: "Fufu & Light Soup",
    amount: 40,
    type: "expense",
    category: "Food",
    description: "Weekend lunch",
    date: "2026-07-13",
  },
  // --- June data (older month for trend analysis) ---
  {
    id: "sample-16",
    title: "June Salary",
    amount: 4500,
    type: "income",
    category: "Salary",
    description: "June salary from work",
    date: "2026-06-01",
  },
  {
    id: "sample-17",
    title: "Food expenses",
    amount: 380,
    type: "expense",
    category: "Food",
    description: "June food total",
    date: "2026-06-15",
  },
  {
    id: "sample-18",
    title: "Transport June",
    amount: 150,
    type: "expense",
    category: "Transport",
    description: "June transport total",
    date: "2026-06-15",
  },
  {
    id: "sample-19",
    title: "Bills June",
    amount: 250,
    type: "expense",
    category: "Bills",
    description: "June bills total",
    date: "2026-06-15",
  },
  {
    id: "sample-20",
    title: "Shopping June",
    amount: 200,
    type: "expense",
    category: "Shopping",
    description: "June shopping total",
    date: "2026-06-20",
  },
  // --- May data ---
  {
    id: "sample-21",
    title: "May Salary",
    amount: 4200,
    type: "income",
    category: "Salary",
    description: "May salary",
    date: "2026-05-01",
  },
  {
    id: "sample-22",
    title: "Food May",
    amount: 350,
    type: "expense",
    category: "Food",
    description: "May food total",
    date: "2026-05-15",
  },
  {
    id: "sample-23",
    title: "Transport May",
    amount: 120,
    type: "expense",
    category: "Transport",
    description: "May transport total",
    date: "2026-05-15",
  },
  {
    id: "sample-24",
    title: "Bills May",
    amount: 220,
    type: "expense",
    category: "Bills",
    description: "May bills total",
    date: "2026-05-15",
  },
];

const STORAGE_KEY = "spendsense_transactions";

// ─── Context Type ───

export type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  income: number;
  expenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
  isLoading: boolean;
  syncWithBackend: () => Promise<void>;
};

export const FinanceContext = createContext<FinanceContextType | null>(null);

// ─── Provider ───

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  // Persist to AsyncStorage whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  async function loadTransactions() {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("spendsense_token");
      if (token) {
        const response = await api.get("/transactions");
        if (response.data) {
          setTransactions(response.data);
          setIsLoading(false);
          return;
        }
      }

      // Offline local storage
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTransactions(JSON.parse(saved));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
    }
    setIsLoading(false);
  }

  function addTransaction(transaction: Transaction) {
    setTransactions((prev) => [transaction, ...prev]);

    // Try to sync with backend
    (async () => {
      try {
        const token = await AsyncStorage.getItem("spendsense_token");
        if (token) {
          await api.post("/transactions", transaction);
        }
      } catch {
        // Offline — already saved locally
      }
    })();
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((item) => item.id !== id));

    (async () => {
      try {
        const token = await AsyncStorage.getItem("spendsense_token");
        if (token) {
          await api.delete(`/transactions/${id}`);
        }
      } catch {
        // Offline
      }
    })();
  }

  function updateTransaction(transaction: Transaction) {
    setTransactions((prev) =>
      prev.map((item) => (item.id === transaction.id ? transaction : item))
    );

    (async () => {
      try {
        const token = await AsyncStorage.getItem("spendsense_token");
        if (token) {
          await api.put(`/transactions/${transaction.id}`, transaction);
        }
      } catch {
        // Offline
      }
    })();
  }

  const syncWithBackend = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("spendsense_token");
      if (token) {
        const response = await api.get("/transactions");
        if (response.data && response.data.length > 0) {
          setTransactions(response.data);
        }
      }
    } catch (error) {
      console.log("Sync failed — using local data");
    }
  }, []);

  // ─── Computed values ───

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        income,
        expenses,
        balance,
        savings,
        savingsRate,
        isLoading,
        syncWithBackend,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}