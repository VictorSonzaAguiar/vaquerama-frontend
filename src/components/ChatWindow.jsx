// ===============================================================
// 🌵 ChatWindow.jsx — versão FINAL corrigida com apiClient + JWT
// ===============================================================

import React, { useState, useEffect, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { io } from "socket.io-client";
import apiClient from "../api/api"; // ✅ Usa o apiClient com interceptor JWT
import "../styles/ChatWindow.css";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://192.168.3.9:3000";

const ChatWindow = ({ conversation, user, onBack }) => {
  // === Proteção inicial contra dados vazios ===
  if (!conversation || !conversation.id) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <div className="header-left">
            <button onClick={onBack} className="back-btn">
              <i className="bi bi-arrow-left"></i>
            </button>
            <div className="header-user">
              <img src="https://placehold.co/40x40?text=?" alt="Perfil" />
              <span className="username">Carregando...</span>
            </div>
          </div>
        </div>
        <div className="chat-body loading">Carregando conversa...</div>
      </div>
    );
  }

  // === Estados principais ===
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // === Inicializa Socket.IO ===
  useEffect(() => {
    socketRef.current = io(BACKEND_BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.emit("joinConversation", conversation.id);

    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [conversation.id]);

  // === Busca mensagens da conversa (com token JWT) ===
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiClient.get(`/messages/${conversation.id}`);
        const data = res.data?.messages || [];
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation.id]);

  // === Scroll automático ao final ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === Enviar mensagem ===
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!conversation?.id || !user?.id) return;

    const msg = {
      conversation_id: conversation.id,
      sender_id: user.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      setIsSending(true);

      // Exibe instantaneamente no chat
      setMessages((prev) => [...prev, msg]);

      // Envia via socket
      socketRef.current.emit("sendMessage", msg);

      // Envia via API (com JWT automático)
      await apiClient.post(`/messages/${conversation.id}`, msg);

      setNewMessage("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    } finally {
      setIsSending(false);
    }
  };

  // === Render ===
  return (
    <div className="chat-window">
      {/* ===== HEADER ===== */}
      <div className="chat-header">
        <div className="header-left">
          <button onClick={onBack} className="back-btn">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div className="header-user">
            <img
              src={
                conversation.participant_photo
                  ? `${BACKEND_BASE_URL}/uploads/${conversation.participant_photo}`
                  : "https://placehold.co/40x40?text=U"
              }
              alt="Perfil"
            />
            <span className="username">
              {conversation.participant_name || "Usuário"}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <i className="bi bi-info-circle"></i>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="chat-body">
        {loading ? (
          <div className="loading">
            <Spinner animation="border" size="sm" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-wrapper ${
                msg.sender_id === user.id ? "sent" : "received"
              }`}
            >
              {msg.sender_id !== user.id && (
                <img
                  src={
                    conversation.participant_photo
                      ? `${BACKEND_BASE_URL}/uploads/${conversation.participant_photo}`
                      : "https://placehold.co/28x28?text=?"
                  }
                  alt="Perfil"
                  className="msg-avatar"
                />
              )}
              <div
                className={`message-bubble ${
                  msg.sender_id === user.id ? "sent" : "received"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">Nenhuma mensagem ainda...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== INPUT ===== */}
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
        />
        <button type="submit" disabled={isSending}>
          <i className="bi bi-send-fill"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
