// src/components/PostCardMini.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const BACKEND_BASE_URL = 'http://localhost:3000';

const PostCardMini = ({ post }) => {
    // Constrói a URL da mídia
    const mediaUrl = post.image_url 
        ? `${BACKEND_BASE_URL}/uploads/${post.image_url}` 
        : 'https://via.placeholder.com/300x300?text=NO+MEDIA';

    return (
        <Link to={`/post/${post.id}`} className="post-mini-card">
            <div className="post-mini-image-wrapper">
                <img src={mediaUrl} alt={post.caption} className="post-mini-image" />
                
                {/* Ícones de Interação (Overlays - UI/UX) */}
                <div className="post-mini-overlay d-flex justify-content-center align-items-center">
                    <span className="me-3">
                        <i className="bi bi-heart-fill me-1"></i> {post.likes_count || 0}
                    </span>
                    <span>
                        <i className="bi bi-chat-fill me-1"></i> {post.comments_count || 0}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default PostCardMini;