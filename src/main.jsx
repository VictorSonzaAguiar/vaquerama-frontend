import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css'; 

import { AuthProvider } from './hooks/useAuth.jsx';
// ✅ A LINHA QUE FALTAVA ESTÁ AQUI ✅
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* O AuthProvider envolve o NotificationProvider */}
      <AuthProvider>
        {/* E o NotificationProvider envolve o App */}
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);