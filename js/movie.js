
// 🔥 FIREBASE

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// 🔍 OBTENER ID
function obtenerId() {

  const params =
    new URLSearchParams(window.location.search);

  return params.get("id");

}


// 🎬 CONFIG TMDB
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL =
  "https://api.themoviedb.org/3";


// 🎬 MOVIE ACTUAL
let currentMovie = null;


// 🎬 TRAILER
let trailerKey = null;


// ⭐ RATING SELECCIONADO
let selectedRating = 0;


// 🎬 MOVIE ID
const movieId = obtenerId();


// 🎬 CARGAR PELÍCULA
async function cargarPelicula(id) {

  try {

    // 🎬 DATOS
    const resMovie = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`
    );

    const movie =
      await resMovie.json();

    // 🎭 CRÉDITOS
    const resCredits = await fetch(
      `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    );

    const credits =
      await resCredits.json();

    // 🎥 VIDEOS
    const resVideos = await fetch(
      `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`
    );

    const videos =
      await resVideos.json();

    // 🎬 GUARDAR MOVIE
    currentMovie = movie;

    // 🎬 TRAILER
    const trailer =
      videos.results.find(
        v =>
          v.type === "Trailer" &&
          v.site === "YouTube"
      );

    const trailerDiv =
      document.querySelector(".trailer");

    if (trailer) {

      trailerKey = trailer.key;

    } else {

      trailerDiv.remove();

    }

    // 🧱 MOSTRAR
    mostrarPelicula(movie, credits);

  } catch (error) {

    console.error(error);

  }

}


// 🧱 MOSTRAR PELÍCULA
function mostrarPelicula(movie, credits) {

  // 🎯 ELEMENTOS
  const title =
    document.getElementById("movie-title");

  const poster =
    document.getElementById("movie-poster");

  const banner =
    document.getElementById("movie-banner");

  const overview =
    document.getElementById("movie-overview");

  const year =
    document.getElementById("movie-year");

  const directorEl =
    document.getElementById("movie-director");

  const genresEl =
    document.getElementById("movie-genres");

  const ratingEl =
    document.getElementById("movie-rating");


  // 🎬 INFO
  title.textContent =
    movie.title;

  overview.textContent =
    movie.overview;

  poster.src =
    `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  banner.src =
    `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;


  // 📅 AÑO
  const yearText =
    movie.release_date
      ? movie.release_date.split("-")[0]
      : "—";

  year.textContent =
    yearText;


  // 🎬 DIRECTOR
  const director =
    credits.crew.find(
      p => p.job === "Director"
    );

  directorEl.textContent =
    director
      ? director.name
      : "—";


  // 🏷️ GÉNEROS
  genresEl.innerHTML = "";

  movie.genres.forEach(g => {

    const p =
      document.createElement("p");

    p.textContent =
      g.name;

    genresEl.appendChild(p);

  });


  // ⭐ RATING TMDB
  ratingEl.textContent =
    `${movie.vote_average.toFixed(1)}/10`;

}


// 💬 CARGAR POSTS
function cargarPosts() {

  // 📦 CONTENEDOR
  const postsContainer =
    document.querySelector(
      ".community-posts"
    );

  // 📚 COLLECTION
  const postsRef =
    collection(db, "posts");

  // 🎬 QUERY
const q = query(
  postsRef,

  where("movieId", "==", movieId),

  orderBy("fecha", "desc")
);

  // 🔥 TIEMPO REAL
  onSnapshot(q, (snapshot) => {

    // 🧹 LIMPIAR
    postsContainer.innerHTML = "";

    // 🔁 POSTS
    snapshot.docs.forEach(doc => {

      const post =
        doc.data();

      // 🧱 POST
      const postDiv =
        document.createElement("div");

      postDiv.classList.add("post");

      let starsHTML = "";

      for (let i = 1; i <= 7; i++) {

  if (i <= post.rating) {

    starsHTML += "★";

  } else {

    starsHTML += "☆";

  }

}

      postDiv.innerHTML = `

        <h3 class="usuario-post">${post.user}</h3>

        <p class="estrellas">${starsHTML}</p>

        <p class="Mensjae-post">${post.texto}</p>

      `;

      // ➕ AGREGAR
      postsContainer.appendChild(
        postDiv
      );

    });

  });

}


