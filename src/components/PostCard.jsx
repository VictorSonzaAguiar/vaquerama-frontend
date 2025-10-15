// src/components/PostCard.jsx - VERSÃO FINAL 8.3

import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; 

// URL base do nosso Backend (Deve ser a mesma do apiClient no api.js, mas sem o /api)
const BACKEND_BASE_URL = 'http://localhost:3000'; 

const PostCard = ({ post }) => {
    // 🛑 CHECAGEM CRÍTICA: Se o post não existir ou faltarem campos cruciais, não renderize.
    if (!post || !post.author_name) {
        console.error("PostCard: Dados de postagem incompletos ou nulos.", post);
        return <div className="text-danger p-3 bg-card mb-4">Erro ao carregar postagem: Dados faltantes.</div>;
    }
    
    // 1. CONSTRUÇÃO DA URL DA MÍDIA
    const rawMediaUrl = post.media_url;
    const mediaUrl = rawMediaUrl 
        ? `${BACKEND_BASE_URL}/uploads/${rawMediaUrl}` 
        : 'https://via.placeholder.com/600x600?text=VAQUERAMA+MEDIA';

    // 2. CONSTRUÇÃO DA URL DA FOTO DE PERFIL
    // O Backend deve retornar o nome do arquivo da foto de perfil em 'u.profile_photo_url AS author_photo' (iremos conferir isso)
    const profilePhotoUrl = post.author_photo 
        ? `${BACKEND_BASE_URL}/uploads/${post.author_photo}` 
        : null; 

    // 3. TIPO DE USUÁRIO (Corrigido para 'author_type')
    const userTypeDisplay = post.author_type 
        ? post.author_type.charAt(0) + post.author_type.slice(1).toLowerCase()
        : 'Desconhecido';

    // 4. INICIAL DO AUTOR
    const authorInitial = post.author_name ? post.author_name.charAt(0) : '🐴';

    // 5. ESTADO DE LIKE (AGORA INICIALIZADO CORRETAMENTE COM O DADO DO BACKEND)
    const [isLiked, setIsLiked] = React.useState(post.is_liked || false); 
    const [likesCount, setLikesCount] = React.useState(post.likes_count || 0);

    const handleLike = () => {
        // TODO: Aqui vamos enviar a requisição POST para o Backend para persistir o like
        // Por enquanto, apenas a lógica local de UI:
        if (isLiked) {
            setLikesCount(likesCount - 1);
        } else {
            setLikesCount(likesCount + 1);
        }
        setIsLiked(!isLiked);
    };

    return (
        <div className="post-card">
            
            {/* 1. CABEÇALHO */}
            <div className="post-header">
                <div className="d-flex align-items-center">
                    <Link to={`/profile/${post.author_id}`}>
                        {/* Renderização condicional para Foto ou Inicial */}
                        {profilePhotoUrl ? (
                            // Se tiver foto, usa a tag <img> com a classe profile-icon
                            <img src={profilePhotoUrl} alt="Perfil" className="profile-icon" />
                        ) : (
                            // Se não tiver foto, usa a div com a inicial
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
                <i 
                    className={`action-icon ${isLiked ? 'bi bi-heart-fill like-active' : 'bi bi-heart'}`} 
                    onClick={handleLike}
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
                {/* Exibição de Comentários (dependente da correção do Backend) */}
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