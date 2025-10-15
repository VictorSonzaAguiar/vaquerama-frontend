// src/components/PostCard.jsx - VERSÃO FINAL COM LIKE REAL (ETAPA 13.0)

import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; 

import apiClient from '../api/api'; // Importa o cliente Axios

// URL base do nosso Backend (Para construir o caminho das imagens)
const BACKEND_BASE_URL = 'http://localhost:3000'; 

const PostCard = ({ post }) => {
    // 🛑 CHECAGEM CRÍTICA
    if (!post || !post.author_name) {
        console.error("PostCard: Dados de postagem incompletos ou nulos.", post);
        return <div className="text-danger p-3 bg-card mb-4">Erro ao carregar postagem: Dados faltantes.</div>;
    }
    
    // 1. CONSTRUÇÃO DE DADOS E URLS
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

    // 2. ESTADO DE LIKE (Inicializado com dados do Backend)
    const [isLiked, setIsLiked] = React.useState(post.is_liked || false); 
    const [likesCount, setLikesCount] = React.useState(post.likes_count || 0);

    
    // =========================================================
    // Lógica de Curtir/Descurtir (COM CHAMADA À API)
    // =========================================================
    const handleLike = async () => {
        const currentIsLiked = isLiked;
        const currentLikes = likesCount;

        // 1. Otimismo na UI: Atualiza imediatamente
        setIsLiked(!currentIsLiked);
        setLikesCount(currentIsLiked ? currentLikes - 1 : currentLikes + 1);

        try {
            // 2. Chamada POST protegida: /api/posts/:id/like
            // O interceptor do Axios se encarrega de anexar o Token JWT
            await apiClient.post(`posts/${post.id}/like`);
            
        } catch (err) {
            console.error("Erro ao curtir/descurtir:", err);
            
            // 3. Reverte a UI em caso de falha (se o Backend falhar)
            alert("Falha ao registrar curtida. Verifique sua conexão.");
            setIsLiked(currentIsLiked);
            setLikesCount(currentLikes);
        }
    };

    return (
        <div className="post-card">
            
            {/* 1. CABEÇALHO */}
            <div className="post-header">
                <div className="d-flex align-items-center">
                    <Link to={`/profile/${post.author_id}`}>
                        {/* Renderização condicional para Foto ou Inicial */}
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
            
            {/* 2. MÍDIA (FOTO) */}
            <div className="post-media">
                <img src={mediaUrl} alt={`Post de ${post.author_name}`} />
            </div>

            {/* 3. AÇÕES */}
            <div className="post-actions">
                {/* Botão LIKE - CHAMA O HANDLER CORRIGIDO */}
                <i 
                    className={`action-icon ${isLiked ? 'bi bi-heart-fill like-active' : 'bi bi-heart'}`} 
                    onClick={handleLike} // <--- CHAMA A FUNÇÃO AGORA INTEGRADA
                ></i>
                <i className="bi bi-chat action-icon"></i>
                <i className="bi bi-send action-icon"></i>
                <i className="bi bi-bookmark action-icon ms-auto"></i> 
            </div>

            {/* 4. METADATA */}
            <div className="post-likes">
                {likesCount} curtidas
            </div>
            
            <div className="post-caption">
                <Link to={`/profile/${post.author_id}`} className="author-name text-white">
                    {post.author_name}
                </Link>
                {post.caption}
            </div>

            <div className="post-metadata">
                {post.comments_count > 0 && 
                    <p className="m-0">Ver todos os {post.comments_count} comentários</p>
                }
                <p className="m-0">
                    POSTADO EM {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </p>
            </div>
        </div>
    );
};

export default PostCard;