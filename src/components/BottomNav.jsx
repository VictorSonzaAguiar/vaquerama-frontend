// src/components/BottomNav.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import useAuth from '../hooks/useAuth'; 
import '../styles/global.css'; // Para garantir estilos de cores

const BottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Lógica: Se logado, vai para /profile/ID_REAL. Senão, vai para /login.
  const profileRoute = isAuthenticated && user && user.id ? `/profile/${user.id}` : '/login';

  const navLinks = [
    { to: "/feed", icon: "bi-house-door-fill", text: "Feed" },
    { to: "/explore", icon: "bi-search", text: "Explorar" },
    { to: "/postar", icon: "bi-plus-square", text: "Postar" }, // Ícone para criar post
    { to: "/messages", icon: "bi-send", text: "Mensagens" },
    // Ícone de perfil no canto (o /logout/login não é essencial aqui)
    { to: profileRoute, icon: "bi-person-circle", text: "Perfil" }, 
  ];
  
  // Classes: fixed-bottom (fixo embaixo), d-lg-none (esconde no desktop)
  return (
    <nav className="bottom-nav fixed-bottom d-block d-lg-none shadow-lg">
      <div className="d-flex justify-content-around align-items-center h-100">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            // Usa as classes de cor e formatação do global.css/Bootstrap
            className={({ isActive }) => 
              `nav-link-mobile text-white d-flex flex-column align-items-center justify-content-center ${isActive ? 'active-mobile-link' : ''}`
            }
          >
            <i className={`${link.icon} fs-4`}></i>
            {/* O texto pode ser útil para acessibilidade, mas é opcional em mobile */}
            {/* <span style={{fontSize: '0.7rem'}}>{link.text}</span> */}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;