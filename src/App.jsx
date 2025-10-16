// src/App.jsx (VERSÃO CORRIGIDA)

import React from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom'; 

import ProtectedRoute from './components/ProtectedRoute'; 

// Páginas
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';
import Postar from './pages/Postar';
import Logout from './pages/Logout'; 
import EditProfile from './pages/EditProfile'; 
import PostDetail from './pages/PostDetail';
import Explore from './pages/Explore';

// =========================================================
// Componente Wrapper para decidir se o AppLayout deve ser mostrado
// =========================================================
const LayoutWrapper = ({ children }) => {
    const location = useLocation();
    
    // CORREÇÃO APLICADA AQUI: '/logout' agora é uma string
    const noLayoutPaths = ['/login', '/register', '/logout'];
    
    // Esta parte do código que usa o noLayoutPaths não precisa ser alterada,
    // mas a lógica para ocultar o layout não estava aqui.
    // Vamos garantir que a lógica correta seja usada abaixo no return do App.
    // O ideal é que este Wrapper não faça nada, a lógica fica no App.
    return children;
};

// Componente Wrapper para aplicar o AppLayout *apenas* uma vez
const LayoutWithAuth = () => {
    return (
        <ProtectedRoute>
            <AppLayout>
                <Outlet />
            </AppLayout>
        </ProtectedRoute>
    );
};


// Componente temporário para rotas em construção
const TempPage = ({ title }) => <h2 className="text-center text-white mt-5">{title} em construção...</h2>;

// =========================================================
// Função Principal App() com Rotas
// =========================================================
function App() {
  return (
    // O LayoutWrapper não é estritamente necessário aqui, mas mantemos a estrutura
    <LayoutWrapper> 
        <Routes>
            
            {/* 1. Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* 2. Rota Mestra PROTEGIDA (Todas as rotas que precisam de Sidebar) */}
            <Route element={<LayoutWithAuth />}> 
                
                {/* Páginas Principais */}
                <Route index element={<Feed />} /> {/* Rota raiz: / */}
                <Route path="feed" element={<Feed />} />
                <Route path="postar" element={<Postar />} />
                
                {/* Páginas de Interação */}
                <Route path="profile/:id" element={<Profile />} />
                <Route path="edit" element={<EditProfile />} /> 
                <Route path="post/:id" element={<PostDetail />} />

                {/* Páginas Temporárias (Em Construção) */}
                <Route path="explore" element={<Explore />} />
                <Route path="messages" element={<TempPage title="Mensagens" />} />
                <Route path="notifications" element={<TempPage title="Notificações" />} />
            </Route>
            
            {/* 3. Rota 404 (Não encontrada) */}
            <Route path="*" element={<h2 className="text-center text-danger mt-5">Página Não Encontrada (404)</h2>} />

        </Routes>
    </LayoutWrapper>
  );
}

export default App;