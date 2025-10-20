// ===============================================================
// 📄 Login.jsx — Tela de Login da Vaquerama (versão corrigida)
// ===============================================================

import React, { useState } from "react"; // ✅ Importa React para resolver o erro
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import useAuth from "../hooks/useAuth";

const Login = () => {
  // 1️⃣ Estados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // 2️⃣ Hooks
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // 3️⃣ Função de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      console.log("✅ Login bem-sucedido!");
      navigate("/feed");
    } else {
      setError(result.error);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="p-4 bg-card border-custom shadow-lg">
            <Card.Body>
              {/* Cabeçalho */}
              <h1 className="text-center text-accent fw-bold mb-4">VAQUERAMA</h1>
              <p className="text-center text-subtle mb-4">
                Entre na sua conta para acompanhar as últimas vaquejadas.
              </p>

              {/* Formulário */}
              <Form onSubmit={handleSubmit}>
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

                {error && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {error}
                  </div>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 bg-accent border-0 fw-bold"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center mt-3 text-subtle">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-accent fw-bold">
              Cadastre-se
            </Link>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
