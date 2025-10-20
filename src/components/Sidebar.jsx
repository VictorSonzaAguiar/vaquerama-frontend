// =============================================================
// 🌵 Sidebar.jsx — com CreateDropdown integrado (mantendo ícones originais)
// =============================================================
import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Home,
  Search,
  Send,
  Heart,
  User,
  LogOut,
  PlusSquare,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContext";
import NotificationModal from "./NotificationModal";
import PostModal from "./PostModal";
import CreateDropdown from "./CreateDropdown";
import logoVaquerama from "../assets/logovaquerama.png";
import "../styles/sidebar.css";

const Sidebar = ({ collapsed = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const dropdownRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      // não fecha se o click foi dentro do trigger (dropdownRef) ou dentro do dropdown portal (.create-dropdown)
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest?.(".create-dropdown")
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileRoute =
    isAuthenticated && user?.id ? `/profile/${user.id}` : "/login";

  const handlePostAction = (type) => {
    setShowDropdown(false);
    if (type === "post") setShowPostModal(true);
    else alert("🔴 Função 'Ao vivo' ainda em desenvolvimento!");
  };

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
    { to: "#", icon: <PlusSquare size={22} />, text: "Criar Post", isCreate: true },
    { to: profileRoute, icon: <User size={22} />, text: "Perfil" },
    { to: "/logout", icon: <LogOut size={22} />, text: "Sair/Login" },
  ];

  return (
    <>
      <aside className={`ig-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="ig-sidebar-inner">
          {/* LOGO */}
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

          {/* NAV */}
          <nav className="ig-nav" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.isNotification) {
                return (
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
                );
              }

              if (link.isCreate) {
                return (
                  <div
                    key={link.text}
                    className="nav-item"
                    ref={dropdownRef}
                    style={{ position: "relative" }}
                  >
                        <div
                          className="nav-item create-trigger"
                          onClick={(e) => {
                            // calcula posição do trigger e abre o dropdown via portal
                            const rect = dropdownRef.current?.getBoundingClientRect();
                            setAnchorRect(rect || null);
                            setShowDropdown((s) => !s);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            width: "100%",
                            cursor: "pointer",
                          }}
                        >
                      <span
                        className="nav-icon"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {link.icon}
                      </span>
                      {!collapsed && (
                        <span className="nav-text">{link.text}</span>
                      )}
                    </div>

                    {showDropdown && (
                      <CreateDropdown
                        onSelect={handlePostAction}
                        anchorRect={anchorRect}
                      />
                    )}
                  </div>
                );
              }

              return (
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
              );
            })}
          </nav>

          <div className="ig-sidebar-spacer" />
        </div>
      </aside>

      {/* MODAIS */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      {showPostModal && <PostModal onClose={() => setShowPostModal(false)} />}
    </>
  );
};

export default Sidebar;
