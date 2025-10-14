// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  // Puxa o estado de autenticação do nosso hook
  const { isAuthenticated, loading } = useAuth(); 

  // Se o hook ainda está verificando, pode-se mostrar um loader (melhoria futura)
  if (loading) {
    return (
      <div className="text-center mt-5">
        <h1 className="text-accent">🐎 Carregando...</h1>
        <p className="text-subtle">Verificando autenticação...</p>
      </div>
    );
  }

  // Lógica principal:
  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a tela de Login
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza o componente filho (o Feed, por exemplo)
  return children;
};

export default ProtectedRoute;