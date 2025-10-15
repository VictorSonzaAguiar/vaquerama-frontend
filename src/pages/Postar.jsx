// src/pages/Postar.jsx

import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/api";

const Postar = () => {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  // ===========================
  // Pré-visualização da mídia
  // ===========================
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

  // ===========================
  // Submissão do post
  // ===========================
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

      setSuccess("Postagem criada com sucesso! Redirecionando para o Feed...");
      setTimeout(() => navigate("/feed"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Falha ao criar o post. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4" style={{ maxWidth: "900px" }}>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card
            className="bg-dark border-0 rounded-4 shadow-lg"
            style={{ overflow: "hidden" }}
          >
            <Card.Body className="p-0">
              {/* Preview da mídia */}
              {mediaPreview && (
                <div className="w-100" style={{ maxHeight: "500px", overflow: "hidden" }}>
                  <Image
                    src={mediaPreview}
                    fluid
                    className="w-100"
                    style={{ objectFit: "cover", height: "500px" }}
                  />
                </div>
              )}

              <Form
                onSubmit={handleSubmit}
                className="p-4 d-flex flex-column gap-3"
              >
                {/* Upload */}
                <Form.Group className="text-center">
                  <Form.Label
                    htmlFor="mediaInput"
                    className="px-4 py-2 rounded-3 fw-bold"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#1c1c1c",
                      color: "#0095f6",
                      border: "1px solid #333",
                    }}
                  >
                    {mediaFile ? "Alterar Mídia" : "Selecionar Foto ou Vídeo"}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    id="mediaInput"
                    name="media"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    style={{ display: "none" }}
                  />
                </Form.Group>

                {/* Legenda */}
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Escreva uma legenda..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="bg-secondary text-white border-0 rounded-3 p-3"
                    style={{ resize: "none", fontSize: "1rem" }}
                  />
                </Form.Group>

                {/* Mensagens */}
                {error && (
                  <div className="alert alert-danger text-center">{error}</div>
                )}
                {success && (
                  <div className="alert alert-success text-center">{success}</div>
                )}

                {/* Botão */}
                <Button
                  type="submit"
                  className="fw-bold py-2"
                  style={{
                    backgroundColor: "#0095f6",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  disabled={loading || (!caption && !mediaFile)}
                >
                  {loading ? "Publicando..." : "Postar"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Postar;
