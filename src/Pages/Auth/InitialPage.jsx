// src/Pages/Auth/InitialPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../../Components/Auth/PrimaryButton';
import '../../Components/AuthStyles.css';

const InitialPage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <h1 className="logo-text">ROTINA PRO</h1>
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

      <div className="social-login">
        <p>Ou entre usando sua conta Google</p>
        <div className="google-icon-wrapper">
          <span className="google-icon">G</span>
        </div>
      </div>
    </div>
  );
};

export default InitialPage;