// src/Pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: 'black', minHeight: '100vh', textAlign: 'center' }}>
            <h1>404 - Página Não Encontrada</h1>
            <p>Oooops! Parece que você se perdeu.</p>
            <Link to="/" style={{color: '#C4B5FD'}}>Voltar para a página inicial</Link>
        </div>
    );
};

export default NotFoundPage;