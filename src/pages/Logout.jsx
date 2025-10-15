// src/pages/Logout.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Logout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Executa a função de logout (limpa o token no localStorage)
        logout();
        
        // 2. Redireciona o usuário para a página de login
        setTimeout(() => {
            navigate('/login', { replace: true });
        }, 100); 
    }, [logout, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <h2 className="text-accent">Saindo... Volte sempre!</h2>
        </div>
    );
};

export default Logout;