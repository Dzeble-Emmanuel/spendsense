import { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";

export type BiometricType = "fingerprint" | "facial" | "iris" | "none";

type BiometricState = {
  isAvailable: boolean;
  biometricType: BiometricType;
  authenticate: (reason?: string) => Promise<boolean>;
};

export function useBiometric(): BiometricState {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");

  useEffect(() => {
    checkAvailability();
  }, []);

  async function checkAvailability() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        setIsAvailable(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("facial");
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("fingerprint");
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType("iris");
        }
      }
    } catch {
      setIsAvailable(false);
    }
  }

  async function authenticate(reason = "Verify your identity to access SpendSense"): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // allows device PIN as fallback
        fallbackLabel: "Use Passcode",
      });
      return result.success;
    } catch {
      return false;
    }
  }

  return { isAvailable, biometricType, authenticate };
}
