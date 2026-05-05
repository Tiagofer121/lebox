// 🔥 IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 CONFIG (PONÉ LA TUYA)
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🧠 USERNAME GLOBAL
let username = "";

// 🔐 AUTH + USERNAME
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    username = docSnap.data().username;
  }

  startFeed();
});

// 🚪 LOGOUT
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "../index.html";
  });
};

// 📝 CREAR POST
window.crearPost = async function() {
  const texto = document.getElementById("postText").value;

  if (!texto) return alert("Escribí algo");
  if (!username) return alert("Cargando usuario...");

  await addDoc(collection(db, "posts"), {
    texto: texto,
    user: username,
    fecha: Date.now()
  });

  document.getElementById("postText").value = "";
};

// 📡 FEED EN TIEMPO REAL
function startFeed() {
  const q = query(
    collection(db, "posts"),
    orderBy("fecha", "desc")
  );

  onSnapshot(q, (snapshot) => {
    const feed = document.getElementById("feed");

    feed.innerHTML = "";

    snapshot.forEach((docu) => {
      const data = docu.data();

      const fecha = new Date(data.fecha);
      const fechaTexto = fecha.toLocaleString();

      feed.innerHTML += `
        <div class="post">
          <h4>@${data.user}</h4>
          <p>${data.texto}</p>
          <small>${fechaTexto}</small>
        </div>
      `;
    });
  });
}
