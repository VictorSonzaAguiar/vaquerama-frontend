// src/pages/Profile.jsx - FINAL COM LÓGICA DE SEGUIR

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import apiClient from '../api/api';
import useAuth from '../hooks/useAuth';

// URL base para a mídia (como fizemos no PostCard)
const BACKEND_BASE_URL = 'http://localhost:3000';

const Profile = () => {
    const { id } = useParams(); // Obtém o ID do perfil da URL (ex: /profile/1)
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pega o user logado e o token para ações protegidas
    const { user: loggedUser, token } = useAuth(); 
    // Garante que o ID é um número para a comparação
    const isOwner = loggedUser && loggedUser.id === parseInt(id);


    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);

            try {
                // Chamada ao Backend: /api/users/:id
                const response = await apiClient.get(`users/${id}`); 
                const userData = response.data.user;

                // Constrói a URL da foto de perfil
                if (userData.profile_photo_url) {
                    userData.profile_photo_full_url = `${BACKEND_BASE_URL}/uploads/${userData.profile_photo_url}`;
                }
                
                // Inicializa o estado de carregamento do botão de seguir
                userData.loading_follow = false; 

                setProfile(userData);
            } catch (err) {
                console.error("Erro ao carregar perfil:", err);
                setError("Perfil não encontrado ou erro de conexão.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]); // Recarrega sempre que o ID na URL mudar

    
    // =========================================================
    // Lógica de Seguir/Deixar de Seguir (Etapa 12.0)
    // =========================================================
    const handleToggleFollow = async () => {
        if (!token || profile.loading_follow) return;
        
        // 1. Otimismo na UI: Atualiza imediatamente (melhor UX)
        const currentStatus = profile.is_following;
        const newStatus = !currentStatus;
        
        setProfile(p => ({ 
            ...p, 
            is_following: newStatus,
            friends_count: newStatus ? p.friends_count + 1 : p.friends_count - 1,
            loading_follow: true,
        }));
        
        try {
            // 2. Chamada POST protegida: /api/users/:id/follow
            await apiClient.post(`users/${id}/follow`);
            
        } catch (err) {
            console.error("Erro ao seguir/deixar de seguir:", err);
            setError("Falha na ação. Tente novamente.");
            
            // 3. Reverte a UI em caso de falha
            setProfile(p => ({ 
                ...p, 
                is_following: currentStatus,
                friends_count: currentStatus ? p.friends_count : p.friends_count + 1,
            }));
        } finally {
            setProfile(p => ({ ...p, loading_follow: false }));
        }
    };


    if (loading) {
        return <h2 className="text-center text-accent mt-5">Carregando Perfil...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-danger mt-5">{error}</h2>;
    }
    
    if (!profile) return null;


    // Conversão de tipo de usuário (usa author_type que é o nome correto)
    const userTypeDisplay = profile.user_type.charAt(0) + profile.user_type.slice(1).toLowerCase();

    return (
        <Container className="profile-container mt-4">
        
        {/* 1. SEÇÃO DE BIOGRAFIA (TOPO) - Layout Adaptativo */}
        {/* Usamos g-4 para espaçamento horizontal e ajustamos classes internas */}
        <Row className="mb-5 p-4 bg-card border-custom rounded g-4"> 
            
            {/* --- LAYOUT MOBILE (xs) - Foto e Nome Centralizados --- */}
            <Col xs={12} className="d-block d-md-none text-center">
                
                {/* Foto Centralizada */}
                <Image 
                    src={profile.profile_photo_full_url || 'https://via.placeholder.com/150/000000/D4AF37?text=VA'} 
                    roundedCircle 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid var(--accent-color)' }}
                    className="mb-3"
                />
                
                {/* Nome de Usuário (Grande) */}
                <h3 className="text-white mb-2">{profile.username}</h3>
                
                {/* Botão de Ação Mobile */}
                {isOwner ? (
                    <Button variant="outline-primary" className="btn-sm text-white border-custom w-100 mb-3">
                        Editar Perfil
                    </Button>
                ) : (
                    <Button 
                        variant={profile.is_following ? 'secondary' : 'primary'} 
                        className={profile.is_following ? 'btn-sm bg-secondary border-0 w-100 mb-3' : 'btn-sm bg-accent border-0 w-100 mb-3'}
                        onClick={handleToggleFollow} // <--- AÇÃO DE SEGUIR/DEIXAR DE SEGUIR
                        disabled={profile.loading_follow}
                    >
                        {profile.loading_follow ? 'Processando...' : profile.is_following ? 'Seguindo' : 'Seguir'}
                    </Button>
                )}
            </Col>

            {/* --- COLUNA DE CONTEÚDO (APARECE EM MOBILE E DESKTOP) --- */}
            <Col xs={12} md={9} className="d-flex flex-column justify-content-center">
            
            {/* LAYOUT DESKTOP: Foto e Nome na mesma linha (Mobile: Escondido) */}
            <div className="d-none d-md-flex align-items-center mb-3">
                <h2 className="text-white me-3 mb-0">{profile.username}</h2>
                
                {isOwner ? (
                    <Button variant="outline-primary" className="btn-sm text-white border-custom me-2">
                        Editar Perfil
                    </Button>
                ) : (
                    <Button 
                        variant={profile.is_following ? 'secondary' : 'primary'} 
                        className={profile.is_following ? 'btn-sm bg-secondary border-0' : 'btn-sm bg-accent border-0'}
                        onClick={handleToggleFollow} // <--- AÇÃO DE SEGUIR/DEIXAR DE SEGUIR
                        disabled={profile.loading_follow}
                    >
                        {profile.loading_follow ? 'Processando...' : profile.is_following ? 'Seguindo' : 'Seguir'}
                    </Button>
                )}
            </div>
            
            {/* TERCEIRO BLOCO: CONTADORES (Posts, Seguidores, Seguindo) */}
            <div className="d-flex justify-content-around justify-content-md-start mb-4 text-white border-bottom border-custom pb-2 w-100"> 
                <div className="me-4 me-md-4 text-center"><strong>{profile.posts_count || 0}</strong> Posts</div>
                <div className="me-4 me-md-4 text-center"><strong>{profile.friends_count || 0}</strong> Seguidores</div>
                <div className="text-center"><strong>{profile.following_count || 0}</strong> Seguindo</div>
            </div>

            {/* QUARTO BLOCO: BIO E TIPO DE USUÁRIO (Aparece tanto em Mobile quanto em Desktop) */}
            <h5 className="text-white mb-1">{profile.name}</h5>
            <p className="text-accent mb-0" style={{fontSize: '0.9rem'}}>{userTypeDisplay}</p>
            
            <p className="text-subtle mt-2">{profile.bio || 'Biografia não definida.'}</p>

            {/* LOCALIZAÇÃO (Apenas em Desktop) - Corrigido o "BR" */}
            {(profile.city || profile.state_province) && (
                <p className="text-subtle mb-3 d-none d-md-block">
                <i className="bi bi-geo-alt-fill me-1"></i> 
                {profile.city || ''} {profile.city && profile.state_province ? ', ' : ''} {profile.state_province || ''}
                </p>
            )}
            
            </Col>

            {/* --- COLUNA ESPECÍFICA DE FOTO PARA DESKTOP --- */}
            <Col xs={12} md={3} className="text-center mb-3 mb-md-0 d-none d-md-block">
                <Image 
                    src={profile.profile_photo_full_url || 'https://via.placeholder.com/150/000000/D4AF37?text=VA'} 
                    roundedCircle 
                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid var(--accent-color)' }}
                />
            </Col>

        </Row>

        {/* 2. LINHA DE POSTS (GALERIA) */}
        <Row className="mb-4">
            <Col>
                <h4 className="text-white border-bottom border-custom pb-2">Posts de {profile.username}</h4>
            </Col>
        </Row>
        
        <Row>
            <Col className="text-subtle text-center py-5">
                <i className="bi bi-camera" style={{fontSize: '3rem'}}></i>
                <p className="mt-2">Ainda não há posts nesta galeria.</p>
            </Col>
        </Row>

        </Container>
    );
};

export default Profile;

