// src/components/EditPostModal.jsx (VERSÃO FINAL CORRIGIDA)

import React, { useState, useEffect } from 'react';
import '../Styles/EditPostModal.css';

// ✅ A LINHA QUE FALTAVA ESTÁ AQUI ✅
const BACKEND_BASE_URL = 'http://localhost:3000';

const EditPostModal = ({ post, isOpen, onClose, onSave }) => {
    const [caption, setCaption] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (post) {
            setCaption(post.caption);
        }
    }, [post]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(post.id, caption);
            onClose();
        } catch (error) {
            console.error("Falha ao salvar a edição:", error);
            alert("Não foi possível salvar as alterações. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    // O JSX que você já tinha, agora com a variável funcionando
    return (
        <div className="edit-post-overlay">
            <div className="edit-post-modal-insta">
                
                <div className="edit-left">
                    <img src={`${BACKEND_BASE_URL}/uploads/${post.media_url}`} alt="Preview do post" />
                </div>

                <div className="edit-right">
                    <div className="edit-header-insta">
                        <button className="cancel-button" onClick={onClose}>Cancelar</button>
                        <h5>Editar informações</h5>
                        <button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Concluir'}
                        </button>
                    </div>

                    <div className="edit-body-insta">
                        <div className="edit-user-info">
                            <img src={post.author_photo ? `${BACKEND_BASE_URL}/uploads/${post.author_photo}` : 'https://via.placeholder.com/28'} alt="Perfil" />
                            <span>{post.author_name}</span>
                        </div>

                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Escreva uma legenda..."
                            maxLength="2200"
                        />
                        <div className="char-counter">{caption.length} / 2200</div>
                        
                        <div className="edit-option">
                            <span>Adicionar localização</span>
                            <span>&gt;</span>
                        </div>
                        <div className="edit-option">
                            <span>Acessibilidade</span>
                            <span>&gt;</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;