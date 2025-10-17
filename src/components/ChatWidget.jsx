// src/components/ChatWidget.jsx (VERSÃO CORRIGIDA)

import React, { useState, useEffect } from 'react';
import apiClient from '../api/api';
import ConversationList from './ConversationList';
// ✅ 1. IMPORTAMOS O NOVO COMPONENTE DE JANELA DE CHAT
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ✅ 2. NOVO ESTADO PARA CONTROLAR A CONVERSA ATIVA DENTRO DO WIDGET
    const [activeConversation, setActiveConversation] = useState(null);

    // Busca as conversas quando o widget é aberto
    useEffect(() => {
        if (isOpen && conversations.length === 0) {
            setLoading(true);
            apiClient.get('/conversations')
                .then(response => {
                    setConversations(response.data.conversations || []);
                })
                .catch(err => {
                    console.error("Erro ao buscar conversas para o widget:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, conversations.length]);

    // ✅ 3. A FUNÇÃO AGORA DEFINE A CONVERSA ATIVA EM VEZ DE NAVEGAR
    const handleSelectConversation = (convo) => {
        setActiveConversation(convo);
    };

    // Função para fechar o widget ou voltar para a lista de conversas
    const handleClose = () => {
        setIsOpen(false);
        setActiveConversation(null); // Reseta a conversa ativa ao fechar
    };
    
    return (
        <div className="chat-widget">
            {isOpen ? (
                // --- Janela Aberta ---
                <div className="chat-widget-window">
                    {/* ✅ 4. RENDERIZAÇÃO CONDICIONAL */}
                    {activeConversation ? (
                        // Se há uma conversa ativa, mostra a janela de chat
                        <ChatWindow 
                            conversation={activeConversation} 
                            onBack={() => setActiveConversation(null)} // Botão de voltar
                        />
                    ) : (
                        // Se não, mostra o cabeçalho e a lista de conversas
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
                </button>
            )}
        </div>
    );
};

export default ChatWidget;