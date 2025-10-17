// src/components/ConversationList.jsx (VERSÃO FINAL E CORRIGIDA)

import React from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const BACKEND_BASE_URL = 'http://localhost:3000';

const ConversationList = ({ conversations, onSelectConversation, selectedConversation }) => {
    return (
        <div className="conversation-list-items">
            {conversations.map(convo => {
                const isActive = selectedConversation?.conversation_id === convo.conversation_id;
                // A condição principal é que o backend envie convo.unread_count > 0
                const hasUnreadMessages = convo.unread_count > 0;

                return (
                    <div
                        key={convo.conversation_id}
                        // Mantemos apenas a classe 'active'
                        className={`conversation-item ${isActive ? 'active' : ''}`}
                        onClick={() => onSelectConversation(convo)}
                    >
                        {/* 1. Imagem de Perfil */}
                        <div className="profile-icon-wrapper">
                            <img
                                src={convo.participant_photo
                                    ? `${BACKEND_BASE_URL}/uploads/${convo.participant_photo}`
                                    : 'https://via.placeholder.com/56/262626/A8A8A8?text=VA'}
                                alt={convo.participant_name}
                                className="profile-icon"
                            />
                        </div>

                        {/* 2. Detalhes (Nome e Última Mensagem) */}
                        <div className="conversation-details">
                            {/* O nome fica em negrito se houver novas mensagens */}
                            <span className={`participant-name ${hasUnreadMessages ? 'fw-bold' : ''}`}>
                                {convo.participant_name}
                            </span>
                            {/* A última mensagem fica em negrito se for não lida (classe 'text-white' é do Bootstrap/global.css) */}
                            <p className={`last-message ${hasUnreadMessages ? 'fw-bold text-white' : ''}`}>
                                {convo.last_message || 'Nenhuma mensagem ainda.'}
                            </p>
                        </div>

                        {/* 3. Coluna de Status (Timestamp e Bolinha) */}
                        <div className="d-flex flex-column align-items-end timestamp-col">
                            <span className="timestamp">
                                {convo.last_message_timestamp ? moment(convo.last_message_timestamp).fromNow(true) : ''}
                            </span>
                            
                            {/* RENDERIZA APENAS A BOLINHA SE TIVER MENSAGEM NÃO LIDA */}
                            {hasUnreadMessages && (
                                <div className="unread-dot mt-1"></div>
                            )}
                            
                            {/* ADICIONA ESPAÇADOR VAZIO SE NÃO TIVER BOLINHA, PARA MANTER O LAYOUT GRID PERFEITO */}
                            {!hasUnreadMessages && (
                                <div style={{ height: '14px' }}></div> 
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;