// 1. Імпорти з Firebase SDK (версія 10.8.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Ваша конфігурація Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDoBR31Tu-ZJeMMRBQ_5Jk0sogBef4aOQo",
    authDomain: "you-will-be-the-ciso.firebaseapp.com",
    projectId: "you-will-be-the-ciso",
    storageBucket: "you-will-be-the-ciso.firebasestorage.app",
    messagingSenderId: "378201094782",
    appId: "1:378201094782:web:a7cbec1ae7c75930b5362f",
    measurementId: "G-NQQTTRJ6BR"
};

// 3. Ініціалізація додатку та сервісів
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Елементи інтерфейсу в index.html (використовуємо обертку для безпеки, якщо DOM ще не завантажився)
document.addEventListener("DOMContentLoaded", () => {
    const googleLoginBtn = document.getElementById('google-login-btn');
    const userGreeting = document.getElementById('user-greeting');

    // 4. Логіка кліку на кнопку входу/виходу через Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            if (auth.currentUser) {
                try {
                    await signOut(auth);
                    console.log("✅ Користувач вийшов із системи");
                } catch (error) {
                    console.error("❌ Помилка виходу:", error);
                }
                return;
            }

            try {
                const result = await signInWithPopup(auth, googleProvider);
                console.log("✅ Успішний вхід:", result.user.email);
            } catch (error) {
                console.error("❌ Помилка входу через Google:", error);
                alert("Не вдалося увійти: " + error.message);
            }
        });
    }
});

// 5. Відстеження стану авторизації (AuthStateChanged)
onAuthStateChanged(auth, async (user) => {
    const userGreeting = document.getElementById('user-greeting');
    const googleLoginBtn = document.getElementById('google-login-btn');

    if (user) {
        if (userGreeting) {
            userGreeting.innerText = user.email;
        }
        if (googleLoginBtn) {
            googleLoginBtn.title = "Натисніть, щоб вийти";
        }

        if (typeof window.appState !== 'undefined') {
            window.appState.profile.name = user.displayName || user.email.split('@')[0];
            if (typeof window.saveState === 'function') {
                window.saveState();
            }
        }

        // Завантажуємо збережений прогрес з Firestore
        try {
            const userDocRef = doc(db, "users_progress", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const cloudData = docSnap.data();
                if (cloudData.appState && typeof window.appState !== 'undefined') {
                    window.appState = { ...window.appState, ...cloudData.appState };
                    if (typeof window.saveState === 'function') {
                        window.saveState();
                    }
                    if (typeof window.switchModule === 'function') {
                        window.switchModule(window.appState.currentModuleId || 1);
                    }
                    console.log("📂 Прогрес успішно завантажено з Firestore!");
                }
            }
        } catch (error) {
            console.error("❌ Помилка завантаження прогресу з бази:", error);
        }

    } else {
        if (userGreeting) {
            userGreeting.innerText = "Увійти через Google";
        }
        if (googleLoginBtn) {
            googleLoginBtn.title = "";
        }
        console.log("🔒 Користувач не авторизований.");
    }
});

// 6. Глобальна функція автоматичної синхронізації з хмарою
// 6. Глобальна функція автоматичної синхронізації з хмарою (виправлена)
window.saveGameToCloud = async function() {
    // Перевіряємо, чи є залогінений користувач і чи ініціалізований appState
    if (!auth || !auth.currentUser) return;
    if (typeof window.appState === 'undefined' || !window.appState) return;

    const user = auth.currentUser;

    try {
        const userDocRef = doc(db, "users_progress", user.uid);
        
        // Очищаємо об'єкт від можливих undefined значень, які лякають Firestore
        const cleanState = JSON.parse(JSON.stringify(window.appState));

        const dataToSave = {
            email: user.email,
            studentName: cleanState.profile?.name || user.displayName || user.email.split('@')[0],
            lastUpdated: new Date().toISOString(),
            appState: cleanState
        };

        await setDoc(userDocRef, dataToSave, { merge: true });
        console.log("☁️ Прогрес успішно синхронізовано з Firestore без помилок!");
    } catch (error) {
        console.error("❌ Помилка хмарного збереження:", error);
    }
};
