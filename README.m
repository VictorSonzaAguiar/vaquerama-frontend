# VAQUERAMA - Frontend (React/Web)

## 🎯 Sobre
Este é o Front-end Web da rede social Vaquerama, projetado para consumir a API construída em Node.js/Express. O foco de design é um layout de rede social (similar ao Instagram), com total responsividade (Mobile-First) e um tema Dark.

## 🛠️ Tecnologias
- **Framework:** React com JavaScript (via Vite)
- **Estilização:** Bootstrap 5 (React-Bootstrap) + CSS Modular (Dark Theme)
- **Roteamento:** React Router DOM
- **Requisições à API:** Axios (substituindo o fetch nativo)

## ⚙️ Configuração e Instalação
1. **Clonar o Repositório:** (A ser adicionado quando estiver no Git)
2. **Instalar Dependências:** `npm install`
3. **Rodar o Servidor de Desenvolvimento:** `npm run dev`
4. **Endpoint da API:** `http://localhost:3000/api` (É crucial garantir que o Backend esteja rodando!)

## 🗺️ Estrutura do Projeto (Em Construção)
A aplicação será dividida em:
- **`src/`**
    - **`pages/`**: Componentes principais que representam as Rotas (Ex: `Feed.jsx`, `Login.jsx`).
    - **`components/`**: Componentes reutilizáveis (Ex: `PostCard.jsx`, `Navbar.jsx`).
    - **`styles/`**: Arquivos de CSS e configuração do Bootstrap.
    - **`hooks/`**: Lógica de estado e autenticação (Ex: `useAuth.js`).
    - **`api/`**: Módulo de configuração do Axios.