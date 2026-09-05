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

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  GHS: 1.0,      // Base currency
  USD: 0.088,    // 1 GHS ≈ $0.088 USD ($1 ≈ 11.36 GHS)
  EUR: 0.076,    // 1 GHS ≈ €0.076 EUR (€1 ≈ 13.15 GHS)
  GBP: 0.065,    // 1 GHS ≈ £0.065 GBP (£1 ≈ 15.38 GHS)
  NGN: 125.0,    // 1 GHS ≈ ₦125.0 NGN
  KES: 11.35,    // 1 GHS ≈ 11.35 KES
  ZAR: 1.56,     // 1 GHS ≈ 1.56 ZAR
  INR: 7.35,     // 1 GHS ≈ 7.35 INR
  CAD: 0.119,    // 1 GHS ≈ 0.119 CAD
};

type SettingsContextType = {
  darkMode: boolean;
  notifications: boolean;
  biometricEnabled: boolean;
  currency: Currency;
  exchangeRates: Record<string, number>;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setBiometricEnabled: (value: boolean) => void;
  setCurrency: (curr: Currency) => void;
  convertAmount: (amountInGhs: number) => number;
  formatMoney: (amount: number) => string;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_EXCHANGE_RATES);

  useEffect(() => {
    async function loadSettings() {
      const [dm, notif, bio, savedCurr, savedRates] = await Promise.all([
        AsyncStorage.getItem("darkMode"),
        AsyncStorage.getItem("notifications"),
        AsyncStorage.getItem("biometricEnabled"),
        AsyncStorage.getItem("spendsense_currency"),
        AsyncStorage.getItem("spendsense_rates"),
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
      if (savedRates !== null) {
        try {
          const parsed = JSON.parse(savedRates);
          setExchangeRates((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }

      // Refresh live exchange rates in background (Base: GHS)
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/GHS");
        const data = await res.json();
        if (data && data.rates && typeof data.rates === "object") {
          const merged = { ...DEFAULT_EXCHANGE_RATES, ...data.rates };
          setExchangeRates(merged);
          await AsyncStorage.setItem("spendsense_rates", JSON.stringify(merged));
        }
      } catch {
        // Offline: smoothly keep cached/default rates
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

  function convertAmount(amountInGhs: number): number {
    const rate = exchangeRates[currency.code] ?? 1.0;
    return amountInGhs * rate;
  }

  function formatMoney(amount: number): string {
    const rate = exchangeRates[currency.code] ?? 1.0;
    const converted = amount * rate;
    const formatted = Math.abs(converted).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const prefix = converted < 0 ? "-" : "";
    return `${prefix}${currency.symbol} ${formatted}`;
  }

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        notifications,
        biometricEnabled,
        currency,
        exchangeRates,
        toggleDarkMode,
        toggleNotifications,
        setBiometricEnabled,
        setCurrency,
        convertAmount,
        formatMoney,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}