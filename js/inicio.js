// IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore, collection, addDoc, getDocs } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CONFIG (TU CONFIG REAL)
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

// INICIALIZAR
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 PROTEGER LA PÁGINA
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// 🚪 LOGOUT
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// 📝 CREAR POST
window.crearPost = async function() {
  const texto = document.getElementById("postText").value;

  if (!texto) return alert("Escribí algo");

  await addDoc(collection(db, "posts"), {
    texto: texto,
    fecha: Date.now(),
    user: auth.currentUser.email
  });

  document.getElementById("postText").value = "";

  cargarPosts();
};

// 📱 MOSTRAR POSTS
async function cargarPosts() {
  const querySnapshot = await getDocs(collection(db, "posts"));
  const feed = document.getElementById("feed");

  feed.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    feed.innerHTML += `
      <div style="border:1px solid white; margin:10px; padding:10px;">
        <p>${data.texto}</p>
        <small>${data.user}</small>
      </div>
    `;
  });
}

// 🔄 CARGAR AL ENTRAR
cargarPosts();