// =================================================================
// GALERÍA DE PRODUCTOS (galeria.html)
// Los productos vienen de la tabla products_practice de Supabase (la
// misma que administras en admin.html). Ver cargarProductos() al final.
// =================================================================

// Todos los productos (se llena en cargarProductos)
let productos = [];

// Filtros actuales: lo que se escribió en el buscador y el chip activo.
// categoriaActiva se guarda NORMALIZADA ("tecnologia", sin tilde).
let textoBusqueda = "";
let categoriaActiva = "todas";


// ===================== UTILIDADES =====================

// 90000 → "$90.000" (formato colombiano, igual que en admin.js)
const formato = (n) => "$" + Math.round(n).toLocaleString("es-CO");

// Precio con el descuento aplicado: 100000 con 0.15 → 85000
const precioFinal = (p) => p.precio * (1 - (p.descuento || 0));

// Quita tildes y pasa a minúsculas: "Cámara" → "camara" (igual que en admin.js)
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Busca un producto por id en el array (find devuelve el primero que cumple)
const buscarProducto = (id) => productos.find((p) => p.id === id);

// ¿Se puede comprar? Tiene que estar disponible Y tener unidades
const sePuedeComprar = (p) => p.disponible && p.unidades > 0;

// Cuadrito con la inicial cuando no hay foto (o no carga)
function fotoSinImagen(nombre) {
  const inicial = (nombre || "?").trim().charAt(0).toUpperCase();
  return `<span class="sin-foto" aria-hidden="true">${inicial}</span>`;
}

function fotoProducto(p) {
  return p.imagen_url
    ? `<img src="${p.imagen_url}" alt="${p.nombre}" loading="lazy">`
    : fotoSinImagen(p.nombre);
}


// ===================== CARRITO (localStorage) =====================
// Guardamos SOLO { id: cantidad }, por ejemplo { "1": 2, "5": 1 }.
// El nombre, el precio y la foto se buscan en "productos" cada vez:
// así, si un precio cambia, el carrito no queda con el precio viejo.
let carrito = {};
try { carrito = JSON.parse(localStorage.getItem("carrito")) || {}; } catch (e) {}

function guardarCarrito() {
  try { localStorage.setItem("carrito", JSON.stringify(carrito)); } catch (e) {}
}

// Cuántas unidades de ese producto hay en el carrito (0 si ninguna)
const cantidadEnCarrito = (id) => carrito[id] || 0;

// Cambia la cantidad de un producto: +1, -1, o un número exacto.
// Nunca baja de 0 ni pasa del stock (unidades).
function cambiarCantidad(id, cambio) {
  const p = buscarProducto(id);
  if (!p) return;

  const actual = cantidadEnCarrito(id);
  const nueva = Math.max(0, Math.min(actual + cambio, p.unidades));

  if (nueva === actual) {
    // Llegó al tope del stock: avisamos en vez de no hacer nada en silencio
    if (cambio > 0) mostrarAviso(`Solo hay ${p.unidades} unidades de ${p.nombre}`);
    return;
  }

  if (nueva === 0) delete carrito[id];   // 0 unidades = ya no está en el carrito
  else carrito[id] = nueva;

  guardarCarrito();
  actualizarPieTarjeta(id);   // solo redibuja ESA tarjeta, no toda la grilla
  pintarCarrito();

  if (actual === 0 && nueva > 0) mostrarAviso(`${p.nombre} agregado ✓`);
  if (cambio > 0) animarContador();
}

// Total de unidades en el carrito (para el numerito del botón).
// Object.values({ "1": 2, "5": 1 }) → [2, 1] → reduce suma → 3
const totalUnidades = () => Object.values(carrito).reduce((suma, n) => suma + n, 0);

function animarContador() {
  const contador = document.getElementById("contador-carrito");
  // Quitar la clase, forzar al navegador a "notarlo" (offsetWidth) y
  // volver a ponerla: es el truco para repetir una animación CSS
  contador.classList.remove("rebote");
  void contador.offsetWidth;
  contador.classList.add("rebote");
}


// ===================== TARJETAS DE LA GRILLA =====================

