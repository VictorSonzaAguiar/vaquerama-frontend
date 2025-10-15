// src/components/AppLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div className="d-flex">
      
      {/* 1. Sidebar Fixo da Esquerda (Menu) */}
      <Sidebar />
      
      {/* 2. Wrapper Principal para o Layout de 2 Colunas (Feed + Sugestões) */}
      <main className="main-content flex-grow-1">
        <div className="container-fluid">
          <div className="row justify-content-center mx-0">
              
            {/* Espaçador para alinhar o Feed centralizado em telas grandes */}
            <div className="col-lg-1 d-none d-lg-block"></div>
            
            {/* Coluna Central: FEED DE NOTÍCIAS (Responsivo) */}
            {/* O FEED será maior em Mobile (col-12) e em Desktop (col-md-7) */}
            <div className="col-12 col-md-8 col-lg-7 px-0 feed-col-style">
                <div id="app-content">
                    {children} {/* Aqui entra a página Feed.jsx */}
                </div>
            </div>

            {/* Coluna Direita: SIDEBAR DE SUGESTÕES (Apenas em Desktop/Tablet) */}
            <div className="col-md-4 col-lg-3 d-none d-md-block sidebar-col-style-right">
                <div className="sidebar-sticky pt-4">
                    <h6 className="fw-bold mb-3 text-white">Sugestões de Vaqueiros</h6>
                    <p className="text-subtle" style={{fontSize: '14px'}}>
                        Encontre novos vaqueiros e parques para seguir.
                    </p>
                    <p className="mt-5 text-subtle" style={{fontSize: '10px'}}>
    VAQUERAMA © 2025
</p>
                </div>
            </div>

          </div>
        </div>
      </main>
       
    
  );


      {/* TODO: Implementar a navegação Bottom-Nav Mobile */}

    </div>
  );
};

export default AppLayout;