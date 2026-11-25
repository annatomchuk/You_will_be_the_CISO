// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoBR31Tu-ZJeMMRBQ_5Jk0sogBef4aOQo",
  authDomain: "you-will-be-the-ciso.firebaseapp.com",
  projectId: "you-will-be-the-ciso",
  storageBucket: "you-will-be-the-ciso.firebasestorage.app",
  messagingSenderId: "378201094782",
  appId: "1:378201094782:web:a7cbec1ae7c75930b5362f",
  measurementId: "G-NQQTTRJ6BR"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Експортуємо методи, щоб зручно викликати в інших файлах
export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };
