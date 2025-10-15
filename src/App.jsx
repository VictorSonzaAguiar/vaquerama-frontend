// src/App.jsx

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; 
import ProtectedRoute from './components/ProtectedRoute'; 

import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';
import Postar from './pages/Postar';
import Logout from './pages/Logout'; // Arquivo Logout existe!


// Componente temporário para as páginas em construção
const TempPage = ({ title }) => <h2 className="text-center text-white mt-5">{title} em construção...</h2>;


// 1. Componente que decide se o Layout deve ser mostrado
const LayoutWrapper = ({ children }) => {
    const location = useLocation();
    
    // Rotas onde o Sidebar/Layout deve ser oculto
    const noLayoutPaths = ['/login', '/register', '/logout'];
    const shouldHideLayout = noLayoutPaths.some(path => location.pathname.startsWith(path));

    // Se a rota for de login/registro/logout, apenas renderiza o conteúdo
    if (shouldHideLayout) {
        return children;
    }

    // Para todas as outras rotas, renderiza o conteúdo DENTRO do AppLayout
    return <AppLayout>{children}</AppLayout>;
};


function App() {
  return (
    // O LayoutWrapper agora envolve TUDO, decidindo o layout
    <LayoutWrapper>
        <Routes>
          
          {/* ========================================= */}
          {/* 1. Rotas Públicas (Renderizadas no LayoutWrapper) */}
          {/* ========================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          
          
          {/* ========================================= */}
          {/* 2. Rotas Protegidas */}
          {/* Usamos o ProtectedRoute em torno de CADA ROTA que exige login */}
          {/* A aplicação do AppLayout é feita UMA VEZ pelo LayoutWrapper */}
          {/* ========================================= */}
          
          {/* Rota Raiz (Redireciona para o Feed) */}
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} /> 
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          
          {/* Páginas Principais */}
          <Route path="/postar" element={<ProtectedRoute><Postar /></ProtectedRoute>} /> 
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Páginas Temporárias */}
          <Route path="/explore" element={<ProtectedRoute><TempPage title="Explorar" /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><TempPage title="Mensagens" /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><TempPage title="Notificações" /></ProtectedRoute>} />

          {/* Rota 404 (Não encontrada) */}
          <Route path="*" element={<div>Página Não Encontrada (404)</div>} />

        </Routes>
    </LayoutWrapper>
  );
}

export default App;
