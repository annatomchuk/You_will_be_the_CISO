import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, doc, setDoc, getDoc } from './firebase.js';

const loginBtn = document.getElementById('google-login-btn');
const greetingText = document.getElementById('user-greeting');

// 1. Обробник кліку на кнопку входу через Google
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Успішний вхід:", user.email);
    } catch (error) {
      console.error("Помилка входу через Google:", error.message);
    }
  });
}

// 2. Відстеження сесії користувача
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Користувач увійшов: оновлюємо ім'я в шапці
    if (greetingText) {
      greetingText.innerText = user.displayName ? user.displayName.split(' ')[0] : user.email;
    }
    if (loginBtn) {
      loginBtn.title = `Авторизовано як ${user.email}`;
    }

    // Завантажуємо збереження з Firestore і оновлюємо інтерфейс гри
    await loadGameFromCloud(user.uid);
  } else {
    // Користувач не ввійшов
    if (greetingText) {
      greetingText.innerText = "Увійти через Google";
    }
    if (loginBtn) {
      loginBtn.style.display = 'flex';
      loginBtn.title = "";
    }
  }
});

// 3. Функція синхронізації (зберігає весь appState у Firebase Firestore)
window.saveGameToCloud = async function() {
  const user = auth.currentUser;
  if (!user) return; // Якщо не залогінений — гра просто зберігається в localStorage

  try {
    await setDoc(doc(db, "game_saves", user.uid), {
      email: user.email,
      name: user.displayName,
      appState: window.appState, // Беремо актуальний стан з index.html
      updatedAt: new Date()
    }, { merge: true });

    console.log("Прогрес успішно синхронізовано з Firebase Firestore!");
  } catch (error) {
    console.error("Помилка збереження в хмару:", error);
  }
};

// 4. Функція завантаження прогресу з хмари та оновлення інтерфейсу
async function loadGameFromCloud(userId) {
  try {
    const docRef = doc(db, "game_saves", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.appState && typeof window.appState !== 'undefined') {
        // Оновлюємо глобальний стейт сайту хмарними даними
        window.appState = { ...window.appState, ...data.appState };

        // Викликаємо функції рендерингу з index.html, щоб обновити екрани й сайдбар
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof window.renderSidebar === 'function') window.renderSidebar();
        if (typeof window.renderModuleContent === 'function') window.renderModuleContent();

        console.log("Прогрес успішно завантажено з хмари Firebase!");
      }
    } else {
      console.log("У цього користувача ще немає хмарних збережень.");
    }
  } catch (error) {
    console.error("Помилка завантаження з хмари:", error);
  }
}