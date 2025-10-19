import React, { createContext, useState, useContext, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../api/api.js";
import useAuth from "../hooks/useAuth";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // 👉 Adiciona nova notificação
  const addNotification = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  // 👉 Marcar todas como lidas (chama backend)
  const clearNotifications = async () => {
    try {
      await api.put("/notifications/read/all"); // chama backend
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Erro ao limpar notificações:", err);
    }
  };

  // 👉 Buscar notificações do backend
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Conecta socket
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      transports: ["websocket"],
    });

    socket.emit("register_user", user.id);
    socket.on("notification", (data) => {
      addNotification(data);
    });

    // Busca inicial e polling a cada 10s
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setUnreadCount,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
