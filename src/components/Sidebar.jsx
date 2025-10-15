// src/components/Sidebar.jsx - CORRIGIDO

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import useAuth from '../hooks/useAuth'; // <--- IMPORTADO

const Sidebar = () => {
  // Pega o objeto user do hook (que contém o ID)
  const { user, isAuthenticated } = useAuth();
  
  // Lógica: Se estiver logado, vai para /profile/ID_REAL. Senão, vai para /login.
  const profileRoute = isAuthenticated && user && user.id ? `/profile/${user.id}` : '/login';

  const navLinks = [
    { to: "/feed", icon: "bi-house-door-fill", text: "Feed" },
    { to: "/explore", icon: "bi-search", text: "Explorar" },
    { to: "/messages", icon: "bi-send", text: "Mensagens" },
    { to: "/notifications", icon: "bi-heart", text: "Notificações" },
    { to: "/postar", icon: "bi-plus-square", text: "Criar Post" },
    // O link de Perfil agora é DINÂMICO
    { to: profileRoute, icon: "bi-person-circle", text: "Perfil" }, 
    { to: "/logout", icon: "bi-box-arrow-right", text: "Sair/Login" },
  ];

  return (
    // ... (O restante do layout é o mesmo)
    <aside id="sidebar-left" className="fixed-top d-none d-lg-block">
      <div className="p-3">
        
        <Link to="/" className="navbar-brand text-accent fw-bold fs-4 mb-4 d-block">
          VAQUERAMA
        </Link>
        
        <nav className="nav flex-column">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `nav-link text-white d-flex align-items-center ${isActive ? 'fw-bold' : ''}`
              }
            >
              <i className={`${link.icon} fs-4 me-3`}></i>
              <span className="nav-text">{link.text}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;