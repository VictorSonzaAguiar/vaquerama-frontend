import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Home,
  Search,
  Send,
  Heart,
  PlusSquare,
  User,
  LogOut,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContext";
import NotificationModal from "./NotificationModal";
import logoVaquerama from "../assets/logovaquerama.png";
import "../styles/sidebar.css";

const Sidebar = ({ collapsed = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRoute =
    isAuthenticated && user?.id ? `/profile/${user.id}` : "/login";

  const toggleNotifications = (e) => {
    e.preventDefault();
    setShowNotifications((prev) => !prev);
  };

  const navLinks = [
    { to: "/feed", icon: <Home size={22} />, text: "Feed" },
    { to: "/explore", icon: <Search size={22} />, text: "Explorar" },
    { to: "/messages", icon: <Send size={22} />, text: "Mensagens" },
    {
      to: "#",
      icon: <Heart size={22} />,
      text: "Notificações",
      isNotification: true,
    },
    { to: "/postar", icon: <PlusSquare size={22} />, text: "Criar Post" },
    { to: profileRoute, icon: <User size={22} />, text: "Perfil" },
    { to: "/logout", icon: <LogOut size={22} />, text: "Sair/Login" },
  ];

  return (
    <>
      <aside
        className={`ig-sidebar ${collapsed ? "collapsed" : ""}`}
        aria-label="Sidebar"
      >
        <div className="ig-sidebar-inner">
          {/* LOGO TOPO */}
          <div className="ig-logo-top">
            <div className="ig-logo-container">
              <Link to="/" className="ig-logo-link" title="Vaquerama">
                <img
                  src={logoVaquerama}
                  alt="Vaquerama logo"
                  className="ig-logo"
                />
              </Link>
            </div>
          </div>

          {/* NAVEGAÇÃO */}
          <nav className="ig-nav" aria-label="Main navigation">
            {navLinks.map((link) =>
              link.isNotification ? (
                <button
                  key={link.text}
                  onClick={toggleNotifications}
                  className="nav-item"
                  type="button"
                >
                  <span className="nav-icon">{link.icon}</span>
                  {!collapsed && <span className="nav-text">{link.text}</span>}
                  {!collapsed && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </button>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  title={link.text}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {!collapsed && <span className="nav-text">{link.text}</span>}
                </NavLink>
              )
            )}
          </nav>

          <div className="ig-sidebar-spacer" />
        </div>
      </aside>

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default Sidebar;
