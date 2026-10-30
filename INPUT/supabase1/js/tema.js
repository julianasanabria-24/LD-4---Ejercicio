// ===================== MODO CLARO / OSCURO =====================
// Mismo código que en prueba2.js: el tema se guarda como atributo en
// <html data-tema="oscuro">, y el CSS cambia las variables de color
// según ese atributo. El script pequeño del <head> ya puso el tema
// guardado al cargar; aquí solo lo cambiamos.
const btnTema = document.getElementById("btn-tema");

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  btnTema.innerText = tema === "oscuro" ? "☀️ Modo claro" : "🌙 Modo oscuro";

  // localStorage recuerda la elección aunque recargues la página
  try { localStorage.setItem("tema", tema); } catch (e) {}
}

btnTema.addEventListener("click", () => {
  const actual = document.documentElement.dataset.tema;
  aplicarTema(actual === "oscuro" ? "claro" : "oscuro");
});

aplicarTema(document.documentElement.dataset.tema);
