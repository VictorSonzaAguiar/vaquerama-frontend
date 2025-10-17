// src/components/ChatWindow.jsx (VERSÃO FINAL COM FOTO E TEMPO REAL)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Spinner, InputGroup, FormControl } from 'react-bootstrap';
import apiClient from '../api/api';
import useAuth from '../hooks/useAuth';
import io from 'socket.io-client'; // Importa o cliente Socket.IO
import '../styles/ChatWindow.css';

// URL do seu servidor backend
const SOCKET_SERVER_URL = "http://localhost:3000";
const BACKEND_BASE_URL = 'http://localhost:3000';

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Ref para manter a instância do socket viva entre renderizações
  const socketRef = useRef(null);

  // =========================================================
  // 1. CONECTA E GERENCIA O SOCKET.IO
  // =========================================================
  useEffect(() => {
    // Conecta ao servidor quando o componente é montado
    socketRef.current = io(SOCKET_SERVER_URL);

    // Entra na "sala" da conversa atual para receber mensagens
    socketRef.current.emit('join_conversation', conversation.conversation_id);

    // Listener: fica "ouvindo" por novas mensagens que chegam do servidor
    socketRef.current.on('receive_message', (incomingMessage) => {
      // Adiciona a mensagem recebida ao estado, atualizando a tela
      setMessages(prev => [...prev, incomingMessage]);
    });

    // Função de limpeza: desconecta e sai da sala quando o componente é fechado
    return () => {
      socketRef.current.emit('leave_conversation', conversation.conversation_id);
      socketRef.current.disconnect();
    };
  }, [conversation.conversation_id]);

  // =========================================================
  // 2. BUSCA O HISTÓRICO DE MENSAGENS DA API
  // =========================================================
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

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  // =========================================================
  // 3. ENVIA UMA NOVA MENSAGEM
  // =========================================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);

    try {
      // Passo A: Envia para a API para salvar no banco de dados
      const response = await apiClient.post(`/messages/${conversation.conversation_id}`, { content: newMessage });

      // Cria o objeto da mensagem com os dados corretos (ID do banco)
      const sentMessage = {
        id: response.data.messageId,
        sender_id: user.id,
        content: newMessage,
        created_at: new Date().toISOString(),
      };

      // Passo B: Atualiza a tela localmente
      setMessages(prev => [...prev, sentMessage]);

      // Passo C: Emite a mensagem via Socket.IO para o outro usuário em tempo real
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

  return (
    <div className="chat-window">
      {/* Cabeçalho */}
      <div className="chat-window-header">
        <button onClick={onBack} className="back-btn">&larr;</button>
        <h6>{conversation.participant_name}</h6>
        <div />
      </div>

      {/* Corpo com as mensagens */}
      <div className="chat-window-body">
        {loading ? <Spinner size="sm" /> : messages.map(msg => (
          // ✅ MELHORIA VISUAL: Container para a mensagem e a foto
          <div key={msg.id} className={`message-container ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
            {/* Mostra a foto apenas para mensagens recebidas */}
            {msg.sender_id !== user.id && (
              <img
                src={conversation.participant_photo ? `${BACKEND_BASE_URL}/uploads/${conversation.participant_photo}` : 'https://via.placeholder.com/28'}
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

      {/* Input de envio */}
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