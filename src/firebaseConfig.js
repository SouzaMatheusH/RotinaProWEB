// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,    // <-- Manter Pop-up
    signOut,
    onAuthStateChanged
    // Removido: getRedirectResult, signInWithRedirect
} from "firebase/auth";
import { 
    getFirestore,
    doc,
    setDoc,
    collection, 
    query, 
    getDocs,
    where,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore"; 

// Credenciais do usuário (Mantidas)
const firebaseConfig = {
    apiKey: "AIzaSyB6uFEcx-cJwzD8tVkHcHPLUho9HirKsGo",
    authDomain: "autenticacao-189e7.firebaseapp.com",
    projectId: "autenticacao-189e7",
    storageBucket: "autenticacao-189e7.firebasestorage.app",
    messagingSenderId: "934347804663",
    appId: "1:934347804663:web:8c7a335b96c3c1aa7b28f2"
};

// 1. Inicializa o Firebase App
const app = initializeApp(firebaseConfig);

// 2. Inicializa e EXPORTA o serviço de autenticação
export const auth = getAuth(app); 

// 3. Inicializa e EXPORTA o serviço do Firestore
export const db = getFirestore(app); 

// 4. Inicializa e EXPORTA o provedor do Google
export const googleProvider = new GoogleAuthProvider();

// 5. Exporta os métodos para uso nas Páginas
export { 
    // Métodos do Firebase Auth
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup, // <-- Exportado
    signOut,
    onAuthStateChanged,
    
    // Métodos do Firestore
    doc,
    setDoc,
    collection, 
    query, 
    getDocs,
    where,
    deleteDoc,
    serverTimestamp
};