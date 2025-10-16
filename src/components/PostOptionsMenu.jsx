// src/components/PostOptionsMenu.jsx (VERSÃO CORRIGIDA E COMPLETA)

import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import '../Styles/PostOptionsMenu.css';

// 1. O componente agora aceita a nova prop 'onEdit'
const PostOptionsMenu = ({ post, onDelete, onEdit }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const isOwner = user.id === post.author_id;

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir este post? A ação não pode ser desfeita.')) {
            onDelete(post.id);
        }
        handleClose();
    };

    // 2. Nova função para lidar com o clique em "Editar"
    const handleEdit = () => {
        // Chama a função onEdit que foi passada pelo componente pai (PostCard)
        // Passamos o objeto 'post' inteiro, pois o modal de edição precisará de seus dados.
        onEdit(post);
        // Fecha o menu de opções após clicar
        handleClose();
    };

    return (
        <>
            <i className="bi bi-three-dots post-options" onClick={handleOpen}></i>

            {isOpen && (
                <div className="options-menu-overlay">
                    <div className="options-menu-backdrop" onClick={handleClose}></div>
                    <div className="options-menu-content">
                        {isOwner ? (
                            // Opções para o DONO do post
                            <>
                                <button className="options-menu-item text-danger" onClick={handleDelete}>Excluir</button>
                                {/* 3. O botão "Editar" agora chama a função handleEdit */}
                                <button className="options-menu-item" onClick={handleEdit}>Editar</button>
                            </>
                        ) : (
                            // Opções para OUTROS usuários
                            <>
                                <button className="options-menu-item text-danger">Denunciar (em breve)</button>
                                <button className="options-menu-item">Deixar de seguir (em breve)</button>
                            </>
                        )}
                        <button className="options-menu-item">Ir para o post</button>
                        <button className="options-menu-item">Copiar link</button>
                        <button className="options-menu-item" onClick={handleClose}>Cancelar</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostOptionsMenu;