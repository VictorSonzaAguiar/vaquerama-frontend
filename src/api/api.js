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

export default apiClient;
