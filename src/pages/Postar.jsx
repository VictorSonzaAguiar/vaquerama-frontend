// src/pages/Postar.jsx

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/api';

const Postar = () => {
    const [caption, setCaption] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null); // Para pré-visualização da imagem
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    
    // Configurações e Hooks
    const navigate = useNavigate();

    // =========================================================
    // Lógica de Pré-visualização da Mídia
    // =========================================================
    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file)); // Cria a URL temporária para pré-visualização
        } else {
            setMediaFile(null);
            setMediaPreview(null);
        }
    };
    
    // =========================================================
    // Submissão do Post (Lógica de FormData e API)
    // =========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!caption && !mediaFile) {
            return setError("O post deve ter uma legenda e/ou uma mídia.");
        }
        
        setLoading(true);

        // 1. Cria o objeto FormData (necessário para enviar arquivos)
        const formData = new FormData();
        formData.append('caption', caption);
        
        // O Backend espera 'media' como nome do campo (conforme multerConfig)
        if (mediaFile) {
            formData.append('media', mediaFile); 
            // O Backend espera o tipo de mídia
            formData.append('media_type', mediaFile.type.startsWith('video/') ? 'VIDEO' : 'PHOTO');
        } else {
            formData.append('media_type', 'TEXT');
        }

        try {
            // 2. Chamada POST para o Backend: /api/posts/create
            // NOTA: O Axios detecta que é FormData e define o Content-Type como multipart/form-data.
            await apiClient.post('posts/create', formData);
            
            setSuccess("Postagem criada com sucesso! Redirecionando para o Feed...");

            setTimeout(() => {
                navigate('/feed'); // Leva o usuário para o Feed para ver o post
            }, 2000);

        } catch (err) {
            setLoading(false);
            const errorMessage = err.response 
                               ? err.response.data.message || "Falha ao criar o post. Tente novamente."
                               : "Erro de conexão com o servidor. Backend offline?";
            setError(errorMessage);
        }
    };


    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="p-4 bg-card border-custom shadow-lg">
                        <Card.Body>
                            
                            <h3 className="text-white fw-bold mb-4">Criar Novo Post</h3>
                            
                            <Form onSubmit={handleSubmit}>
                                
                                {/* 1. UPLOAD DE MÍDIA E PRÉ-VISUALIZAÇÃO */}
                                <Form.Group controlId="formFile" className="mb-4">
                                    <Form.Label className="text-accent fw-bold" style={{cursor: 'pointer'}}>
                                        <i className="bi bi-camera me-2"></i> 
                                        {mediaFile ? 'Mudar Mídia' : 'Selecionar Foto/Vídeo'}
                                    </Form.Label>
                                    
                                    {/* Oculta o input padrão e usa o label customizado (melhor UX/UI) */}
                                    <Form.Control 
                                        type="file" 
                                        accept="image/*,video/*" 
                                        onChange={handleMediaChange} 
                                        style={{ display: 'none' }}
                                    />
                                </Form.Group>

                                {/* Área de Pré-visualização (UI/UX) */}
                                {mediaPreview && (
                                    <div className="media-preview-box mb-4 text-center">
                                        <Image src={mediaPreview} fluid rounded className="border-custom" />
                                    </div>
                                )}
                                
                                {/* 2. CAMPO DE LEGENDA */}
                                <Form.Group controlId="formCaption" className="mb-4">
                                    <Form.Label className="text-white">O que você está pensando?</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        placeholder="Digite sua legenda aqui..."
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className="bg-card text-white border-custom" 
                                        style={{resize: 'none'}}
                                    />
                                </Form.Group>

                                {/* Mensagens de Feedback */}
                                {error && <div className="alert alert-danger mb-3">{error}</div>}
                                {success && <div className="alert alert-success mb-3">{success}</div>}

                                {/* 3. BOTÃO DE POSTAR */}
                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="w-100 bg-accent border-0 fw-bold"
                                    disabled={loading || (!caption && !mediaFile)} // Desabilita se vazio ou carregando
                                >
                                    {loading ? 'Publicando...' : 'Postar Agora'}
                                </Button>
                                
                            </Form>
                            
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Postar;