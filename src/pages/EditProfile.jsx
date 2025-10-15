// src/pages/EditProfile.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/api';
import useAuth from '../hooks/useAuth';

// URL base para a mídia e busca de perfil
const BACKEND_BASE_URL = 'http://localhost:3000';

const EditProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Redireciona se não houver ID (embora ProtectedRoute já faça isso)
  const userId = user?.id;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    gender: '', // Nova coluna de gênero
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
  // 1. Buscar Dados Atuais do Perfil (GET /users/:id)
  // =========================================================
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchCurrentProfile = async () => {
      try {
        const response = await apiClient.get(`users/${userId}`);
        const data = response.data.user;

        // Popula o formulário com os dados atuais
        setFormData({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          gender: data.gender || '',
          user_type: data.user_type || '',
          city: data.city || '',
          state_province: data.state_province || '',
        });

        // Define a URL da foto atual para pré-visualização
        if (data.profile_photo_url) {
          setPreviewPhotoUrl(`${BACKEND_BASE_URL}/uploads/${data.profile_photo_url}`);
        }

      } catch (err) {
        console.error('Erro ao buscar perfil para edição:', err);
        setError('Falha ao carregar seus dados atuais.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProfile();
  }, [userId]);


  // =========================================================
  // 2. Handlers
  // =========================================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      // Cria URL temporária para pré-visualização
      setPreviewPhotoUrl(URL.createObjectURL(file)); 
    }
  };


  // =========================================================
  // 3. Submissão do Formulário (PUT /users/update)
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      // Cria FormData para enviar texto e a foto (se houver)
      const dataToSend = new FormData();

      // Anexa todos os campos de texto
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
      });

      // Anexa o novo arquivo de foto, se selecionado
      if (profilePhoto) {
        dataToSend.append('profile_photo', profilePhoto); // O backend espera 'profile_photo'
      }

      // Faz a requisição PUT (ou POST, dependendo da configuração do backend)
      // Assumindo que o backend aceita PUT ou POST em /users/update
      await apiClient.put(`users/update`, dataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data', // Sobrescreve para incluir o arquivo
        },
      });

      setSuccess('Perfil atualizado com sucesso!');
      
      // Redireciona o usuário de volta para o seu perfil após a atualização
      setTimeout(() => navigate(`/profile/${userId}`), 1500);

    } catch (err) {
      setSubmitting(false);
      const errorMessage = err.response 
                           ? err.response.data.message || 'Falha ao atualizar o perfil. Nome de usuário já em uso?'
                           : 'Erro de conexão ou servidor. Tente novamente.';
      setError(errorMessage);
    }
  };

  // =========================================================
  // Renderizações
  // =========================================================
  if (loading) {
    return <h2 className="text-center text-accent mt-5">Carregando dados para edição...</h2>;
  }
  
  if (!userId) {
    return <h2 className="text-center text-danger mt-5">Erro de Autenticação. Faça login novamente.</h2>;
  }

  return (
    <Container className="mt-4 mb-5" style={{ maxWidth: '700px' }}>
      <Row>
        <Col>
          <h2 className="text-white mb-4">Editar Perfil</h2>

          <Card className="bg-card border-custom shadow-lg p-4">
            <Form onSubmit={handleSubmit}>

              {/* Seção de Foto de Perfil */}
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
                <Form.Group controlId="formProfilePhoto">
                  <Form.Label 
                    htmlFor="photoInput"
                    className="btn btn-link text-accent fw-bold p-0"
                    style={{ cursor: 'pointer' }}
                  >
                    Alterar Foto do Perfil
                  </Form.Label>
                  <Form.Control 
                    type="file" 
                    id="photoInput"
                    name="profile_photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </Form.Group>
              </div>


              {/* 1. Nome e Nome de Usuário */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formName">
                    <Form.Label className="text-white">Nome (ou Parque)</Form.Label>
                    <Form.Control type="text" placeholder="Nome" name="name" value={formData.name} onChange={handleChange} className="bg-secondary text-white border-0" required />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formUsername">
                    <Form.Label className="text-white">Nome de Usuário</Form.Label>
                    <Form.Control type="text" placeholder="@usuario" name="username" value={formData.username} onChange={handleChange} className="bg-secondary text-white border-0" required />
                  </Form.Group>
                </Col>
              </Row>

              {/* 2. Bio */}
              <Form.Group className="mb-3" controlId="formBio">
                <Form.Label className="text-white">Biografia</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Conte sobre sua paixão por vaquejada..." name="bio" value={formData.bio} onChange={handleChange} className="bg-secondary text-white border-0" />
              </Form.Group>

              {/* 3. Tipo de Usuário e Gênero (Novas Colunas) */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formUserType">
                    <Form.Label className="text-white">Tipo de Perfil</Form.Label>
                    <Form.Select 
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleChange}
                      className="bg-secondary text-white border-0"
                      disabled // Normalmente, o tipo de usuário não é alterado após o cadastro
                    >
                      <option value="FAN">Fã de Vaquejada</option>
                      <option value="COMPETIDOR">Vaqueiro Competidor</option>
                      <option value="PARQUE">Parque de Vaquejada</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formGender">
                    <Form.Label className="text-white">Gênero</Form.Label>
                    <Form.Select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="bg-secondary text-white border-0"
                    >
                      <option value="">Prefiro não dizer</option>
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Feminino</option>
                      <option value="OTHER">Outro</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* 4. Localização */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formCity">
                    <Form.Label className="text-white">Cidade</Form.Label>
                    <Form.Control type="text" placeholder="Ex: Fortaleza" name="city" value={formData.city} onChange={handleChange} className="bg-secondary text-white border-0" />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formState">
                    <Form.Label className="text-white">Estado (UF)</Form.Label>
                    <Form.Control type="text" placeholder="Ex: CE" name="state_province" value={formData.state_province} onChange={handleChange} className="bg-secondary text-white border-0" />
                  </Form.Group>
                </Col>
              </Row>

              {/* Mensagens de Status */}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {success && <div className="alert alert-success mt-3">{success}</div>}

              {/* Botão de Submissão */}
              <Button
                type="submit"
                className="w-100 bg-accent border-0 fw-bold py-2 mt-4"
                disabled={submitting}
              >
                {submitting ? 'Salvando Alterações...' : 'Salvar Perfil'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;
