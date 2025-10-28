// src/Pages/DashboardPage.jsx
import React from 'react';

const DashboardPage = () => {
    return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: 'black', minHeight: '100vh' }}>
            <h1>Dashboard PRO</h1>
            <p>Seja bem-vindo. Sua navegação funciona! (Etapa 2)</p>
            {/* O conteúdo principal de gestão de hábitos virá aqui */}
            <p><Link to="/login" style={{color: '#C4B5FD'}}>Sair (Logout)</Link></p>
        </div>
    );
};

export default DashboardPage;