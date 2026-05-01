// 🔥 IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 CONFIG (poné la tuya real)
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

// 🔥 INICIALIZAR
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔁 CAMBIO DE CARDS (LO QUE YA TENÍAS)
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

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Cuenta creada"))
    .catch(err => alert(err.message));
};

// 🔐 LOGIN
window.login = function() {
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "../inicio.html";
    })
    .catch(err => alert(err.message));
};
