// src/components/ChatWidget.jsx (VERSÃO FINAL E CORRIGIDA)

import React, { useState, useEffect } from 'react';
import apiClient from '../api/api';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { useNotifications } from '../context/NotificationContext'; // Importação para o badge global

const ChatWidget = () => {
    // Pega a contagem global de não lidas e a função de limpeza
    const { unreadCount, clearNotifications } = useNotifications(); 
    
    const [isOpen, setIsOpen] = useState(false); // Estado para abrir/fechar o widget
    const [conversations, setConversations] = useState([]); // Lista de conversas
    const [loading, setLoading] = useState(true); // Estado de carregamento
    const [activeConversation, setActiveConversation] = useState(null); // Conversa selecionada

    // =========================================================
    // 1. BUSCA CONVERSAS AO ABRIR O WIDGET
    // =========================================================
    useEffect(() => {
        // Busca apenas se o widget for aberto E a lista estiver vazia
        if (isOpen && conversations.length === 0) { 
            setLoading(true); // Inicia o carregamento
            apiClient.get('/conversations')
                .then(response => {
                    setConversations(response.data.conversations || []); // Define as conversas
                })
                .catch(err => {
                    console.error("Erro ao buscar conversas para o widget:", err); // Loga o erro
                })
                .finally(() => {
                    setLoading(false); // Finaliza o carregamento
                });
        }
    }, [isOpen, conversations.length]); // Dependências

    // =========================================================
    // 2. HANDLERS
    // =========================================================
    const handleSelectConversation = (convo) => {
        setActiveConversation(convo); // Define a conversa ativa
        // ✅ AÇÃO: Limpa a contagem GERAL ao abrir uma conversa no widget
        clearNotifications(); // Limpa as notificações globais
    };

    const handleClose = () => {
        setIsOpen(false); // Fecha o widget
        setActiveConversation(null); // Limpa a conversa ativa
    };

    return (
        <div className="chat-widget">
            {isOpen ? (
                // --- Janela Aberta ---
                <div className="chat-widget-window">
                    {activeConversation ? (
                        <ChatWindow 
                            conversation={activeConversation} 
                            onBack={() => setActiveConversation(null)} 
                        />
                    ) : (
                        <>
                            <div className="chat-widget-header">
                                <h5>Mensagens</h5>
                                <button className="close-btn" onClick={handleClose}>&times;</button>
                            </div>
                            {loading ? (
                                <p className="text-center text-subtle p-3">Carregando...</p>
                            ) : (
                                <ConversationList 
                                    conversations={conversations}
                                    onSelectConversation={handleSelectConversation}
                                    // Passamos null para selectedConversation, pois o widget não a exibe
                                />
                            )}
                        </>
                    )}
                </div>
            ) : (
                // --- Botão Fechado ---
                <button className="chat-widget-button" onClick={() => setIsOpen(true)}>
                    <i className="bi bi-send"></i>
                    <span>Mensagens</span>
                    {/* ✅ NOVO: RENDERIZA O BADGE DE NOTIFICAÇÃO GLOBAL */}
                    {unreadCount > 0 && <span className="notification-badge ms-2">{unreadCount}</span>}
                </button>
            )}
        </div>
    );
};

export default ChatWidget;