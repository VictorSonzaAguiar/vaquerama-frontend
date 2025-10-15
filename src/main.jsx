// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- AGORA IMPORTADO CORRETAMENTE
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolve o App com o BrowserRouter para habilitar o roteamento */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
