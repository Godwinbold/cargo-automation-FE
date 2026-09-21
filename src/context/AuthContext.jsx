/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  GetFromLocalStorage,
  SaveToLocalStorage,
  RemoveFromLocalStorage,
} from "../utils/getFromLocals";
import { toast } from "sonner";

const AuthContext = createContext();

// 15 minutes of inactivity before automatic logout
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => GetFromLocalStorage("access_token"));
  const [user, setUser] = useState(() => GetFromLocalStorage("user"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load from localStorage is done in the state initialization
    setLoading(false);
  }, []);

  const login = (userData) => {
    if (userData?.token) {
      SaveToLocalStorage("access_token", userData.token);
      setToken(userData.token);
    }
    SaveToLocalStorage("user", userData);
    setUser(userData);

    if (userData?.airlineId) {
      localStorage.setItem("airlineId", userData.airlineId);
    }
    if (userData?.userId) {
      localStorage.setItem("userId", userData.userId);
    }
    localStorage.setItem("last_active_time", Date.now().toString());
  };

  const logout = () => {
    RemoveFromLocalStorage("access_token");
    RemoveFromLocalStorage("user");
    localStorage.removeItem("airlineId");
    localStorage.removeItem("userId");
    localStorage.removeItem("last_active_time");
    setToken(null);
    setUser(null);
  };

  // Automatic logout when user has been idle for 15 minutes
  const performAutoLogout = useCallback(() => {
    const isExecutive = window.location.pathname.startsWith("/executive");
    const isAdmin = window.location.pathname.startsWith("/admin");
    const currentAirlineId = localStorage.getItem("airlineId");

    logout();

    toast.warning(
      "You were logged out due to inactivity. Please log in again.",
      {
        id: "session-timeout",
        duration: 6000,
      },
    );

    let redirectUrl = "/login";
    if (isExecutive) {
      redirectUrl = "/executive-login";
    } else if (isAdmin) {
      redirectUrl = "/admin-login";
    } else if (currentAirlineId) {
      redirectUrl = `/login?airlineId=${currentAirlineId}`;
    }

    if (typeof window !== "undefined") {
      window.location.href = redirectUrl;
    }
  }, []);

  // Idle timer and user activity tracking across tabs
  useEffect(() => {
    if (!token) return;

    const now = Date.now();
    localStorage.setItem("last_active_time", now.toString());
    let lastRecordTime = now;

    // Throttled activity listener to keep performance 100% lag-free
    const handleUserActivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastRecordTime >= 5000) {
        lastRecordTime = currentTime;
        localStorage.setItem("last_active_time", currentTime.toString());
      }
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    // Check inactivity status every 10 seconds
    const intervalId = setInterval(() => {
      const storedLastActive =
        Number(localStorage.getItem("last_active_time")) || lastRecordTime;
      const inactiveDuration = Date.now() - storedLastActive;

      if (inactiveDuration >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(intervalId);
        performAutoLogout();
      }
    }, 10000);

    // Cross-tab synchronization: if logged out in another tab, log out here
    const handleStorageChange = (e) => {
      if (e.key === "access_token" && !e.newValue) {
        logout();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token, performAutoLogout]);

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
        INACTIVITY_TIMEOUT_MS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
