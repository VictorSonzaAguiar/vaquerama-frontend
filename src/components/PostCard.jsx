// src/components/PostCard.jsx (VERSÃO CORRIGIDA E COMPLETA)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; 

import apiClient from '../api/api'; 
import CommentSection from './CommentSection';
import PostOptionsMenu from './PostOptionsMenu'; 

const BACKEND_BASE_URL = 'http://localhost:3000'; 

// 1. O componente agora também aceita a prop 'onEdit'
const PostCard = ({ post, onDelete, onEdit }) => {
    if (!post || !post.author_name) {
        console.error("PostCard: Dados de postagem incompletos ou nulos.", post);
        return <div className="text-danger p-3 bg-card mb-4">Erro ao carregar postagem: Dados faltantes.</div>;
    }
    
    const mediaUrl = post.media_url ? `${BACKEND_BASE_URL}/uploads/${post.media_url}` : '';
    const profilePhotoUrl = post.author_photo ? `${BACKEND_BASE_URL}/uploads/${post.author_photo}` : null;
    const userTypeDisplay = post.author_type ? post.author_type.charAt(0) + post.author_type.slice(1).toLowerCase() : 'Desconhecido';
    const authorInitial = post.author_name ? post.author_name.charAt(0).toUpperCase() : '🐴';

    const [isLiked, setIsLiked] = useState(post.is_liked || false); 
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        const currentIsLiked = isLiked;
        const currentLikes = likesCount;
        setIsLiked(!currentIsLiked);
        setLikesCount(currentIsLiked ? currentLikes - 1 : currentLikes + 1);
        try {
            await apiClient.post(`posts/${post.id}/like`);
        } catch (err) {
            console.error("Erro ao curtir/descurtir:", err);
            alert("Falha ao registrar curtida. Verifique sua conexão.");
            setIsLiked(currentIsLiked);
            setLikesCount(currentLikes);
        }
    };

    return (
        <div className="post-card">
            
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

                {/* 2. Passamos a nova prop 'onEdit' para o menu de opções */}
                <PostOptionsMenu 
                    post={post} 
                    onDelete={onDelete} 
                    onEdit={onEdit} 
                />
            </div>
            
            <div className="post-media">
                <img src={mediaUrl} alt={`Post de ${post.author_name}`} />
            </div>

            <div className="post-actions">
                <i className={`action-icon ${isLiked ? 'bi bi-heart-fill like-active' : 'bi bi-heart'}`} onClick={handleLike}></i>
                <i className="bi bi-chat action-icon" onClick={() => setShowComments(!showComments)}></i>
                <i className="bi bi-send action-icon"></i>
                <i className="bi bi-bookmark action-icon ms-auto"></i> 
            </div>

            <div className="post-likes">
                {likesCount} curtidas
            </div>
            
            <div className="post-caption">
                <Link to={`/profile/${post.author_id}`} className="author-name text-white">
                    {post.author_name}
                </Link>
                {' '}{post.caption}
            </div>

            <div className="post-metadata">
                {post.comments_count > 0 && 
                    <p className="m-0" style={{cursor: 'pointer'}} onClick={() => setShowComments(!showComments)}>
                        Ver todos os {post.comments_count} comentários
                    </p>
                }
                <p className="m-0">
                    POSTADO EM {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </p>
            </div>
            
            {showComments && (
                <div className="p-3">
                    <CommentSection postId={post.id} />
                </div>
            )}
        </div>
    );
};

export default PostCard;