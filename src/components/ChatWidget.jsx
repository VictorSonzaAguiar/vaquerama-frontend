// =============================================================
// 🌵 ChatWidget.jsx — CORRIGIDO (Mostra 2 avatares sobrepostos)
// =============================================================

import React, { useState, useEffect } from "react";
import apiClient from "../api/api";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useNotifications } from "../context/NotificationContext";
import useAuth from "../hooks/useAuth";
import "../styles/ChatWidget.css";
const BACKEND_BASE_URL = "http://localhost:3000";

const ChatWidget = () => {
  // Contextos globais
  const { unreadCount, clearNotifications } = useNotifications();
  const { user } = useAuth();

  // Estados
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);

  // =========================================================
  // 1️⃣ Buscar conversas (CORRIGIDO)
  // =========================================================
  useEffect(() => {
    // Se não há usuário logado, não faz nada
    if (!user?.id) return;

    setLoading(true);
    apiClient
      .get("/conversations")
      .then((response) => {
        setConversations(response.data.conversations || []);
      })
      .catch((err) => {
        console.error("Erro ao buscar conversas para o widget:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Gatilhos:
    // 1. Quando o user.id estiver disponível (primeiro carregamento)
    // 2. Sempre que a contagem de não lidos mudar (nova mensagem)
  }, [user?.id, unreadCount]);

  // =========================================================
  // 2️⃣ Selecionar conversa
  // =========================================================
  const handleSelectConversation = (convo) => {
    // Normaliza os dados para o ChatWindow
    const formattedConversation = {
      id: convo.conversation_id, // campo correto
      participant_name: convo.participant_name,
      participant_photo: convo.participant_photo,
    };

    setActiveConversation(formattedConversation);
    clearNotifications();
  };

  // =========================================================
  // 3️⃣ Fechar widget
  // =========================================================
  const handleClose = () => {
    setIsOpen(false);
    setActiveConversation(null);
  };

  // =========================================================
  // 4️⃣ Render principal
  // =========================================================
  return (
    <div className="chat-widget">
      {isOpen ? (
        // ================================
        // 💬 Janela aberta
        // ================================
        <div className="chat-widget-window">
          {activeConversation && activeConversation.id ? (
            <ChatWindow
              conversation={activeConversation}
              user={user}
              onBack={() => setActiveConversation(null)}
            />
          ) : (
            <>
              <div className="chat-widget-header">
                <h5>Mensagens</h5>
                <button className="close-btn" onClick={handleClose}>
                  &times;
                </button>
              </div>

              {loading ? (
                <p className="text-center text-subtle p-3">Carregando...</p>
              ) : (
                <ConversationList
                  conversations={conversations}
                  onSelectConversation={handleSelectConversation}
                  selectedConversation={activeConversation}
                />
              )}
            </>
          )}
        </div>
      ) : (
        // ================================
        // 🟡 Botão flutuante fechado
        // ================================
        (() => {
          // Pega as DUAS últimas conversas
          const firstConvo =
            conversations.length > 0 ? conversations[0] : null;
          const secondConvo =
            conversations.length > 1 ? conversations[1] : null;

          return (
            <button
              className="chat-widget-button"
              onClick={() => setIsOpen(true)}
            >
              <div className="chat-widget-icon">
                <i className="bi bi-messenger"></i>
              </div>

              <span className="chat-widget-label">Mensagens</span>

              {/* === PILHA DE AVATARES === */}
              <div className="chat-widget-avatar-stack">
                
                {/* Avatar 2 (Atrás) */}
                {secondConvo && (
                  <img
                    src={
                      secondConvo.participant_photo
                        ? `${BACKEND_BASE_URL}/uploads/${secondConvo.participant_photo}`
                        : "https://placehold.co/40x40?text=U"
                    }
                    alt="Conversa anterior"
                    className="avatar-stacked avatar-2"
                  />
                )}

                {/* Avatar 1 (Frente) */}
                {firstConvo && (
                  <img
                    src={
                      firstConvo.participant_photo
                        ? `${BACKEND_BASE_URL}/uploads/${firstConvo.participant_photo}`
                        : "https://placehold.co/40x40?text=U"
                    }
                    alt="Última conversa"
                    className="avatar-stacked avatar-1"
                  />
                )}

                {/* Fallback: Se não houver NENHUMA conversa, mostra seu user */}
                {!firstConvo && (
                  <img
                    src={
                      user?.profile_photo_url
                        ? `${BACKEND_BASE_URL}/uploads/${user.profile_photo_url}`
                        : "https://placehold.co/40x40?text=U"
                    }
                    alt="Usuário"
                    className="avatar-stacked avatar-1"
                  />
                )}

                {/* Emblema de não lido */}
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </div>
            </button>
          );
        })()
      )}
    </div>
  );
};

export default ChatWidget;