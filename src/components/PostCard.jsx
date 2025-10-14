// src/components/PostCard.jsx

import React from 'react';

// O componente PostCard (Placeholder)
const PostCard = ({ post }) => {
    // Por enquanto, apenas mostra o ID para confirmar que foi carregado
    return (
        <div className="card bg-card border-custom p-3 mb-4">
            <h5 className="text-white">Post ID: {post.id}</h5>
            <p className="text-subtle">Placeholder do Cartão de Postagem. Dados do autor: {post.author_name}</p>
        </div>
    );
};

export default PostCard;