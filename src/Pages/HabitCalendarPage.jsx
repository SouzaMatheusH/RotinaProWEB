// src/Pages/HabitCalendarPage.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components/AuthStyles.css'; // Estilos globais/cores
import './HabitCalendarPageStyle.css'; // Estilos do calendário
import CreateHabitModal from '../Components/CreateHabitModal'; 
import DailyHabitChecklistModal from '../Components/DailyHabitChecklistModal'; // NOVO IMPORT

// *****************************************************************
// CONSTANTES E FUNÇÕES DE UTILIDADE
// *****************************************************************
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // Rótulos: Domingo a Sábado

// Função que gera a estrutura completa do calendário (dias do mês e padding)
const generateCalendarStructure = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 

    // Cria células vazias para alinhar o dia 1 corretamente
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    // Cria as células do mês (números de 1 a 31)
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...paddingDays, ...monthDays];
};

// *****************************************************************
// COMPONENTE PRINCIPAL
// *****************************************************************

const HabitCalendarPage = () => {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    
    // 1. Estado para controlar a visibilidade do Modal de CRIAÇÃO
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    
    // 2. Estado para o Modal de CHECKLIST (Controla visibilidade e a data clicada)
    const [checklistModalData, setChecklistModalData] = useState({
        isOpen: false,
        day: null,
        month: null,
        year: null
    }); 
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed (Jan=0)
    const currentDay = currentDate.getDate();
    
    const calendarDays = useMemo(() => generateCalendarStructure(year, month), [year, month]);
    const monthYear = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    // Lógica para determinar a cor do dia (simulação de consistência)
    const getDayColor = (day) => {
        if (!day) return 'transparent'; 
        
        return day === currentDay 
            ? 'var(--color-primary)' 
            : '#3d3d3d'; 
    };

    // Handler para abrir o Modal de CHECKLIST
    const handleDayClick = (day) => {
        if (day) {
            // Abre o modal de checklist com a data clicada
            setChecklistModalData({
                isOpen: true,
                day: day,
                month: month + 1, // Passa o mês 1-indexed (Jan=1)
                year: year
            });
        }
    };
    
    // Handler para abrir o Modal de CRIAÇÃO
    const handleNewHabitClick = () => {
        setIsCreateModalOpen(true); 
    };

    // Função de callback após o sucesso no Modal de Criação
    const handleHabitAdded = () => {
        alert("Hábito adicionado com sucesso! Atualizando calendário.");
        // Futuro: Lógica para recarregar a lista de hábitos do Firestore
    };
    
    // Função para fechar o modal de checklist
    const closeChecklistModal = () => {
        setChecklistModalData(prev => ({ ...prev, isOpen: false }));
    };


    return (
        <div className="auth-container"> 
            
            <div className="calendar-wrapper">
                
                {/* 1. CABEÇALHO COM MÊS E BOTÃO NOVO HÁBITO */}
                <div className="calendar-header">
                    {/* Título do Mês */}
                    <h1 className="welcome-title" style={{ color: 'white', margin: 0 }}>
                        {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                    </h1>
                    
                    {/* BOTÃO NOVO HÁBITO - CHAMA A ABERTURA DO MODAL DE CRIAÇÃO */}
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
                                    onClick={() => handleDayClick(day)} // CHAMA O MODAL DE CHECKLIST
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div> {/* Fim do .calendar-box */}
                
                </div> {/* Fim do .calendar-body-content */}

            </div> {/* Fim do .calendar-wrapper */}

            {/* 3. MODAL DE CRIAÇÃO DE HÁBITO */}
            <CreateHabitModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onHabitAdded={handleHabitAdded}
            />

            {/* 4. MODAL DE CHECKLIST DIÁRIA */}
            <DailyHabitChecklistModal
                isOpen={checklistModalData.isOpen}
                onClose={closeChecklistModal}
                day={checklistModalData.day}
                month={checklistModalData.month}
                year={checklistModalData.year}
            />

        </div>
    );
};

export default HabitCalendarPage;