// El pie cambia según el estado: agotado / "Agregar" / selector − n +
function pieTarjeta(p) {
  if (!sePuedeComprar(p)) {
    return `<button type="button" class="btn-agregar" disabled>Agotado</button>`;
  }

  const cantidad = cantidadEnCarrito(p.id);

  if (cantidad === 0) {
    return `<button type="button" class="btn-agregar" data-accion="sumar" data-id="${p.id}">Agregar al carrito</button>`;
  }

  // <output> es la etiqueta HTML para "un valor calculado"
  return `
    <div class="cantidad">
      <button type="button" data-accion="restar" data-id="${p.id}" aria-label="Quitar uno">−</button>
      <span class="en-carrito"><output>${cantidad}</output> en el carrito</span>
      <button type="button" data-accion="sumar" data-id="${p.id}" aria-label="Agregar uno"
        ${cantidad >= p.unidades ? "disabled" : ""}>+</button>
    </div>`;
}

function tarjetaProducto(p, i) {
  const etiquetas = [];
  if (p.descuento > 0) etiquetas.push(`<span class="etiqueta">-${Math.round(p.descuento * 100)}%</span>`);
  if (!sePuedeComprar(p)) etiquetas.push(`<span class="etiqueta agotado">Agotado</span>`);

  return `
    <article class="producto ${sePuedeComprar(p) ? "" : "esta-agotado"}" data-producto="${p.id}" style="--i: ${i}">
      <div class="producto-foto">
        ${fotoProducto(p)}
        <div class="etiquetas">${etiquetas.join("")}</div>
      </div>

      <div class="producto-cuerpo">
        <span class="producto-categorias">${(p.categorias || []).join(" · ")}</span>
        <h3 class="producto-nombre">${p.nombre}</h3>
        <p class="producto-descripcion">${p.description || ""}</p>

        <div class="producto-precios">
          <span class="precio-final">${formato(precioFinal(p))}</span>
          ${p.descuento > 0 ? `<span class="precio-antes">${formato(p.precio)}</span>` : ""}
        </div>
        ${sePuedeComprar(p) && p.unidades <= 5 ? `<span class="stock-bajo">¡Quedan solo ${p.unidades}!</span>` : ""}
      </div>

      <div class="producto-pie">${pieTarjeta(p)}</div>
    </article>`;
}

// Redibuja SOLO el pie de una tarjeta. Si redibujáramos toda la grilla,
// todas las tarjetas repetirían su animación de entrada con cada clic.
function actualizarPieTarjeta(id) {
  const pie = document.querySelector(`[data-producto="${id}"] .producto-pie`);
  if (pie) pie.innerHTML = pieTarjeta(buscarProducto(id));
}

// Aplica el buscador y el chip, y dibuja la grilla
function mostrarProductos() {
  const buscado = normalizar(textoBusqueda);

  const visibles = productos.filter((p) => {
    const coincideTexto =
      normalizar(p.nombre).includes(buscado) ||
      (p.categorias || []).some((c) => normalizar(c).includes(buscado));
    // Comparamos normalizado: "tecnología" y "tecnologia" cuentan igual
    const coincideCategoria =
      categoriaActiva === "todas" ||
      (p.categorias || []).some((c) => normalizar(c) === categoriaActiva);
    return coincideTexto && coincideCategoria;
  });

  const grilla = document.getElementById("grilla-productos");
  grilla.innerHTML = visibles.length
    ? visibles.map(tarjetaProducto).join("")
    : `<p class="sin-resultados">No encontramos productos con ese filtro 🔍</p>`;

  document.getElementById("conteo-resultados").innerText =
    `${visibles.length} de ${productos.length} productos`;
}


