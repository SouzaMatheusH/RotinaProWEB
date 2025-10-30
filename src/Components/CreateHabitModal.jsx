// src/Components/CreateHabitModal.jsx

import React, { useState } from 'react';
import './HabitModalStyle.css';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const WEEK_DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// Função para salvar o novo hábito na COLEÇÃO RAIZ 'habits'
const saveNewHabit = async (habitData) => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Usuário não autenticado.");
    }

    try {
        // Referencia a COLEÇÃO RAIZ "habits"
        const habitsCollectionRef = collection(db, "habits");

        // 'addDoc' cria um novo documento na coleção 'habits'
        await addDoc(habitsCollectionRef, {
            // CAMPO DE VÍNCULO: O UID é adicionado ao documento
            userId: user.uid,

            name: habitData.commitment,
            recurrence: habitData.recurrence,
            createdAt: serverTimestamp(),
            lastMarked: null,
            streak: 0,
        });

        return true;

    } catch (error) {
        console.error("Erro ao salvar o novo hábito na coleção raiz:", error);
        throw new Error("Falha ao salvar o hábito. Verifique as regras de segurança do Firestore (coleção 'habits').");
    }
};

const CreateHabitModal = ({ isOpen, onClose, onHabitAdded }) => {
    // Estado para o formulário
    const [commitment, setCommitment] = useState('');
    const [recurrence, setRecurrence] = useState([1, 2, 3, 4, 5]); // Segunda a Sexta por padrão
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // Lógica para marcar/desmarcar o dia
    const toggleDayRecurrence = (dayIndex) => {
        setRecurrence(prevRecurrence =>
            prevRecurrence.includes(dayIndex)
                ? prevRecurrence.filter(i => i !== dayIndex)
                : [...prevRecurrence, dayIndex].sort((a, b) => a - b)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!commitment.trim()) {
            setError("O comprometimento é obrigatório.");
            return;
        }
        if (recurrence.length === 0) {
            setError("Selecione pelo menos um dia de recorrência.");
            return;
        }

        setLoading(true);
        try {
            await saveNewHabit({ commitment, recurrence });

            setCommitment('');
            setRecurrence([1, 2, 3, 4, 5]);
            onHabitAdded();
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>
                    &times;
                </button>
                <h2 className="modal-title">Criar hábito</h2>

                <form onSubmit={handleSubmit}>
                    <label className="modal-label">Qual seu comprometimento?</label>
                    <input
                        className="modal-input"
                        type="text"
                        placeholder="Exercícios, dormir bem, etc..."
                        value={commitment}
                        onChange={(e) => setCommitment(e.target.value)}
                        disabled={loading}
                    />

                    <label className="modal-label">Qual a recorrência?</label>
                    {WEEK_DAYS.map((day, index) => (
                        <div key={index} className="recurrence-item">
                            {/* O LABEL SERVE COMO O BOTÃO RETANGULAR GRANDE */}
                            <label htmlFor={`day-${index}`} 
                                   className={`recurrence-label ${recurrence.includes(index) ? 'checked-bg' : ''}`}
                                   onClick={(e) => {
                                       e.preventDefault(); // Impede o clique duplo
                                       toggleDayRecurrence(index);
                                   }}
                                   > 
                                {/* INPUT REAL (ESCONDIDO) */}
                                <input
                                    type="checkbox"
                                    id={`day-${index}`}
                                    checked={recurrence.includes(index)}
                                    onChange={() => toggleDayRecurrence(index)}
                                    disabled={loading}
                                />
                                
                                {/* CONTEÚDO VISÍVEL DO BOTÃO */}
                                <span className="recurrence-icon-box">
                                    <span className="custom-check-icon">✓</span>
                                </span>
                                
                                <span className="recurrence-day-text">{day}</span>
                            </label>
                        </div>
                    ))}

                    {error && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '15px' }}>{error}</p>}

                    <button
                        type="submit"
                        className="modal-confirm-button"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : '✓ Confirmar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateHabitModal;