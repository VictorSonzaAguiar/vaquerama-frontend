// src/pages/Login.jsx

import { useState } from 'react'; // Importa apenas o que será usado
import { Link, useNavigate } from 'react-router-dom'; // Importa Link e useNavigate
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

import useAuth from '../hooks/useAuth'; // O hook de autenticação real

const Login = () => {
  // 1. Estados para armazenar os dados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Para mensagens de erro

  // 2. Hooks para autenticação e navegação
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // 3. Função de submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Chama a função de login real do hook
    const result = await login(email, password); 

    if (result.success) {
      console.log("Login Real: Sucesso!");
      // Redireciona o usuário para o Feed após o login
      navigate('/feed'); 
    } else {
      // Exibe a mensagem de erro retornada pelo hook
      setError(result.error); 
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        {/* Colunas para centralizar o formulário em diferentes tamanhos de tela */}
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          
          <Card className="p-4 bg-card border-custom shadow-lg">
            <Card.Body>
                
              {/* Título do Projeto e Chamada (UI/UX) */}
              <h1 className="text-center text-accent fw-bold mb-4">VAQUERAMA</h1>
              <p className="text-center text-subtle mb-4">Entre na sua conta para acompanhar as últimas vaquejadas.</p>

              {/* Formulário */}
              <Form onSubmit={handleSubmit}>
                
                {/* Campo de E-mail */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="text-white">Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-card text-white border-custom" 
                    required
                  />
                </Form.Group>

                {/* Campo de Senha */}
                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="text-white">Senha</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-card text-white border-custom" 
                    required
                  />
                </Form.Group>
                
                {/* Mensagem de Erro (se houver) */}
                {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}

                {/* Botão de Submissão */}
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 bg-accent border-0 fw-bold"
                  disabled={loading} 
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                
              </Form>
              
            </Card.Body>
          </Card>
          
          {/* Link para Cadastro */}
          <p className="text-center mt-3 text-subtle">
            Não tem uma conta? <Link to="/register" className="text-accent fw-bold">Cadastre-se</Link>
          </p>
          
        </Col>
      </Row>
    </Container>
  );
};

export default Login;