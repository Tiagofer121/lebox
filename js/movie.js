
// 🔍 OBTENER ID
function obtenerId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔥 CONFIG
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL = "https://api.themoviedb.org/3";

// 🎬 TRAER DATOS (EN ESPAÑOL)
async function cargarPelicula(id) {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`
    );

    const data = await res.json();

    mostrarPelicula(data);

  } catch (error) {
    console.error("Error:", error);
  }
}

// 🧱 MOSTRAR
function mostrarPelicula(movie) {
  const title = document.getElementById("movie-title");
  const poster = document.getElementById("movie-poster");
  const banner = document.getElementById("movie-banner");
  const overview = document.getElementById("movie-overview");

  title.textContent = movie.title;

  poster.src = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;

  banner.src = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;

  overview.textContent = movie.overview;
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {
  const movieId = obtenerId();

  if (!movieId) return;

  cargarPelicula(movieId);
});
