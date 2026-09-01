/**
 * SMS Transaction Parser for SpendSense
 * Extracts transaction information (amount, sender, type, category)
 * from financial SMS messages (e.g. MTN MoMo, Telecel Cash, Bank notifications).
 */

export interface ParsedSMSResult {
  isFinancial: boolean;
  amount?: number;
  type?: "income" | "expense";
  category?: string;
  title?: string;
  sender?: string;
  reference?: string;
}

export function parseFinancialSMS(body: string, sender: string = ""): ParsedSMSResult {
  if (!body) return { isFinancial: false };

  const text = body.toLowerCase();

  // Check if financial keywords exist
  const isMomo = text.includes("cash out") || text.includes("cash in") || text.includes("payment received") || text.includes("you have paid") || text.includes("trans id") || text.includes("momo");
  const isBank = text.includes("debited") || text.includes("credited") || text.includes("acct") || text.includes("ghs") || text.includes("ghc");

  if (!isMomo && !isBank) {
    return { isFinancial: false };
  }

  let type: "income" | "expense" = "expense";
  if (text.includes("received") || text.includes("credited") || text.includes("cash in")) {
    type = "income";
  }

  // Regex to extract amounts in GH₵ or GHS
  const amountMatch = body.match(/(?:ghs|ghc|gh₵|\$)\s*([\d,]+\.?\d*)/i) || body.match(/([\d,]+\.?\d*)\s*(?:ghs|ghc|gh₵)/i);
  let amount = 0;
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  let category = "Other";
  let title = "Mobile Transaction";

  if (text.includes("food") || text.includes("papaye") || text.includes("kfc") || text.includes("restaurant")) {
    category = "Food";
    title = "Food & Dining";
  } else if (text.includes("uber") || text.includes("bolt") || text.includes("yango") || text.includes("fuel")) {
    category = "Transport";
    title = "Ride / Transport";
  } else if (text.includes("ecg") || text.includes("gwcl") || text.includes("bundle") || text.includes("airtime") || text.includes("internet")) {
    category = "Bills";
    title = "Utilities & Bills";
  } else if (type === "income") {
    category = "Salary";
    title = "Payment Received";
  }

  return {
    isFinancial: true,
    amount: amount > 0 ? amount : undefined,
    type,
    category,
    title,
    sender,
  };
}
