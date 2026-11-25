import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Ваша конфігурація Firebase для проєкту you-will-be-the-ciso
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
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Елементи інтерфейсу для входу
const googleLoginBtn = document.getElementById('google-login-btn');
const userGreeting = document.getElementById('user-greeting');

// Обробник кліку на кнопку входу через Google
googleLoginBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Успішний вхід:", user.email);
  } catch (error) {
    console.error("Помилка входу через Google:", error.message);
  }
});

// Відстеження стану сесії користувача
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Користувач увійшов
    userGreeting.innerText = user.displayName ? user.displayName.split(' ')[0] : user.email;
    googleLoginBtn.title = `Авторизовано як ${user.email}`;
    
    // Підтягуємо збереження користувача з Firestore у ваш локальний стейт
    await loadGameFromCloud(user.uid);
  } else {
    // Користувач не ввійшов
    userGreeting.innerText = "Увійти через Google";
  }
});

// Функція збереження прогресу в хмару (викликається разом із saveState)
async function saveGameToCloud() {
  const user = auth.currentUser;
  if (!user) return; // Якщо не залогінений — зберігаємо тільки в localStorage

  try {
    await setDoc(doc(db, "game_saves", user.uid), {
      email: user.email,
      name: user.displayName,
      appState: appState, // ваш загальний об'єкт стану платформи
      updatedAt: new Date()
    }, { merge: true });
    
    console.log("Прогрес успішно синхронізовано з Firebase Firestore!");
  } catch (error) {
    console.error("Помилка збереження в хмару:", error);
  }
}

// Функція завантаження прогресу з хмари
async function loadGameFromCloud(userId) {
  try {
    const docRef = doc(db, "game_saves", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.appState) {
        appState = { ...appState, ...data.appState };
        saveState(); // оновлюємо локалсторідж і рендеримо інтерфейс
        renderSidebar();
        renderModuleContent();
        console.log("Прогрес завантажено з хмари Firebase!");
      }
    } else {
      console.log("У цього користувача ще немає хмарних збережень.");
    }
  } catch (error) {
    console.error("Помилка завантаження з хмари:", error);
  }
}
