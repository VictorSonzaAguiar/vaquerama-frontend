// src/pages/Feed.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/api';
import PostCard from '../components/PostCard';
import EditPostModal from '../components/EditPostModal';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await apiClient.get('posts/');
                setPosts(response.data.posts || response.data);
            } catch (err) {
                console.error("Erro ao buscar o feed:", err);
                setError("Falha ao carregar o feed. Verifique se o backend está ativo.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleDeletePost = async (postId) => {
        try {
            await apiClient.delete(`posts/${postId}`);
            setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
        } catch (err) {
            console.error("Erro ao deletar o post:", err);
            alert(err.response?.data?.message || 'Não foi possível deletar o post.');
        }
    };

    const handleOpenEditModal = (post) => {
        setEditingPost(post);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingPost(null);
    };

    const handleSavePost = async (postId, newCaption) => {
        try {
            await apiClient.put(`posts/${postId}`, { caption: newCaption });
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post.id === postId ? { ...post, caption: newCaption } : post
                )
            );
        } catch (err) {
            console.error("Erro ao salvar o post:", err);
            alert(err.response?.data?.message || 'Não foi possível salvar as alterações.');
            throw err;
        }
    };

    if (loading) return <h2 className="text-center text-accent empty-feed-message">🐎 Carregando o Feed...</h2>;
    if (error) return <h2 className="text-center text-danger empty-feed-message">{error}</h2>;
    if (posts.length === 0) return <h2 className="text-center text-subtle empty-feed-message">Ainda não há posts no Vaquerama. Seja o primeiro a postar!</h2>;

    return (
        <div className="feed-container">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                    onEdit={handleOpenEditModal}
                />
            ))}

            <EditPostModal
                isOpen={isEditModalOpen}
                post={editingPost}
                onClose={handleCloseEditModal}
                onSave={handleSavePost}
            />
        </div>
    );
};

export default Feed;
