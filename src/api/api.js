// =========================================================
// 🌐 API CLIENT (axios) — compatível com desktop e mobile
// =========================================================

import axios from "axios";

// ============================
// 🔧 BASE URL dinâmica
// ============================
// 1) Usa a variável do .env se existir (VITE_API_URL)
// 2) Se não existir, tenta automaticamente descobrir o IP local
// 3) Fallback final: localhost:3000/api
let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // 👇 Se não houver .env, detecta ambiente local automaticamente
  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname.startsWith("192.168.");
  API_URL = isLocal
    ? `http://${hostname}:3000/api`
    : "https://vaquerama-backend.example.com/api"; // opcional: URL do deploy
}

console.log("[API] Base URL:", API_URL);

// ============================
// ⚙️ Instância principal
// ============================
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ============================
// 🧩 Interceptor de Requisição
// - Injeta o token JWT se existir
// ============================
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================
// 🚨 Interceptor de Resposta
// - Trata globalmente erros 401
// ============================
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("userToken");
      // Opcional: redirecionar usuário para login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============================
// 📸 Helper: Criar Post com Mídia
// ============================
export const createPost = async (caption, file) => {
  const formData = new FormData();
  formData.append("caption", caption);

  if (file) {
    formData.append("media", file);
    const mediaType = file.type.startsWith("video/") ? "VIDEO" : "PHOTO";
    formData.append("media_type", mediaType);
  }

  const { data } = await apiClient.post("/posts/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// ============================
// ✅ Exporta instância global
// ============================
export default apiClient;
