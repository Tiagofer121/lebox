
// 🔍 OBTENER ID
function obtenerId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔥 CONFIG
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL = "https://api.themoviedb.org/3";

// 🎬 TRAILER
let trailerKey = null;

// 🎬 CARGAR TODO
async function cargarPelicula(id) {
  try {

    // 🎬 DATOS PRINCIPALES
    const resMovie = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`
    );

    const movie = await resMovie.json();

    // 🎬 CRÉDITOS
    const resCredits = await fetch(
      `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    );

    const credits = await resCredits.json();

    // 🎬 VIDEOS / TRAILERS
    const resVideos = await fetch(
      `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`
    );

    const videos = await resVideos.json();

    // 🔥 BUSCAR TRAILER
    const trailer = videos.results.find(
      v => v.type === "Trailer" && v.site === "YouTube"
    );

    if (trailer) {
      trailerKey = trailer.key;
    }

    // 🧱 MOSTRAR
    mostrarPelicula(movie, credits);

  } catch (error) {
    console.error("Error:", error);
  }
}

// 🧱 MOSTRAR EN HTML
function mostrarPelicula(movie, credits) {

  // 🎯 ELEMENTOS
  const title = document.getElementById("movie-title");
  const poster = document.getElementById("movie-poster");
  const banner = document.getElementById("movie-banner");
  const overview = document.getElementById("movie-overview");

  const year = document.getElementById("movie-year");
  const directorEl = document.getElementById("movie-director");
  const genresEl = document.getElementById("movie-genres");

  // 🎬 BÁSICOS
  title.textContent = movie.title;

  overview.textContent = movie.overview;

  poster.src =
    `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  banner.src =
    `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;

  // 📅 AÑO
  const yearText = movie.release_date
    ? movie.release_date.split("-")[0]
    : "—";

  year.textContent = yearText;

  // 🎬 DIRECTOR
  const director = credits.crew.find(
    p => p.job === "Director"
  );

  directorEl.textContent =
    director ? director.name : "—";

  // 🏷️ GÉNEROS
  genresEl.innerHTML = "";

  if (movie.genres.length === 0) {

    genresEl.textContent = "—";

  } else {

    movie.genres.forEach(g => {

      const p = document.createElement("p");

      p.textContent = g.name;

      genresEl.appendChild(p);

    });

  }
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {

  const movieId = obtenerId();

  if (!movieId) {
    console.log("No hay ID");
    return;
  }

  // 🎬 CARGAR PELÍCULA
  cargarPelicula(movieId);

  // ▶️ BOTÓN TRAILER
  document.getElementById("trailer-btn")
  .addEventListener("click", () => {

    if (!trailerKey) return;

    const container =
      document.getElementById("trailer-container");

    // limpiar anterior
    container.innerHTML = "";

    // crear iframe
    const iframe = document.createElement("iframe");

    iframe.src =
      `https://www.youtube.com/embed/${trailerKey}`;

    iframe.width = "100%";

    iframe.height = "400";

    iframe.allowFullscreen = true;

    container.appendChild(iframe);

  });

});