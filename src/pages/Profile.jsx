// ===============================================================
// 📄 Profile.jsx — "Competidor | Editar Perfil" abaixo do nome
// ===============================================================
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import apiClient from "../api/api";
import useAuth from "../hooks/useAuth";
import PostCardMini from "../components/PostCardMini";
import "../styles/profile.css";

const BACKEND_BASE_URL = "http://localhost:3000";

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user: loggedUser } = useAuth();
  const isOwner = loggedUser && loggedUser.id === parseInt(id);

  // ============================================================
  // 🔹 Buscar informações do perfil
  // ============================================================
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`users/${id}`);
        const userData = response.data.user;

        if (userData.profile_photo_url) {
          userData.profile_photo_full_url = `${BACKEND_BASE_URL}/uploads/${userData.profile_photo_url}`;
        }

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
  }, [id]);

  // ============================================================
  // 🔹 Buscar posts do usuário
  // ============================================================
  useEffect(() => {
    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await apiClient.get(`posts/user/${id}`);
        setUserPosts(response.data.posts || []);
      } catch (err) {
        console.error("Erro ao carregar posts do usuário:", err);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchUserPosts();
  }, [id]);

  // ============================================================
  // 🔹 Seguir / Deixar de seguir
  // ============================================================
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
      console.error("Erro ao seguir/deixar de seguir:", err);
      setProfile((p) => ({
        ...p,
        is_following: currentStatus,
        friends_count: currentStatus ? p.friends_count : p.friends_count + 1,
      }));
    } finally {
      setProfile((p) => ({ ...p, loading_follow: false }));
    }
  };

  // ============================================================
  // 🔹 Estados de carregamento / erro
  // ============================================================
  if (loading)
    return <h2 className="text-center text-accent mt-5">Carregando Perfil...</h2>;
  if (error)
    return <h2 className="text-center text-danger mt-5">{error}</h2>;
  if (!profile) return null;

  // ============================================================
  // 🧠 Layout redesenhado e limpo
  // ============================================================
  return (
    <div className="profile-container">
      {/* HEADER */}
      <header className="profile-header">
        <div className="profile-avatar-wrapper">
          <img
            src={
              profile.profile_photo_full_url ||
              "https://via.placeholder.com/150/000000/D4AF37?text=USER"
            }
            alt="Foto de perfil"
            className="profile-avatar"
          />
        </div>

        <h2 className="profile-name">{profile.username}</h2>

        {/* 🔹 Cargo + Botões abaixo do nome */}
        {isOwner ? (
          <div className="profile-header-actions owner-layout">
            <span className="profile-role">
              {profile.user_type || "Competidor"}
            </span>
            <Link to="/edit" className="btn-edit-inline">
              Editar Perfil
            </Link>
          </div>
        ) : (
          <div className="profile-header-actions other-layout">
            <span className="profile-role">
              {profile.user_type || "Competidor"}
            </span>
            <div className="profile-action-buttons">
              <Link to={`/messages/${id}`} className="btn-message-inline">
                <i className="bi bi-chat-dots"></i> Mensagem
              </Link>
              <Button
                className={`btn-follow-inline ${
                  profile.is_following ? "following" : ""
                }`}
                onClick={handleToggleFollow}
                disabled={profile.loading_follow}
              >
                {profile.loading_follow
                  ? "..."
                  : profile.is_following
                  ? "Seguindo"
                  : "Seguir +1"}
              </Button>
            </div>
          </div>
        )}

        <p className="profile-stats">
  <span>{profile.friends_count || 0} Seguidores</span> ·{" "}
  <span>{profile.following_count || 0} Seguindo</span>
</p>


        {/* 🔹 Biografia */}
        <div className="profile-bio">
          <p className="profile-desc">
            {profile.bio || "Biografia não definida."}
          </p>
          {(profile.city || profile.state_province) && (
            <p className="profile-location">
              <i className="bi bi-geo-alt-fill"></i>{" "}
              {profile.city}
              {profile.city && profile.state_province ? ", " : ""}
              {profile.state_province}
            </p>
          )}
        </div>
      </header>

      {/* POSTS GRID */}
      <section className="profile-posts">
        <h3>Publicações</h3>
        {postsLoading ? (
          <p className="loading-text">Carregando posts...</p>
        ) : userPosts.length === 0 ? (
          <p className="no-posts">
            <i className="bi bi-camera"></i> Nenhum post encontrado.
          </p>
        ) : (
          <div className="profile-posts-grid">
            {userPosts.map((post) => (
              <PostCardMini key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
