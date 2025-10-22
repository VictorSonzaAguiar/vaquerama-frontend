import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";


import { useSocket } from "../context/SocketContext";
import useAuth from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContext";

import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ChatWidget from "./ChatWidget";



const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { addNotification, unreadCount, addMessageNotification, unreadMessageCount } = useNotifications();
const socket = useSocket();

  const isMessagesPage = location.pathname.startsWith("/messages");

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sidebar:collapsed") || "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const effectiveCollapsed = isMessagesPage ? true : collapsed;

  const cssVars = useMemo(
    () => ({
      "--sidebar-w": effectiveCollapsed ? "72px" : "260px",
    }),
    [effectiveCollapsed]
  );

  // Efeito 1: Gerencia a CONEXÃO do socket (depende apenas do 'user')
// Efeito 1: Gerencia os OUVINTES GLOBAIS (notificação de chat)
useEffect(() => {
  // Se não temos o socket central, não faz nada
  if (!socket) return;

  // Ouve por "nova mensagem" (para mostrar o emblema)
  const handleNotification = () => addMessageNotification(); // <-- CORRIGIDO
  socket.on("new_message_notification", handleNotification);

  // Limpa o ouvinte
  return () => {
    socket.off("new_message_notification", handleNotification);
  };
}, [socket, addMessageNotification]); // <-- CORRIGIDO

  useEffect(() => {
  const totalUnread = (unreadCount || 0) + (unreadMessageCount || 0);
  document.title =
    totalUnread > 0 ? `(${totalUnread}) Vaquerama` : "Vaquerama";
}, [unreadCount, unreadMessageCount]); // <-- Adiciona a nova dependência;

  // ============================================================
  // 🚫 Remover barra de sugestões em rotas específicas
  // ============================================================
  const currentPath = location.pathname.toLowerCase();

  // Oculta em perfil, editar perfil e páginas de configuração
  const hideSuggestions =
    currentPath.startsWith("/profile") ||
    currentPath.includes("edit") ||
    currentPath.includes("config") ||
    currentPath.includes("settings") ||
    currentPath.includes("account");

  // ============================================================
  // 🧭 Layout principal
  // ============================================================
  return (
    <div className="app-shell" style={cssVars}>
      <Sidebar collapsed={effectiveCollapsed} />

      <main className={`app-content ${isMessagesPage ? "is-messages" : ""}`}>
        {isMessagesPage ? (
          children
        ) : (
          <div className="container-fluid">
            <div className="row justify-content-center mx-0">
              {/* Centraliza e remove sugestões */}
              {hideSuggestions ? (
                <div className="col-12 d-flex justify-content-center px-0">
                  <div
                    className="feed-col-style"
                    style={{
                      width: "100%",
                      maxWidth: "900px",
                      margin: "0 auto",
                    }}
                  >
                    {children}
                  </div>
                </div>
              ) : (
                <>
                  <div className="d-none d-lg-block col-lg-1" />
                  <div className="col-12 col-md-8 col-lg-7 px-0 feed-col-style">
                    <div id="app-content">{children}</div>
                  </div>

                  {/* 🔥 Sidebar de sugestões — agora some em /edit, /config, /settings etc */}
                  {!hideSuggestions && (
                    <div className="d-none d-md-block col-md-4 col-lg-3 sidebar-col-style-right">
                      <div className="sidebar-sticky pt-4">
                        <h6 className="fw-bold mb-3 text-white">
                          Sugestões de Vaqueiros
                        </h6>
                        <p className="text-subtle" style={{ fontSize: "14px" }}>
                          Encontre novos vaqueiros e parques para seguir.
                        </p>
                        <p
                          className="mt-5 text-subtle"
                          style={{ fontSize: "10px" }}
                        >
                          VAQUERAMA © 2025
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
      {!isMessagesPage && <ChatWidget />}
    </div>
  );
};

export default AppLayout;
