// =============================================================
// 🐎 EditProfile.jsx — Layout idêntico ao Instagram + Vaquerama
// =============================================================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/api";
import useAuth from "../hooks/useAuth";
import "../styles/EditProfile.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const BACKEND_BASE_URL = "http://localhost:3000";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    gender: "NAO_INFORMAR",
    user_type: "",
    city: "",
    state_province: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiClient.get(`users/${userId}`);
        const data = res.data.user;

        setFormData({
          name: data.name || "",
          username: data.username || "",
          bio: data.bio || "",
          gender: data.gender || "NAO_INFORMAR",
          user_type: data.user_type || "",
          city: data.city || "",
          state_province: data.state_province || "",
        });

        if (data.profile_photo_url) {
          setPreviewPhotoUrl(
            `${BACKEND_BASE_URL}/uploads/${data.profile_photo_url}`
          );
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setError("Falha ao carregar dados do perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        form.append(key, value)
      );
      if (profilePhoto) form.append("profile_photo", profilePhoto);

      await apiClient.put(`users/update`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => navigate(`/profile/${userId}`), 1500);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setError("Erro ao atualizar. Verifique os campos.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <h2 className="text-center text-accent mt-5">Carregando...</h2>;

  return (
    <div className="editprofile-wrapper">
      {/* COLUNA DE CONFIGURAÇÕES */}
      <aside className="editprofile-settings">
        <h4 className="settings-title">Configurações</h4>

        <div className="settings-section">
          <div className="meta-block">
            <h6 className="meta-title">Central de Contas</h6>
            <p className="meta-text">
              Gerencie suas experiências conectadas e configurações de contas
              nas tecnologias da Vaquerama.
            </p>
            <a className="meta-link">Ver mais na Central de Contas</a>
          </div>

          <div className="config-links">
            <button className="settings-link active">
              <i className="bi bi-pencil-square"></i> Editar perfil
            </button>
            <button className="settings-link">
              <i className="bi bi-bell"></i> Notificações
            </button>
            <button className="settings-link">
              <i className="bi bi-briefcase"></i> Conta profissional
            </button>
            <button className="settings-link">
              <i className="bi bi-shield-lock"></i> Privacidade e segurança
            </button>
            <button className="settings-link">
              <i className="bi bi-gear"></i> Central de Contas
            </button>
          </div>
        </div>
      </aside>

      {/* FORMULÁRIO PRINCIPAL */}
      <div className="editprofile-form-area">
        <div className="editprofile-scroll">
          <form onSubmit={handleSubmit} className="editprofile-form">
            <h3 className="editprofile-heading">Editar perfil</h3>

            <div className="editprofile-photo-section">
              <img
                src={
                  previewPhotoUrl ||
                  "https://via.placeholder.com/150/000000/D4AF37?text=VA"
                }
                alt="Foto de perfil"
                className="editprofile-photo"
              />
              <div>
                <h5 className="editprofile-username">{formData.username}</h5>
                <label
                  htmlFor="photoInput"
                  className="editprofile-change-photo"
                >
                  Alterar foto do perfil
                </label>
                <input
                  type="file"
                  id="photoInput"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div className="editprofile-field">
              <label>Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="editprofile-field">
              <label>Nome de Usuário</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="editprofile-field">
              <label>Biografia</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="editprofile-field">
              <label>Gênero</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="NAO_INFORMAR">Prefiro não dizer</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            <div className="editprofile-field">
              <label>Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="editprofile-field">
              <label>Estado (UF)</label>
              <input
                type="text"
                name="state_province"
                value={formData.state_province}
                onChange={handleChange}
              />
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <button
              type="submit"
              className="editprofile-save"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar Perfil"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
