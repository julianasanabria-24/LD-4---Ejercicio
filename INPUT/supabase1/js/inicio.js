// =================================================================
// PORTADA DE EVERWISH (index.html)
// Trae de Supabase los productos destacados y los dibuja con las
// mismas clases de tarjeta que la tienda (css/galeria.css).
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

function tarjetaDestacado(p, i) {
  const nombre = escaparTexto((p.nombre || "Sin nombre").trim());
  const categorias = p.categorias || [];
  const foto = p.imagen_url
    ? `<img src="${escaparTexto(p.imagen_url)}" alt="${nombre}" loading="lazy">`
    : `<span class="sin-foto" aria-hidden="true">${nombre.charAt(0).toUpperCase()}</span>`;
  const descuento = Number(p.descuento) || 0;

  // La tarjeta lleva a la tienda filtrada por la colección del producto
  // (la segunda categoría es el "mundo": princesas, bajo el mar...)
  const coleccion = categorias[1] || categorias[0] || "";
  const enlace = coleccion ? `galeria.html?categoria=${encodeURIComponent(coleccion)}` : "galeria.html";

  return `
    <article class="producto" style="--i: ${i}">
      <div class="producto-foto">
        ${foto}
        <div class="etiquetas">
          ${descuento > 0 ? `<span class="etiqueta">-${Math.round(descuento * 100)}%</span>` : ""}
        </div>
      </div>
      <div class="producto-cuerpo">
        <span class="producto-categorias">${escaparTexto(categorias.join(" · "))}</span>
        <h3 class="producto-nombre">${nombre}</h3>
        <p class="producto-descripcion">${escaparTexto(p.description)}</p>
        <div class="producto-precios">
          <span class="precio-final">${pesosInicio(precioConDescuento(p))}</span>
          ${descuento > 0 ? `<span class="precio-antes">${pesosInicio(p.precio)}</span>` : ""}
        </div>
      </div>
      <div class="producto-pie">
        <a class="boton" href="${enlace}">Ver en la tienda</a>
      </div>
    </article>`;
}

// Destacados = disponibles y con unidades, primero los de mayor descuento
async function cargarDestacados() {
  const contenedor = document.getElementById("destacados");

  const { data, error } = await db
    .from("products_practice")
    .select("id, nombre, description, precio, descuento, unidades, categorias, imagen_url")
    .eq("disponible", true)
    .gt("unidades", 0)
    .order("descuento", { ascending: false })
    .order("id")
    .limit(4);

  if (error) {
    console.log("Error al traer los destacados:", error);
    contenedor.innerHTML = `<p class="sin-resultados">No pudimos abrir el cofre de deseos 😕<br>Revisa la consola (F12).</p>`;
    return;
  }

  contenedor.innerHTML = data.length
    ? data.map(tarjetaDestacado).join("")
    : `<p class="sin-resultados">Muy pronto llegarán nuevos deseos ✦</p>`;
}

// Si una foto no carga, mostramos la inicial (como en la tienda).
// "error" no sube al contenedor como un clic: se escucha en captura (true)
document.addEventListener("error", (evento) => {
  const img = evento.target;
  if (img.tagName === "IMG" && img.closest(".producto-foto")) {
    img.outerHTML = `<span class="sin-foto" aria-hidden="true">${escaparTexto(img.alt).charAt(0)}</span>`;
  }
}, true);

cargarDestacados();
