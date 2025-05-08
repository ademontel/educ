// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'  // o como llames a tu CSS de Tailwind

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { UserProvider } from './context/UserContext.jsx'



const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    {/* Primero carga toda la parte de autenticación */}
    <AuthProvider>
      {/* Dentro, la capa de usuario */}
      <UserProvider>
        {/* Luego el router */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
)
