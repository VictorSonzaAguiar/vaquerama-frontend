// ===================================================================
// 📄 src/pages/Profile.jsx - FINAL COMPLETO E CORRIGIDO
// Inclui: seguir/deixar de seguir + posts + botão de mensagem
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import PostCardMini from '../components/PostCardMini';
import apiClient from '../api/api';
import useAuth from '../hooks/useAuth';

// URL base para a mídia
const BACKEND_BASE_URL = 'http://localhost:3000';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const { user: loggedUser } = useAuth();
  const isOwner = loggedUser && loggedUser.id === parseInt(id);

  // =========================================================
  // 1️⃣ Buscar informações do perfil
  // =========================================================
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`users/${id}`);
        const userData = response.data.user;

        if (userData.profile_photo_url) {
          userData.profile_photo_full_url = `${BACKEND_BASE_URL}/uploads/${userData.profile_photo_url}`;
        }

        userData.loading_follow = false;
        setProfile(userData);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Perfil não encontrado ou erro de conexão.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // =========================================================
  // 2️⃣ Buscar posts do usuário
  // =========================================================
  useEffect(() => {
    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await apiClient.get(`posts/user/${id}`);
        setUserPosts(response.data.posts || []);
      } catch (err) {
        console.error('Erro ao carregar posts do usuário:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [id]);

  // =========================================================
  // 3️⃣ Lógica de Seguir / Deixar de Seguir
  // =========================================================
  const handleToggleFollow = async () => {
    if (profile.loading_follow) return;

    const currentStatus = profile.is_following;
    const newStatus = !currentStatus;

    setProfile((p) => ({
      ...p,
      is_following: newStatus,
      friends_count: newStatus ? p.friends_count + 1 : p.friends_count - 1,
      loading_follow: true,
    }));

    try {
      await apiClient.post(`users/${id}/follow`);
    } catch (err) {
      console.error('Erro ao seguir/deixar de seguir:', err);
      setError('Falha na ação. Tente novamente.');
      setProfile((p) => ({
        ...p,
        is_following: currentStatus,
        friends_count: currentStatus ? p.friends_count : p.friends_count + 1,
      }));
    } finally {
      setProfile((p) => ({ ...p, loading_follow: false }));
    }
  };

  // =========================================================
  // 4️⃣ Renderizações Condicionais
  // =========================================================
  if (loading) {
    return <h2 className="text-center text-accent mt-5">Carregando Perfil...</h2>;
  }

  if (error) {
    return <h2 className="text-center text-danger mt-5">{error}</h2>;
  }

  if (!profile) return null;

  const userTypeDisplay = profile.user_type
    ? profile.user_type.charAt(0) + profile.user_type.slice(1).toLowerCase()
    : '';

  // =========================================================
  // 5️⃣ Layout Final
  // =========================================================
  return (
    <Container className="profile-container mt-4">
      {/* 1. SEÇÃO DE BIOGRAFIA (TOPO) */}
      <Row className="mb-5 p-4 bg-card border-custom rounded g-4">
        {/* MOBILE */}
        <Col xs={12} className="d-block d-md-none text-center">
          <Image
            src={profile.profile_photo_full_url || 'https://via.placeholder.com/150/000000/D4AF37?text=VA'}
            roundedCircle
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              border: '3px solid var(--accent-color)',
            }}
            className="mb-3"
          />
          <h3 className="text-white mb-2">{profile.username}</h3>

          {isOwner ? (
            <Link to="/edit" className="btn btn-outline-primary btn-sm text-white border-custom w-100 mb-3">
              Editar Perfil
            </Link>
          ) : (
            // ✅ NOVO: Container para botões no mobile
            <div className="d-flex w-100 mb-3 gap-2">
              <Button
                variant={profile.is_following ? 'secondary' : 'primary'}
                className={
                  profile.is_following
                    ? 'btn-sm bg-secondary border-0 w-100'
                    : 'btn-sm bg-accent border-0 w-100'
                }
                onClick={handleToggleFollow}
                disabled={profile.loading_follow}
              >
                {profile.loading_follow ? '...' : profile.is_following ? 'Seguindo' : 'Seguir'}
              </Button>
              {/* ✅ NOVO: Botão de mensagem no mobile */}
              <Link to={`/messages/${id}`} className="btn btn-outline-light btn-sm w-100">
                Mensagem
              </Link>
            </div>
          )}
        </Col>

        {/* DESKTOP */}
        <Col xs={12} md={9} className="d-flex flex-column justify-content-center">
          <div className="d-none d-md-flex align-items-center mb-3">
            <h2 className="text-white me-3 mb-0">{profile.username}</h2>
            {isOwner ? (
              <Link to="/edit" className="btn btn-outline-primary btn-sm text-white border-custom me-2">
                Editar Perfil
              </Link>
            ) : (
              // ✅ NOVO: Container para botões no desktop
              <div className="d-flex">
                <Button
                  variant={profile.is_following ? 'secondary' : 'primary'}
                  className={profile.is_following ? 'btn-sm bg-secondary border-0' : 'btn-sm bg-accent border-0'}
                  onClick={handleToggleFollow}
                  disabled={profile.loading_follow}
                >
                  {profile.loading_follow ? 'Processando...' : profile.is_following ? 'Seguindo' : 'Seguir'}
                </Button>
                {/* ✅ NOVO: Botão de mensagem no desktop */}
                <Link to={`/messages/${id}`} className="btn btn-outline-light btn-sm ms-2">
                  Mensagem
                </Link>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-around justify-content-md-start mb-4 text-white border-bottom border-custom pb-2 w-100">
            <div className="me-4 text-center">
              <strong>{profile.posts_count || 0}</strong> Posts
            </div>
            <div className="me-4 text-center">
              <strong>{profile.friends_count || 0}</strong> Seguidores
            </div>
            <div className="text-center">
              <strong>{profile.following_count || 0}</strong> Seguindo
            </div>
          </div>

          <h5 className="text-white mb-1">{profile.name}</h5>
          <p className="text-accent mb-0" style={{ fontSize: '0.9rem' }}>
            {userTypeDisplay}
          </p>
          <p className="text-subtle mt-2">{profile.bio || 'Biografia não definida.'}</p>

          {(profile.city || profile.state_province) && (
            <p className="text-subtle mb-3 d-none d-md-block">
              <i className="bi bi-geo-alt-fill me-1"></i>
              {profile.city || ''} {profile.city && profile.state_province ? ', ' : ''}{' '}
              {profile.state_province || ''}
            </p>
          )}
        </Col>

        <Col xs={12} md={3} className="text-center mb-3 mb-md-0 d-none d-md-block">
          <Image
            src={profile.profile_photo_full_url || 'https://via.placeholder.com/150/000000/D4AF37?text=VA'}
            roundedCircle
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'cover',
              border: '3px solid var(--accent-color)',
            }}
          />
        </Col>
      </Row>

      {/* 2. GALERIA DE POSTS */}
      <Row className="mb-4">
        <Col>
          <h4 className="text-white border-bottom border-custom pb-2">Posts de {profile.username}</h4>
        </Col>
      </Row>

      {postsLoading ? (
        <Row>
          <Col className="text-subtle text-center py-5">Carregando posts...</Col>
        </Row>
      ) : userPosts.length === 0 ? (
        <Row>
          <Col className="text-subtle text-center py-5">
            <i className="bi bi-camera" style={{ fontSize: '3rem' }}></i>
            <p className="mt-2">Ainda não há posts nesta galeria.</p>
          </Col>
        </Row>
      ) : (
        <Row xs={1} sm={2} md={3} lg={3} className="g-4">
          {userPosts.map((post) => (
            <Col key={post.id}>
              <PostCardMini post={post} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Profile;