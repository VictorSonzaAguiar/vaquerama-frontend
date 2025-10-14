// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';


// Componente para decidir se o Layout deve ser mostrado
const LayoutWrapper = ({ children }) => {
    const location = useLocation();
    
    // Rotas onde o Sidebar/Layout deve ser oculto
    const noLayoutPaths = ['/login', '/register'];
    const showLayout = !noLayoutPaths.includes(location.pathname);

    if (showLayout) {
        return <AppLayout>{children}</AppLayout>;
    }

    // Para as rotas de Login e Register, apenas renderiza o conteúdo
    return children;
};


function App() {
  return (
    <Router>
        {/* Envolve as rotas com o componente que decide o layout */}
        <LayoutWrapper>
            <Routes>
              
              {/* Rotas Públicas (sem layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rotas Protegidas (com layout) */}
              <Route path="/" element={<Feed />} /> {/* Rota principal é o Feed */}
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/postar" element={<div>Criar Post Componente...</div>} />
              
              {/* Rota 404 (Não encontrada) */}
              <Route path="*" element={<div>Página Não Encontrada (404)</div>} />

            </Routes>
        </LayoutWrapper>
    </Router>
  );
}

export default App;