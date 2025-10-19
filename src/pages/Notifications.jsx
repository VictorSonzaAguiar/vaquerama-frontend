// src/pages/Notifications.jsx
import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import "../styles/notifications.css";

const Notifications = () => {
  const { notifications, clearNotifications } = useNotifications();

 useEffect(() => {
  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/read/all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      clearNotifications(); // zera o contador local também
    } catch (err) {
      console.error("Erro ao marcar notificações como lidas:", err);
    }
  };

  markAllAsRead();
}, []);


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

  if (!notifications.length) {
    return (
      <div className="notifications-empty">
        <i className="bi-bell-slash fs-1 text-muted"></i>
        <p className="text-muted mt-3">Nenhuma notificação por enquanto!</p>
      </div>
    );
  }

  return (
    <div className="notifications-page container py-4">
      <h4 className="text-light fw-bold mb-4">Notificações</h4>

      <div className="notifications-list">
        {notifications.map((n) => (
          <div
  key={n.id || Math.random()}
  className={`notification-card d-flex align-items-center ${n.is_read ? "read" : "unread"}`}
>

            <div className="avatar-wrapper me-3">
              <img
                src={
                  n.sender_avatar
                  ? `${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://192.168.3.9:3000"}/uploads/${n.sender_avatar}`


                    : "/default-avatar.png"
                }
                alt={n.sender_name}
                className="avatar-img"
              />
            </div>

            <div className="flex-grow-1 text-light">
              <span className="fw-semibold">{n.sender_name}</span>{" "}
              {n.type === "like" && (
                <span className="text-muted">curtiu seu post</span>
              )}
              {n.type === "comment" && (
                <span className="text-muted">comentou em seu post</span>
              )}
              <div className="time text-secondary">{timeAgo(n.created_at)}</div>
            </div>

            {n.post_media_url && (
  <Link to={`/post/${n.post_id}`} className="post-preview">
    <img
     src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${n.post_media_url}`}

      alt="Post"
      className="post-thumb"
    />
  </Link>
)}

          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
