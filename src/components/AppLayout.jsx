import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";

import useAuth from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContext";

import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ChatWidget from "./ChatWidget";

const SOCKET_SERVER_URL = "http://localhost:3000";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { addNotification, unreadCount } = useNotifications();
  const socketRef = useRef(null);

  const isMessagesPage = location.pathname.startsWith("/messages");

  // preferências do usuário (fora de /messages)
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sidebar:collapsed") || "false"); }
    catch { return false; }
  });
  useEffect(() => localStorage.setItem("sidebar:collapsed", JSON.stringify(collapsed)), [collapsed]);

  // em /messages força colapsado
  const effectiveCollapsed = isMessagesPage ? true : collapsed;

  const cssVars = useMemo(() => ({
    "--sidebar-w": effectiveCollapsed ? "72px" : "260px",
  }), [effectiveCollapsed]);

  // sockets + notificações
  useEffect(() => {
    if (user && user.id) {
      if (!socketRef.current) socketRef.current = io(SOCKET_SERVER_URL);
      socketRef.current.emit("register_user", user.id);
      socketRef.current.on("new_message_notification", () => addNotification());
      return () => { socketRef.current?.disconnect(); socketRef.current = null; };
    }
  }, [user, addNotification]);

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) Vaquerama` : "Vaquerama";
  }, [unreadCount]);

  return (
    <div className="app-shell" style={cssVars}>
      <Sidebar collapsed={effectiveCollapsed} />

      <main className={`app-content ${isMessagesPage ? "is-messages" : ""}`}>
        {isMessagesPage ? (
          children
        ) : (
          <div className="container-fluid">
            <div className="row justify-content-center mx-0">
              <div className="d-none d-lg-block col-lg-1" />
              <div className="col-12 col-md-8 col-lg-7 px-0 feed-col-style">
                <div id="app-content">{children}</div>
              </div>
              <div className="d-none d-md-block col-md-4 col-lg-3 sidebar-col-style-right">
                <div className="sidebar-sticky pt-4">
                  <h6 className="fw-bold mb-3 text-white">Sugestões de Vaqueiros</h6>
                  <p className="text-subtle" style={{ fontSize: "14px" }}>
                    Encontre novos vaqueiros e parques para seguir.
                  </p>
                  <p className="mt-5 text-subtle" style={{ fontSize: "10px" }}>
                    VAQUERAMA © 2025
                  </p>
                </div>
              </div>
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
