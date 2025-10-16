// src/pages/Explore.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import apiClient from '../api/api';
import PostCardMini from '../components/PostCardMini';
import '../Styles/explore.css'; // <-- novo CSS para o estilo Instagram

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExploreFeed = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('posts/explore');
        setPosts(response.data.posts || []);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar a página Explorar:", err);
        setError("Não foi possível carregar o conteúdo. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchExploreFeed();
  }, []);

  if (loading) {
    return <h2 className="text-center text-accent mt-5">🔎 Explorando o Vaquerama...</h2>;
  }

  if (error) {
    return <h2 className="text-center text-danger mt-5">{error}</h2>;
  }

  return (
    <Container fluid className="explore-container">
      <h3 className="text-white mb-4">Explorar</h3>

      {posts.length === 0 ? (
        <p className="text-subtle text-center mt-5">Nenhum post encontrado para explorar no momento.</p>
      ) : (
        <Row className="explore-grid g-0">
          {posts.map((post) => (
            <Col key={post.id} xs={4} className="p-1 explore-item">
              <PostCardMini post={post} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Explore;
