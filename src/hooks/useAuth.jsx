// ===============================================================
// 📄 useAuth.jsx — Hook e Contexto de Autenticação (versão final)
// ===============================================================

import React, {
  useContext,
  createContext,
  useState,
  useEffect,
} from "react";
import apiClient from "../api/api";
import { jwtDecode } from "jwt-decode";

// ===============================================================
// 🔹 Hook principal — controla autenticação e estado do usuário
// ===============================================================
const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("userToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  // 🔸 Verifica token e busca dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("userToken");
      if (storedToken) {
        try {
          const response = await apiClient.get("/users/me");
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido
          localStorage.removeItem("userToken");
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // 🔸 Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const newToken = response.data.token;

      if (newToken) {
        localStorage.setItem("userToken", newToken);
        setToken(newToken);
        const userResponse = await apiClient.get("/users/me");
        setUser(userResponse.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || "Credenciais inválidas.";
      return { success: false, error: errorMessage };
    }
  };

  // 🔸 Logout
  const logout = () => {
    localStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    token,
  };
};

// ===============================================================
// 🔹 Criação do Contexto e Provider global
// ===============================================================
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuthLogic();
  return (
    <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
  );
};

// ===============================================================
// 🔹 Hook de acesso ao contexto em qualquer componente
// ===============================================================
export const useAuth = () => useContext(AuthContext);

export default useAuth;
