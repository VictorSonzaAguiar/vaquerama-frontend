// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import apiClient from "../api/api";

const useAuth = () => {
  // Estado para armazenar o token (se o usuário está logado)
  const [token, setToken] = useState(localStorage.getItem("userToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Efeito para manter o estado de autenticação sincronizado
  useEffect(() => {
    setIsAuthenticated(!!token);
    // TODO: No futuro, podemos decodificar o token ou buscar dados do usuário aqui.
  }, [token]);

  // Função de Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Chamada de API: '/users/login' é o endpoint
      const response = await apiClient.post("auth/login", { email, password });

      // 2. Se for sucesso (Status 200), extrai o token
      const newToken = response.data.token;
      const userData = response.data.user; // Se a API retornar dados do user

      if (newToken) {
        // 3. Armazena o token e atualiza o estado
        localStorage.setItem("userToken", newToken);
        setToken(newToken);
        setUser(userData);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);

      // Trata erros de resposta da API (ex: 401 Unauthorized)
      const errorMessage = error.response
        ? error.response.data.message || "Credenciais inválidas."
        : "Erro de conexão com o servidor. O Backend está rodando?";

      return { success: false, error: errorMessage };
    }
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
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

export default useAuth;
