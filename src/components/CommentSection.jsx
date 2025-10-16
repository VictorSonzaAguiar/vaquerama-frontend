// src/components/CommentSection.jsx (VERSÃO CORRIGIDA E SIMPLIFICADA)

import React from 'react';
import moment from 'moment'; // Biblioteca para formatar datas ("há 5 minutos")
import 'moment/locale/pt-br'; // Importa a localização para português

// Configura o moment para usar português
moment.locale('pt-br');

const BACKEND_BASE_URL = 'http://localhost:3000';

/**
 * Este componente agora é "burro". Ele não busca nem envia dados.
 * Ele apenas recebe uma lista de comentários (`comments`) e um estado
 * de carregamento (`loading`) e os exibe na tela.
 */
const CommentSection = ({ comments, loading }) => {

  // Se os comentários ainda estão sendo carregados, exibe uma mensagem.
  if (loading) {
    return <p className="text-subtle text-center">Carregando comentários...</p>;
  }

  // Renderiza a lista de comentários
  return (
    <div className="comment-list">
      {/* Se a lista de comentários estiver vazia, exibe uma mensagem */}
      {comments.length === 0 ? (
        <p className="text-subtle">Seja o primeiro a comentar!</p>
      ) : (
        // Se houver comentários, mapeia cada um para um elemento visual
        comments.map((comment) => (
          <div key={comment.id} className="d-flex mb-3">
            
            {/* Ícone/Foto de Perfil do autor do comentário */}
            <div className="comment-profile-icon me-2">
              {comment.author_photo ? (
                <img
                  src={`${BACKEND_BASE_URL}/uploads/${comment.author_photo}`}
                  alt={comment.author_name}
                />
              ) : (
                // Se não houver foto, exibe a primeira letra do nome
                comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U'
              )}
            </div>

            {/* Conteúdo do comentário */}
            <div>
              <strong className="text-white me-1">{comment.author_name}:</strong>
              <span className="text-white">{comment.content}</span>
              <small className="text-subtle d-block">
                {moment(comment.created_at).fromNow()}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;