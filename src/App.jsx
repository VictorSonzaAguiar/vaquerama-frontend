// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importação das páginas (Ainda vamos criá-las)
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Importação do Layout (Ainda vamos criar)
import AppLayout from './components/AppLayout';


function App() {
  return (
    // O Router envolve toda a aplicação
    <Router>
      {/* O AppLayout será o nosso container principal com Sidebar, Navbar, etc. */}
      <AppLayout>
        {/* As Routes definem o mapeamento das URLs para os componentes */}
        <Routes>
          
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Protegidas (Definiremos a proteção nos hooks mais tarde) */}
          <Route path="/" element={<Feed />} /> {/* Rota principal é o Feed */}
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/postar" element={<div>Criar Post Componente...</div>} />
          
          {/* Rota 404 (Não encontrada) */}
          <Route path="*" element={<div>Página Não Encontrada (404)</div>} />

        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;