// ===================== CHIPS DE CATEGORÍA =====================
// Sacamos las categorías de los mismos productos: si agregas uno con
// una categoría nueva en admin.html, su chip aparece solo.
function mostrarChips() {
  // En la base hay "tecnología" (con tilde) y "tecnologia" (sin tilde).
  // Un Set las vería distintas y saldrían DOS chips. Por eso usamos un
  // Map: la clave es la versión normalizada ("tecnologia") y el valor es
  // el texto que se muestra (el primero que aparezca).
  const categorias = new Map();
  productos
    .flatMap((p) => p.categorias || [])   // flatMap junta todos los arrays en uno
    .forEach((c) => {
      const clave = normalizar(c.trim());
      if (clave && !categorias.has(clave)) categorias.set(clave, c.trim());
    });

  // Ordenamos por la clave, y "todas" siempre va primero
  const chips = [["todas", "todas"], ...[...categorias].sort(([a], [b]) => a.localeCompare(b))];

  document.getElementById("chips-categorias").innerHTML = chips
    .map(([clave, texto]) => `
      <button type="button" class="chip" data-categoria="${clave}"
        aria-pressed="${clave === categoriaActiva}">${texto}</button>`)
    .join("");
}

document.getElementById("chips-categorias").addEventListener("click", (evento) => {
  const chip = evento.target.closest(".chip");
  if (!chip) return;

  categoriaActiva = chip.dataset.categoria;
  // aria-pressed marca el chip activo (el CSS lo pinta con degradado)
  document.querySelectorAll(".chip").forEach((c) => {
    c.setAttribute("aria-pressed", c === chip);
  });
  mostrarProductos();
});

// "input" se dispara con cada tecla: la grilla filtra mientras escribes
document.getElementById("input-busqueda").addEventListener("input", (evento) => {
  textoBusqueda = evento.target.value.trim();
  mostrarProductos();
});


// ===================== CLICS EN LAS TARJETAS =====================
// Delegación de eventos (igual que en admin.js): los botones se crean y
// se borran, así que escuchamos en la grilla, que siempre existe.
document.getElementById("grilla-productos").addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "sumar") cambiarCantidad(id, +1);
  if (boton.dataset.accion === "restar") cambiarCantidad(id, -1);
});

// Si una foto no carga, la cambiamos por la inicial. "error" no sube
// al contenedor como un clic, por eso usamos captura (el "true" final)
document.addEventListener("error", (evento) => {
  const img = evento.target;
  if (img.tagName === "IMG") img.outerHTML = fotoSinImagen(img.alt);
}, true);


// ===================== PANEL DEL CARRITO =====================

function pintarCarrito() {
  const ids = Object.keys(carrito).map(Number).filter(buscarProducto);
  const lista = document.getElementById("lista-carrito");

  document.getElementById("contador-carrito").innerText = totalUnidades();
  document.getElementById("resumen-carrito").hidden = ids.length === 0;

  if (ids.length === 0) {
    lista.innerHTML = `
      <div class="carrito-vacio">
        <span>🛒</span>
        Tu carrito está vacío.<br>Agrega algo desde la galería.
      </div>`;
    return;
  }

  lista.innerHTML = ids.map((id) => {
    const p = buscarProducto(id);
    const cantidad = carrito[id];
    return `
      <div class="item-carrito">
        ${fotoProducto(p)}
        <div>
          <span class="item-nombre" title="${p.nombre}">${p.nombre}</span>
          <span class="item-precio">${formato(precioFinal(p))} c/u</span>
          <div class="cantidad pequena">
            <button type="button" data-accion="restar" data-id="${id}" aria-label="Quitar uno">−</button>
            <output>${cantidad}</output>
            <button type="button" data-accion="sumar" data-id="${id}" aria-label="Agregar uno"
              ${cantidad >= p.unidades ? "disabled" : ""}>+</button>
          </div>
        </div>
        <div class="item-derecha">
          <span class="item-subtotal">${formato(precioFinal(p) * cantidad)}</span>
          <button type="button" class="btn-quitar" data-accion="quitar" data-id="${id}">Quitar</button>
        </div>
      </div>`;
  }).join("");

  // Subtotal = sin descuento; total = con descuento; la diferencia es el ahorro
  const subtotal = ids.reduce((suma, id) => suma + buscarProducto(id).precio * carrito[id], 0);
  const total = ids.reduce((suma, id) => suma + precioFinal(buscarProducto(id)) * carrito[id], 0);

  document.getElementById("carrito-subtotal").innerText = formato(subtotal);
  document.getElementById("carrito-ahorro").innerText = "-" + formato(subtotal - total);
  document.getElementById("carrito-total").innerText = formato(total);
}

