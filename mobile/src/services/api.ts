import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Backend URL: Android emulator uses 10.0.2.2, iOS simulator uses localhost
// For Expo Go on a real device, use your machine's local IP address
// Live Cloud Backend on Render
const CLOUD_API_URL = "https://spendsense-api-ojc8.onrender.com/api";

const getBaseUrl = () => {
  return CLOUD_API_URL;
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
