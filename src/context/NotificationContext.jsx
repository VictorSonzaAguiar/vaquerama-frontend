import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Simplesmente incrementa a contagem
  const addNotification = () => {
    setUnreadCount(prev => prev + 1);
  };

  // Zera a contagem (quando o usuário visitar a página de mensagens)
  const clearNotifications = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook customizado para facilitar o uso
export const useNotifications = () => useContext(NotificationContext);