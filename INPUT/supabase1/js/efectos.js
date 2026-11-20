// =================================================================
// EFECTOS COMPARTIDOS (index, galeria, cliente)
// 1. Revelar secciones al hacer scroll
// 2. Sombra en la barra superior al bajar
// 3. Flechas de los carruseles
// Nada de esto toca Supabase: solo hace la página más "viva".
// =================================================================

// 1) IntersectionObserver avisa cuando un elemento ENTRA en pantalla.
//    Entonces le ponemos .revelado y el CSS lo hace aparecer (everwish.css).
const observadorRevelar = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("revelado");
      observadorRevelar.unobserve(entrada.target);   // solo una vez
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

// Se puede volver a llamar después de dibujar contenido nuevo
function revelarEn(raiz = document) {
  raiz.querySelectorAll("[data-revelar]:not(.revelado)").forEach((el) => observadorRevelar.observe(el));
}
revelarEn();


// 2) Barra con sombra cuando ya no estás arriba del todo
const barraSuperior = document.querySelector(".barra");
if (barraSuperior) {
  const revisarScroll = () => barraSuperior.classList.toggle("con-sombra", window.scrollY > 8);
  window.addEventListener("scroll", revisarScroll, { passive: true });
  revisarScroll();
}


// 3) Carruseles: <button data-carrusel="id-del-carrusel" data-direccion="1">
//    mueve el carrusel casi una "pantalla" a la derecha (-1 = izquierda)
document.addEventListener("click", (evento) => {
  const flecha = evento.target.closest("[data-carrusel]");
  if (!flecha) return;
  const carrusel = document.getElementById(flecha.dataset.carrusel);
  if (!carrusel) return;
  carrusel.scrollBy({ left: carrusel.clientWidth * 0.85 * Number(flecha.dataset.direccion), behavior: "smooth" });
});
