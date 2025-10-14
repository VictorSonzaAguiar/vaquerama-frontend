// src/pages/Feed.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/api';
import PostCard from '../components/PostCard'; // O PostCard (placeholder) já foi criado

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // CORREÇÃO APLICADA: Chama 'posts/' para formar a URL completa:
                // http://localhost:3000/api/posts/
                const response = await apiClient.get('posts/'); 
                
                // Os dados do Backend devem estar em response.data.posts ou response.data
                // O Backend deve retornar os posts diretamente no corpo (response.data)
                setPosts(response.data.posts || response.data); 
                
                setLoading(false);
            } catch (err) {
                // O erro 404 será capturado aqui
                console.error("Erro ao buscar o feed:", err);
                setError("Falha ao carregar o feed. Verifique se o Backend está ativo.");
                setLoading(false);
            }
        };

        fetchPosts();
    }, []); // Roda apenas uma vez ao montar

    if (loading) {
        return <h2 className="text-center text-accent empty-feed-message">🐎 Carregando o Feed...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-danger empty-feed-message">{error}</h2>;
    }
    
    // Se não houver posts (array vazio)
    if (posts.length === 0) {
        return <h2 className="text-center text-subtle empty-feed-message">Ainda não há posts no Vaquerama. Seja o primeiro a postar!</h2>;
    }

    return (
        <div className="feed-container">
            {posts.map(post => (
                // Aqui renderizamos o PostCard real
                <PostCard key={post.id} post={post} />
                // No momento, o placeholder PostCard.jsx será usado
            ))}
        </div>
    );
};

export default Feed;