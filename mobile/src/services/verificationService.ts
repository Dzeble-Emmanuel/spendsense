import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const STORAGE_KEY_VERIFIED_EMAILS = "spendsense_verified_emails";
const STORAGE_KEY_PENDING_OTP = "spendsense_pending_otp";

export interface PendingOtpRecord {
  email: string;
  code: string;
  expiresAt: number;
}

const DEMO_ACCOUNTS = ["demo@spendsense.app", "demo2@spendsense.app", "test@spendsense.app"];
export const isDemoEmail = (email: string): boolean => {
  if (!email) return false;
  return DEMO_ACCOUNTS.includes(email.toLowerCase().trim());
};

export async function checkEmailVerified(email: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  // Demo 1 (demo@spendsense.app) is pre-verified for instant access
  if (cleanEmail === "demo@spendsense.app") return true;

  // Demo 2 (demo2@spendsense.app) and regular accounts check local storage (defaults to UNVERIFIED)
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_VERIFIED_EMAILS);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return Array.isArray(list) && list.includes(cleanEmail);
  } catch {
    return false;
  }
}

export async function resetDemo2Verification(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_VERIFIED_EMAILS);
    if (raw) {
      let list: string[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        list = list.filter((e) => e !== "demo2@spendsense.app" && e !== "test@spendsense.app");
        await AsyncStorage.setItem(STORAGE_KEY_VERIFIED_EMAILS, JSON.stringify(list));
      }
    }
  } catch {}
}

export async function sendVerificationOtp(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email) return { success: false, error: "Email is required" };
  const cleanEmail = email.toLowerCase().trim();

  try {
    const res = await api.post("/auth/send-verification-otp", { email: cleanEmail });
    return { success: true };
  } catch (err: any) {
    const errMsg = err.response?.data?.message || err.message || "Failed to dispatch verification code";
    return { success: false, error: errMsg };
  }
}

export async function verifyEmailCode(email: string, inputCode: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !inputCode) {
    return { success: false, error: "Please enter the 6-digit verification code" };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = inputCode.trim();

  // 1. Master testing/examiner code (strictly works ONLY for authorized demo accounts)
  if (isDemoEmail(cleanEmail) && cleanCode === "123456") {
    try {
      await api.post("/auth/verify-otp", { email: cleanEmail, code: cleanCode });
    } catch {}
    await markEmailAsVerified(cleanEmail);
    return { success: true };
  }

  // 2. Authoritative backend verification (STX-01 / STX-06 remediation)
  try {
    const res = await api.post("/auth/verify-otp", { email: cleanEmail, code: cleanCode });
    if (res.data?.verified) {
      await markEmailAsVerified(cleanEmail);
      return { success: true };
    }
    return { success: false, error: res.data?.message || "Invalid or expired verification code" };
  } catch (err: any) {
    const message = err.response?.data?.message || "Verification failed. Please check the code and retry.";
    return { success: false, error: message };
  }
}

export async function markEmailAsVerified(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_VERIFIED_EMAILS);
    let list: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    if (!list.includes(cleanEmail)) {
      list.push(cleanEmail);
      await AsyncStorage.setItem(STORAGE_KEY_VERIFIED_EMAILS, JSON.stringify(list));
    }
  } catch (err) {
    console.error("Failed to store verified email locally:", err);
  }
}