// 🚀 INIT
document.addEventListener(
  "DOMContentLoaded",
  () => {

    // ❌ SIN ID
    if (!movieId) return;

    // 🎬 CARGAR MOVIE
    cargarPelicula(movieId);

    // 💬 CARGAR POSTS
    cargarPosts();


    // 🎥 TRAILER
    const trailerBtn =
      document.getElementById(
        "trailer-btn"
      );

    trailerBtn.addEventListener(
      "click",
      () => {

        if (!trailerKey) return;

        const container =
          document.getElementById(
            "trailer-container"
          );

        // 🧹 LIMPIAR
        container.innerHTML = "";

        // 🎬 IFRAME
        const iframe =
          document.createElement(
            "iframe"
          );

        iframe.src =
          `https://www.youtube.com/embed/${trailerKey}`;

        iframe.width = "100%";

        iframe.height = "400";

        iframe.allowFullscreen =
          true;

        // ➕ AGREGAR
        container.appendChild(
          iframe
        );

      }
    );


    // 📖 DESCRIPCIÓN
    const descripcion =
      document.querySelector(
        ".descripcion"
      );

    let abierta = false;

    descripcion.addEventListener(
      "click",
      () => {

        if (!abierta) {

          descripcion.style.maxHeight =
            descripcion.scrollHeight +
            "px";

          abierta = true;

        } else {

          descripcion.style.maxHeight =
            "80px";

          abierta = false;

        }

      }
    );


    // 🎞️ TABS
    const buttons =
      document.querySelectorAll(
        ".tab-btn"
      );

    const slider =
      document.querySelector(
        ".tabs-slider"
      );

    const pages =
      document.querySelectorAll(
        ".tab-page"
      );



    // ✅ ACTIVE
    buttons[0].classList.add(
      "active"
    );

    // 🚀 EVENTOS
    buttons.forEach(
      (btn, index) => {

        btn.addEventListener(
          "click",
          () => {

            // 🎞️ SLIDE
            slider.style.transform =
              `translateX(-${index * 100}%)`;

            // ❌ REMOVE ACTIVE
            buttons.forEach(b => {
              b.classList.remove(
                "active"
              );
            });

            // ✅ ACTIVE
            btn.classList.add(
              "active"
            );

          }
        );

      }
    );


    // ⭐ ESTRELLAS
    const stars =
      document.querySelectorAll(
        ".star"
      );

    stars.forEach(star => {

      star.addEventListener(
        "click",
        () => {

          // ⭐ VALOR
          selectedRating =
            Number(
              star.dataset.value
            );

          // ❌ LIMPIAR
          stars.forEach(s => {
            s.classList.remove(
              "active"
            );
          });

          // ✅ ACTIVAR
          stars.forEach(s => {

            if (
              Number(
                s.dataset.value
              ) <= selectedRating
            ) {

              s.classList.add(
                "active"
              );

            }

          });

        }
      );

    });


    // 💬 PUBLICAR
    const publishBtn =
      document.getElementById(
        "publish-post-btn"
      );

    const postText =
      document.getElementById(
        "post-text"
      );

    publishBtn.addEventListener(
      "click",
      async () => {

        // ✍️ TEXTO
        const texto =
          postText.value.trim();

        // ❌ VALIDACIONES
        if (!texto) return;

        if (
          selectedRating === 0
        ) return;

        try {

          // 👤 USER
          const username =
            localStorage.getItem(
              "username"
            );

          // 🚀 FIREBASE
          await addDoc(
            collection(
              db,
              "posts"
            ),
            {

              texto: texto,

              rating:
                selectedRating,

              user: username,

              movieId: movieId,

              movieTitle:
                currentMovie.title,

              moviePoster:
                currentMovie.poster_path,

              fecha: Date.now()

            }
          );

          // 🧹 LIMPIAR
          postText.value = "";

          selectedRating = 0;

          stars.forEach(s => {
            s.classList.remove(
              "active"
            );
          });

          console.log(
            "Post publicado"
          );

        } catch (error) {

          console.error(error);

        }

      }
    );

  }
);
