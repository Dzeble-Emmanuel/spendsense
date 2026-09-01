/**
 * Receipt text parser — extracts transaction info from OCR text or SMS messages.
 * Works fully offline with pattern matching.
 */

export type ParsedReceiptData = {
  title: string;
  amount: number | null;
  category: string;
  date: string;
  confidence: "high" | "medium" | "low";
};

// Known merchant → category mappings
const MERCHANT_CATEGORIES: Record<string, string> = {
  papaye: "Food",     kfc: "Food",         shoprite: "Shopping",
  melcom: "Shopping", "canal+": "Bills",   dstv: "Bills",
  mtn: "Bills",       telecel: "Bills",    "airtel": "Bills",
  uber: "Transport",  bolt: "Transport",   yango: "Transport",
  ecg: "Bills",       gwcl: "Bills",       pharmacy: "Health",
  hospital: "Health", clinic: "Health",    school: "Education",
  university: "Education",
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORIES)) {
    if (lower.includes(keyword)) return category;
  }
  return "Other";
}

function extractAmount(text: string): number | null {
  // Patterns: GHS 45.00 / GH₵45.00 / Total: 45.00 / TOTAL 45.00 / Amount: 45.00
  const patterns = [
    /(?:total|amount|subtotal|grand total)[:\s]*(?:ghs?|gh₵)?\s*([\d,]+\.?\d{0,2})/i,
    /(?:ghs|gh₵|ghc)\s*([\d,]+\.?\d{0,2})/i,
    /([\d,]+\.\d{2})\s*(?:ghs|gh₵|ghc)/i,
    /\btotal[:\s]+([\d,]+\.?\d{0,2})\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0) return val;
    }
  }
  return null;
}

function extractTitle(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 2);
  // Return first non-date, non-number line (likely merchant name)
  for (const line of lines.slice(0, 4)) {
    if (!/^\d/.test(line) && !/^\d{2}[\/\-]/.test(line)) {
      return line.replace(/[^\w\s&'-]/g, "").trim().slice(0, 40) || "Receipt Expense";
    }
  }
  return "Receipt Expense";
}

function extractDate(text: string): string {
  const today = new Date().toISOString().split("T")[0];
  const patterns = [
    /(\d{4}[-\/]\d{2}[-\/]\d{2})/,
    /(\d{2}[-\/]\d{2}[-\/]\d{4})/,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const d = new Date(match[1]);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
      } catch {}
    }
  }
  return today;
}

export function parseReceiptText(text: string): ParsedReceiptData {
  const amount = extractAmount(text);
  const title = extractTitle(text);
  const category = detectCategory(text);
  const date = extractDate(text);

  const confidence =
    amount !== null && title !== "Receipt Expense" ? "high" :
    amount !== null ? "medium" : "low";

  return { title, amount, category, date, confidence };
}
