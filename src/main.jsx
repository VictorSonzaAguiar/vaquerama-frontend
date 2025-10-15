// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- O ÚNICO LUGAR ONDE SE IMPORTA ISSO
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- O ÚNICO LUGAR ONDE SE USA ESTA TAG */}
        <App />
    </BrowserRouter>
  </React.StrictMode>,
);
