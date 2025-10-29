// src/Components/DailyHabitChecklistModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import '../Components/HabitModalStyle.css';
import { 
    auth, db, 
    collection, query, getDocs, where, 
    doc, setDoc, deleteDoc
} from '../firebaseConfig'; 

const DailyHabitChecklistModal = ({ isOpen, onClose, day, month, year }) => {
    // Estados
    const [checklistItems, setChecklistItems] = useState([]); 
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isMarking, setIsMarking] = useState(false);

    const user = auth.currentUser;
    if (!user) return null; 

    // **********************************************
    // FUNÇÕES DE UTILIDADE E PERSISTÊNCIA
    // **********************************************

    // Retorna a data no formato YYYY-MM-DD
    const getFormattedDate = useCallback((d, m, y) => {
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toISOString().split('T')[0];
    }, []);
    
    // Usamos useCallback para que a função seja estável nas dependências do useEffect
    const fetchHabitsAndCompletions = useCallback(async () => {
        if (!user || !day) return;

        setLoading(true);
        const formattedDate = getFormattedDate(day, month, year);
        const fullDate = new Date(year, month - 1, day);
        const dayIndex = fullDate.getDay(); 

        try {
            // 1. BUSCA DE HÁBITOS (RESTRITO AO USUÁRIO)
            const habitsRef = collection(db, "habits");
            const habitsQuery = query(habitsRef, where("userId", "==", user.uid)); 
            const habitsSnapshot = await getDocs(habitsQuery);

            let allHabits = [];
            habitsSnapshot.forEach((doc) => {
                allHabits.push({ id: doc.id, ...doc.data() });
            });

            // 2. FILTRA OS HÁBITOS PELA RECORRÊNCIA DO DIA
            const habitsForToday = allHabits.filter(habit => {
                return habit.recurrence && habit.recurrence.includes(dayIndex);
            });

            // 3. BUSCA CONCLUSÕES (RESTRITO AO USUÁRIO E DATA)
            const completionsRef = collection(db, "completions");
            const completionsQuery = query(
                completionsRef, 
                where("userId", "==", user.uid),
                where("date", "==", formattedDate)
            );
            const completionsSnapshot = await getDocs(completionsQuery);
            
            const completedHabitsMap = new Map();
            completionsSnapshot.forEach(doc => {
                completedHabitsMap.set(doc.data().habitId, true);
            });

            // 4. COMBINA HÁBITOS E CONCLUSÕES
            const finalChecklist = habitsForToday.map(habit => ({
                id: habit.id,
                name: habit.name,
                completed: completedHabitsMap.has(habit.id), 
            }));

            setChecklistItems(finalChecklist);

        } catch (error) {
            console.error("Erro na busca de Hábitos e Conclusões:", error);
            setChecklistItems([{ id: 'err', name: 'Falha ao carregar dados.', completed: false }]);
        } finally {
            setLoading(false);
        }
    }, [user, day, month, year, getFormattedDate]); // Dependências do useCallback

    // Função que salva ou remove o registro de conclusão
    const saveCompletionStatus = async (habitId, isCompleted) => {
        setIsMarking(true);
        const formattedDate = getFormattedDate(day, month, year);

        try {
            const completionsRef = collection(db, "completions");
            const q = query(
                completionsRef, 
                where("userId", "==", user.uid),
                where("habitId", "==", habitId),
                where("date", "==", formattedDate)
            );
            
            const snapshot = await getDocs(q);
            const existingDoc = snapshot.docs[0];

            if (isCompleted) {
                // SE MARCAR (Cria o registro)
                if (!existingDoc) {
                    await setDoc(doc(completionsRef), { 
                        userId: user.uid,
                        habitId: habitId,
                        date: formattedDate,
                        completed: true,
                        markedAt: new Date(),
                    });
                }
            } else {
                // SE DESMARCAR (Remove o registro)
                if (existingDoc) {
                    await deleteDoc(existingDoc.ref);
                }
            }

            // === PONTO CRÍTICO DE CORREÇÃO ===
            // FORÇA A BUSCA COMPLETA NOVAMENTE PARA ATUALIZAR O ESTADO A PARTIR DO FIRESTORE
            await fetchHabitsAndCompletions(); 
            // =================================

        } catch (error) {
            console.error("Erro ao salvar o status de conclusão:", error);
            alert("Falha ao registrar a conclusão.");
        } finally {
            setIsMarking(false);
        }
    };

    // Função de clique que agora chama a persistência
    const toggleHabitCompletion = (id) => {
        const item = checklistItems.find(item => item.id === id);
        if (item) {
            saveCompletionStatus(id, !item.completed);
        }
    };


    // **********************************************
    // HOOKS
    // **********************************************

    // 1. Calcula o progresso toda vez que a checklist muda
    useEffect(() => {
        const completedCount = checklistItems.filter(item => item.completed).length;
        const totalCount = checklistItems.length;
        setProgress((totalCount > 0 ? (completedCount / totalCount) : 0) * 100);
    }, [checklistItems]); 

    // 2. Busca os dados sempre que o modal abre ou a data muda
    useEffect(() => {
        if (isOpen && day !== null) {
            fetchHabitsAndCompletions(); 
        }
    }, [isOpen, day, month, year, fetchHabitsAndCompletions]); // Dependência atualizada

    // **********************************************
    // RENDERIZAÇÃO
    // **********************************************
    if (!isOpen || day === null) return null; 

    const fullDate = new Date(year, month - 1, day);
    const dayName = fullDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
    
    const checkIcon = '✓'; 

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="checklist-header">
                    <p className="checklist-day">{dayName.charAt(0).toUpperCase() + dayName.slice(1)}</p>
                    <h2 className="checklist-date">{formattedDate}</h2>
                    
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="checklist-body">
                    {loading || isMarking ? (
                        <p style={{ color: '#ccc', textAlign: 'center' }}>{isMarking ? 'Salvando marcação...' : 'Carregando hábitos...'}</p>
                    ) : checklistItems.length === 0 ? (
                        <p style={{ color: '#ccc', textAlign: 'center' }}>Nenhum hábito marcado para este dia!</p>
                    ) : (
                        checklistItems.map(item => (
                            <div 
                                key={item.id} 
                                className={`checklist-item ${item.completed ? 'completed' : ''}`}
                                onClick={() => !isMarking && toggleHabitCompletion(item.id)}
                            >
                                <label className="checklist-checkbox">
                                    <span className="checklist-checkbox-icon">{checkIcon}</span>
                                </label>
                                <span className="checklist-item-text">{item.name}</span>
                            </div>
                        ))
                    )}
                </div>

                <button className="modal-close-button" onClick={onClose}>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default DailyHabitChecklistModal;