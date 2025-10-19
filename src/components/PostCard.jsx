// src/components/PostCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import apiClient from '../api/api';
import CommentSection from './CommentSection';
import PostOptionsMenu from './PostOptionsMenu';

const BACKEND_BASE_URL = 'http://localhost:3000';

const PostCard = ({ post, onDelete, onEdit }) => {
    if (!post || !post.author_name) {
        console.error("PostCard: Dados incompletos.", post);
        return <div className="text-danger p-3 bg-card mb-4">Erro ao carregar post.</div>;
    }

    const mediaUrl = post.media_url ? `${BACKEND_BASE_URL}/uploads/${post.media_url}` : '';
    const profilePhotoUrl = post.author_photo ? `${BACKEND_BASE_URL}/uploads/${post.author_photo}` : null;
    const authorInitial = post.author_name.charAt(0).toUpperCase();
    const [isLiked, setIsLiked] = useState(post.is_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        const currentLiked = isLiked;
        const currentLikes = likesCount;
        setIsLiked(!currentLiked);
        setLikesCount(currentLiked ? currentLikes - 1 : currentLikes + 1);
        try {
            await apiClient.post(`posts/${post.id}/like`);
        } catch (err) {
            console.error("Erro ao curtir:", err);
            setIsLiked(currentLiked);
            setLikesCount(currentLikes);
        }
    };

    return (
        <div className="post-card">
            {/* Cabeçalho */}
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
                        <Link to={`/profile/${post.author_id}`} className="author-name">
                            {post.author_name}
                        </Link>
                        <div className="author-type">{post.author_type}</div>
                    </div>
                </div>
                <PostOptionsMenu post={post} onDelete={onDelete} onEdit={onEdit} />
            </div>

            {/* Imagem */}
            <div className="post-media">
                <img src={mediaUrl} alt={`Post de ${post.author_name}`} />
            </div>

            {/* Ações */}
            <div className="post-actions">
                <i
                    className={`action-icon bi ${isLiked ? 'bi-heart-fill like-active' : 'bi-heart'}`}
                    onClick={handleLike}
                ></i>
                <i className="bi bi-chat action-icon" onClick={() => setShowComments(!showComments)}></i>
                <i className="bi bi-send action-icon"></i>
                <i className="bi bi-bookmark action-icon ms-auto"></i>
            </div>

            {/* Curtidas */}
            <div className="post-likes">{likesCount} curtidas</div>

            {/* Legenda */}
            <div className="post-caption">
                <Link to={`/profile/${post.author_id}`} className="author-name">{post.author_name}</Link>
                {' '}{post.caption}
            </div>

            {/* Metadados */}
            <div className="post-metadata">
                {post.comments_count > 0 && (
                    <p className="view-comments" onClick={() => setShowComments(!showComments)}>
                        Ver todos os {post.comments_count} comentários
                    </p>
                )}
                <p className="post-date">POSTADO EM {new Date(post.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            {/* Comentários */}
            {showComments && (
                <div className="p-3">
                    <CommentSection postId={post.id} />
                </div>
            )}
        </div>
    );
};

export default PostCard;
