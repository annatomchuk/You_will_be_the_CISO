import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, doc, setDoc, getDoc } from './firebase.js';

const loginBtn = document.getElementById('google-login-btn');
const greetingText = document.getElementById('user-greeting');

// 1. Клік на кнопку входу
loginBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Успішний вхід:", user.email);
  } catch (error) {
    console.error("Помилка входу:", error.message);
  }
});

// 2. Відстеження: чи залогінений користувач зараз
onAuthStateChanged(auth, async (user) => {
  if (user) {
    greetingText.innerText = `Вітаю, ${user.displayName || user.email}!`;
    loginBtn.style.display = 'none'; // Ховаємо кнопку входу, коли вже зайшли
    
    // Завантажуємо збереження гравця з бази Firestore
    await loadGameData(user.uid);
  } else {
    greetingText.innerText = "";
    loginBtn.style.display = 'inline-block';
  }
});

// 3. Функція збереження гри (викликайте її при зміні бюджету чи модулю)
window.saveGameProgress = async function(currentModule, budget, decisions) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await setDoc(doc(db, "game_saves", user.uid), {
      email: user.email,
      name: user.displayName,
      currentModule: currentModule,
      budget: budget,
      decisions: decisions,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log("Прогрес успішно синхронізовано з Firebase Firestore!");
  } catch (error) {
    console.error("Помилка збереження в базу:", error);
  }
};

// 4. Функція завантаження гри
async function loadGameData(userId) {
  try {
    const docSnap = await getDoc(doc(db, "game_saves", userId));

    if (docSnap.exists()) {
      const savedData = docSnap.data();
      console.log("Збереження знайдено:", savedData);
      
      // ТУТ ОНОВЛЮЄТЕ ЗМІННІ У ВАШІЙ ГРІ:
      // window.game.budget = savedData.budget;
      // window.game.currentModule = savedData.currentModule;
    } else {
      console.log("Новий користувач, збережень ще немає.");
    }
  } catch (error) {
    console.error("Помилка завантаження:", error);
  }
}
