import React, { createContext, useContext, useState, useEffect } from "react";
import { GetFromLocalStorage, SaveToLocalStorage, RemoveFromLocalStorage } from "../utils/getFromLocals";

const AuthContext = createContext();

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
  };

  const logout = () => {
    RemoveFromLocalStorage("access_token");
    RemoveFromLocalStorage("user");
    localStorage.removeItem("airlineId");
    localStorage.removeItem("userId");
    setToken(null);
    setUser(null);
  };

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
