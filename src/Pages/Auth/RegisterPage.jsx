// src/Pages/Auth/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PrimaryButton from '../../Components/Auth/PrimaryButton';
import LavenderInput from '../../Components/Auth/LavenderInput';
import '../../Components/AuthStyles.css';
import { 
    auth, 
    createUserWithEmailAndPassword, 
    db, 
    doc, 
    setDoc // Importação dos métodos do Firestore para salvar
} from '../../firebaseConfig'; 

const RegisterPage = () => {
  // Estado para coletar todos os dados do formulário
  const [formData, setFormData] = useState({
    nome: '', 
    email: '', 
    password: '', 
    telefone: '' // Dados adicionais para o Firestore
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true); // Inicia o carregamento

    try {
      // 1. CRIA O USUÁRIO NO FIREBASE AUTHENTICATION (usa apenas email e senha)
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      const user = userCredential.user;

      // 2. SALVA DADOS ADICIONAIS NO CLOUD FIRESTORE
      // Cria uma referência de documento na coleção 'users', usando o UID do Firebase Auth.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nomeCompleto: formData.nome, // Salva o Nome Completo
        email: formData.email,
        telefone: formData.telefone, // Salva o Telefone
        createdAt: new Date(),
        pontuacaoHabitos: 0,
      });
      
      // 3. Sucesso: Limpa o estado e navega.
      alert('Cadastro realizado com sucesso! Faça login.');
      navigate('/login');
      
    } catch (firebaseError) {
      console.error("Erro no Cadastro (Auth ou Firestore):", firebaseError);
      
      // Tratamento de erros de autenticação para o usuário
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('O email já está em uso. Tente fazer login.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        // Erro geral (inclui erros de Firestore ou regras de segurança)
        setError('Erro ao criar conta ou salvar dados. Verifique suas regras do Firestore.');
      }
    } finally {
        setLoading(false); // Finaliza o carregamento, mesmo em caso de erro
    }
  };

  return (
    <div className="auth-container">
      <h1 className="logo-text">ROTINA PRO</h1>
      <h2 className="welcome-title">Crie sua conta!</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <LavenderInput 
          label="Nome Completo" id="nome" name="nome" value={formData.nome} 
          onChange={handleChange} required 
        />
        <LavenderInput 
          label="Email" id="email" name="email" type="email" value={formData.email} 
          onChange={handleChange} required 
        />
        <LavenderInput 
          label="Senha" id="password" name="password" type="password" 
          value={formData.password} onChange={handleChange} required 
        />
        <LavenderInput 
          label="Telefone" id="telefone" name="telefone" type="tel" 
          value={formData.telefone} onChange={handleChange} placeholder="Opcional" 
        />
        
        {error && <p className="error-text" style={{color: 'red', marginTop: '10px'}}>{error}</p>}

        <PrimaryButton type="submit" className="margin-top-large" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastre-se'}
        </PrimaryButton>
      </form>
      
      <div className="no-account">
        <p>Já tem uma conta? <Link to="/login" className="link-text">Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;