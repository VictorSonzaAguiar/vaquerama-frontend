// src/pages/Feed.jsx (VERSÃO FINAL COM LÓGICA DE EXCLUSÃO E EDIÇÃO)

import React, { useState, useEffect } from 'react';
import apiClient from '../api/api';
import PostCard from '../components/PostCard'; 

// ✅ 1. IMPORTAMOS O NOSSO NOVO MODAL DE EDIÇÃO
import EditPostModal from '../components/EditPostModal';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 2. NOVOS ESTADOS PARA CONTROLAR O MODAL DE EDIÇÃO
    // Controla se o modal está visível ou não
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // Guarda os dados do post que está sendo editado no momento
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await apiClient.get('posts/'); 
                setPosts(response.data.posts || response.data); 
            } catch (err) {
                console.error("Erro ao buscar o feed:", err);
                setError("Falha ao carregar o feed. Verifique se o Backend está ativo.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // --- LÓGICA DE AÇÕES ---

    // Função para deletar um post (já existente)
    const handleDeletePost = async (postId) => {
        try {
            await apiClient.delete(`posts/${postId}`);
            setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
        } catch (err) {
            console.error("Erro ao deletar o post:", err);
            alert(err.response?.data?.message || 'Não foi possível deletar o post.');
        }
    };

    // ✅ 3. NOVAS FUNÇÕES PARA GERENCIAR A EDIÇÃO
    // Função para ABRIR o modal
    const handleOpenEditModal = (post) => {
        setEditingPost(post); // Guarda o post que será editado
        setIsEditModalOpen(true); // Abre o modal
    };

    // Função para FECHAR o modal
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingPost(null); // Limpa o post guardado
    };

    // Função para SALVAR as alterações do post
    const handleSavePost = async (postId, newCaption) => {
        try {
            // Chama o endpoint PUT que criamos no back-end
            await apiClient.put(`posts/${postId}`, { caption: newCaption });

            // Atualiza a lista de posts na tela IMEDIATAMENTE
            setPosts(currentPosts =>
                currentPosts.map(post => {
                    if (post.id === postId) {
                        // Se for o post que editamos, retorna o post com a nova legenda
                        return { ...post, caption: newCaption };
                    }
                    // Se não for, retorna o post como estava
                    return post;
                })
            );
        } catch (err) {
            console.error("Erro ao salvar o post:", err);
            alert(err.response?.data?.message || 'Não foi possível salvar as alterações.');
            // Lança o erro para que o modal saiba que a operação falhou
            throw err; 
        }
    };

    // --- RENDERIZAÇÃO ---

    if (loading) {
        return <h2 className="text-center text-accent empty-feed-message">🐎 Carregando o Feed...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-danger empty-feed-message">{error}</h2>;
    }
    
    if (posts.length === 0) {
        return <h2 className="text-center text-subtle empty-feed-message">Ainda não há posts no Vaquerama. Seja o primeiro a postar!</h2>;
    }

    return (
        <div className="feed-container">
            {posts.map(post => (
                // ✅ 4. PASSAMOS A FUNÇÃO DE ABRIR O MODAL COMO PROP 'onEdit'
                <PostCard 
                    key={post.id} 
                    post={post} 
                    onDelete={handleDeletePost}
                    onEdit={handleOpenEditModal} // <-- A nova prop sendo passada
                />
            ))}

            {/* ✅ 5. RENDERIZAMOS O MODAL AQUI */}
            {/* Ele fica invisível até que 'isEditModalOpen' seja true */}
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