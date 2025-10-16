// src/components/PostCard.jsx - CORRIGIDO (ABRIR DETALHE AO CLICAR EM COMENTÁRIOS)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Adiciona useNavigate
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import apiClient from '../api/api'; 
import CommentSection from './CommentSection';

const BACKEND_BASE_URL = 'http://localhost:3000';

const PostCard = ({ post }) => {
  const navigate = useNavigate(); // ✅ Para redirecionar ao detalhe
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  if (!post || !post.author_name) {
    console.error("PostCard: Dados de postagem incompletos ou nulos.", post);
    return <div className="text-danger p-3 bg-card mb-4">Erro ao carregar postagem: Dados faltantes.</div>;
  }

  // === URLs ===
  const rawMediaUrl = post.media_url;
  const mediaUrl = rawMediaUrl 
    ? `${BACKEND_BASE_URL}/uploads/${rawMediaUrl}` 
    : 'https://via.placeholder.com/600x600?text=VAQUERAMA+MEDIA';

  const profilePhotoUrl = post.author_photo 
    ? `${BACKEND_BASE_URL}/uploads/${post.author_photo}` 
    : null;

  const userTypeDisplay = post.author_type 
    ? post.author_type.charAt(0) + post.author_type.slice(1).toLowerCase()
    : 'Desconhecido';

  const authorInitial = post.author_name ? post.author_name.charAt(0) : '🐴';

  // === Curtir/Descurtir ===
  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevLikes = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevLikes - 1 : prevLikes + 1);

    try {
      await apiClient.post(`posts/${post.id}/like`);
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err);
      alert("Falha ao registrar curtida. Verifique sua conexão.");
      setIsLiked(prevLiked);
      setLikesCount(prevLikes);
    }
  };

  // === Ir para Detalhe do Post ===
  const goToPostDetail = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post-card">
      {/* 1. CABEÇALHO */}
      <div className="post-header">
        <div className="d-flex align-items-center">
          <Link to={`/profile/${post.author_id}`}>
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Perfil" className="profile-icon" />
            ) : (
              <div className="profile-icon">{authorInitial}</div>
            )}
          </Link>
          <div>
            <Link to={`/profile/${post.author_id}`} className="author-name text-white">
              {post.author_name}
            </Link>
            <div className="author-type">{userTypeDisplay}</div>
          </div>
        </div>
        <i className="bi bi-three-dots post-options"></i>
      </div>

      {/* 2. MÍDIA */}
      <div className="post-media" onClick={goToPostDetail} style={{ cursor: 'pointer' }}>
        <img src={mediaUrl} alt={`Post de ${post.author_name}`} />
      </div>

      {/* 3. AÇÕES */}
      <div className="post-actions">
        <i 
          className={`action-icon ${isLiked ? 'bi bi-heart-fill like-active' : 'bi bi-heart'}`} 
          onClick={handleLike}
        ></i>
        {/* CLICA E VAI PARA POST DETAIL */}
        <i 
          className="bi bi-chat action-icon" 
          onClick={goToPostDetail}
        ></i>
        <i className="bi bi-send action-icon"></i>
        <i className="bi bi-bookmark action-icon ms-auto"></i>
      </div>

      {/* 4. METADATA */}
      <div className="post-likes">{likesCount} curtidas</div>

      <div className="post-caption">
        <Link to={`/profile/${post.author_id}`} className="author-name text-white">
          {post.author_name}
        </Link>
        {post.caption}
      </div>

      <div className="post-metadata">
        {/* CLICA E VAI PARA O DETALHE */}
        {post.comments_count > 0 && (
          <p 
            className="m-0 text-subtle" 
            style={{ cursor: 'pointer' }}
            onClick={goToPostDetail}
          >
            Ver todos os {post.comments_count} comentários
          </p>
        )}
        <p className="m-0">
          {new Date(post.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
