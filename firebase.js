import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDoBR31Tu-ZJeMMRBQ_5Jk0sogBef4aOQo",
    authDomain: "you-will-be-the-ciso.firebaseapp.com",
    projectId: "you-will-be-the-ciso",
    storageBucket: "you-will-be-the-ciso.firebasestorage.app",
    messagingSenderId: "378201094782",
    appId: "1:378201094782:web:a7cbec1ae7c75930b5362f",
    measurementId: "G-NQQTTRJ6BR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };