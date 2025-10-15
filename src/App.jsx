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
import Logout from './pages/Logout'; 

// Páginas temporárias para as rotas não implementadas (Explore, Messages, etc.)
const TempPage = ({ title }) => <h2 className="text-center text-white mt-5">{title} em construção...</h2>;


// 1. Componente que decide se o layout (Sidebar + Container) deve ser aplicado
const LayoutWrapper = ({ children }) => {
    const location = useLocation();
    
    // Rotas onde o Layout DEVE ser oculto
    const noLayoutPaths = ['/login', '/register', '/logout'];
    const showLayout = !noLayoutPaths.some(path => location.pathname.startsWith(path));

    // Se a rota não for de login/registro/logout, aplicamos o AppLayout
    if (showLayout) {
        return <AppLayout>{children}</AppLayout>;
    }

    // Caso contrário, apenas renderizamos o conteúdo (Login, Register, Logout)
    return children;
};


function App() {
  return (
    // O LayoutWrapper encapsula TUDO, decidindo se o AppLayout é aplicado
    <LayoutWrapper>
        <Routes>
          
          {/* ========================================= */}
          {/* 2. Rotas Públicas (Renderizadas DENTRO do LayoutWrapper, mas sem o AppLayout) */}
          {/* ========================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          
          
          {/* ========================================= */}
          {/* 3. Rotas Protegidas (Aplicamos o ProtectedRoute e renderizamos o conteúdo) */}
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
