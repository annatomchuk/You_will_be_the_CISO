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
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Елементи інтерфейсу в index.html
const googleLoginBtn = document.getElementById('google-login-btn');
const userGreeting = document.getElementById('user-greeting');

// 4. Логіка кліку на кнопку входу/виходу через Google
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        // Якщо користувач уже залогінений — робимо вихід (Sign Out)
        if (auth.currentUser) {
            try {
                await signOut(auth);
                console.log("✅ Користувач вийшов із системи");
            } catch (error) {
                console.error("❌ Помилка виходу:", error);
            }
            return;
        }

        // Інакше — відкриваємо вікно входу через Google (Popup)
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("✅ Успішний вхід:", result.user.email);
        } catch (error) {
            console.error("❌ Помилка входу через Google:", error);
            alert("Не вдалося увійти: " + error.message);
        }
    });
}

// 5. Відстеження стану авторизації (AuthStateChanged)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Користувач увійшов
        if (userGreeting) {
            userGreeting.innerText = user.email;
        }
        if (googleLoginBtn) {
            googleLoginBtn.title = "Натисніть, щоб вийти";
        }

        // Оновлюємо ім'я у профілі на основі пошти або Google Display Name
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
                    // Зливаємо хмарні дані з локальними
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
        // Користувач не залогінений
        if (userGreeting) {
            userGreeting.innerText = "Увійти через Google";
        }
        if (googleLoginBtn) {
            googleLoginBtn.title = "";
        }
        console.log("🔒 Користувач не авторизований.");
    }
});

// 6. Глобальна функція автоматичної синхронізації (викликається з вашого index.html при кожній зміні стану)
window.saveGameToCloud = async function() {
    const user = auth.currentUser;
    if (!user) return; // Якщо не залогінений — граємо просто в локалсторіджі

    try {
        const userDocRef = doc(db, "users_progress", user.uid);
        const dataToSave = {
            email: user.email,
            lastUpdated: new Date().toISOString(),
            appState: window.appState // Зберігаємо весь об'єкт проходження тестів, симуляторів, детективу та фіналу
        };

        await setDoc(userDocRef, dataToSave, { merge: true });
        console.log("☁️ Прогрес і відповіді синхронізовані з Firestore!");
    } catch (error) {
        console.error("❌ Помилка хмарного збереження:", error);
    }
};
