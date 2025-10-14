// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Ícones do Bootstrap

// Ícones que vamos usar (Você já tem o Bootstrap instalado)
const navLinks = [
  { to: "/feed", icon: "bi-house-door-fill", text: "Feed" },
  { to: "/explore", icon: "bi-search", text: "Explorar" },
  { to: "/messages", icon: "bi-send", text: "Mensagens" },
  { to: "/notifications", icon: "bi-heart", text: "Notificações" },
  { to: "/postar", icon: "bi-plus-square", text: "Criar Post" },
  { to: "/profile/me", icon: "bi-person-circle", text: "Perfil" },
  { to: "/login", icon: "bi-box-arrow-right", text: "Sair/Login" },
];

const Sidebar = () => {
  return (
    // Estilo fixo e responsivo (será ajustado via CSS)
    <aside id="sidebar-left" className="d-none d-lg-block">
      <div className="p-3">
        
        {/* Logo Vaquerama */}
        <Link to="/" className="navbar-brand text-accent fw-bold fs-4 mb-4 d-block">
          VAQUERAMA
        </Link>
        
        {/* Links de Navegação */}
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