// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; 

import { auth } from './firebaseConfig'; 

// Importe as Páginas
import InitialPage from './Pages/Auth/InitialPage';
import LoginPage from './Pages/Auth/LoginPage';
import RegisterPage from './Pages/Auth/RegisterPage';
import HomePage from './Pages/HomePage'; // NOVA
import HabitCalendarPage from './Pages/HabitCalendarPage';
import NotFoundPage from './Pages/NotFoundPage';

// Hook personalizado para gerenciar o estado do usuário
const useAuthStatus = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
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
                <Route path="/" element={<InitialPage />} />
                
                <Route path="/login" element={loggedIn ? <Navigate to="/home" /> : <LoginPage />} />
                <Route path="/cadastro" element={loggedIn ? <Navigate to="/home" /> : <RegisterPage />} />

                <Route 
                    path="/home" 
                    element={loggedIn ? <HomePage /> : <Navigate to="/login" />} 
                />
                
                <Route 
                    path="/HabitCalendarPage" 
                    element={loggedIn ? <HabitCalendarPage /> : <Navigate to="/login" />} 
                />

                {/* Rota final: 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;