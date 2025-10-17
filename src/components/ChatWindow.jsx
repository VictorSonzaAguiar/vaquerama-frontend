// src/components/ChatWindow.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Spinner, InputGroup, FormControl } from 'react-bootstrap';
import apiClient from '../api/api';
import useAuth from '../hooks/useAuth';
import io from 'socket.io-client'; // 👈 importar o socket
import '../styles/ChatWindow.css';

const BACKEND_BASE_URL = 'http://localhost:3000';
const SOCKET_SERVER_URL = 'http://localhost:3000'; // 👈 igual no Messages.jsx

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef(null); // 👈 adicionar

  // =========================
  // 1. Buscar histórico
  // =========================
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/messages/${conversation.conversation_id}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Erro ao buscar mensagens no widget:", err);
    } finally {
      setLoading(false);
    }
  }, [conversation.conversation_id]);

  // =========================
  // 2. Conexão Socket
  // =========================
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    // Entrar na sala da conversa
    socketRef.current.emit('join_conversation', conversation.conversation_id);

    // Listener: receber mensagens em tempo real
    socketRef.current.on('receive_message', (incomingMessage) => {
      if (incomingMessage.conversation_id === conversation.conversation_id) {
        setMessages(prev => [...prev, incomingMessage]);
      }
    });

    // Cleanup: sair da sala e desconectar
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_conversation', conversation.conversation_id);
        socketRef.current.disconnect();
      }
    };
  }, [conversation.conversation_id]);

  // =========================
  // 3. Buscar mensagens no load
  // =========================
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // =========================
  // 4. Enviar mensagem
  // =========================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await apiClient.post(`/messages/${conversation.conversation_id}`, { content: newMessage });

      const sentMessage = {
        id: response.data.messageId,
        sender_id: user.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        conversation_id: conversation.conversation_id,
      };

      setMessages(prev => [...prev, sentMessage]);

      // 👇 Emite via socket para o outro usuário
      socketRef.current.emit('send_message', {
        conversationId: conversation.conversation_id,
        message: sentMessage,
      });

      setNewMessage('');
    } catch (err) {
      alert("Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  // =========================
  // 5. Renderização
  // =========================
  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <button onClick={onBack} className="back-btn">&larr;</button>
        <h6>{conversation.participant_name}</h6>
      </div>

      <div className="chat-window-body">
        {loading ? <Spinner size="sm" /> : messages.map(msg => (
          <div key={msg.id} className={`message-container ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
            {msg.sender_id !== user.id && (
              <img
                src={conversation.participant_photo
                  ? `${BACKEND_BASE_URL}/uploads/${conversation.participant_photo}`
                  : 'https://via.placeholder.com/28'}
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

      <form className="chat-window-input" onSubmit={handleSendMessage}>
        <InputGroup>
          <FormControl
            placeholder="Mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <button type="submit" disabled={isSending}>
            <i className="bi bi-send"></i>
          </button>
        </InputGroup>
      </form>
    </div>
  );
};

export default ChatWindow;
