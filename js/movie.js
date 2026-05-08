// FIREBASE
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// OBTENER ID
function obtenerId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// CONFIG TMDB
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL = "https://api.themoviedb.org/3";

// ESTADO
let currentMovie = null;
let trailerKey = null;
let selectedRating = 0;
const movieId = obtenerId();


// ============================================================
// SKELETON: ocultar skeleton y mostrar contenido
// ============================================================
function mostrarContenido() {
  document.getElementById("skeleton").style.display = "none";
  document.getElementById("main-content").style.display = "block";
}


// ============================================================
// CARGAR PELÍCULA (datos + créditos + videos + providers + similares)
// ============================================================
async function cargarPelicula(id) {
  try {

    const [resMovie, resCredits, resVideos, resProviders, resSimilares] =
      await Promise.all([
        fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`),
        fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`),
        fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=es-ES&page=1`)
      ]);

    const movie      = await resMovie.json();
    const credits    = await resCredits.json();
    const videos     = await resVideos.json();
    const providers  = await resProviders.json();
    const similares  = await resSimilares.json();

    currentMovie = movie;

    // TRAILER
    const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube")
      || videos.results.find(v => v.site === "YouTube");
    if (trailer) {
      trailerKey = trailer.key;
    } else {
      document.querySelector(".trailer")?.remove();
    }

    // MOSTRAR
    mostrarPelicula(movie, credits);
    mostrarProviders(providers.results);
    mostrarSimilares(similares.results);
    mostrarContenido();

  } catch (error) {
    console.error(error);
    mostrarContenido(); // mostrar igual para no quedarse en skeleton
  }
}


// ============================================================
// MOSTRAR PELÍCULA
// ============================================================
function mostrarPelicula(movie, credits) {

  document.getElementById("movie-title").textContent    = movie.title;
  document.getElementById("movie-overview").textContent = movie.overview;
  document.getElementById("movie-poster").src  = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  document.getElementById("movie-banner").src  = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;

  // AÑO
  document.getElementById("movie-year").textContent =
    movie.release_date ? movie.release_date.split("-")[0] : "—";

  // DURACIÓN
  if (movie.runtime) {
    const h = Math.floor(movie.runtime / 60);
    const m = movie.runtime % 60;
    document.getElementById("movie-runtime").textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // DIRECTOR
  const director = credits.crew.find(p => p.job === "Director");
  document.getElementById("movie-director").textContent = director ? director.name : "—";

  // GÉNEROS
  const genresEl = document.getElementById("movie-genres");
  genresEl.innerHTML = "";
  movie.genres.forEach(g => {
    const p = document.createElement("p");
    p.textContent = g.name;
    genresEl.appendChild(p);
  });

  // RATING TMDB
  document.getElementById("movie-rating").textContent = `${movie.vote_average.toFixed(1)}/10`;
}


// ============================================================
// STREAMING PROVIDERS
// ============================================================
function mostrarProviders(results) {
  // Intentar con AR (Argentina) primero, luego ES, luego US
  const regionData = results?.AR || results?.ES || results?.US;
  const flatrate = regionData?.flatrate;

  if (!flatrate || flatrate.length === 0) return;

  const section = document.getElementById("streaming-section");
  const container = document.getElementById("streaming-providers");
  section.style.display = "block";

  flatrate.slice(0, 6).forEach(p => {
    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/w92${p.logo_path}`;
    img.alt = p.provider_name;
    img.title = p.provider_name;
    img.classList.add("provider-logo");
    container.appendChild(img);
  });
}


// ============================================================
// PELÍCULAS SIMILARES
// ============================================================
function mostrarSimilares(results) {
  if (!results || results.length === 0) return;

  const section    = document.getElementById("similares-section");
  const container  = document.getElementById("similares-container");
  section.style.display = "block";

  results.slice(0, 15).forEach(movie => {
    if (!movie.poster_path) return;

    const card = document.createElement("div");
    card.classList.add("similar-card");
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w185${movie.poster_path}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;
    card.addEventListener("click", () => {
      window.location.href = `movie.html?id=${movie.id}`;
    });
    container.appendChild(card);
  });
}


// ============================================================
// WATCHLIST (localStorage)
// ============================================================
function iniciarWatchlist() {
  const btnQuiero = document.getElementById("btn-quiero-ver");
  const btnVi     = document.getElementById("btn-ya-vi");

  const quiero = JSON.parse(localStorage.getItem("quiero_ver") || "[]");
  const vi     = JSON.parse(localStorage.getItem("ya_vi") || "[]");

  if (quiero.includes(movieId)) btnQuiero.classList.add("activo-quiero");
  if (vi.includes(movieId))     btnVi.classList.add("activo-visto");

  btnQuiero.addEventListener("click", () => {
    const lista = JSON.parse(localStorage.getItem("quiero_ver") || "[]");
    const idx = lista.indexOf(movieId);
    if (idx === -1) {
      lista.push(movieId);
      btnQuiero.classList.add("activo-quiero");
      mostrarToast("Agregada a tu lista 👁");
    } else {
      lista.splice(idx, 1);
      btnQuiero.classList.remove("activo-quiero");
    }
    localStorage.setItem("quiero_ver", JSON.stringify(lista));
  });

  btnVi.addEventListener("click", () => {
    const lista = JSON.parse(localStorage.getItem("ya_vi") || "[]");
    const idx = lista.indexOf(movieId);
    if (idx === -1) {
      lista.push(movieId);
      btnVi.classList.add("activo-visto");
      mostrarToast("Marcada como vista ✓");
    } else {
      lista.splice(idx, 1);
      btnVi.classList.remove("activo-visto");
    }
    localStorage.setItem("ya_vi", JSON.stringify(lista));
  });
}


