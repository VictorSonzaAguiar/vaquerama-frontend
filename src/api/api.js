// src/api/api.js

import axios from "axios";

// URL base do nosso Backend (Node.js/Express)
const API_URL = "http://localhost:3000/api";

// Cria uma instância configurada do Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Não incluiremos o token por enquanto, pois esta é a rota de Login
});

// **********************************************
// NOVO: INTERCEPTOR PARA ADICIONAR O TOKEN JWT
// **********************************************
apiClient.interceptors.request.use(
  (config) => {
    // 1. Obtém o token do localStorage
    const token = localStorage.getItem('userToken');

    // 2. Verifica se a rota é pública (Login ou Register)
    const isPublicRoute = config.url.includes('/auth/login') || config.url.includes('/auth/register');

    // 3. Se houver token E não for uma rota pública, adiciona o header de Autorização
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
