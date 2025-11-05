// src/Pages/Auth/InitialPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../../Components/Auth/PrimaryButton';
import '../../Components/AuthStyles.css';
// 1. Importa a imagem do logo
import RotinaProLogo from '../../assets/logo.png'; 


const InitialPage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      {/* 2. Substitui o H1 pelo componente de Imagem */}
      {/* Adicionamos uma classe para estilizar o tamanho no CSS */}
      <img src={RotinaProLogo} alt="Logo Rotina PRO" className="logo-image" />
      
      <div className="welcome-section">
        <h2 className="welcome-title">Olá, seja bem-vindo!</h2>
        <p className="welcome-text">
          Seja bem vindo ao melhor app de desenvolvimento de hábitos que você já usou!
        </p>
      </div>
      
      <div className="button-group">
        <PrimaryButton onClick={() => navigate('/login')}>
          Login
        </PrimaryButton>
        <PrimaryButton onClick={() => navigate('/cadastro')}>
          Cadastre-se
        </PrimaryButton>
      </div>

    </div>
  );
};

export default InitialPage;