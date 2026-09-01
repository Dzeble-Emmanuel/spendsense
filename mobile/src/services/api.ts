import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Backend URL: Android emulator uses 10.0.2.2, iOS simulator uses localhost
// For Expo Go on a real device, use your machine's local IP address
const getBaseUrl = () => {
  if (__DEV__) {
    // Change this to your computer's local network IP when testing on a real device
    // e.g., "http://192.168.1.100:5000/api"
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000/api";
    }
    return "http://localhost:5000/api";
  }
  return "https://api.spendsense.app/api"; // production URL placeholder
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("spendsense_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Failed to get token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear stored token
      await AsyncStorage.removeItem("spendsense_token");
      await AsyncStorage.removeItem("spendsense_user");
    }
    return Promise.reject(error);
  }
);

// Health check — test if backend is reachable
export async function checkBackendConnection(): Promise<boolean> {
  try {
    await api.get("/health", { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export default api;