// Clics dentro del carrito: misma delegación que en la grilla
document.getElementById("lista-carrito").addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "sumar") cambiarCantidad(id, +1);
  if (boton.dataset.accion === "restar") cambiarCantidad(id, -1);
  // "quitar" = restar TODO lo que hay
  if (boton.dataset.accion === "quitar") cambiarCantidad(id, -cantidadEnCarrito(id));
});

document.getElementById("btn-vaciar").addEventListener("click", () => {
  if (!confirm("¿Vaciar todo el carrito?")) return;
  const ids = Object.keys(carrito).map(Number);
  carrito = {};
  guardarCarrito();
  ids.forEach(actualizarPieTarjeta);
  pintarCarrito();
});

document.getElementById("btn-finalizar").addEventListener("click", () => {
  // Por ahora solo es visual: el pago y el pedido vendrán con Supabase
  mostrarAviso("Pronto: aquí se creará tu pedido en Supabase 🛍️");
});


// ===================== ABRIR / CERRAR EL CARRITO =====================
// Igual que el sidebar de cliente.js: solo poner o quitar clases;
// el movimiento lo hace el CSS (transform + transition)
function abrirCarrito() {
  const panel = document.getElementById("panel-carrito");
  panel.classList.add("abierto");
  panel.inert = false;
  document.getElementById("fondo-carrito").classList.add("visible");
  document.getElementById("btn-cerrar-carrito").focus();
}

function cerrarCarrito() {
  const panel = document.getElementById("panel-carrito");
  panel.classList.remove("abierto");
  panel.inert = true;
  document.getElementById("fondo-carrito").classList.remove("visible");
}

document.getElementById("btn-carrito").addEventListener("click", abrirCarrito);
document.getElementById("btn-cerrar-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("fondo-carrito").addEventListener("click", cerrarCarrito);
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") cerrarCarrito();
});


// ===================== AVISO (toast) =====================
let temporizadorAviso;

function mostrarAviso(mensaje) {
  const aviso = document.getElementById("aviso");
  aviso.innerText = mensaje;
  aviso.classList.add("visible");

  // Si llega otro aviso antes de que se esconda el anterior, reiniciamos
  // el tiempo (si no, el nuevo desaparecería antes de tiempo)
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2200);
}


// ===================== ARRANQUE =====================
// Igual que en admin.js: la consulta viaja a Supabase y vuelve, por eso
// "await" (y por eso la función es async).
async function cargarProductos() {
  const { data, error } = await db
    .from('products_practice')
    .select('*')
    .order('id');

  if (error) {
    console.log("Error al traer productos:", error);
    document.getElementById("grilla-productos").innerHTML =
      `<p class="sin-resultados">No pudimos cargar los productos 😕<br>Revisa la consola (F12).</p>`;
    document.getElementById("conteo-resultados").innerText = "";
    return;
  }

  // Limpiamos lo que escribieron a mano en admin: nombres con espacios
  // de más, y números que pueden llegar en null
  productos = data.map((p) => ({
    ...p,   // "..." copia todas las columnas tal cual; abajo pisamos algunas
    nombre: (p.nombre || "Sin nombre").trim(),
    precio: Number(p.precio) || 0,
    unidades: Number(p.unidades) || 0,
    descuento: Number(p.descuento) || 0,
  }));

  limpiarCarrito();
  mostrarChips();
  mostrarProductos();
  pintarCarrito();
}

// El carrito guardado en localStorage puede estar desactualizado: el
// admin pudo borrar un producto, marcarlo agotado o bajarle el stock.
// Antes de mostrarlo lo "sincronizamos" con lo que dice la base de datos.
function limpiarCarrito() {
  for (const id of Object.keys(carrito)) {
    const p = buscarProducto(Number(id));
    if (!p || !sePuedeComprar(p)) delete carrito[id];               // ya no se puede comprar
    else carrito[id] = Math.min(carrito[id], p.unidades);           // no más que el stock
  }
  guardarCarrito();
}

cargarProductos();
