
// 🔥 CONFIG
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL = "https://api.themoviedb.org/3";

const TOTAL_PELICULAS = 5;
const INTERVALO = 4000;

let peliculas = [];
let index = 0;

// 🎬 CARGAR
async function cargarPeliculas() {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}`
  );

  const data = await res.json();

  peliculas = data.results.slice(0, TOTAL_PELICULAS);

  renderSlides();
  iniciarSlider();
}

// 🧱 CREAR SLIDES
function renderSlides() {
  const track = document.getElementById("slider-track");

  peliculas.forEach(movie => {
    const slide = document.createElement("div");
    slide.classList.add("slide");

    const img = document.createElement("img");
    img.src = `https://image.tmdb.org/t/p/original${movie.poster_path}`;

    slide.appendChild(img);
    track.appendChild(slide);
  });

  // 👇 mostrar primer título
  document.getElementById("banner-title").textContent =
    peliculas[0].title;
}

// 🔄 SLIDE AUTOMÁTICO
function iniciarSlider() {
  const track = document.getElementById("slider-track");
  const title = document.getElementById("banner-title");

  setInterval(() => {
    index++;

    if (index >= peliculas.length) {
      index = 0;
    }

    track.style.transform = `translateX(-${index * 100}%)`;

    // 🔥 actualizar título
    title.textContent = peliculas[index].title;

  }, INTERVALO);
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {
  cargarPeliculas();
});