// src/components/CommentSection.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import apiClient from '../api/api';
import moment from 'moment';

const BACKEND_BASE_URL = 'http://localhost:3000';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // =========================================================
  // 1. Lógica de Busca de Comentários
  // =========================================================
  const fetchComments = async () => {
    setLoading(true);
    try {
      // Backend: GET /api/posts/:id/comments
      const response = await apiClient.get(`posts/${postId}/comments`);
       content: newComment,
      setComments(response.data.comments || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
      setError("Falha ao carregar comentários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // =========================================================
  // 2. Lógica de Envio de Comentário
  // =========================================================
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      // Backend: POST /api/posts/:id/comment
      const response = await apiClient.post(`posts/${postId}/comment`, {
        content: newComment,
      });

      // Simulação: Adiciona o novo comentário (pode ser substituído pela resposta real da API)
      const newCommentData = {
          id: response.data.commentId,
          content: newComment,
          created_at: new Date().toISOString(),
          author_name: 'Você', // Será o nome do usuário logado na implementação final
          author_photo: null,
      };

      setComments(prev => [newCommentData, ...prev]); // Adiciona ao topo da lista
      setNewComment('');
      setError(null);

    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      setError("Falha ao enviar comentário. Login expirado?");
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <p className="text-subtle text-center">Carregando comentários...</p>;
  }
  
  // Interface de Comentários
  return (
    <div className="comment-section mt-3">
        
        {/* Formulário de Envio de Novo Comentário */}
        <Form onSubmit={handleCommentSubmit} className="mb-3">
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder="Adicionar um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-card text-white border-custom"
                    disabled={submitting}
                />
                <Button 
                    type="submit" 
                    variant="primary" 
                    className="bg-accent border-0"
                    disabled={submitting || !newComment.trim()}
                >
                    {submitting ? 'Enviando...' : 'Postar'}
                </Button>
            </InputGroup>
            {error && <small className="text-danger">{error}</small>}
        </Form>

        {/* Lista de Comentários */}
        <div className="comment-list" style={{maxHeight: '300px', overflowY: 'auto'}}>
            {comments.length === 0 ? (
                <p className="text-subtle">Seja o primeiro a comentar!</p>
            ) : (
                comments.map(comment => (
                    <div key={comment.id} className="d-flex mb-2">
                        {/* Foto de Perfil do Comentário */}
                        <div className="comment-profile-icon me-2">
                            {comment.author_photo ? (
                                <img src={`${BACKEND_BASE_URL}/uploads/${comment.author_photo}`} alt="P" />
                            ) : (
                                comment.author_name ? comment.author_name.charAt(0) : 'U'
                            )}
                        </div>
                        {/* Conteúdo do Comentário */}
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
    </div>
  );
};

export default CommentSection;