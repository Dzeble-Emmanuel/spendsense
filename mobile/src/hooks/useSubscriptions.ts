import { useContext } from "react";
import { SubscriptionContext } from "../context/SubscriptionContext";

export function useSubscriptions() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscriptions must be used within SubscriptionProvider");
  return ctx;
}
