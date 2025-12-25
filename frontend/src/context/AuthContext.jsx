import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../services/apiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  async function login(credentials) {
    const data = await loginUser(credentials);

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.clear();
    setIsAuthenticated(false);
    window.location.href = "/auth/login";
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
