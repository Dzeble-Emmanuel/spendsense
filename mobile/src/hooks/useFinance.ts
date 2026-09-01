import { useContext } from "react";
import { FinanceContext } from "../context/FinanceContext";

/**
 * Hook that provides access to the shared FinanceContext.
 * All screens using this hook share the SAME transaction state.
 */
export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error(
      "useFinance must be used within a FinanceProvider"
    );
  }

  return context;
}