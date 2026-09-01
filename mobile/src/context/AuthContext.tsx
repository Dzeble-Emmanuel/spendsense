import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

type User = {
  id: string;
  fullName: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  skipAuth: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
      const savedToken = await AsyncStorage.getItem("spendsense_token");
      const savedUser = await AsyncStorage.getItem("spendsense_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
    setIsLoading(false);
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.post("/auth/login", { email, password });

      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem("spendsense_token", newToken);
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "Cannot connect to server. Check your network."
          : "Login failed. Please try again.");

      return { success: false, error: message };
    }
  }

  async function register(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem("spendsense_token", newToken);
      await AsyncStorage.setItem("spendsense_user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "Cannot connect to server. Check your network."
          : "Registration failed. Please try again.");

      return { success: false, error: message };
    }
  }

  async function logout() {
    await AsyncStorage.removeItem("spendsense_token");
    await AsyncStorage.removeItem("spendsense_user");
    await AsyncStorage.removeItem("spendsense_transactions");
    setToken(null);
    setUser(null);
  }

  async function skipAuth() {
    const demoUser = {
      id: "demo-user",
      fullName: "Demo User",
      email: "demo@spendsense.app",
    };
    await AsyncStorage.setItem("spendsense_token", "demo-token");
    await AsyncStorage.setItem("spendsense_user", JSON.stringify(demoUser));
    setUser(demoUser);
    setToken("demo-token");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        skipAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
