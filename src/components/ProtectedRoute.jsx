// src/components/ProtectedRoute.jsx (VERSÃO CORRIGIDA)

import React from 'react';
import { Navigate } from 'react-router-dom';

// ✅ 1. CORRIGE O CAMINHO DA IMPORTAÇÃO PARA .jsx
import useAuth from '../hooks/useAuth.jsx'; 

const ProtectedRoute = ({ children }) => {
  // Puxa o estado de autenticação do nosso hook, que agora vem do Contexto
  const { isAuthenticated, loading } = useAuth(); 

  // Se o hook ainda está verificando o token, mostra uma tela de carregamento
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <h1 className="text-accent">🐎 Carregando...</h1>
      </div>
    );
  }

  // Se terminou de carregar e NÃO está autenticado, redireciona para o Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se terminou de carregar e ESTÁ autenticado, renderiza a página solicitada
  return children;
};

export default ProtectedRoute;
