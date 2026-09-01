import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "USD", symbol: "$",   name: "US Dollar" },
  { code: "EUR", symbol: "€",   name: "Euro" },
  { code: "GBP", symbol: "£",   name: "British Pound" },
  { code: "NGN", symbol: "₦",   name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "ZAR", symbol: "R",   name: "South African Rand" },
  { code: "INR", symbol: "₹",   name: "Indian Rupee" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
];

type SettingsContextType = {
  darkMode: boolean;
  notifications: boolean;
  biometricEnabled: boolean;
  currency: Currency;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setBiometricEnabled: (value: boolean) => void;
  setCurrency: (curr: Currency) => void;
  formatMoney: (amount: number) => string;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>(SUPPORTED_CURRENCIES[0]);

  useEffect(() => {
    async function loadSettings() {
      const [dm, notif, bio, savedCurr] = await Promise.all([
        AsyncStorage.getItem("darkMode"),
        AsyncStorage.getItem("notifications"),
        AsyncStorage.getItem("biometricEnabled"),
        AsyncStorage.getItem("spendsense_currency"),
      ]);
      if (dm !== null) setDarkMode(dm === "true");
      if (notif !== null) setNotifications(notif === "true");
      if (bio !== null) setBiometricEnabledState(bio === "true");
      if (savedCurr !== null) {
        try {
          const parsed = JSON.parse(savedCurr);
          setCurrencyState(parsed);
        } catch {}
      }
    }
    loadSettings();
  }, []);

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem("darkMode", String(next));
      return next;
    });
  }

  function toggleNotifications() {
    setNotifications((prev) => {
      const next = !prev;
      AsyncStorage.setItem("notifications", String(next));
      return next;
    });
  }

  function setBiometricEnabled(value: boolean) {
    setBiometricEnabledState(value);
    AsyncStorage.setItem("biometricEnabled", String(value));
  }

  function setCurrency(curr: Currency) {
    setCurrencyState(curr);
    AsyncStorage.setItem("spendsense_currency", JSON.stringify(curr));
  }

  function formatMoney(amount: number): string {
    const formatted = Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const prefix = amount < 0 ? "-" : "";
    return `${prefix}${currency.symbol} ${formatted}`;
  }

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        notifications,
        biometricEnabled,
        currency,
        toggleDarkMode,
        toggleNotifications,
        setBiometricEnabled,
        setCurrency,
        formatMoney,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}