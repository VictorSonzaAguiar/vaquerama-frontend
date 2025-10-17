// src/pages/Messages.jsx (VERSÃO FINAL E COMPLETA)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { InputGroup, FormControl, Spinner } from 'react-bootstrap';
import apiClient from '../api/api';
import io from 'socket.io-client';

// Componentes e Contextos
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

  // Efeito para limpar as notificações ao entrar na página
  useEffect(() => {
    clearNotifications();
  }, [clearNotifications]);

  // Efeito para conectar e gerenciar o Socket.IO
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.on('receive_message', (incomingMessage) => {
      // Apenas adiciona a mensagem se ela pertencer à conversa aberta
      if (incomingMessage.conversation_id === selectedConversation?.conversation_id) {
          setMessages(prev => [...prev, incomingMessage]);
      }
    });

    return () => socketRef.current.disconnect();
  }, [selectedConversation]);

  // Efeito para entrar/sair das salas de chat
  useEffect(() => {
    if (selectedConversation) {
      socketRef.current.emit('join_conversation', selectedConversation.conversation_id);
    }
    return () => {
      if (selectedConversation) {
        socketRef.current.emit('leave_conversation', selectedConversation.conversation_id);
      }
    };
  }, [selectedConversation]);

  // Busca a lista de conversas
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

  // Busca as mensagens de uma conversa selecionada
  const fetchMessages = useCallback(async (conversationId) => {
    setLoadingMessages(true);
    try {
      const response = await apiClient.get(`/messages/${conversationId}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id);
    }
  }, [selectedConversation, fetchMessages]);

  // Envia uma nova mensagem
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
  
  // Renderização
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