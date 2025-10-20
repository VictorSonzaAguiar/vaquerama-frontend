// ===========================================================
// 📸 PostModal.jsx — Modal de criação de post estilo Instagram
// ===========================================================
import React, { useState } from "react";
import { X } from "lucide-react";
import "../styles/PostModal.css";
import apiClient from "../api/api";

const PostModal = ({ onClose }) => {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaFile(null);
      setMediaPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!caption && !mediaFile) {
      return setError("O post deve ter uma legenda e/ou uma mídia.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      if (mediaFile) {
        formData.append("media", mediaFile);
        formData.append(
          "media_type",
          mediaFile.type.startsWith("video/") ? "VIDEO" : "PHOTO"
        );
      } else {
        formData.append("media_type", "TEXT");
      }

      await apiClient.post("/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Postagem criada com sucesso!");
      setTimeout(() => {
        onClose(); // fecha o modal
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Falha ao criar o post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postmodal-backdrop">
      <div className="postmodal-content">
        <button className="postmodal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {!mediaPreview ? (
          <div className="postmodal-initial">
            <h3>Criar novo post</h3>
            <label htmlFor="mediaInput" className="postmodal-upload">
              <span>Selecionar do computador</span>
            </label>
            <input
              type="file"
              id="mediaInput"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <form className="postmodal-form" onSubmit={handleSubmit}>
            <div className="media-preview">
              {mediaFile.type.startsWith("video/") ? (
                <video
                  src={mediaPreview}
                  controls
                  className="preview-media"
                ></video>
              ) : (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="preview-media"
                />
              )}
            </div>

            <textarea
              placeholder="Escreva uma legenda..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn-postar"
            >
              {loading ? "Publicando..." : "Postar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostModal;
