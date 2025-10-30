// src/Pages/HabitCalendarPage.jsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, collection, query, getDocs, where } from "../firebaseConfig";
import '../Components/AuthStyles.css'; 
import '../Components/HabitModalStyle.css';
import './HabitCalendarPageStyle.css'; 
import CreateHabitModal from "../Components/CreateHabitModal";
import DailyHabitChecklistModal from "../Components/DailyHabitChecklistModal";


// *****************************************************************
// CONSTANTES E FUNÇÕES DE UTILIDADE
// *****************************************************************
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const generateCalendarStructure = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...paddingDays, ...monthDays];
};


// *****************************************************************
// NOVO COMPONENTE: EFEITO VISUAL DE BRILHO
// *****************************************************************

const BackgroundStars = ({ score = 0 }) => {
    // Escala para o número de estrelas baseado na pontuação (1 estrela por ponto)
    const MAX_STARS = 100; // Limite máximo de estrelas para performance
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
    }, [starCount]); // Recalcula sempre que o score muda

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

const HabitCalendarPage = () => {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    const [checklistModalData, setChecklistModalData] = useState({
        isOpen: false, day: null, month: null, year: null
    }); 
    const [consistencyScore, setConsistencyScore] = useState(0); // Pontuação que varia o brilho
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Gatilho para recarregar dados do calendário

    const user = auth.currentUser;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 
    const currentDay = currentDate.getDate();
    
    const calendarDays = useMemo(() => generateCalendarStructure(year, month), [year, month]);
    const monthYear = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    // ----------------------------------------------------
    // FUNÇÃO DE BUSCA DE CONSISTÊNCIA NO FIRESTORE
    // ----------------------------------------------------
    const fetchConsistencyScore = useCallback(async () => {
        if (!user) return;

        try {
            // Consulta para buscar TODAS as conclusões do usuário na coleção 'completions'
            const completionsRef = collection(db, "completions");
            const q = query(
                completionsRef, 
                where("userId", "==", user.uid)
            );
            
            const snapshot = await getDocs(q);
            
            // O SCORE É O NÚMERO TOTAL DE REGISTROS DE CONCLUSÃO
            const totalCompletions = snapshot.size; 
            
            setConsistencyScore(totalCompletions); 

        } catch (error) {
            console.error("Erro ao buscar score de consistência:", error);
            setConsistencyScore(0);
        }
    }, [user]);
    // ----------------------------------------------------


    // Recarrega o score e o calendário sempre que o gatilho for ativado (após salvar/marcar)
    useEffect(() => {
        fetchConsistencyScore();
        // FUTURO: Aqui você chamaria a função para recarregar os dados do calendário (ex: cores dos dias)
    }, [user, fetchConsistencyScore, refreshTrigger]); 


    // Handlers de Modal (ajustados)
    const handleNewHabitClick = () => { setIsCreateModalOpen(true); };
    
    // Chamado após um NOVO HÁBITO ser criado
    const handleHabitAdded = () => { 
        alert("Hábito adicionado com sucesso!");
        setIsCreateModalOpen(false);
        // Ativa o gatilho para recarregar o score e o calendário
        setRefreshTrigger(prev => prev + 1); 
    };

    // Chamado após marcar/desmarcar um hábito no checklist
    const handleChecklistUpdated = () => {
        // Ativa o gatilho para recarregar o score (mais brilho!)
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDayClick = (day) => {
        if (day) {
            setChecklistModalData({ isOpen: true, day: day, month: month + 1, year: year });
        }
    };

    const getDayColor = (day) => {
        if (!day) return 'transparent'; 
        return day === currentDay ? 'var(--color-primary)' : '#3d3d3d'; 
    };
    

    return (
        <div className="auth-container" style={{ position: 'relative' }}> 
            
            {/* Efeito de Brilho no Background (Quantidade varia com o Score) */}
            <BackgroundStars score={consistencyScore} />

            <div className="calendar-wrapper" style={{ zIndex: 10 }}> 
                
                {/* 1. CABEÇALHO COM MÊS E BOTÃO NOVO HÁBITO */}
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
                
                {/* 2. CORPO CENTRALIZADO (CALENDÁRIO) */}
                <div className="calendar-body-content">
                
                    <div className="calendar-box">
                        
                        <div className="calendar-grid">
                            
                            {/* CABEÇALHO DOS DIAS DA SEMANA */}
                            {DAY_LABELS.map((label, index) => (
                                <div key={index} className="calendar-day-header">
                                    {label}
                                </div>
                            ))}

                            {/* CORPO DOS DIAS DO MÊS E PADDING */}
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
                
                </div>

            </div>

            {/* Modais */}
            <CreateHabitModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onHabitAdded={handleHabitAdded} // Chamada após salvar
            />
            <DailyHabitChecklistModal 
                isOpen={checklistModalData.isOpen} 
                onClose={() => setChecklistModalData(prev => ({...prev, isOpen: false}))} 
                day={checklistModalData.day} 
                month={checklistModalData.month} 
                year={checklistModalData.year}
                onChecklistUpdated={handleChecklistUpdated} // Chamada após marcar/desmarcar
            />

        </div>
    );
};

export default HabitCalendarPage;