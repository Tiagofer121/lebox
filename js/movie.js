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

// ============================================================
// ⏱ TIEMPO MÍNIMO DEL SKELETON (en milisegundos)
// Subilo si la API tarda más, bajalo si querés que sea más rápido
// ============================================================
const LOADING_MIN_MS = 500;

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
let trailerKey   = null;
let selectedRating = 0;
const movieId = obtenerId();


// ============================================================
// SKELETON: ocultar skeleton y mostrar contenido
// Espera LOADING_MIN_MS como mínimo antes de mostrar
// ============================================================
function mostrarContenido(tiempoInicio) {
  const transcurrido = Date.now() - tiempoInicio;
  const restante = Math.max(0, LOADING_MIN_MS - transcurrido);

  setTimeout(() => {
    const skeleton     = document.getElementById("skeleton");
    const mainContent  = document.getElementById("main-content");
    if (skeleton)    skeleton.style.display    = "none";
    if (mainContent) mainContent.style.display = "block";
  }, restante);
}


// ============================================================
// CARGAR PELÍCULA
// ============================================================
async function cargarPelicula(id, tiempoInicio) {
  try {

    const [resMovie, resCredits, resVideos, resProviders, resSimilares] =
      await Promise.all([
        fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`),
        fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`),
        fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=es-ES&page=1`)
      ]);

    const movie     = await resMovie.json();
    const credits   = await resCredits.json();
    const videos    = await resVideos.json();
    const providers = await resProviders.json();
    const similares = await resSimilares.json();

    currentMovie = movie;

    // TRAILER
    const trailer =
      videos.results.find(v => v.type === "Trailer" && v.site === "YouTube") ||
      videos.results.find(v => v.site === "YouTube");

    if (trailer) {
      trailerKey = trailer.key;
    } else {
      document.querySelector(".trailer")?.remove();
    }

    // MOSTRAR TODO
    mostrarPelicula(movie, credits);
    mostrarProviders(providers.results);
    mostrarSimilares(similares.results);
    mostrarContenido(tiempoInicio);

  } catch (error) {
    console.error("Error cargando película:", error);
    mostrarContenido(tiempoInicio);
  }
}


// ============================================================
// MOSTRAR PELÍCULA
// ============================================================
function mostrarPelicula(movie, credits) {

  document.getElementById("movie-title").textContent    = movie.title || "—";
  document.getElementById("movie-overview").textContent = movie.overview || "Sin descripción disponible.";
  document.getElementById("movie-poster").src  = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=Sin+imagen";
  document.getElementById("movie-banner").src  = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : "";

  // AÑO
  document.getElementById("movie-year").textContent =
    movie.release_date ? movie.release_date.split("-")[0] : "—";

  // DURACIÓN
  const runtimeEl = document.getElementById("movie-runtime");
  const circulosCreacion = document.querySelectorAll(".circulo-runtime");
  if (movie.runtime) {
    const h = Math.floor(movie.runtime / 60);
    const m = movie.runtime % 60;
    runtimeEl.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
  } else {
    runtimeEl.remove();
    circulosCreacion.forEach(el => el.remove());
  }

  // DIRECTOR
  const director = credits.crew?.find(p => p.job === "Director");
  document.getElementById("movie-director").textContent = director ? director.name : "—";

  // GÉNEROS
  const genresEl = document.getElementById("movie-genres");
  genresEl.innerHTML = "";
  (movie.genres || []).forEach(g => {
    const p = document.createElement("p");
    p.textContent = g.name;
    genresEl.appendChild(p);
  });

  // RATING TMDB
  document.getElementById("movie-rating").textContent =
    movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : "—";
}


// ============================================================
// STREAMING PROVIDERS
// ============================================================
function mostrarProviders(results) {
  const regionData = results?.AR || results?.ES || results?.US;
  const flatrate   = regionData?.flatrate;
  if (!flatrate || flatrate.length === 0) return;

  const section   = document.getElementById("streaming-section");
  const container = document.getElementById("streaming-providers");
  if (!section || !container) return;

  section.style.display = "block";

  flatrate.slice(0, 6).forEach(p => {
    const img = document.createElement("img");
    img.src   = `https://image.tmdb.org/t/p/w92${p.logo_path}`;
    img.alt   = p.provider_name;
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

  const section   = document.getElementById("similares-section");
  const container = document.getElementById("similares-container");
  if (!section || !container) return;

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
  if (!btnQuiero || !btnVi) return;

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
// RATING COMUNIDAD
// ============================================================
async function cargarRatingComunidad() {
  try {
    const q        = query(collection(db, "posts"), where("movieId", "==", movieId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const ratings = snapshot.docs.map(d => d.data().rating).filter(Boolean);
    if (ratings.length === 0) return;

    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const el  = document.getElementById("community-rating");
    if (el) el.textContent = `${avg.toFixed(1)}/7`;
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
  if (!postsContainer) return;

  const q = query(
    collection(db, "posts"),
    where("movieId", "==", movieId),
    orderBy("fecha", "desc")
  );

  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";

    const countEl = document.getElementById("count-posts");
    if (countEl) countEl.textContent = snapshot.docs.length > 0 ? snapshot.docs.length : "";

    snapshot.docs.forEach(doc => {
      const post = doc.data();

      let starsHTML = "";
      for (let i = 1; i <= post.rating; i++) starsHTML += "★";

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

  // Guardar tiempo de inicio para el skeleton
  const tiempoInicio = Date.now();

  // Lanzar todo en paralelo
  cargarPelicula(movieId, tiempoInicio);
  cargarPosts();
  cargarRatingComunidad();
  iniciarWatchlist();

  // TRAILER — igual al original
  const trailerBtn = document.getElementById("trailer-btn");
  if (trailerBtn) {
    trailerBtn.addEventListener("click", () => {
      if (!trailerKey) return;
      const container = document.getElementById("trailer-container");
      container.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.src           = `https://www.youtube.com/embed/${trailerKey}`;
      iframe.width         = "100%";
      iframe.height        = "400";
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    });
  }

  // DESCRIPCIÓN — leer más
  const descripcion = document.querySelector(".descripcion");
  const leerMasBtn  = document.querySelector(".leer-mas-btn");
  let abierta = false;

  if (descripcion) {
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
  }

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

  // SPOILER
  const spoilerBtn = document.getElementById("spoiler-btn");
  let isSpoiler = false;

  if (spoilerBtn) {
    spoilerBtn.addEventListener("click", () => {
      isSpoiler = !isSpoiler;
      spoilerBtn.classList.toggle("activo-boton-spoiler");
    });
  }

  // PUBLICAR POST
  const publishBtn = document.getElementById("publish-post-btn");
  const postText   = document.getElementById("post-text");

  if (publishBtn && postText) {
    publishBtn.addEventListener("click", async () => {
      const texto = postText.value.trim();
      if (!texto || selectedRating === 0) return;

      try {
        const username = localStorage.getItem("username");

        await addDoc(collection(db, "posts"), {
          texto,
          rating:      selectedRating,
          spoiler:     isSpoiler,
          user:        username,
          movieId,
          movieTitle:  currentMovie.title,
          moviePoster: currentMovie.poster_path,
          fecha:       Date.now()
        });

        // Mostrar tu nota
        const tuRatingEl   = document.getElementById("tu-rating");
        const tuRatingChip = document.getElementById("tu-rating-chip");
        if (tuRatingEl && tuRatingChip) {
          tuRatingEl.textContent     = `${selectedRating}/7`;
          tuRatingChip.style.display = "flex";
        }

        postText.value = "";
        selectedRating = 0;
        stars.forEach(s => s.classList.remove("active"));
        mostrarToast("Post publicado ✓");

      } catch (error) {
        console.error(error);
      }
    });
  }

});
