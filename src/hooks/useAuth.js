// src/hooks/useAuth.js - CORRIGIDO
import { useState } from "react";
import apiClient from "../api/api";
// Se você não instalou, precisa rodar: npm install jwt-decode
import { jwtDecode } from "jwt-decode";

// Função auxiliar para inicializar o estado lendo o localStorage
const getInitialState = () => {
  const token = localStorage.getItem("userToken");

  if (token) {
    try {
      // 1. Tenta decodificar o token para pegar o ID.
      // Assumimos que o token JWT contém o { id: X }
      const decoded = jwtDecode(token);

      // 2. Retorna o estado autenticado e o ID do usuário.
      return {
        token: token,
        isAuthenticated: true,
        user: { id: decoded.id }, // Popula o ID do usuário imediatamente
      };
    } catch (e) {
      // Token inválido (erro de decodificação)
      localStorage.removeItem("userToken");
    }
  }

  // Estado padrão (deslogado)
  return {
    token: null,
    isAuthenticated: false,
    user: null,
  };
};

const useAuth = () => {
  // Inicializa o estado com base no localStorage, garantindo que o user.id existe.
  const [state, setState] = useState(getInitialState());
  const [loading, setLoading] = useState(false);

  // Função de Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post("auth/login", { email, password });

      const newToken = response.data.token;

      if (newToken) {
        localStorage.setItem("userToken", newToken);
        const decoded = jwtDecode(newToken);

        // Atualiza o estado com o ID do usuário (vindo do token)
        setState({
          token: newToken,
          isAuthenticated: true,
          user: { id: decoded.id },
        });
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response
        ? error.response.data.message || "Credenciais inválidas."
        : "Erro de conexão com o servidor. O Backend está rodando?";

      return { success: false, error: errorMessage };
    }
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem("userToken");
    setState({
      token: null,
      isAuthenticated: false,
      user: null,
    });
  };

  // Retorna os dados do estado para uso nos componentes
  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading,
    login,
    logout,
    token: state.token,
  };
};

export default useAuth;
