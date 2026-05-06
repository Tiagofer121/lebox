
// 🔍 OBTENER ID
function obtenerId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔥 CONFIG
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL = "https://api.themoviedb.org/3";

// 🎬 CARGAR TODO
async function cargarPelicula(id) {
  try {
    // 🎬 datos principales
    const resMovie = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`
    );
    const movie = await resMovie.json();

    // 🎬 créditos (director)
    const resCredits = await fetch(
      `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    );
    const credits = await resCredits.json();

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

  poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  banner.src = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;

  // 📅 AÑO
  const yearText = movie.release_date
    ? movie.release_date.split("-")[0]
    : "—";

  year.textContent = yearText;

  // 🎬 DIRECTOR
  const director = credits.crew.find(p => p.job === "Director");
  directorEl.textContent = director ? director.name : "—";

  // 🏷️ GÉNEROS (cada uno en un <p>)
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

  cargarPelicula(movieId);
});
