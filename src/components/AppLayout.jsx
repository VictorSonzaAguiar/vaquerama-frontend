// src/components/AppLayout.jsx
import React from 'react';
import Sidebar from './Sidebar'; // Importa a Sidebar (Ainda vamos criá-la)

const AppLayout = ({ children }) => {
  return (
    <div className="d-flex">
      {/* Sidebar (será o menu fixo da esquerda) */}
      <Sidebar />
      
      {/* Conteúdo Principal (Rotas) */}
      <main className="main-content flex-grow-1">
        {/* Renderiza o componente da rota atual (Feed, Login, etc.) */}
        {children} 
      </main>
    </div>
  );
};

export default AppLayout;