// ============================================================
// RATING COMUNIDAD (promedio de posts de Firebase)
// ============================================================
async function cargarRatingComunidad() {
  try {
    const q = query(
      collection(db, "posts"),
      where("movieId", "==", movieId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const ratings = snapshot.docs.map(d => d.data().rating).filter(Boolean);
    if (ratings.length === 0) return;

    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    document.getElementById("community-rating").textContent = `${avg.toFixed(1)}/7`;
  } catch (e) {
    console.error(e);
  }
}


// ============================================================
// TOAST
// ============================================================
function mostrarToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.classList.add("toast");
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2500);
}


// ============================================================
// CARGAR POSTS
// ============================================================
function cargarPosts() {
  const postsContainer = document.querySelector(".community-posts");
  const postsRef = collection(db, "posts");

  const q = query(
    postsRef,
    where("movieId", "==", movieId),
    orderBy("fecha", "desc")
  );

  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";

    // CONTADOR EN TAB
    const countEl = document.getElementById("count-posts");
    if (countEl) countEl.textContent = snapshot.docs.length > 0 ? snapshot.docs.length : "";

    snapshot.docs.forEach(doc => {
      const post = doc.data();

      // ESTRELLAS
      let starsHTML = "";
      for (let i = 1; i <= 7; i++) {
        starsHTML += i <= post.rating ? "★" : "";
      }

      let textoPost = post.texto;
      let isHidden  = post.spoiler;

      if (post.spoiler) textoPost = "⚠ Spoiler — tocar para revelar";

      const postDiv = document.createElement("div");
      postDiv.classList.add("post");
      postDiv.innerHTML = `
        <div class="div-post-user-estrellas">
          <h3 class="usuario-post">@${post.user}</h3>
          <p class="estrellas">${starsHTML}</p>
        </div>
        <p class="post-text">${textoPost}</p>
      `;

      if (post.spoiler) {
        const postText = postDiv.querySelector(".post-text");
        postText.addEventListener("click", () => {
          if (isHidden) {
            postText.textContent = post.texto;
            isHidden = false;
          }
        });
      }

      postsContainer.appendChild(postDiv);
    });
  });
}


// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  if (!movieId) return;

  cargarPelicula(movieId);
  cargarPosts();
  cargarRatingComunidad();
  iniciarWatchlist();

  // TRAILER
  document.getElementById("trailer-btn").addEventListener("click", () => {
    if (!trailerKey) return;
    const container = document.getElementById("trailer-container");
    container.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${trailerKey}?autoplay=1`;
    iframe.width = "100%";
    iframe.height = "400";
    iframe.allowFullscreen = true;
    iframe.allow = "autoplay; encrypted-media";
    container.appendChild(iframe);
  });

  // DESCRIPCIÓN — leer más
  const descripcion = document.querySelector(".descripcion");
  const leerMasBtn  = document.querySelector(".leer-mas-btn");
  let abierta = false;

  descripcion.addEventListener("click", () => {
    if (!abierta) {
      descripcion.style.maxHeight = descripcion.scrollHeight + "px";
      if (leerMasBtn) leerMasBtn.textContent = "Leer menos ↑";
      abierta = true;
    } else {
      descripcion.style.maxHeight = "92px";
      if (leerMasBtn) leerMasBtn.textContent = "Leer más ↓";
      abierta = false;
    }
  });

  // TABS
  const buttons = document.querySelectorAll(".tab-btn");
  const pages   = document.querySelectorAll(".tab-page");

  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      pages.forEach(p => p.style.display = "none");
      pages[index].style.display = "block";
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // ESTRELLAS
  const stars = document.querySelectorAll(".star");
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      stars.forEach(s => {
        s.classList.toggle("active", Number(s.dataset.value) <= selectedRating);
      });
    });
  });

  // PUBLICAR POST
  const publishBtn = document.getElementById("publish-post-btn");
  const postText   = document.getElementById("post-text");

  publishBtn.addEventListener("click", async () => {
    const texto = postText.value.trim();
    if (!texto || selectedRating === 0) return;

    try {
      const username = localStorage.getItem("username");

      await addDoc(collection(db, "posts"), {
        texto,
        rating: selectedRating,
        spoiler: isSpoiler,
        user: username,
        movieId,
        movieTitle: currentMovie.title,
        moviePoster: currentMovie.poster_path,
        fecha: Date.now()
      });

      postText.value = "";
      selectedRating = 0;
      stars.forEach(s => s.classList.remove("active"));

      // Mostrar tu nota en el chip
      document.getElementById("tu-rating").textContent = `${selectedRating}/7`;

      mostrarToast("Post publicado ✓");

    } catch (error) {
      console.error(error);
    }
  });

  // COMPARTIR
  document.getElementById("share-btn").addEventListener("click", () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: currentMovie?.title || "Película", url });
    } else {
      navigator.clipboard.writeText(url).then(() => mostrarToast("Link copiado 🔗"));
    }
  });

});

// SPOILER
const spoilerBtn = document.getElementById("spoiler-btn");
let isSpoiler = false;

spoilerBtn.addEventListener("click", () => {
  isSpoiler = !isSpoiler;
  spoilerBtn.classList.toggle("activo-boton-spoiler");
});
