// =========================================================
// 🌐 API CLIENT (axios) — compatível com desktop e mobile
// =========================================================

import axios from "axios";

// ============================
// 🔧 BASE URL dinâmica
// ============================
// 1️⃣ Usa variável do .env (VITE_API_URL) se existir
// 2️⃣ Caso contrário, detecta o ambiente automaticamente
// 3️⃣ Fallback final: localhost:3000/api
let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname.startsWith("192.168.");
  API_URL = isLocal
    ? `http://${hostname}:3000/api` // ✅ Inclui /api para combinar com o backend
    : "https://vaquerama-backend.example.com/api"; // URL do deploy (opcional)
}

console.log("[API] Base URL:", API_URL);

// ============================
// ⚙️ Instância principal
// ============================
const apiClient = axios.create({
  baseURL: API_URL, // ✅ Agora dinâmico e com /api incluído
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
// - Trata globalmente erros 401 (token inválido ou expirado)
// ============================
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("[API] Token inválido ou expirado. Limpando sessão...");
      localStorage.removeItem("userToken");

      // Opcional: redirecionar o usuário para login automaticamente
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

  // ✅ Agora a rota resolve para /api/posts/create automaticamente
  const { data } = await apiClient.post("/posts/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

// ============================
// ✅ Exporta instância global
// ============================
export default apiClient;
