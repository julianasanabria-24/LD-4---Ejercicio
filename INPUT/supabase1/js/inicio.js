// =================================================================
// PORTADA DE EVERWISH (index.html)
// Trae de Supabase todos los productos UNA vez y con ellos arma:
//   - las tarjetas de mundos (con cuántas joyas tiene cada uno)
//   - las tarjetas de tipo de joya
//   - los carruseles de Novedades y Ofertas
// Usa MUNDOS, TIPOS, mundoDe y tipoDe de js/mundos.js.
// No duplica el carrito: para comprar, cada tarjeta lleva a la tienda.
// =================================================================

// 90000 → "$90.000" (mismo formato que galeria.js)
const pesosInicio = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("es-CO");

// Precio con el descuento aplicado: 100000 con 0.15 → 85000
const precioConDescuento = (p) => (Number(p.precio) || 0) * (1 - (Number(p.descuento) || 0));

// Los datos vienen de la base y van a innerHTML: los escapamos
function escaparTexto(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Misma tarjeta que la tienda (css/galeria.css), con un enlace en vez del carrito
function tarjetaInicio(p, i) {
  const nombre = escaparTexto((p.nombre || "Sin nombre").trim());
  const descuento = Number(p.descuento) || 0;
  const mundo = datosMundo(mundoDe(p));
  const tipo = datosTipo(tipoDe(p));
  const foto = p.imagen_url
    ? `<img src="${escaparTexto(p.imagen_url)}" alt="${nombre}" loading="lazy">`
    : `<span class="sin-foto" aria-hidden="true">${nombre.charAt(0).toUpperCase()}</span>`;

  return `
    <article class="producto" style="--i: ${i}">
      <div class="producto-foto">
        ${foto}
        <div class="etiquetas">
          ${descuento > 0 ? `<span class="etiqueta">-${Math.round(descuento * 100)}%</span>` : ""}
          ${p.unidades > 0 && p.unidades <= 5 ? `<span class="etiqueta ultimas">¡Últimas ${p.unidades}!</span>` : ""}
        </div>
      </div>
      <div class="producto-cuerpo">
        ${mundo ? `<a class="producto-mundo" href="${enlaceMundo(mundo.clave)}">${mundo.nombre}${tipo ? " · " + tipo.nombre : ""}</a>` : ""}
        <h3 class="producto-nombre">${nombre}</h3>
        <p class="producto-descripcion">${escaparTexto(p.description)}</p>
        <div class="producto-precios">
          <span class="precio-final">${pesosInicio(precioConDescuento(p))}</span>
          ${descuento > 0 ? `<span class="precio-antes">${pesosInicio(p.precio)}</span>` : ""}
        </div>
      </div>
      <div class="producto-pie">
        <a class="boton secundario" href="${mundo ? enlaceMundo(mundo.clave) : "galeria.html"}">Ver en la tienda</a>
      </div>
    </article>`;
}

// Tarjetas de mundo y de tipo. Se dibujan YA (sin esperar a Supabase);
// cuando llegan los productos solo se cambia el número (data-cuenta),
// así no se repite la animación de entrada.
function pintarMundos() {
  document.getElementById("lista-mundos").innerHTML = MUNDOS.map((m, i) => `
    <a class="mundo-tarjeta" href="${enlaceMundo(m.clave)}" data-revelar style="--retraso: ${i}">
      <img src="${m.imagen}" alt="" loading="lazy">
      <span class="mundo-estudio">${m.estudio}</span>
      <span class="mundo-nombre">${m.nombre}</span>
      <span class="mundo-cuenta"><span data-cuenta="${m.clave}">·</span> joyas</span>
    </a>`).join("");
}

function pintarTipos() {
  document.getElementById("lista-tipos").innerHTML = TIPOS.map((t, i) => `
    <a class="tipo-tarjeta" href="${enlaceTipo(t.clave)}" data-revelar style="--retraso: ${i}">
      <span class="tipo-icono" aria-hidden="true">${t.icono}</span>
      <strong>${t.nombre}</strong>
      <span><span data-cuenta="${t.clave}">·</span> piezas</span>
    </a>`).join("");
}

function ponerCuentas(contenedorId, cuantos) {
  document.querySelectorAll(`#${contenedorId} [data-cuenta]`).forEach((el) => {
    el.textContent = cuantos[el.dataset.cuenta] || 0;
  });
}

// Cuenta cuántos productos hay por clave: { princesas: 10, villanos: 10, ... }
function contarPor(productos, claveDe) {
  const cuenta = {};
  productos.forEach((p) => { const c = claveDe(p); cuenta[c] = (cuenta[c] || 0) + 1; });
  return cuenta;
}

function pintarCarrusel(id, lista, vacio) {
  document.getElementById(id).innerHTML = lista.length
    ? lista.map(tarjetaInicio).join("")
    : `<p class="sin-resultados">${vacio}</p>`;
}

async function cargarPortada() {
  const { data, error } = await db
    .from("products_practice")
    .select("id, nombre, description, precio, descuento, unidades, disponible, categorias, imagen_url");

  if (error) {
    console.log("Error al traer los productos:", error);
    const fallo = "No pudimos abrir el cofre de joyas 😕 Revisa la consola (F12).";
    pintarCarrusel("carrusel-novedades", [], fallo);
    pintarCarrusel("carrusel-ofertas", [], fallo);
    return;
  }

  // Las cuentas incluyen todo; los carruseles, solo lo que se puede comprar
  ponerCuentas("lista-mundos", contarPor(data, mundoDe));
  ponerCuentas("lista-tipos", contarPor(data, tipoDe));
  document.getElementById("dato-joyas").textContent = data.length;

  const disponibles = data.filter((p) => p.disponible && p.unidades > 0);

  const novedades = [...disponibles].sort((a, b) => b.id - a.id).slice(0, 10);
  const ofertas = disponibles
    .filter((p) => Number(p.descuento) > 0)
    .sort((a, b) => b.descuento - a.descuento)
    .slice(0, 10);

  pintarCarrusel("carrusel-novedades", novedades, "Muy pronto llegarán nuevas joyas ✦");
  pintarCarrusel("carrusel-ofertas", ofertas, "Ahora mismo no hay ofertas. ¡Vuelve pronto! ✦");
}

// Si una foto no carga, mostramos la inicial (como en la tienda).
// "error" no sube al contenedor como un clic: se escucha en captura (true)
document.addEventListener("error", (evento) => {
  const img = evento.target;
  if (img.tagName === "IMG" && img.closest(".producto-foto")) {
    img.outerHTML = `<span class="sin-foto" aria-hidden="true">${escaparTexto(img.alt).charAt(0)}</span>`;
  }
}, true);

pintarMundos();
pintarTipos();
revelarEn(document);
cargarPortada();
