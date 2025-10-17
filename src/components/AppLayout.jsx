import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client'; // ✅ 1. IMPORTA O CLIENTE SOCKET.IO

// Hooks e Contextos
import useAuth from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';

// Componentes
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ChatWidget from './ChatWidget';

// URL do seu servidor backend
const SOCKET_SERVER_URL = "http://localhost:3000";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth(); // Pega o usuário logado
  const { addNotification, unreadCount } = useNotifications(); // Pega as funções de notificação
  const socketRef = useRef(null); // Ref para guardar a conexão do socket

  // =========================================================
  // ✅ 2. LÓGICA DE CONEXÃO E NOTIFICAÇÃO EM TEMPO REAL
  // =========================================================
  useEffect(() => {
    // Só conecta se o usuário estiver logado
    if (user && user.id) {
      // Conecta ao servidor Socket.IO
      socketRef.current = io(SOCKET_SERVER_URL);

      // A. Envia um evento para o backend dizendo "Ei, sou eu, usuário X"
      socketRef.current.emit('register_user', user.id);

      // B. Fica ouvindo pelo evento de notificação que o backend vai mandar
      socketRef.current.on('new_message_notification', () => {
        // Quando ouvir, chama a função do nosso context para aumentar a contagem
        addNotification();
      });

      // C. Função de limpeza: desconecta o socket quando o usuário deslogar
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user, addNotification]);

  // Efeito "bônus" para mostrar a notificação no título da aba do navegador
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) Vaquerama` : 'Vaquerama';
  }, [unreadCount]);

  // O resto do seu componente continua igual...
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className="d-flex">
      <Sidebar />
      <main className="main-content flex-grow-1">
        {isMessagesPage ? (
          children
        ) : (
          <div className="container-fluid">
            <div className="row justify-content-center mx-0">
              <div className="col-lg-1 d-none d-lg-block"></div>
              <div className="col-12 col-md-8 col-lg-7 px-0 feed-col-style">
                <div id="app-content">
                  {children}
                </div>
              </div>
              <div className="col-md-4 col-lg-3 d-none d-md-block sidebar-col-style-right">
                <div className="sidebar-sticky pt-4">
                  <h6 className="fw-bold mb-3 text-white">Sugestões de Vaqueiros</h6>
                  <p className="text-subtle" style={{ fontSize: '14px' }}>
                    Encontre novos vaqueiros e parques para seguir.
                  </p>
                  <p className="mt-5 text-subtle" style={{ fontSize: '10px' }}>
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