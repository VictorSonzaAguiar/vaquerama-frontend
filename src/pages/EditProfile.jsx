// src/pages/EditProfile.jsx (VERSÃO FINAL CORRIGIDA)

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/api';
import useAuth from '../hooks/useAuth';

const BACKEND_BASE_URL = 'http://localhost:3000';

const EditProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    gender: 'NAO_INFORMAR',
    user_type: '',
    city: '',
    state_province: '',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // =========================================================
  // 1️⃣ Buscar dados do usuário
  // =========================================================
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
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          gender: data.gender || 'NAO_INFORMAR',
          user_type: data.user_type || '',
          city: data.city || '',
          state_province: data.state_province || '',
        });

        if (data.profile_photo_url) {
          setPreviewPhotoUrl(`${BACKEND_BASE_URL}/uploads/${data.profile_photo_url}`);
        }
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        setError('Falha ao carregar dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // =========================================================
  // 2️⃣ Handlers
  // =========================================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
    }
  };

  // =========================================================
  // 3️⃣ Submissão do formulário
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));
      if (profilePhoto) form.append('profile_photo', profilePhoto);

      await apiClient.put(`users/update`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => navigate(`/profile/${userId}`), 1500);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar. Verifique os campos.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // Render
  // =========================================================
  if (loading) return <h2 className="text-center text-accent mt-5">Carregando...</h2>;
  if (!userId) return <h2 className="text-center text-danger mt-5">Erro de autenticação.</h2>;

  return (
    <Container className="mt-4 mb-5" style={{ maxWidth: '700px' }}>
      <Row>
        <Col>
          <h2 className="text-white mb-4">Editar Perfil</h2>

          <Card className="bg-card border-custom shadow-lg p-4">
            <Form onSubmit={handleSubmit}>
              
              {/* FOTO DE PERFIL */}
              <div className="text-center mb-4">
                <Image
                  src={previewPhotoUrl || 'https://via.placeholder.com/150/000000/D4AF37?text=VA'}
                  roundedCircle
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    border: '3px solid var(--accent-color)',
                  }}
                  className="mb-3"
                />

                <Form.Group controlId="profilePhoto">
                  <Form.Label
                    className="btn btn-link text-accent fw-bold p-0"
                    style={{ cursor: 'pointer' }}
                    onClick={() => document.getElementById('photoInput').click()}
                  >
                    Alterar Foto do Perfil
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="profile_photo"
                    id="photoInput"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </Form.Group>
              </div>

              {/* NOME E USUÁRIO */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="name">
                    <Form.Label className="text-white">Nome (ou Parque)</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nome"
                      className="bg-secondary text-white border-0"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="username">
                    <Form.Label className="text-white">Nome de Usuário</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="@usuario"
                      className="bg-secondary text-white border-0"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* BIO */}
              <Form.Group controlId="bio" className="mb-3">
                <Form.Label className="text-white">Biografia</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Conte sobre sua paixão por vaquejada..."
                  className="bg-secondary text-white border-0"
                />
              </Form.Group>

              {/* TIPO DE PERFIL / GÊNERO */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="user_type">
                    <Form.Label className="text-white">Tipo de Perfil</Form.Label>
                    <Form.Select
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleChange}
                      className="bg-secondary text-white border-0"
                      disabled
                    >
                      <option value="FAN">Fã de Vaquejada</option>
                      <option value="COMPETIDOR">Vaqueiro Competidor</option>
                      <option value="PARQUE">Parque de Vaquejada</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group controlId="gender">
                    <Form.Label className="text-white">Gênero</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="bg-secondary text-white border-0"
                    >
                      <option value="NAO_INFORMAR">Prefiro não dizer</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMININO">Feminino</option>
                      <option value="OUTRO">Outro</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* LOCALIZAÇÃO */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="city">
                    <Form.Label className="text-white">Cidade</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ex: Fortaleza"
                      className="bg-secondary text-white border-0"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group controlId="state_province">
                    <Form.Label className="text-white">Estado (UF)</Form.Label>
                    <Form.Control
                      type="text"
                      name="state_province"
                      value={formData.state_province}
                      onChange={handleChange}
                      placeholder="Ex: CE"
                      className="bg-secondary text-white border-0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* STATUS */}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {success && <div className="alert alert-success mt-3">{success}</div>}

              {/* BOTÃO */}
              <Button
                type="submit"
                className="w-100 bg-accent border-0 fw-bold py-2 mt-4"
                disabled={submitting}
              >
                {submitting ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;
