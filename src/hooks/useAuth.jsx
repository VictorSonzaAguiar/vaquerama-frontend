// src/hooks/useAuth.js (VERSÃO FINAL E INTELIGENTE)

import { useState, useEffect } from "react";
import apiClient from "../api/api";
import { jwtDecode } from "jwt-decode";

// Esta função agora é um provedor de contexto, que será usado no main.jsx
// (A explicação está na Etapa 3)
// Por enquanto, apenas copie este código.
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("userToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true); // Começa como true

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("userToken");
      if (storedToken) {
        try {
          // Usa a nova rota '/me' para buscar o perfil completo
          const response = await apiClient.get("/users/me");
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Se o token for inválido, limpa tudo
          localStorage.removeItem("userToken");
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false); // Finaliza o carregamento inicial
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post("auth/login", { email, password });
      const newToken = response.data.token;

      if (newToken) {
        localStorage.setItem("userToken", newToken);
        setToken(newToken);
        // Após o login, busca os dados do usuário
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

// Precisamos criar um Contexto para que o hook funcione corretamente
// em toda a aplicação. Esta parte é nova e crucial.
import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default () => useContext(AuthContext);
