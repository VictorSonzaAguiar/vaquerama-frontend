// src/pages/PostDetail.jsx (VERSÃO FINAL COM LEGENDA CORRIGIDA)

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../api/api";
import useAuth from "../hooks/useAuth";
import moment from "moment";

import "../Styles/PostDetail.css";
import CommentSection from "../components/CommentSection";

const BACKEND_BASE_URL = "http://localhost:3000";

const PostDetail = () => {
    const { id: postId } = useParams();
    const { user } = useAuth();

    // Estados
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Funções de busca de dados
    const fetchComments = useCallback(async () => {
        try {
            setCommentsLoading(true);
            const response = await apiClient.get(`posts/${postId}/comments`);
            setComments(response.data.comments || []);
        } catch (err) {
            console.error("Erro ao carregar comentários:", err);
        } finally {
            setCommentsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await apiClient.get(`posts/${postId}`);
                const postData = response.data.post || response.data;
                setPost(postData);
                setIsLiked(postData.is_liked || false);
                setLikesCount(postData.likes_count || 0);
            } catch (err) {
                setError("Erro ao carregar o post.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        fetchComments();
    }, [postId, fetchComments]);

    // Lógica de Ações do Usuário
    const handleLike = async () => {
        const prev = isLiked;
        const prevCount = likesCount;
        setIsLiked(!prev);
        setLikesCount(prev ? prevCount - 1 : prevCount + 1);
        try {
          await apiClient.post(`posts/${postId}/like`);
        } catch {
          setIsLiked(prev);
          setLikesCount(prevCount);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const response = await apiClient.post(`posts/${postId}/comment`, {
                content: newComment,
            });
            const addedComment = {
                id: response.data.commentId,
                content: newComment,
                created_at: new Date().toISOString(),
                author_name: user?.name || 'Você',
                author_photo: null,
            };
            setComments(prev => [...prev, addedComment]);
            setNewComment('');
        } catch (err) {
            alert("Falha ao enviar comentário.");
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => window.history.back();

    if (loading) return null;
    if (error) return <div className="post-error">{error}</div>;
    if (!post) return null;

    const mediaUrl = post.media_url ? `${BACKEND_BASE_URL}/uploads/${post.media_url}` : "";
    const profilePhotoUrl = post.author_photo ? `${BACKEND_BASE_URL}/uploads/${post.author_photo}` : null;
    const authorInitial = post.author_name ? post.author_name[0].toUpperCase() : "U";

    return (
        <div className="post-detail-overlay" role="dialog" aria-modal="true">
            <div className="post-detail-backdrop" onClick={closeModal} />
            <div className="insta-modal" role="document">
                <div className="insta-left">
                    <img src={mediaUrl} alt="post" className="insta-image" draggable={false} />
                </div>
                <div className="insta-right">
                    <div className="insta-header">
                        <Link to={`/profile/${post.author_id}`} className="insta-user">
                            {profilePhotoUrl ? (
                                <img src={profilePhotoUrl} alt="perfil" />
                            ) : (
                                <div className="insta-placeholder">{authorInitial}</div>
                            )}
                            <span>{post.author_name}</span>
                        </Link>
                        <button className="insta-close" onClick={closeModal} aria-label="Fechar">✕</button>
                    </div>

                    <div className="insta-comments">
                        {/* ====================================================== */}
                        {/* ✅ BLOCO DA LEGENDA ADICIONADO DE VOLTA AQUI ✅ */}
                        {/* ====================================================== */}
                        {post.caption && (
                            <div className="insta-caption">
                                <Link to={`/profile/${post.author_id}`} className="insta-user">
                                    {profilePhotoUrl ? (
                                        <img src={profilePhotoUrl} alt="perfil" />
                                    ) : (
                                        <div className="insta-placeholder">{authorInitial}</div>
                                    )}
                                    <strong>{post.author_name}</strong>
                                </Link>{" "}
                                <p className="caption-text">{post.caption}</p>
                                <div className="caption-date">
                                    {moment(post.created_at).fromNow()}
                                </div>
                            </div>
                        )}
                        {/* ====================================================== */}

                        <CommentSection comments={comments} loading={commentsLoading} />
                    </div>

                    <div className="insta-footer">
                        <div className="actions">
                             <i className={`bi ${isLiked ? "bi-heart-fill liked" : "bi-heart"}`} onClick={handleLike} aria-label="Curtir"/>
                             <i className="bi bi-chat" />
                             <i className="bi bi-send" />
                             <i className="bi bi-bookmark ms-auto" />
                        </div>
                        <div className="likes-count">{likesCount} curtida{likesCount !== 1 ? "s" : ""}</div>
                        <form className="add-comment" onSubmit={handleCommentSubmit}>
                            <input
                                type="text"
                                placeholder="Adicione um comentário..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? '...' : 'Postar'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;