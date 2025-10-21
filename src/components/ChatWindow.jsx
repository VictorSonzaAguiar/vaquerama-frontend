// ===============================================================
// 🌵 ChatWindow.jsx — versão final estilo Instagram Direct
// ===============================================================

import React, { useState, useEffect, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { io } from "socket.io-client";
import apiClient from "../api/api";
import "../styles/ChatWindow.css";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://192.168.3.9:3000";

const ChatWindow = ({ conversation, user, onBack }) => {
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

  // === Estados ===
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
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

    return () => socketRef.current.disconnect();
  }, [conversation.id]);

  // === Busca mensagens ===
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

  // === Scroll automático ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === Pré-visualização da mídia ===
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // === Enviar mensagem ===
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !media) return;
    if (!conversation?.id || !user?.id) return;

    const formData = new FormData();
    formData.append("content", newMessage.trim());
    if (media) formData.append("media", media);

    try {
      setIsSending(true);

      const tempMsg = {
        sender_id: user.id,
        content: newMessage.trim(),
        media_url: preview || null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      socketRef.current.emit("sendMessage", {
        conversationId: conversation.id,
        message: tempMsg,
      });

      await apiClient.post(`/messages/${conversation.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewMessage("");
      setMedia(null);
      setPreview(null);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    } finally {
      setIsSending(false);
    }
  };

  // === Renderização ===
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
              {/* Avatar do outro usuário */}
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

              <div className="message-content">
                {/* ============================================= */}
                {/* AQUI ESTÁ A CORREÇÃO NO JSX                   */}
                {/* A classe 'message-bubble' foi para o <p>      */}
                {/* A <div> extra foi removida                    */}
                {/* ============================================= */}
                {msg.content && (
                  <p
                    className={`message-bubble ${
                      msg.sender_id === user.id ? "sent" : "received"
                    }`}
                  >
                    {msg.content}
                  </p>
                )}

                {/* ===== Mídia fora do balão ===== */}
                {msg.media_url && (
                  <div
                    className={`message-media ${
                      msg.sender_id === user.id ? "sent" : "received"
                    }`}
                  >
                    {msg.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={msg.media_url}
                        controls
                        className="chat-media"
                      />
                    ) : msg.media_url.match(/\.(mp3|wav|m4a|ogg)$/i) ? (
                      <audio
                        src={msg.media_url}
                        controls
                        className="chat-media"
                      />
                    ) : (
                      <img
                        src={msg.media_url}
                        alt="mídia"
                        className="chat-media"
                      />
                    )}
                  </div>
                )}
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
        {preview && (
          <div className="media-preview">
            {preview.match(/video/) ? (
              <video src={preview} controls width="100" />
            ) : preview.match(/audio/) ? (
              <audio src={preview} controls />
            ) : (
              <img src={preview} alt="preview" width="60" />
            )}
            <button
              type="button"
              className="remove-preview"
              onClick={() => {
                setPreview(null);
                setMedia(null);
              }}
            >
              ✕
            </button>
          </div>
        )}

        <label htmlFor="mediaUpload" className="upload-btn">
          <i className="bi bi-paperclip"></i>
        </label>
        <input
          type="file"
          id="mediaUpload"
          accept="image/*,video/*,audio/*"
          onChange={handleMediaChange}
          style={{ display: "none" }}
        />

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