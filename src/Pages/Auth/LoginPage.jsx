// src/Pages/Auth/LoginPage.jsx

import React, { useState } from 'react'; // REMOVIDO useEffect
import { useNavigate, Link } from 'react-router-dom';
import PrimaryButton from '../../Components/Auth/PrimaryButton';
import LavenderInput from '../../Components/Auth/LavenderInput';
import '../../Components/AuthStyles.css'; 
import { 
    auth, 
    signInWithEmailAndPassword, 
    googleProvider,
    signInWithPopup // <-- Usar Pop-up
    // REMOVIDO: signInWithRedirect, getRedirectResult
} from '../../firebaseConfig'; 
import RotinaProLogo from '../../assets/logo.png';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // REMOVIDO: O useEffect para checkRedirect (que usava getRedirectResult) foi removido.

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailPasswordLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            navigate('/home'); 
        } catch (firebaseError) {
            console.error("Erro no Login:", firebaseError);
            if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
                setError('Credenciais inválidas. Verifique seu email e senha.');
            } else {
                setError('Erro ao fazer login. Tente novamente.');
            }
        }
    };

    // FUNÇÃO POP-UP RESTAURADA
    const handleGoogleLogin = async () => {
        setError('');
        try {
            // Usa o método de Pop-up
            await signInWithPopup(auth, googleProvider); 
            navigate('/home'); 
        } catch (firebaseError) {
            // Captura erros específicos do pop-up
            if (firebaseError.code !== 'auth/popup-closed-by-user') {
                console.error("Erro no Google Login:", firebaseError);
                setError('Erro ao fazer login com Google. Verifique se pop-ups estão bloqueados.');
            }
        }
    };

    return (
        <div className="auth-container">
            <img src={RotinaProLogo} alt="Logo Rotina PRO" className='logo-image'/>
            <h2 className="welcome-title">Bem-vindo de volta!</h2>
            <p className="welcome-text-small">Faça o login para continuar</p>

            <form onSubmit={handleEmailPasswordLogin} className="auth-form">
                <LavenderInput 
                    label="Email" id="email" name="email" value={formData.email} 
                    onChange={handleChange} placeholder="Seu email" required
                />
                <LavenderInput 
                    label="Senha" id="password" name="password" type="password" 
                    value={formData.password} onChange={handleChange} placeholder="Sua senha secreta" required
                />

                <div className="login-options">
                    <label>
                        <input type="checkbox" /> Lembre de mim
                    </label>
                    <Link to="#" className="link-text">Esqueceu a senha?</Link>
                </div>
                
                {error && <p className="error-text" style={{color: 'red', textAlign: 'center', width: '100%'}}>{error}</p>}

                <PrimaryButton type="submit">
                    Login
                </PrimaryButton>
            </form>
            
            <div className="social-login" style={{marginTop: '30px'}}>
                <p>Ou entre usando sua conta Google</p>
                <div className="google-icon-wrapper" onClick={handleGoogleLogin} style={{cursor: 'pointer'}}>
                    <span className="google-icon">G</span>
                </div>
            </div>

            <div className="no-account">
                <p>Não tem uma conta? <Link to="/cadastro" className="link-text">Cadastre-se</Link></p>
            </div>
        </div>
    );
};

export default LoginPage;