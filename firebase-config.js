import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Substitua pelas suas chaves do Firebase (Instruções no documento Walkthrough)
const firebaseConfig = {
  apiKey: "AIzaSyDD1Pzr45VvADtpD_KBScCKfWmVZwgAp0I",
  authDomain: "nitgifts-loja.firebaseapp.com",
  projectId: "nitgifts-loja",
  storageBucket: "nitgifts-loja.firebasestorage.app",
  messagingSenderId: "960100020082",
  appId: "1:960100020082:web:45179ba87f364e8e6a37eb",
  measurementId: "G-SNRCKFZEWM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar instâncias para serem usadas em outros arquivos
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, getDoc };
