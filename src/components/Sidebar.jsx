import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import useAuth from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext'; // ✅ 1. IMPORTA O HOOK DE NOTIFICAÇÃO

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications(); // ✅ 2. PEGA A CONTAGEM DE MENSAGENS NÃO LIDAS
  
  const profileRoute = isAuthenticated && user && user.id ? `/profile/${user.id}` : '/login';

  const navLinks = [
    { to: "/feed", icon: "bi-house-door-fill", text: "Feed" },
    { to: "/explore", icon: "bi-search", text: "Explorar" },
    // ✅ 3. ADICIONA A CONTAGEM AO LINK DE MENSAGENS
    { to: "/messages", icon: "bi-send", text: "Mensagens", notificationCount: unreadCount },
    { to: "/notifications", icon: "bi-heart", text: "Notificações" },
    { to: "/postar", icon: "bi-plus-square", text: "Criar Post" },
    { to: profileRoute, icon: "bi-person-circle", text: "Perfil" }, 
    { to: "/logout", icon: "bi-box-arrow-right", text: "Sair/Login" },
  ];

  return (
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
              
              {/* ✅ 4. RENDERIZA O BALÃO DE NOTIFICAÇÃO SE HOUVER MENSAGENS NÃO LIDAS */}
              {link.notificationCount > 0 && (
                <span className="notification-badge">{link.notificationCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;