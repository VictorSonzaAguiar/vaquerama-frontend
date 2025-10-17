import React from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configura o moment para usar a localização em português
moment.locale('pt-br');

const BACKEND_BASE_URL = 'http://localhost:3000';

const ConversationList = ({ conversations, onSelectConversation, selectedConversation }) => {
  return (
    <div className="conversation-list-items">
      {conversations.map(convo => {
        // Verifica se a conversa atual é a que está selecionada
        const isActive = selectedConversation?.conversation_id === convo.conversation_id;

        return (
          // Adiciona a classe 'active' se a conversa estiver selecionada
          <div
            key={convo.conversation_id}
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectConversation(convo)}
          >
            {/* 1. Imagem de Perfil */}
            <img
              src={convo.participant_photo ? `${BACKEND_BASE_URL}/uploads/${convo.participant_photo}` : 'https://via.placeholder.com/50'}
              alt={convo.participant_name}
              className="profile-icon"
            />
            
            {/* 2. Detalhes (Nome e Última Mensagem) */}
            <div className="conversation-details">
              <span className="participant-name">{convo.participant_name}</span>
              <p className="last-message">{convo.last_message || 'Nenhuma mensagem ainda.'}</p>
            </div>
            
            {/* 3. Timestamp (Data/Hora) */}
            <span className="timestamp">
              {convo.last_message_timestamp ? moment(convo.last_message_timestamp).fromNow(true) : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;