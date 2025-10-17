// src/components/AppLayout.jsx (VERSÃO FINAL E CORRIGIDA)

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client'; // Importa o cliente Socket.IO

// Hooks e Contextos
import useAuth from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext'; // Usado para a notificação global

// Componentes
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ChatWidget from './ChatWidget';

// URL do seu servidor backend
const SOCKET_SERVER_URL = "http://localhost:3000"; // URL do socket server

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth(); // Pega o usuário logado
  const { addNotification, unreadCount } = useNotifications(); // Pega as funções de notificação
  const socketRef = useRef(null); // Ref para guardar a conexão do socket

  // =========================================================
  // LÓGICA DE CONEXÃO E NOTIFICAÇÃO EM TEMPO REAL
  // =========================================================
  useEffect(() => {
    // Só conecta se o usuário estiver logado
    if (user && user.id) {
      // Cria a conexão se ela ainda não existir
      if (!socketRef.current) {
         socketRef.current = io(SOCKET_SERVER_URL);
      }
     

      // A. Envia um evento para o backend dizendo "Ei, sou eu, usuário X"
      socketRef.current.emit('register_user', user.id); // Registra o usuário

      // B. Fica ouvindo pelo evento de notificação de nova mensagem
      socketRef.current.on('new_message_notification', (data) => {
        // Quando ouvir, chama a função do nosso context para aumentar a contagem
        // (A função do Contexto de Notificação é aumentar a contagem global)
        addNotification(); // Adiciona notificação
      });

      // C. Função de limpeza: desconecta o socket quando o usuário deslogar/componente desmontar
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect(); // Desconecta o socket
          socketRef.current = null;
        }
      };
    }
  }, [user, addNotification]);

  // Efeito "bônus" para mostrar a notificação no título da aba do navegador
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) Vaquerama` : 'Vaquerama';
  }, [unreadCount]);

  // Checa se estamos na página /messages ou /messages/:id
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className="d-flex">
      {/* Sidebar Lateral */}
      <Sidebar /> 
      
      {/* Conteúdo Principal */}
      <main className="main-content flex-grow-1">
        {/* Se for a página de mensagens, não usa a estrutura de 3 colunas */}
        {isMessagesPage ? (
          children
        ) : (
          <div className="container-fluid">
            <div className="row justify-content-center mx-0">
              <div className="col-lg-1 d-none d-lg-block"></div>
              {/* Coluna Central (Feed) */}
              <div className="col-12 col-md-8 col-lg-7 px-0 feed-col-style">
                <div id="app-content">
                  {children}
                </div>
              </div>
              {/* Coluna Lateral Direita (Sugestões) */}
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
      
      {/* Navegação Inferior (Mobile) */}
      <BottomNav />
      
      {/* Chat Widget Flutuante (Apenas se não estiver na página de mensagens) */}
     {!isMessagesPage && <ChatWidget />}
    </div>
  );
};

export default AppLayout;