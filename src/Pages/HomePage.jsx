// src/Pages/HomePage.jsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signOut, collection, query, getDocs, where, db } from '../firebaseConfig';
import PrimaryButton from '../Components/Auth/PrimaryButton';
import CreateHabitModal from '../Components/CreateHabitModal'; 
import DailyHabitChecklistModal from '../Components/DailyHabitChecklistModal';
import '../Components/AuthStyles.css';
import '../Components/HabitModalStyle.css';
import './HabitCalendarPageStyle.css';

// URL da API de frases motivacionais
const API_URL = 'https://souzamatheush.github.io/FrasesAPI/frases.json';


// *****************************************************************
// FUNÇÕES DE UTILIDADE E COMPONENTES AUXILIARES (Mantidas)
// *****************************************************************
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const generateCalendarStructure = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...paddingDays, ...monthDays];
};

const BackgroundStars = ({ score = 0 }) => {
    // ... (Componente BackgroundStars integralmente mantido)
    const MAX_STARS = 100;
    const starCount = Math.min(MAX_STARS, score); 

    const stars = useMemo(() => {
        const starArray = [];
        for (let i = 0; i < starCount; i++) {
            starArray.push({
                id: i,
                x: Math.random() * 100, 
                y: Math.random() * 100,
                size: Math.random() * 2 + 1,
                duration: Math.random() * 2 + 1,
                delay: Math.random() * 1,
            });
        }
        return starArray;
    }, [starCount]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
            {stars.map(star => (
                <div
                    key={star.id}
                    className="star-point"
                    style={{
                        position: 'absolute',
                        left: `${star.x}vw`,
                        top: `${star.y}vh`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        boxShadow: '0 0 5px 1px var(--color-lavender-light)',
                        animation: `star-pulse ${star.duration}s infinite alternate ease-in-out`,
                        animationDelay: `${star.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};


// *****************************************************************
// COMPONENTE PRINCIPAL
// *****************************************************************

const HomePage = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const [currentDate] = useState(new Date());

    // ESTADOS DO CALENDÁRIO/MODAIS/SCORE (Mantidos)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    const [checklistModalData, setChecklistModalData] = useState({
        isOpen: false, day: null, month: null, year: null
    }); 
    const [consistencyScore, setConsistencyScore] = useState(0); 
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    
    // NOVO: ESTADOS PARA O INSIGHT DO DIA (API Externa)
    const [motivationalQuote, setMotivationalQuote] = useState("Clique em 'Novo Insight' para uma dose de motivação!");
    const [loadingQuote, setLoadingQuote] = useState(false);


    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 
    const currentDay = currentDate.getDate();
    
    const calendarDays = useMemo(() => generateCalendarStructure(year, month), [year, month]);
    const monthYear = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });


    // ----------------------------------------------------
    // FUNÇÃO DE BUSCA DA API EXTERNA (REINTRODUZIDA)
    // ----------------------------------------------------
    const fetchNewQuote = async () => {
        setLoadingQuote(true);
        setMotivationalQuote("Buscando sua motivação...");

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json(); 

            if (Array.isArray(data) && data.length > 0) { 
                const randomIndex = Math.floor(Math.random() * data.length); 
                const randomQuote = data[randomIndex]; 
                
                setMotivationalQuote(`"${randomQuote.frase}" - ${randomQuote.autor || 'Autor Desconhecido'}`);
                
            } else {
                 setMotivationalQuote("Erro: A API não retornou frases válidas ou está vazia.");
            }

        } catch (error) {
            console.error("Erro ao carregar a API de frases:", error);
            setMotivationalQuote("Erro ao carregar a frase. Verifique sua conexão.");
        } finally {
            setLoadingQuote(false);
        }
    };
    // ----------------------------------------------------


    // ----------------------------------------------------
    // FUNÇÃO DE BUSCA DE CONSISTÊNCIA E HANDLERS (Mantidos)
    // ----------------------------------------------------
    const fetchConsistencyScore = useCallback(async () => {
        // ... (lógica de busca de score no Firestore)
        if (!user) return;
        try {
            const completionsRef = collection(db, "completions");
            const q = query(completionsRef, where("userId", "==", user.uid));
            const snapshot = await getDocs(q);
            const totalCompletions = snapshot.size; 
            setConsistencyScore(totalCompletions); 
        } catch (error) {
            console.error("Erro ao buscar score de consistência:", error);
            setConsistencyScore(0);
        }
    }, [user]);

    const handleLogout = async () => { /* ... */ };
    const handleNewHabitClick = () => { setIsCreateModalOpen(true); };
    const handleDataUpdated = () => { setRefreshTrigger(prev => prev + 1); };
    const handleDayClick = (day) => {
        if (day) {
            setChecklistModalData({ isOpen: true, day: day, month: month + 1, year: year });
        }
    };
    const getDayColor = (day) => {
        if (!day) return 'transparent'; 
        return day === currentDay ? 'var(--color-primary)' : '#3d3d3d'; 
    };

    useEffect(() => {
        if (user) {
            fetchConsistencyScore();
        }
    }, [user, fetchConsistencyScore, refreshTrigger]); 
    // ----------------------------------------------------


    return (
        <div className="auth-container" style={{ position: 'relative' }}> 
            
            <BackgroundStars score={consistencyScore} />

            <div className="calendar-wrapper" style={{ zIndex: 10 }}> 
                
                {/* 1. CABEÇALHO (Mês e Botão) */}
                <div className="calendar-header">
                    <h1 className="welcome-title" style={{ color: 'white', margin: 0 }}>
                        {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                    </h1>
                    <button 
                        className="header-new-habit-button" 
                        onClick={handleNewHabitClick}
                    >
                        + Novo hábito
                    </button>
                </div>
                
                {/* 2. CORPO PRINCIPAL (CALENDÁRIO) */}
                <div className="calendar-body-content">
                
                    <div className="calendar-box">
                        
                        <div className="calendar-grid">
                            
                            {/* ... (Renderização do Calendário: Dias da Semana e Dias do Mês) ... */}
                            {DAY_LABELS.map((label, index) => (
                                <div key={index} className="calendar-day-header">
                                    {label}
                                </div>
                            ))}

                            {calendarDays.map((day, index) => (
                                <div 
                                    key={index}
                                    className="calendar-day-cell"
                                    style={{
                                        backgroundColor: getDayColor(day), 
                                        cursor: day ? 'pointer' : 'default',
                                        border: day === currentDay ? '2px solid var(--color-lavender-dark)' : 'none',
                                        color: day ? 'white' : 'transparent',
                                    }}
                                    onClick={() => handleDayClick(day)}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div> 

                    {/* NOVO: SEÇÃO DE CONTEÚDO SECUNDÁRIO ABAIXO DO CALENDÁRIO */}
                    <div style={{ marginTop: '50px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        
                        {/* A. INSIGHT DO DIA */}
                        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid var(--color-lavender-dark)', borderRadius: '15px', backgroundColor: '#111', minHeight: '80px' }}>
                            <h3 style={{ color: 'var(--color-lavender-light)', marginBottom: '10px', fontSize: '1.2rem' }}>Insight do Dia</h3>
                            <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: '1rem' }}>{motivationalQuote}</p>
                        </div>

                        {/* B. BOTÃO NOVO INSIGHT */}
                        <PrimaryButton 
                            onClick={fetchNewQuote} 
                            style={{backgroundColor: 'var(--color-lavender-dark)', marginBottom: '30px'}}
                            disabled={loadingQuote} 
                        >
                            {loadingQuote ? 'Buscando...' : 'Novo Insight'}
                        </PrimaryButton>

                    </div>

                </div> {/* Fim do .calendar-body-content */}

            </div> {/* Fim do .calendar-wrapper */}

            {/* Modais */}
            <CreateHabitModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onHabitAdded={handleDataUpdated} 
            />
            <DailyHabitChecklistModal 
                isOpen={checklistModalData.isOpen} 
                onClose={() => setChecklistModalData(prev => ({...prev, isOpen: false}))} 
                day={checklistModalData.day} 
                month={checklistModalData.month} 
                year={checklistModalData.year}
                onChecklistUpdated={handleDataUpdated} 
            />

        </div>
    );
};

export default HomePage;