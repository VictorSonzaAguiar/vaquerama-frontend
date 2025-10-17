// src/pages/Messages.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { InputGroup, FormControl, Spinner } from 'react-bootstrap';
import apiClient from '../api/api';
import io from 'socket.io-client';

import ConversationList from '../components/ConversationList';
import useAuth from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import '../styles/Messages.css';

const SOCKET_SERVER_URL = "http://localhost:3000";
const BACKEND_BASE_URL = 'http://localhost:3000';

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
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // =========================================================
  // 1. CONEXÃO SOCKET + ATUALIZAÇÃO EM TEMPO REAL
  // =========================================================
  useEffect(() => {
    if (!user?.id) return;

    clearNotifications();

    // Conecta no Socket.IO
    socketRef.current = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
    });

    // Registra o usuário logado
    socketRef.current.on('connect', () => {
      socketRef.current.emit("register_user", user.id);
    });

    // Evento: Mensagem Recebida
    const handleReceiveMessage = (incomingMessage) => {
      // Atualiza mensagens se estiver na conversa aberta
      if (incomingMessage.conversation_id === selectedConversationRef.current?.conversation_id) {
        setMessages(prev => [...prev, incomingMessage]);
      }

      // Atualiza lista lateral
      setConversations(prevConversations => {
        let updatedConvo = null;
        const newConvos = prevConversations.filter(c => {
          if (c.conversation_id === incomingMessage.conversation_id) {
            updatedConvo = {
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
        if (updatedConvo) {
          return [updatedConvo, ...newConvos];
        }
        return prevConversations;
      });
    };

    // Evento: Atualização da Lista de Conversas
    const handleUpdateConversationList = async () => {
      try {
        const response = await apiClient.get('/conversations');
        setConversations(response.data.conversations || []);
      } catch (err) {
        console.error("Erro ao atualizar lista:", err);
      }
    };

    socketRef.current.on("receive_message", handleReceiveMessage);
    socketRef.current.on("update_conversation_list", handleUpdateConversationList);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message", handleReceiveMessage);
        socketRef.current.off("update_conversation_list", handleUpdateConversationList);
        socketRef.current.disconnect();
      }
    };
  }, [clearNotifications, user?.id]);

  // =========================================================
  // 2. BUSCA A LISTA DE CONVERSAS
  // =========================================================
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const response = await apiClient.get('/conversations');
        const convos = response.data.conversations || [];
        setConversations(convos);

        if (userIdFromUrl) {
          const targetConvo = convos.find(c => c.participant_id === parseInt(userIdFromUrl));
          if (targetConvo) setSelectedConversation(targetConvo);
        }
      } catch (err) {
        setError('Não foi possível carregar suas conversas.');
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [userIdFromUrl]);

  // =========================================================
  // 3. BUSCA AS MENSAGENS E GERENCIA JOIN/LEAVE
  // =========================================================
  const fetchMessages = useCallback(async (conversationId) => {
    setLoadingMessages(true);
    try {
      const response = await apiClient.get(`/messages/${conversationId}`);
      setMessages(response.data.messages || []);

      setConversations(prev =>
        prev.map(c =>
          c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id);
      if (socketRef.current) {
        socketRef.current.emit('join_conversation', selectedConversation.conversation_id);
      }
    }
    return () => {
      if (socketRef.current && selectedConversation) {
        socketRef.current.emit('leave_conversation', selectedConversation.conversation_id);
      }
    };
  }, [selectedConversation, fetchMessages]);

  // =========================================================
  // 4. ENVIO DE MENSAGEM
  // =========================================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    setIsSending(true);

    try {
      const response = await apiClient.post(`/messages/${selectedConversation.conversation_id}`, { content: newMessage });
      const sentMessage = {
        id: response.data.messageId,
        sender_id: user.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        conversation_id: selectedConversation.conversation_id
      };

      setMessages(prev => [...prev, sentMessage]);

      // Emite mensagem via Socket.IO
      socketRef.current.emit('send_message', {
        conversationId: selectedConversation.conversation_id,
        message: sentMessage,
      });

      setNewMessage('');
    } catch (err) {
      alert("Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  // =========================================================
  // 5. RENDERIZAÇÃO
  // =========================================================
  if (loadingConversations) return <div className="messages-loading"><Spinner animation="border" variant="light" /></div>;
  if (error) return <h2 className="text-center text-danger mt-5">{error}</h2>;

  return (
    <div className="messages-page">
      <div className="messages-sidebar">
        <div className="sidebar-header"><h5>{user?.username}</h5></div>
        <div className="sidebar-search">
          <InputGroup>
            <InputGroup.Text className="search-icon"><i className="bi bi-search"></i></InputGroup.Text>
            <FormControl type="text" className="search-input" placeholder="Pesquisar" />
          </InputGroup>
        </div>
        <ConversationList
          conversations={conversations}
          onSelectConversation={setSelectedConversation}
          selectedConversation={selectedConversation}
        />
      </div>

      <div className="chat-area">
        {selectedConversation ? (
          <div className="chat-wrapper">
            <div className="chat-header">
              <h6>{selectedConversation.participant_name}</h6>
              <div className="chat-actions">
                <i className="bi bi-telephone"></i> <i className="bi bi-camera-video"></i>
              </div>
            </div>
            <div className="chat-body">
              {loadingMessages ? <Spinner animation="border" size="sm" /> : messages.map(msg => (
                <div key={msg.id} className={`message-container ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                  {msg.sender_id !== user.id && (
                    <img
                      src={selectedConversation.participant_photo ? `${BACKEND_BASE_URL}/uploads/${selectedConversation.participant_photo}` : 'https://via.placeholder.com/28'}
                      alt="Perfil"
                      className="chat-profile-pic"
                    />
                  )}
                  <div className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
              <InputGroup>
                <FormControl
                  type="text"
                  className="message-input"
                  placeholder="Mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <button type="submit" className="send-btn" disabled={isSending}><i className="bi bi-send"></i></button>
              </InputGroup>
            </form>
          </div>
        ) : (
          <div className="empty-chat">
            <h5>Suas mensagens</h5>
            <p>Selecione uma conversa para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
