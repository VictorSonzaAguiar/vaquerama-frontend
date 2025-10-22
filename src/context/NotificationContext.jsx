import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api.js";
import { useCallback } from "react";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

const addNotification = useCallback((newNotification) => {
  setNotifications((prev) => [newNotification, ...prev]);
  setUnreadCount((prev) => prev + 1);
}, []); // <-- Adiciona dependência vazia
  // 👉 Marcar todas como lidas (chama backend)
 const clearNotifications = useCallback(async () => {
  try {
    await api.put("/notifications/read/all"); // chama backend
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  } catch (err) {
    console.error("Erro ao limpar notificações:", err);
  }
}, []); // <-- Adiciona dependência vazia

 const fetchNotifications = useCallback(async () => {
  // (Não precisamos mais do 'if (!user) return;' pois o 'useEffect' abaixo vai cuidar disso)
  try {
    const res = await api.get("/notifications");
    setNotifications(res.data);
    const unread = res.data.filter((n) => !n.is_read).length;
    setUnreadCount(unread);
  } catch (err) {
    console.error("Erro ao carregar notificações:", err);
  }
}, []); // <-- Adiciona dependência vazia
 useEffect(() => {
  // Se não temos o socket central, não faz nada
  if (!socket) return;

  // 1. Busca inicial
  fetchNotifications();

  // 2. Ouve por notificações (de likes, comentários, etc.)
  const handleNotification = (data) => addNotification(data);
  socket.on("notification", handleNotification);

  // 3. Limpa o ouvinte
  return () => {
    socket.off("notification", handleNotification);
  };
}, [socket, fetchNotifications, addNotification]); // <-- Depende do socket

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        setUnreadCount,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
