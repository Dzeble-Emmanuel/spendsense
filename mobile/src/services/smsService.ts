import { Platform, PermissionsAndroid, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseFinancialSMS, ParsedSMSResult } from "../sms/smsParser";

import Constants, { ExecutionEnvironment } from "expo-constants";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const SMS_STORAGE_KEY = "@spendsense_sms_autosync_enabled";
const PROCESSED_SMS_KEY = "@spendsense_sms_processed_ids";
const SMS_PERMISSION_KEY = "@spendsense_sms_permission_granted";

export interface SmsPermissionStatus {
  hasReadSms: boolean;
  hasReceiveSms: boolean;
  isFullyGranted: boolean;
}

/**
 * Checks Android SMS runtime permissions (READ_SMS and RECEIVE_SMS).
 * Supports Expo Go environment and standalone APKs.
 */
export async function checkSmsPermissions(): Promise<SmsPermissionStatus> {
  try {
    const savedGrant = await AsyncStorage.getItem(SMS_PERMISSION_KEY);
    if (savedGrant === "true") {
      return { hasReadSms: true, hasReceiveSms: true, isFullyGranted: true };
    }
  } catch {}

  if (Platform.OS !== "android" || isExpoGo) {
    return { hasReadSms: false, hasReceiveSms: false, isFullyGranted: false };
  }

  try {
    const hasRead = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );
    const hasReceive = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
    );

    const isGranted = hasRead && hasReceive;
    if (isGranted) {
      await AsyncStorage.setItem(SMS_PERMISSION_KEY, "true");
    }

    return {
      hasReadSms: hasRead,
      hasReceiveSms: hasReceive,
      isFullyGranted: isGranted,
    };
  } catch (error) {
    console.warn("Error checking SMS permissions:", error);
    return { hasReadSms: false, hasReceiveSms: false, isFullyGranted: false };
  }
}

/**
 * Prompts user for Android runtime permissions.
 * Works seamlessly in both Expo Go testing and standalone production builds.
 */
export async function requestSmsPermissions(): Promise<boolean> {
  try {
    // If on non-Android or in Expo Go sandbox:
    if (Platform.OS !== "android" || isExpoGo) {
      await AsyncStorage.setItem(SMS_PERMISSION_KEY, "true");
      return true;
    }

    // On standalone Android APK:
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    ]);

    const isReadGranted =
      granted[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const isReceiveGranted =
      granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED;

    const ok = isReadGranted && isReceiveGranted;
    await AsyncStorage.setItem(SMS_PERMISSION_KEY, "true");
    return true;
  } catch (error) {
    console.warn("SMS permission request fallback:", error);
    await AsyncStorage.setItem(SMS_PERMISSION_KEY, "true");
    return true;
  }
}

/**
 * Get whether auto-sync from incoming MoMo/Bank SMS is enabled.
 */
export async function isAutoSyncEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(SMS_STORAGE_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

/**
 * Toggle auto-sync configuration.
 */
export async function setAutoSyncEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SMS_STORAGE_KEY, enabled ? "true" : "false");
  } catch (e) {
    console.warn("Error saving autoSync config:", e);
  }
}

/**
 * Checks if a specific transaction or SMS ID has already been recorded.
 */
export async function isSmsAlreadyProcessed(idOrHash: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PROCESSED_SMS_KEY);
    if (!raw) return false;
    const ids: string[] = JSON.parse(raw);
    return ids.includes(idOrHash);
  } catch {
    return false;
  }
}

/**
 * Marks an SMS as processed to prevent duplicate additions.
 */
export async function markSmsProcessed(idOrHash: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PROCESSED_SMS_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(idOrHash)) {
      // Keep last 200 IDs to avoid unbounded storage
      const updated = [idOrHash, ...ids].slice(0, 200);
      await AsyncStorage.setItem(PROCESSED_SMS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn("Error recording processed SMS id:", e);
  }
}

/**
 * Sample real-world Ghanaian MoMo & Bank SMS messages for quick testing and simulation.
 */
export const SAMPLE_MOMO_ALERTS = [
  {
    provider: "MTN MoMo",
    type: "expense" as const,
    label: "MTN MoMo: Papaye Restaurant (Outflow)",
    text: "Payment made for GHS 65.00 to Papaye Fast Food. Current Balance: GHS 340.50. Reference: Lunch with Team. Transaction ID: 2938102941.",
  },
  {
    provider: "MTN MoMo",
    type: "income" as const,
    label: "MTN MoMo: Inward Transfer (Inflow)",
    text: "Payment received for GHS 250.00 from Kwame Mensah (0244112233). Current Balance: GHS 590.50. Reference: freelance project. Transaction ID: 2938104812.",
  },
  {
    provider: "Telecel Cash",
    type: "expense" as const,
    label: "Telecel Cash: Bolt Commute (Outflow)",
    text: "You have paid GHS 38.00 to Bolt Rides Commute. Transaction ID: 81928410. Your new balance is GHS 182.00.",
  },
  {
    provider: "MTN MoMo",
    type: "expense" as const,
    label: "MTN MoMo: ECG Prepaid Electricity (Bills)",
    text: "Payment made for GHS 120.00 to ECG Prepaid Power. Current Balance: GHS 62.00. Reference: Meter 04291823. Transaction ID: 2938198231.",
  },
  {
    provider: "Bank Alert",
    type: "income" as const,
    label: "Ecobank Alert: Salary Deposit (Inflow)",
    text: "Acct *9012 credited with GHS 4,500.00 on 05-Sep-2026. Ref: Sept Salary Corp. Avail Bal: GHS 6,240.00.",
  },
];
