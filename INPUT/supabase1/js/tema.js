// ===================== MODO CLARO / OSCURO =====================
// El tema se guarda como atributo en <html data-tema="oscuro">, y el CSS
// cambia las variables de color según ese atributo. El script pequeño
// del <head> ya puso el tema guardado al cargar; aquí solo lo cambiamos.
// El botón es solo un ícono: aria-label dice en palabras lo que hace.
const btnTema = document.getElementById("btn-tema");

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  const siguiente = tema === "oscuro" ? "Modo claro" : "Modo oscuro";
  btnTema.textContent = tema === "oscuro" ? "☀️" : "🌙";
  btnTema.setAttribute("aria-label", siguiente);
  btnTema.title = siguiente;

  // localStorage recuerda la elección aunque recargues la página
  try { localStorage.setItem("tema", tema); } catch (e) {}
}

btnTema.addEventListener("click", () => {
  const actual = document.documentElement.dataset.tema;
  aplicarTema(actual === "oscuro" ? "claro" : "oscuro");
});

aplicarTema(document.documentElement.dataset.tema);
