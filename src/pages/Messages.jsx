import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { InputGroup, FormControl, Spinner } from "react-bootstrap";
import apiClient from "../api/api";
import io from "socket.io-client";

import ConversationList from "../components/ConversationList";
import useAuth from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContext";
import "../styles/Messages.css";

const SOCKET_SERVER_URL = "http://localhost:3000";
const BACKEND_BASE_URL = "http://localhost:3000";

const Messages = () => {
  const { user } = useAuth();
  const { id: userIdFromUrl } = useParams();
  const { clearNotifications } = useNotifications();
  const socketRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState(null);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => { selectedConversationRef.current = selectedConversation; }, [selectedConversation]);

  const [showListMobile, setShowListMobile] = useState(true);

  const chatEndRef = useRef(null);
  const scrollToBottom = useCallback(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // sockets
  useEffect(() => {
    if (!user?.id) return;
    clearNotifications();

    socketRef.current = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    socketRef.current.on("connect", () => {
      socketRef.current.emit("register_user", user.id);
    });

    const handleReceiveMessage = (incomingMessage) => {
      if (incomingMessage.conversation_id === selectedConversationRef.current?.conversation_id) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
      setConversations((prev) => {
        let updated = null;
        const rest = prev.filter((c) => {
          if (c.conversation_id === incomingMessage.conversation_id) {
            updated = {
              ...c,
              last_message: incomingMessage.content,
              last_message_timestamp: incomingMessage.created_at,
              unread_count:
                c.conversation_id === selectedConversationRef.current?.conversation_id
                  ? 0
                  : (c.unread_count || 0) + 1,
            };
            return false;
          }
          return true;
        });
        return updated ? [updated, ...rest] : prev;
      });
    };

    const handleUpdateConversationList = async () => {
      try {
        const res = await apiClient.get("/conversations");
        setConversations(res.data.conversations || []);
      } catch (e) { /* silent */ }
    };

    socketRef.current.on("receive_message", handleReceiveMessage);
    socketRef.current.on("update_conversation_list", handleUpdateConversationList);

    return () => {
      socketRef.current?.off("receive_message", handleReceiveMessage);
      socketRef.current?.off("update_conversation_list", handleUpdateConversationList);
      socketRef.current?.disconnect();
    };
  }, [clearNotifications, user?.id]);

  // lista de conversas
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const res = await apiClient.get("/conversations");
        const convos = res.data.conversations || [];
        setConversations(convos);

        if (userIdFromUrl) {
          const target = convos.find((c) => c.participant_id === parseInt(userIdFromUrl, 10));
          if (target) { setSelectedConversation(target); setShowListMobile(false); }
        }
      } catch {
        setError("Não foi possível carregar suas conversas.");
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [userIdFromUrl]);

  // mensagens da conversa
  const fetchMessages = useCallback(async (conversationId) => {
    setLoadingMessages(true);
    try {
      const res = await apiClient.get(`/messages/${conversationId}`);
      setMessages(res.data.messages || []);
      setConversations((prev) => prev.map((c) =>
        c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c
      ));
    } catch (e) {
      console.error("Erro ao buscar mensagens:", e);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id);
      socketRef.current?.emit("join_conversation", selectedConversation.conversation_id);
      setShowListMobile(false);
    }
    return () => {
      if (selectedConversation) socketRef.current?.emit("leave_conversation", selectedConversation.conversation_id);
    };
  }, [selectedConversation, fetchMessages]);

  // enviar
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    setIsSending(true);
    try {
      const res = await apiClient.post(`/messages/${selectedConversation.conversation_id}`, { content: newMessage });
      const sent = {
        id: res.data?.messageId ?? `tmp-${Date.now()}`,
        sender_id: user.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        conversation_id: selectedConversation.conversation_id,
      };
      setMessages((prev) => [...prev, sent]);
      socketRef.current?.emit("send_message", { conversationId: selectedConversation.conversation_id, message: sent });
      setNewMessage("");
    } catch {
      alert("Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  if (loadingConversations)
    return (
      <div className="messages-loading">
        <Spinner animation="border" variant="light" />
      </div>
    );
  if (error) return <h2 className="text-center text-danger mt-5">{error}</h2>;

  return (
    <div className="dm-shell">
      {/* lista */}
      <section className={`dm-list ${showListMobile ? "" : "is-hidden-mobile"}`}>
        <header className="dm-list__header"><h5 className="mb-0">{user?.username}</h5></header>
        <div className="dm-list__search">
          <InputGroup>
            <InputGroup.Text className="search-icon"><i className="bi bi-search"></i></InputGroup.Text>
            <FormControl type="text" className="search-input" placeholder="Pesquisar" />
          </InputGroup>
        </div>
        <div className="dm-list__threads">
          <ConversationList
            conversations={conversations}
            onSelectConversation={setSelectedConversation}
            selectedConversation={selectedConversation}
          />
        </div>
      </section>

      {/* chat */}
      <section className="dm-chat">
        {selectedConversation ? (
          <div className="dm-chat__wrapper">
            <header className="dm-chat__header">
              <div className="peer">
                <img
                  className="peer-avatar"
                  src={
                    selectedConversation.participant_photo
                      ? `${BACKEND_BASE_URL}/uploads/${selectedConversation.participant_photo}`
                      : "https://via.placeholder.com/40"
                  }
                  alt={selectedConversation.participant_name}
                />
                <div className="peer-meta">
                  <strong className="peer-name">{selectedConversation.participant_name}</strong>
                  <span className="peer-sub">Online há 1 h</span>
                </div>
                <button
                  className="btn-ghost show-list-mobile ms-2"
                  type="button"
                  onClick={() => setShowListMobile(true)}
                  title="Conversas"
                >
                  <i className="bi bi-list" />
                </button>
              </div>
              <div className="dm-chat__actions">
                <button className="btn-ghost" type="button" title="Ligar"><i className="bi bi-telephone" /></button>
                <button className="btn-ghost" type="button" title="Vídeo"><i className="bi bi-camera-video" /></button>
                <button className="btn-ghost" type="button" title="Informações"><i className="bi bi-info-circle" /></button>
              </div>
            </header>

            <div className="dm-chat__scroll">
              <div className="dm-chat__content">
                {loadingMessages ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`message-row ${msg.sender_id === user.id ? "sent" : "received"}`}>
                      {msg.sender_id !== user.id && (
                        <img
                          src={
                            selectedConversation.participant_photo
                              ? `${BACKEND_BASE_URL}/uploads/${selectedConversation.participant_photo}`
                              : "https://via.placeholder.com/28"
                          }
                          alt="Perfil"
                          className="chat-avatar"
                        />
                      )}
                      <div className={`message-bubble ${msg.sender_id === user.id ? "sent" : "received"}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <form className="dm-chat__input" onSubmit={handleSendMessage}>
              <InputGroup>
                <FormControl
                  type="text"
                  className="message-input"
                  placeholder="Mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <button type="submit" className="send-btn" disabled={isSending}><i className="bi bi-send" /></button>
              </InputGroup>
            </form>
          </div>
        ) : (
          <div className="dm-chat__empty">
            <div className="dm-chat__content">
              <h5>Suas mensagens</h5>
              <p>Selecione uma conversa para começar.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Messages;
