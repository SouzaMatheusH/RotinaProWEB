// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; 

import { auth } from './firebaseConfig'; 

// Importe as Páginas
import InitialPage from './Pages/Auth/InitialPage';
import LoginPage from './Pages/Auth/LoginPage';
import RegisterPage from './Pages/Auth/RegisterPage';
import HomePage from './Pages/HomePage'; // Página principal consolidada
import NotFoundPage from './Pages/NotFoundPage'; // Exemplo

// Hook personalizado para gerenciar o estado do usuário (Mantido)
const useAuthStatus = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoggedIn(!!user); 
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return { loggedIn, loading };
};

// Componente de Roteamento Principal
function App() {
    const { loggedIn, loading } = useAuthStatus();

    if (loading) {
        return (
            <div style={{ color: 'white', backgroundColor: 'black', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h1>Carregando autenticação...</h1>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* 1. Rotas Abertas */}
                <Route path="/" element={<InitialPage />} />
                
                {/* 2. Rotas de Autenticação com Redirecionamento Pós-Login para /home */}
                <Route path="/login" element={loggedIn ? <Navigate to="/home" /> : <LoginPage />} />
                <Route path="/cadastro" element={loggedIn ? <Navigate to="/home" /> : <RegisterPage />} />

                {/* 3. Rota HOME PAGE (Principal protegida) */}
                <Route 
                    path="/home" 
                    element={loggedIn ? <HomePage /> : <Navigate to="/login" />} 
                />
                
                {/* REMOVIDO: Rota /dashboard - Agora o conteúdo está em /home */}
                {/* Opcional: Redirecionar /dashboard para /home, se o link ainda existir em algum lugar */}
                <Route 
                    path="/dashboard" 
                    element={loggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} 
                />


                {/* Rota final: 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;