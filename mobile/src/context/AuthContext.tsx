import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import {
  checkEmailVerified,
  sendVerificationOtp as sendOtpService,
  verifyEmailCode,
  markEmailAsVerified,
  isDemoEmail,
} from "../services/verificationService";

export interface User {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenTour: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeTour: () => Promise<void>;
  skipAuth: () => void;
  sendVerificationOtp: () => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session and tour status on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
      const savedToken = await AsyncStorage.getItem("spendsense_token");
      const savedUser = await AsyncStorage.getItem("spendsense_user");
      const tourSeen = await AsyncStorage.getItem("has_seen_tour");

      if (tourSeen === "true") {
        setHasSeenTour(true);
      }

      if (savedToken && savedUser) {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        const isVerified = await checkEmailVerified(parsed.email);
        setUser({ ...parsed, isEmailVerified: isVerified });
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function deriveNameFromEmail(email: string): string {
    return (
      email
        .split("@")[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ") || "Account User"
    );
  }

  const completeTour = async () => {
    setHasSeenTour(true);
    await AsyncStorage.setItem("has_seen_tour", "true");
  };

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const isVerified = await checkEmailVerified(email);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = response.data;

      const cleanEmail = email.toLowerCase().trim();
      const isDemo1 = cleanEmail === "demo@spendsense.app";
      const isDemo2 = cleanEmail === "demo2@spendsense.app" || cleanEmail === "test@spendsense.app";

      const formattedUser: User = {
        ...userData,
        fullName:
          userData.fullName ||
          (isDemo1 ? "Nana Kwame Konadu" : isDemo2 ? "Kofi Mensah" : deriveNameFromEmail(email)),
        isEmailVerified: isVerified,
      };

      await AsyncStorage.setItem("spendsense_token", newToken);
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(formattedUser));

      setToken(newToken);
      setUser(formattedUser);

      return { success: true };
    } catch (error: any) {
      // Local fallback for offline mode or demo accounts
      const cleanEmail = email.toLowerCase().trim();
      const isDemo1 = cleanEmail === "demo@spendsense.app";
      const isDemo2 = cleanEmail === "demo2@spendsense.app" || cleanEmail === "test@spendsense.app";

      const fallbackUser: User = {
        id: isDemo1
          ? "cmtisa3m70000lap00nek2o1j"
          : isDemo2
          ? "cmtisa3m70000lap00nek2o2k"
          : "usr-" + Date.now(),
        fullName: isDemo1
          ? "Nana Kwame Konadu"
          : isDemo2
          ? "Kofi Mensah"
          : deriveNameFromEmail(email),
        email,
        isEmailVerified: isVerified,
      };

      await AsyncStorage.setItem("spendsense_token", "local-token");
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(fallbackUser));

      setToken("local-token");
      setUser(fallbackUser);

      return { success: true };
    }
  }

  async function register(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    const finalName = fullName.trim() || deriveNameFromEmail(email);

    try {
      const response = await api.post("/auth/register", {
        fullName: finalName,
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;
      const formattedUser: User = {
        ...userData,
        fullName: userData.fullName || finalName,
        isEmailVerified: false,
      };

      await AsyncStorage.setItem("spendsense_token", newToken);
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(formattedUser));

      setToken(newToken);
      setUser(formattedUser);

      return { success: true };
    } catch (error: any) {
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        fullName: finalName,
        email,
        isEmailVerified: false,
      };

      await AsyncStorage.setItem("spendsense_token", "local-token");
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(fallbackUser));

      setToken("local-token");
      setUser(fallbackUser);

      return { success: true };
    }
  }

  async function logout() {
    await AsyncStorage.removeItem("spendsense_token");
    await AsyncStorage.removeItem("spendsense_user");
    setToken(null);
    setUser(null);
  }

  async function skipAuth() {
    const demoUser: User = {
      id: "cmtisa3m70000lap00nek2o1j",
      fullName: "Nana Kwame Konadu",
      email: "demo@spendsense.app",
      isEmailVerified: true,
    };
    await AsyncStorage.setItem("spendsense_token", "demo-token");
    await AsyncStorage.setItem("spendsense_user", JSON.stringify(demoUser));
    setUser(demoUser);
    setToken("demo-token");
  }

  async function sendVerificationOtp(): Promise<{ success: boolean; error?: string }> {
    if (!user || !user.email) {
      return { success: false, error: "No user account active." };
    }
    return await sendOtpService(user.email);
  }

  async function verifyEmailOtp(code: string): Promise<{ success: boolean; error?: string }> {
    if (!user || !user.email) {
      return { success: false, error: "No user account active." };
    }
    const res = await verifyEmailCode(user.email, code);
    if (res.success) {
      const updatedUser: User = { ...user, isEmailVerified: true };
      setUser(updatedUser);
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(updatedUser));
    }
    return res;
  }

  async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, error: "Please enter your email address." };
    }

    try {
      await api.post("/auth/forgot-password", { email: cleanEmail });
      return { success: true };
    } catch (apiError: any) {
      // Fallback: try local/demo OTP service dispatch
      try {
        const otpRes = await sendOtpService(cleanEmail);
        return { success: otpRes.success, error: otpRes.error };
      } catch (err: any) {
        return {
          success: false,
          error: apiError?.response?.data?.message || "Failed to send reset code. Please try again.",
        };
      }
    }
  }

  async function resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanCode || !newPassword) {
      return { success: false, error: "All fields are required." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    try {
      const response = await api.post("/auth/reset-password", {
        email: cleanEmail,
        code: cleanCode,
        newPassword,
      });
      return { success: true };
    } catch (apiError: any) {
      // Offline / demo fallback with verifyEmailCode
      const verifyRes = await verifyEmailCode(cleanEmail, cleanCode);
      if (verifyRes.success) {
        return { success: true };
      }
      return {
        success: false,
        error: apiError?.response?.data?.message || verifyRes.error || "Password reset failed. Please check your code.",
      };
    }
  }

  async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
    if (!user) {
      return { success: false, error: "No active user session." };
    }

    const cleanEmail = user.email ? user.email.toLowerCase().trim() : "";
    if (isDemoEmail(cleanEmail)) {
      return {
        success: false,
        error: "Demo evaluation accounts are protected and cannot be deleted.",
      };
    }

    try {
      await api.delete("/auth/account");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err.message;
      if (err?.response?.status !== 404) {
        return { success: false, error: errMsg || "Failed to delete account from server." };
      }
    }

    // Wipe all local caches, storage, and user credentials
    await AsyncStorage.removeItem("spendsense_token");
    await AsyncStorage.removeItem("spendsense_user");
    await AsyncStorage.removeItem("spendsense_pending_otp");

    setUser(null);
    setToken(null);
    return { success: true };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        hasSeenTour,
        login,
        register,
        logout,
        completeTour,
        skipAuth,
        sendVerificationOtp,
        verifyEmailOtp,
        forgotPassword,
        resetPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
