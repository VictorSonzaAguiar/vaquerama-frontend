import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import "../styles/notifications.css";
import "../Styles/NotificationModal.css";

const NotificationModal = ({ isOpen, onClose }) => {
  const { notifications, clearNotifications } = useNotifications();

  useEffect(() => {
  if (isOpen) {
    clearNotifications();
  }
}, [isOpen, clearNotifications]);

  if (!isOpen) return null;

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return "agora mesmo";
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
    return past.toLocaleDateString();
  };

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>Notificações</h5>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="notifications-empty">
              <i className="bi-bell-slash fs-1 text-muted"></i>
              <p className="text-muted mt-3">Nenhuma notificação por enquanto!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="notification-card">
                <img
                  src={
                    n.sender_avatar
                      ? `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${n.sender_avatar}`
                      : "/default-avatar.png"
                  }
                  alt={n.sender_name}
                  className="avatar-img me-3"
                />
                <div className="flex-grow-1 text-light">
                  <strong>{n.sender_name}</strong>{" "}
                  {n.type === "like" && <span>curtiu seu post ❤️</span>}
                  {n.type === "comment" && <span>comentou em seu post 💬</span>}
                  <div className="time text-secondary">{timeAgo(n.created_at)}</div>
                </div>
                {n.post_media_url && (
                  <Link
                    to={`/post/${n.post_id}`}
                    className="post-thumb-mini"
                    title="Ver post"
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${n.post_media_url}`}
                      alt="Post"
                    />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
