// 1. Імпорти Firebase (працюють прямо у браузері через type="module")
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Ваші налаштування Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDoBR31Tu-ZJeMMRBQ_5Jk0sogBef4aOQo",
    authDomain: "you-will-be-the-ciso.firebaseapp.com",
    projectId: "you-will-be-the-ciso",
    storageBucket: "you-will-be-the-ciso.firebasestorage.app",
    messagingSenderId: "378201094782",
    appId: "1:378201094782:web:a7cbec1ae7c75930b5362f",
    measurementId: "G-NQQTTRJ6BR"
};

// 3. Ініціалізація
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


// ==========================================================
// 4. ФУНКЦІЯ ЗБЕРЕЖЕННЯ ПРОГРЕСУ В БАЗУ ДАНИХ (FIRESTORE)
// ==========================================================
async function saveUserProgress(quizId, userAnswers, score, isCompleted = false) {
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
                answers: userAnswers,   // Зберігає відповіді (правильні/неправильні)
                score: score,           // Набрані бали
                completed: isCompleted  // Чи пройдено тест
            }
        };

        await setDoc(userDocRef, progressData, { merge: true });
        console.log("✅ Прогрес успішно збережено у Firestore!");
        
    } catch (error) {
        console.error("❌ Помилка при збереженні прогресу: ", error);
    }
}


// ==========================================================
// 5. ЛОГІКА ВАШОЇ ГРИ / ТЕСТУ (ПРИКЛАД)
// ==========================================================

// Глобальний об'єкт для збору відповідей гравця
let playerGameData = {
    answers: {},
    score: 0
};

// Відстежуємо стан входу (уже працює у вас на сайті для показу пошти)
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Користувач увійшов:", user.email);
        // Тут можете оновити інтерфейс сайту (показати пошту, аватарку тощо)
    } else {
        console.log("Користувач вийшов або не ввійшов.");
    }
});

// Цю функцію ви викликаєте тоді, коли користувач клікає на відповідь у тестах
window.handleAnswerClick = async function(questionId, selectedOption, isCorrect) {
    
    // 1. Нараховуємо бали, якщо відповідь правильна
    if (isCorrect) {
        playerGameData.score += 10;
    }

    // 2. Записуємо відповідь у загальний об'єкт
    playerGameData.answers[questionId] = {
        selected: selectedOption,
        correct: isCorrect,
        timestamp: new Date().toISOString()
    };

    // 3. Зберігаємо все у Firebase в один клік!
    await saveUserProgress(
        "ciso_simulation_v1",       // ID вашого квізу/гри
        playerGameData.answers,     // Усі відповіді
        playerGameData.score,       // Поточні бали
        false                       // true, якщо це фінальне питання
    );
}
