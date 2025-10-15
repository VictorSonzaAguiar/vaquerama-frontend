// src/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import apiClient from '../api/api'; 
import moment from 'moment'; // Necessário para a validação de idade!

// =========================================================
// COMPONENTE DE ETAPA 1: Sua Identidade
// (Movido para fora do componente principal para estabilizar o foco)
// =========================================================
const Step1 = ({ formData, handleChange, nextStep, error }) => (
    <>
      <h5 className="text-center text-accent fw-bold mb-4">1 de 3: Sua Identidade</h5>
      
      {/* Nome Completo / Parque */}
      <Form.Group className="mb-3" controlId="formName">
        <Form.Label className="text-white">Nome Completo / Parque</Form.Label>
        <Form.Control type="text" placeholder="Nome ou Parque" name="name" value={formData.name} onChange={handleChange} className="bg-card text-white border-custom" required />
      </Form.Group>
      
      {/* Nome de Usuário */}
      <Form.Group className="mb-3" controlId="formUsername">
        <Form.Label className="text-white">Nome de Usuário</Form.Label>
        <Form.Control type="text" placeholder="@seuusuario" name="username" value={formData.username} onChange={handleChange} className="bg-card text-white border-custom" required />
      </Form.Group>
      
      {/* Data de Nascimento */}
      <Form.Group className="mb-4" controlId="formDateOfBirth">
        <Form.Label className="text-white">Data de Nascimento</Form.Label>
        <Form.Control type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="bg-card text-white border-custom" required />
      </Form.Group>
      
      {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}
      
      <Button variant="primary" onClick={nextStep} className="w-100 bg-accent border-0 fw-bold">
        Próximo (2/3)
      </Button>
    </>
);

// =========================================================
// COMPONENTE DE ETAPA 2: Segurança (Email e Senha)
// =========================================================
const Step2 = ({ formData, handleChange, nextStep, prevStep, error }) => (
    <>
      <h5 className="text-center text-accent fw-bold mb-4">2 de 3: Segurança</h5>
      
      {/* Email */}
      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label className="text-white">Endereço de Email</Form.Label>
        <Form.Control type="email" placeholder="seu.email@vaquejada.com" name="email" value={formData.email} onChange={handleChange} className="bg-card text-white border-custom" required />
      </Form.Group>

      {/* Senha */}
      <Form.Group className="mb-4" controlId="formPassword">
        <Form.Label className="text-white">Senha (Mínimo 6 caracteres)</Form.Label>
        <Form.Control type="password" placeholder="Sua senha secreta" name="password" value={formData.password} onChange={handleChange} className="bg-card text-white border-custom" required minLength="6" />
      </Form.Group>
      
      {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}
      
      <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={prevStep} className="bg-secondary border-0">
            Voltar
          </Button>
          <Button variant="primary" onClick={nextStep} className="bg-accent border-0 fw-bold">
            Próximo (3/3)
          </Button>
      </div>
    </>
);

// =========================================================
// COMPONENTE DE ETAPA 3: Seu Papel (Tipo de Usuário)
// =========================================================
const Step3 = ({ formData, handleChange, handleSubmit, prevStep, loading, error, success }) => (
    <Form onSubmit={handleSubmit}>
      <h5 className="text-center text-accent fw-bold mb-4">3 de 3: Seu Papel</h5>
      
      <Form.Group className="mb-4" controlId="formUserType">
        <Form.Label className="text-white">Selecione seu tipo de perfil</Form.Label>
        <Form.Select 
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
          className="bg-card text-white border-custom"
          style={{backgroundColor: 'var(--card-bg)', color: 'var(--text-color)'}}
        >
          <option value="FAN">Fã de Vaquejada</option>
          <option value="COMPETIDOR">Vaqueiro Competidor</option>
          <option value="PARQUE">Parque de Vaquejada</option>
        </Form.Select>
      </Form.Group>
      
      {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}
      {success && <div className="alert alert-success mb-3" role="alert">{success}</div>}

      <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={prevStep} className="bg-secondary border-0">
            Voltar
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            className="bg-accent border-0 fw-bold"
            disabled={loading}
          >
            {loading ? 'Finalizando...' : 'Criar Conta'}
          </Button>
      </div>
    </Form>
);


// =========================================================
// COMPONENTE PRINCIPAL REGISTER
// =========================================================
const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    username: '', 
    date_of_birth: '', 
    email: '',
    password: '',
    user_type: 'FAN', 
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    // ESSENCIAL: Atualiza o estado sem causar re-renderização desnecessária nos filhos
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // =========================================================
  // VALIDAÇÕES DE NEGÓCIO (Limitar idade a 14 anos)
  // =========================================================
  const isOver14 = () => {
    if (!formData.date_of_birth) return false;
    
    // Calcula a idade
    const today = moment();
    const birthDate = moment(formData.date_of_birth);
    return today.diff(birthDate, 'years') >= 14; 
  };
  
  // =========================================================
  // CONTROLE DE ETAPAS
  // =========================================================
  const nextStep = () => {
    setError(null);
    
    // Validação da Etapa 1
    if (step === 1) {
        if (!formData.name || !formData.username || !formData.date_of_birth) {
            setError("Todos os campos de identificação são obrigatórios.");
            return;
        }
        if (!isOver14()) {
            setError("Desculpe, a idade mínima para criar uma conta é 14 anos.");
            return;
        }
    }
    // Validação da Etapa 2 (Email e Senha mínima)
    if (step === 2) {
        if (!formData.email || formData.password.length < 6) {
            setError("Email e senha válida (mínimo 6 caracteres) são obrigatórios.");
            return;
        }
    }
    
    setStep(step + 1);
  };
  
  const prevStep = () => {
      setError(null); 
      setStep(step - 1);
  }


  // =========================================================
  // SUBMISSÃO FINAL (Etapa 3)
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    setLoading(true);

    try {
      // O endpoint /auth/register precisa agora aceitar username e date_of_birth
      const response = await apiClient.post('auth/register', formData);
      
      setSuccess("Cadastro realizado com sucesso! Redirecionando para o login...");
      
      setTimeout(() => {
        navigate('/login'); 
      }, 2000);

    } catch (err) {
      setLoading(false);
      const errorMessage = err.response 
                           ? err.response.data.message || "Erro de registro. Email ou Usuário já cadastrado."
                           : "Erro de conexão com o servidor. Verifique se o Backend está online.";
                           
      setError(errorMessage);
    }
  };


  // Renderização da etapa correta
  const renderStep = () => {
    switch (step) {
        case 1: 
            return <Step1 
                formData={formData} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                error={error} 
            />;
        case 2: 
            return <Step2 
                formData={formData} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                prevStep={prevStep} 
                error={error} 
            />;
        case 3: 
            return <Step3 
                formData={formData} 
                handleChange={handleChange} 
                handleSubmit={handleSubmit} 
                prevStep={prevStep} 
                loading={loading} 
                error={error} 
                success={success}
            />;
        default: return <Step1 
                formData={formData} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                error={error}
            />;
    }
  };


  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          
          <Card className="p-4 bg-card border-custom shadow-lg">
            <Card.Body>
                
              <h3 className="text-center text-accent fw-bold mb-2">Cadastro Vaqueiro</h3>
              <p className="text-center text-subtle mb-4">Etapa {step} de 3</p>

              {renderStep()}
              
            </Card.Body>
          </Card>
          
          <p className="text-center mt-3 text-subtle">
            Já tem uma conta? <Link to="/login" className="text-accent fw-bold">Fazer Login</Link>
          </p>
          
        </Col>
      </Row>
    </Container>
  );
};

export default Register;