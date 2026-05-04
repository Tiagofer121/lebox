// 🔥 IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 CONFIG (PEGÁ LA TUYA)
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

// 🔥 INICIALIZAR FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔁 CAMBIO DE CARDS (LOGIN / REGISTER)
window.showRegister = function() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("registerCard").style.display = "block";
};

window.showLogin = function() {
  document.getElementById("registerCard").style.display = "none";
  document.getElementById("loginCard").style.display = "block";
};

// 🔐 REGISTRO
window.register = function() {
  const email = document.getElementById("emailRegister").value;
  const password = document.getElementById("passwordRegister").value;

  if (!email || !password) {
    alert("Completá los campos");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "home.html";
    })
    .catch(err => alert(err.message));
};

// 🔐 LOGIN
window.login = function() {
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;

  if (!email || !password) {
    alert("Completá los campos");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "../inicio.html";
    })
    .catch(err => alert(err.message));
};
