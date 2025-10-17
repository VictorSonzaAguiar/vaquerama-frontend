// src/App.jsx (VERSÃO FINAL E CORRIGIDA)

import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom'; 

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Páginas
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Postar from './pages/Postar';
import Logout from './pages/Logout'; 
import EditProfile from './pages/EditProfile'; 
import PostDetail from './pages/PostDetail';
import Explore from './pages/Explore';
import Messages from './pages/Messages';

const TempPage = ({ title }) => <h2 className="text-center text-white mt-5">{title} em construção...</h2>;

function App() {
  return (
    <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
            <Route index element={<Feed />} />
            <Route path="feed" element={<Feed />} />
            <Route path="postar" element={<Postar />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="edit" element={<EditProfile />} /> 
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="explore" element={<Explore />} />
            
            {/* ✅ CORREÇÃO APLICADA AQUI ✅ */}
            {/* Rota genérica para quando clicar na sidebar */}
            <Route path="messages" element={<Messages />} /> 
            {/* Rota específica para quando vier de um perfil de usuário */}
            <Route path="messages/:id" element={<Messages />} /> 
            
            <Route path="notifications" element={<TempPage title="Notificações" />} />
        </Route>
        
        {/* Rota 404 */}
        <Route path="*" element={<h2 className="text-center text-danger mt-5">Página Não Encontrada (404)</h2>} />
    </Routes>
  );
}

export default App;