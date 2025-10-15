// src/api/api.js

import axios from "axios";

// URL base do Backend
const API_URL = "http://localhost:3000/api";

// Instância do Axios
const apiClient = axios.create({
  baseURL: API_URL,
  // Content-Type padrão: JSON
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================
// INTERCEPTOR PARA ADICIONAR JWT
// ======================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");

    const isPublicRoute =
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/register");

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================================
// FUNÇÃO AUXILIAR PARA CRIAR POST COM FORM-DATA
// ======================================
export const createPost = async (caption, file) => {
  try {
    const formData = new FormData();
    formData.append("caption", caption);

    if (file) {
      // O backend espera 'media' no multer.single('media')
      formData.append("media", file);

      // Define tipo de mídia
      const mediaType = file.type.startsWith("video/") ? "VIDEO" : "PHOTO";
      formData.append("media_type", mediaType);
    }

    const response = await apiClient.post("/posts/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // sobrescreve JSON
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao criar post:", error.response?.data || error.message);
    throw error;
  }
};

export default apiClient;
