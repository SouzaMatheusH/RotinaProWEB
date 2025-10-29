// src/Pages/HomePage.jsx
import React, { useState } from 'react';
import { signOut, auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import PrimaryButton from '../Components/Auth/PrimaryButton';
import '../Components/AuthStyles.css';

// URL da API de frases motivacionais
const API_URL = 'https://souzamatheush.github.io/FrasesAPI/frases.json';

const HomePage = () => {
    const navigate = useNavigate();
    const [motivationalQuote, setMotivationalQuote] = useState("Clique em 'Novo Insight' para uma dose de motivação!");
    const [loadingQuote, setLoadingQuote] = useState(false);
    
    // ----------------------------------------------------
    // FUNÇÃO CORRIGIDA PARA CONSUMO DA API
    // ----------------------------------------------------
    const fetchNewQuote = async () => {
        setLoadingQuote(true);
        setMotivationalQuote("Buscando sua motivação...");

        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            // O retorno é um ARRAY de frases diretamente, não um objeto com a chave 'frases'.
            const data = await response.json(); 

            if (Array.isArray(data) && data.length > 0) { 
                
                // Seleciona uma frase aleatória dentro do array 'data'
                const randomIndex = Math.floor(Math.random() * data.length); 
                const randomQuote = data[randomIndex]; 
                
                // Formata a frase e o autor
                setMotivationalQuote(`"${randomQuote.frase}" - ${randomQuote.autor || 'Autor Desconhecido'}`);
                
            } else {
                 setMotivationalQuote("Erro: A API não retornou frases válidas ou está vazia.");
            }

        } catch (error) {
            console.error("Erro ao carregar a API de frases:", error);
            setMotivationalQuote("Erro ao carregar a frase. Verifique sua conexão e o console.");
        } finally {
            setLoadingQuote(false);
        }
    };
    // ----------------------------------------------------


    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); 
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            alert("Não foi possível fazer logout. Tente novamente.");
        }
    };

    return (
        <div className="auth-container" style={{paddingTop: '20px', justifyContent: 'flex-start'}}>
            <h1 className="logo-text" style={{marginBottom: '50px'}}>ROTINA PRO</h1>

            <div style={{maxWidth: '350px', width: '100%', textAlign: 'left'}}>
                <h2 className="welcome-title">Bem-vindo(a) de Volta!</h2>
                <p className="welcome-text" style={{fontSize: '1.2rem'}}>
                    Sua rotina começa aqui.
                </p>
                
                {/* Área de Insights (Exibição da Frase) */}
                <div style={{
                    marginTop: '20px', 
                    padding: '20px', 
                    border: '1px solid var(--color-lavender-dark)', 
                    borderRadius: '15px', 
                    backgroundColor: '#111', 
                    minHeight: '80px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{color: 'var(--color-lavender-light)', marginBottom: '10px'}}>Insight do Dia</h3>
                    <p style={{color: '#ccc', fontStyle: 'italic'}}>{motivationalQuote}</p>
                </div>

                {/* Botão que dispara a busca da API (funcionalidade futura / Consumo de API Externa) */}
                <PrimaryButton 
                    onClick={fetchNewQuote} 
                    className="margin-top-large" 
                    style={{backgroundColor: 'var(--color-lavender-dark)'}}
                    disabled={loadingQuote}
                >
                    {loadingQuote ? 'Buscando...' : 'Novo Insight'}
                </PrimaryButton>

                {/* Área Principal de Hábitos (Futura Etapa 2) */}
                <div style={{marginTop: '40px', padding: '20px', border: '1px solid #333', borderRadius: '15px', backgroundColor: '#111'}}>
                    <h3 style={{color: 'var(--color-lavender-light)'}}>Hábitos de Hoje</h3>
                    <p style={{color: '#ccc'}}>Aqui será o calendário e a lista de hábitos a serem marcados.</p>
                    <Link to="/HabitCalendarPage" className="link-text">Ir para Dashboard (Exemplo)</Link>
                </div>

                {/* Botão de Logout */}
                <button 
                    onClick={handleLogout} 
                    className="primary-button"
                    style={{ 
                        marginTop: '50px', 
                        backgroundColor: 'transparent', 
                        border: '1px solid var(--color-primary)',
                        color: 'var(--color-primary)'
                    }}
                >
                    Sair da Conta
                </button>
            </div>
        </div>
    );
};

export default HomePage;