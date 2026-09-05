import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import {
  checkEmailVerified,
  sendVerificationOtp as sendOtpService,
  verifyEmailCode,
  markEmailAsVerified,
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
  sendVerificationOtp: () => Promise<{ success: boolean; code: string; error?: string }>;
  verifyEmailOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
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

      const formattedUser: User = {
        ...userData,
        fullName: userData.fullName || deriveNameFromEmail(email),
        isEmailVerified: isVerified,
      };

      await AsyncStorage.setItem("spendsense_token", newToken);
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(formattedUser));

      setToken(newToken);
      setUser(formattedUser);

      return { success: true };
    } catch (error: any) {
      // Local fallback for offline mode or demo accounts
      const fallbackUser: User = {
        id: email === "demo@spendsense.app" ? "cmtisa3m70000lap00nek2o1j" : "usr-" + Date.now(),
        fullName: email === "demo@spendsense.app" ? "Nana Kwame Konadu" : deriveNameFromEmail(email),
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

  async function sendVerificationOtp(): Promise<{ success: boolean; code: string; error?: string }> {
    if (!user || !user.email) {
      return { success: false, code: "", error: "No user account active." };
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
