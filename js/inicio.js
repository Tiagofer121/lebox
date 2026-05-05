
// 🔥 CONFIG
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL = "https://api.themoviedb.org/3";

// 🎯 CONFIGURABLE
const TOTAL_PELICULAS = 5; // 👈 CAMBIÁS ESTO
const INTERVALO = 4000; // ms (4 segundos)

// 🧠 VARIABLES
let peliculas = [];
let index = 0;

// 🎬 CARGAR POPULARES
async function cargarPeliculas() {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}`
  );

  const data = await res.json();

  peliculas = data.results.slice(0, TOTAL_PELICULAS);

  mostrarBanner();
  iniciarCarrusel();
}

// 🖼️ MOSTRAR BANNER
function mostrarBanner() {
  const movie = peliculas[index];

  const banner = document.getElementById("banner");
  const title = document.getElementById("banner-title");

banner.style.backgroundImage =
  `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`;

  title.textContent = movie.title;
}

// 🔄 CAMBIO AUTOMÁTICO
function iniciarCarrusel() {
  setInterval(() => {
    index++;

    if (index >= peliculas.length) {
      index = 0;
    }

    mostrarBanner();
  }, INTERVALO);
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {
  cargarPeliculas();
});