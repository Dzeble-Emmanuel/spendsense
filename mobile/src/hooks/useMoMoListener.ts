import { useState, useEffect, useCallback } from "react";
import { Alert, Platform } from "react-native";
import {
  checkSmsPermissions,
  requestSmsPermissions,
  isAutoSyncEnabled,
  setAutoSyncEnabled,
  isSmsAlreadyProcessed,
  markSmsProcessed,
  SmsPermissionStatus,
  SAMPLE_MOMO_ALERTS,
} from "../services/smsService";
import { parseFinancialSMS, ParsedSMSResult } from "../sms/smsParser";
import { useFinance } from "./useFinance";

export function useMoMoListener() {
  const { addTransaction } = useFinance();
  const [permissions, setPermissions] = useState<SmsPermissionStatus>({
    hasReadSms: false,
    hasReceiveSms: false,
    isFullyGranted: false,
  });
  const [autoSync, setAutoSyncState] = useState<boolean>(false);
  const [lastDetected, setLastDetected] = useState<ParsedSMSResult | null>(null);
  const [recentImports, setRecentImports] = useState<ParsedSMSResult[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Initialize permission state and auto-sync setting on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const permStatus = await checkSmsPermissions();
      const syncEnabled = await isAutoSyncEnabled();

      if (isMounted) {
        setPermissions(permStatus);
        setAutoSyncState(syncEnabled);
        setIsReady(true);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Request runtime SMS permissions
  const requestPermissions = useCallback(async () => {
    const granted = await requestSmsPermissions();
    const updated = await checkSmsPermissions();
    setPermissions(updated);

    if (granted || updated.isFullyGranted) {
      Alert.alert(
        "MoMo Sync Active",
        "SpendSense is now authorized to monitor incoming mobile money and bank SMS alerts."
      );
      return true;
    } else {
      Alert.alert(
        "Permissions Required",
        "SMS permission is needed to automatically read incoming Mobile Money alerts. You can still paste alerts manually."
      );
      return false;
    }
  }, []);

  // Toggle Auto-Sync
  const toggleAutoSync = useCallback(
    async (value: boolean) => {
      if (value) {
        // If enabling, ensure permissions are granted
        if (!permissions.isFullyGranted) {
          const granted = await requestPermissions();
          if (!granted) {
            return;
          }
        }
      }

      await setAutoSyncEnabled(value);
      setAutoSyncState(value);
    },
    [permissions.isFullyGranted, requestPermissions]
  );

  // Process and ingest an SMS text into the ledger
  const processIncomingSMS = useCallback(
    async (
      rawText: string,
      senderHeader: string = ""
    ): Promise<{
      success: boolean;
      parsed: ParsedSMSResult;
      isDuplicate: boolean;
      message: string;
    }> => {
      const parsed = parseFinancialSMS(rawText, senderHeader);

      if (!parsed.isFinancial || !parsed.amount || parsed.amount <= 0) {
        return {
          success: false,
          parsed,
          isDuplicate: false,
          message: "Message does not contain recognized financial details.",
        };
      }

      // Check duplication
      const dedupKey =
        parsed.transactionId ||
        `${parsed.title}_${parsed.amount}_${parsed.type}_${rawText.slice(0, 30)}`;

      const duplicate = await isSmsAlreadyProcessed(dedupKey);
      if (duplicate) {
        return {
          success: false,
          parsed,
          isDuplicate: true,
          message: `Transaction ${parsed.transactionId || ""} has already been recorded.`,
        };
      }

      // Add to Finance transactions ledger
      addTransaction({
        title: parsed.title,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        description: `Auto-parsed ${parsed.provider}: ${rawText.slice(0, 60)}...`,
        date: new Date().toISOString(),
        locationLabel: parsed.locationLabel,
      });

      // Mark as processed
      await markSmsProcessed(dedupKey);

      setLastDetected(parsed);
      setRecentImports((prev) => [parsed, ...prev.slice(0, 9)]);

      return {
        success: true,
        parsed,
        isDuplicate: false,
        message: `Successfully logged ${parsed.provider} ${parsed.type}: GHS ${parsed.amount.toFixed(2)} (${parsed.title})`,
      };
    },
    [addTransaction]
  );

  // Simulate an incoming SMS for demonstration / testing
  const simulateIncomingAlert = useCallback(
    async (index: number = 0) => {
      const sample = SAMPLE_MOMO_ALERTS[index % SAMPLE_MOMO_ALERTS.length];
      const res = await processIncomingSMS(sample.text, sample.provider);
      return { sample, result: res };
    },
    [processIncomingSMS]
  );

  return {
    permissions,
    autoSync,
    isReady,
    lastDetected,
    recentImports,
    requestPermissions,
    toggleAutoSync,
    processIncomingSMS,
    simulateIncomingAlert,
  };
}
