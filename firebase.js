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

// ==========================================
// ФУНКЦІЇ ЗБЕРЕЖЕННЯ ТА ЗАВАНТАЖЕННЯ ПРОГРЕСУ
// ==========================================

/**
 * Зберігає прогрес користувача (відповіді та бали) у Firestore.
 * Кожен користувач має свій документ у колекції "users_progress" за його унікальним `uid`.
 */
export async function saveUserProgress(quizId, userAnswers, score, isCompleted = false) {
    const user = auth.currentUser;
    
    if (!user) {
        console.warn("Користувач не авторизований. Прогрес не збережено у базі.");
        return;
    }

    try {
        const userDocRef = doc(db, "users_progress", user.uid);
        
        const progressData = {
            email: user.email,
            lastUpdated: new Date().toISOString(),
            [`quizzes.${quizId}`]: {
                answers: userAnswers,   // Об'єкт із відповідями (наприклад: { q1: { selected: "A", correct: true } })
                score: score,           // Бали
                completed: isCompleted  // Чи завершено модуль/гру
            }
        };

        // Використовуємо merge: true, щоб оновлювати тільки конкретний квіз, не стираючи інші дані
        await setDoc(userDocRef, progressData, { merge: true });
        console.log("Прогрес успішно збережено у Firestore!");
        
    } catch (error) {
        console.error("Помилка при збереженні прогресу: ", error);
    }
}

/**
 * Завантажує збережений прогрес користувача з Firestore при вході на сайт або оновленні сторінки.
 */
export async function loadUserProgress(quizId) {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const userDocRef = doc(db, "users_progress", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.quizzes && data.quizzes[quizId]) {
                console.log("Знайдено збережений прогрес у базі:", data.quizzes[quizId]);
                return data.quizzes[quizId]; // Повертає об'єкт { answers, score, completed }
            }
        }
        return null;
    } catch (error) {
        console.error("Помилка завантаження прогресу: ", error);
        return null;
    }
}

// Експортуємо також базові інструменти Firebase для зручності
export { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };
