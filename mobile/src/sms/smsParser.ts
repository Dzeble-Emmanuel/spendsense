/**
 * SMS Transaction Parser for SpendSense
 * Extracts transaction information (amount, provider, sender/merchant, reference, type, category)
 * from financial SMS messages (e.g. MTN MoMo, Telecel Cash, AT Money, Bank notifications).
 */

export interface ParsedSMSResult {
  isFinancial: boolean;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  provider: "MTN MoMo" | "Telecel Cash" | "AT Money" | "Bank Alert" | "Other";
  transactionId?: string;
  reference?: string;
  senderOrRecipient?: string;
  rawText?: string;
  locationLabel?: string;
  confidence: number;
}

export function parseFinancialSMS(body: string, senderHeader: string = ""): ParsedSMSResult {
  if (!body || typeof body !== "string") {
    return {
      isFinancial: false,
      title: "Unknown",
      amount: 0,
      type: "expense",
      category: "Other",
      provider: "Other",
      confidence: 0,
    };
  }

  const raw = body.trim();
  const lower = raw.toLowerCase();
  const senderLower = senderHeader.toLowerCase();

  // Detect financial provider
  let provider: ParsedSMSResult["provider"] = "Other";
  if (
    lower.includes("momo") ||
    lower.includes("mobilemoney") ||
    senderLower.includes("momo") ||
    senderLower.includes("mtn")
  ) {
    provider = "MTN MoMo";
  } else if (
    lower.includes("telecel") ||
    lower.includes("vodafone") ||
    senderLower.includes("telecel") ||
    senderLower.includes("voda")
  ) {
    provider = "Telecel Cash";
  } else if (
    lower.includes("at money") ||
    lower.includes("airteltigo") ||
    senderLower.includes("at money") ||
    senderLower.includes("airtel")
  ) {
    provider = "AT Money";
  } else if (
    lower.includes("acct") ||
    lower.includes("account") ||
    lower.includes("debited") ||
    lower.includes("credited") ||
    senderLower.includes("bank") ||
    senderLower.includes("ecobank") ||
    senderLower.includes("gcb") ||
    senderLower.includes("stanbic") ||
    senderLower.includes("fidelity") ||
    senderLower.includes("calbank")
  ) {
    provider = "Bank Alert";
  }

  // Check if message is financial
  const isFinancialKeyword =
    lower.includes("ghs") ||
    lower.includes("gh₵") ||
    lower.includes("ghc") ||
    lower.includes("payment received") ||
    lower.includes("payment made") ||
    lower.includes("cash in") ||
    lower.includes("cash out") ||
    lower.includes("debited") ||
    lower.includes("credited") ||
    lower.includes("transferred") ||
    lower.includes("trans id") ||
    lower.includes("transaction id") ||
    lower.includes("current balance") ||
    lower.includes("new balance") ||
    lower.includes("available balance") ||
    lower.includes("withdrawal");

  if (!isFinancialKeyword && provider === "Other") {
    return {
      isFinancial: false,
      title: "Non-Financial SMS",
      amount: 0,
      type: "expense",
      category: "Other",
      provider: "Other",
      confidence: 0,
    };
  }

  // Extract amount
  let amount = 0;
  // Match patterns like: GHS 150.00, GHS150, GH₵ 45.50, 150.00 GHS, $45.00
  const amountRegexes = [
    /(?:ghs|ghc|gh₵|\$|kes|ngn|eur|gbp)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /([0-9,]+(?:\.[0-9]{2}))\s*(?:ghs|ghc|gh₵|\$)/i,
    /(?:for|amount of|sum of)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ];

  for (const regex of amountRegexes) {
    const match = raw.match(regex);
    if (match && match[1]) {
      const parsedAmount = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        amount = parsedAmount;
        break;
      }
    }
  }

  // Determine Inflow (income) vs Outflow (expense)
  const isIncome =
    lower.includes("payment received") ||
    lower.includes("received for") ||
    lower.includes("cash in received") ||
    lower.includes("cash in") ||
    lower.includes("has been credited") ||
    lower.includes("credited with") ||
    lower.includes("credited for") ||
    lower.includes("deposit of") ||
    lower.includes("paid into your");

  const type: "income" | "expense" = isIncome ? "income" : "expense";

  // Extract Transaction ID
  let transactionId: string | undefined;
  const tidMatch =
    raw.match(/(?:transaction id|trans id|txnid|txn id|financial transaction id|ref no|reference no)[:\s]+([a-zA-Z0-9.\-_]+)/i) ||
    raw.match(/\b(?:id|trans\. id)[:\s]*([0-9]{6,20})\b/i);
  if (tidMatch && tidMatch[1]) {
    transactionId = tidMatch[1].trim();
  }

  // Extract Reference
  let reference: string | undefined;
  const refMatch = raw.match(/(?:reference|ref)[:\s]+([^.]+?)(?:\.|\n|$)/i);
  if (refMatch && refMatch[1]) {
    reference = refMatch[1].trim();
  }

  // Extract Merchant / Counterparty
  let senderOrRecipient: string | undefined;
  if (isIncome) {
    const fromMatch = raw.match(/(?:from|by)\s+([A-Za-z0-9\s&'-]+?)(?:\s*\([0-9]+\)|\.|\n|current balance|trans id|$)/i);
    if (fromMatch && fromMatch[1]) {
      senderOrRecipient = fromMatch[1].trim();
    }
  } else {
    const toMatch = raw.match(/(?:to|for)\s+([A-Za-z0-9\s&'-]+?)(?:\s*\([0-9]+\)|\.|\n|current balance|trans id|reference|$)/i);
    if (toMatch && toMatch[1]) {
      senderOrRecipient = toMatch[1].trim();
    }
  }

  // Smart Category & Clean Title
  let category = type === "income" ? "Salary & Inflows" : "General Expense";
  let title = type === "income" ? "Payment Received" : "MoMo Payment";

  if (
    lower.includes("papaye") ||
    lower.includes("kfc") ||
    lower.includes("food") ||
    lower.includes("restaurant") ||
    lower.includes("buka") ||
    lower.includes("chop")
  ) {
    category = "Food & Dining";
    title = senderOrRecipient || "Food & Dining";
  } else if (
    lower.includes("bolt") ||
    lower.includes("uber") ||
    lower.includes("yango") ||
    lower.includes("transport") ||
    lower.includes("fuel") ||
    lower.includes("goil") ||
    lower.includes("total")
  ) {
    category = "Transport";
    title = senderOrRecipient || "Transport & Commute";
  } else if (
    lower.includes("ecg") ||
    lower.includes("power") ||
    lower.includes("electricity") ||
    lower.includes("gwcl") ||
    lower.includes("water") ||
    lower.includes("bundle") ||
    lower.includes("airtime") ||
    lower.includes("internet") ||
    lower.includes("dstv")
  ) {
    category = "Bills & Utilities";
    title = senderOrRecipient || "Utilities & Bills";
  } else if (
    lower.includes("shoprite") ||
    lower.includes("melcom") ||
    lower.includes("supermarket") ||
    lower.includes("mall") ||
    lower.includes("store") ||
    lower.includes("palace")
  ) {
    category = "Shopping";
    title = senderOrRecipient || "Shopping";
  } else if (
    lower.includes("health") ||
    lower.includes("pharmacy") ||
    lower.includes("hospital") ||
    lower.includes("clinic")
  ) {
    category = "Health & Medical";
    title = senderOrRecipient || "Health & Pharmacy";
  } else if (isIncome) {
    category = "Salary & Inflows";
    title = senderOrRecipient ? `From ${senderOrRecipient}` : (provider !== "Other" ? `${provider} Inflow` : "Payment Received");
  } else if (senderOrRecipient && senderOrRecipient.length > 2 && senderOrRecipient.length < 35) {
    title = senderOrRecipient;
  } else if (provider !== "Other") {
    title = `${provider} Transfer`;
  }

  // Refine title if it picked up redundant prefix
  if (title.toLowerCase().startsWith("payment made for") || title.toLowerCase().startsWith("payment received for")) {
    title = senderOrRecipient || (type === "income" ? "Payment Received" : "Payment Sent");
  }

  // Location extraction rule:
  // 1. Rent and utilities are mapped to Home / Hostel
  // 2. Explicit location text on the notification is extracted
  // 3. Otherwise left undefined so the user can input it!
  let locationLabel: string | undefined;
  if (
    lower.includes("ecg") ||
    lower.includes("power") ||
    lower.includes("electricity") ||
    lower.includes("gwcl") ||
    lower.includes("water") ||
    lower.includes("rent") ||
    lower.includes("hostel")
  ) {
    locationLabel = "Home / Hostel";
  } else if (lower.includes("tech junction") || lower.includes("tech jct")) {
    locationLabel = "Tech Junction";
  } else if (lower.includes("knust") || lower.includes("campus")) {
    locationLabel = "KNUST Campus";
  } else if (lower.includes("kejetia")) {
    locationLabel = "Kejetia Market";
  } else if (lower.includes("ayigya")) {
    locationLabel = "Ayigya Commute";
  } else if (lower.includes("adum")) {
    locationLabel = "Adum Business District";
  }

  return {
    isFinancial: true,
    title: title.length > 30 ? title.substring(0, 30) : title,
    amount,
    type,
    category,
    provider: provider !== "Other" ? provider : "MTN MoMo",
    transactionId,
    reference,
    senderOrRecipient,
    rawText: raw,
    locationLabel,
    confidence: amount > 0 ? 0.95 : 0.6,
  };
}
