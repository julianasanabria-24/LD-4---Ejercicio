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

// { producto_id: cantidad elegida en la tarjeta antes de pulsar "Agregar" }
const cantidadesSeleccionadas = {};

// Id del pedido de este cliente que está en estado 'carrito' (tabla pedidos)
let pedidoId = null;

// { producto_id: id de su fila en detalles_pedidos }, para poder hacer
// update/delete de esa fila sin volver a buscarla
const detalleIds = {};

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

// Redibuja todo lo que depende del carrito: el pie de cada tarjeta y el panel
function actualizarCarrito() {
  guardarCarrito();
  productos.forEach((p) => actualizarPieTarjeta(p.id));
  pintarCarrito();
}


// ===================== CARRITO EN SUPABASE (pedidos) =====================
// El carrito de un cliente es una fila de "pedidos" con estado 'carrito';
// cada producto es una fila de "detalles_pedidos". Las políticas RLS
// solo dejan ver y tocar los pedidos propios (cliente_id = auth.uid()).

// Usuario con sesión iniciada, o null si nadie entró
async function obtenerUsuario() {
  const { data } = await db.auth.getUser();
  return data.user || null;
}

// Id del pedido en estado 'carrito' de ese cliente, o null si no tiene
async function buscarCarrito(usuario) {
  const { data, error } = await db
    .from('pedidos')
    .select('id')
    .eq('cliente_id', usuario.id)
    .eq('estado', 'carrito')
    .maybeSingle();   // 0 filas → data = null (single() daría error)

  if (error) {
    console.log("Error al buscar el carrito:", error);
    return null;
  }
  return data ? data.id : null;
}

// Devuelve el id del carrito abierto; si no hay, lo crea
async function obtenerOCrearCarrito(usuario) {
  if (pedidoId) return pedidoId;

  pedidoId = await buscarCarrito(usuario);
  if (pedidoId) return pedidoId;

  // Solo mandamos cliente_id: el estado ('carrito') lo pone la base de
  // datos por defecto, y tampoco tenemos permiso para enviarlo
  const { data, error } = await db
    .from('pedidos')
    .insert({ cliente_id: usuario.id })
    .select('id')
    .single();

  if (error) {
    // 23505 = violación de unicidad: ya hay un carrito abierto (doble
    // clic u otra pestaña lo creó un instante antes). Lo usamos.
    if (error.code === '23505') {
      pedidoId = await buscarCarrito(usuario);
      return pedidoId;
    }
    console.log("Error al crear el carrito:", error);
    return null;
  }

  pedidoId = data.id;
  return pedidoId;
}

// Olvida el carrito en esta página (por ejemplo, al cerrar sesión o al confirmar)
function vaciarCarritoLocal() {
  carrito = {};
  for (const id of Object.keys(detalleIds)) delete detalleIds[id];   // es const: se vacía, no se reasigna
  pedidoId = null;
  actualizarCarrito();
}

// Suma "cantidad" unidades del producto al carrito. El id llega como texto
// (btn.dataset.id). Devuelve true si salió bien, false si falló.
async function agregarAlCarrito(id, cantidad) {
  const usuario = await obtenerUsuario();
  const nueva = (carrito[id] || 0) + cantidad;

  // Sin sesión: modo demostración, solo en esta página (no toca Supabase)
  if (!usuario) {
    carrito[id] = nueva;
    return true;
  }

  const pedido = await obtenerOCrearCarrito(usuario);
  if (!pedido) return false;

  if (detalleIds[id]) {
    // Ya está en el carrito: cambiamos la cantidad de su fila
    const { data, error } = await db
      .from('detalles_pedidos')
      .update({ cantidad: nueva })
      .eq('id', detalleIds[id])
      .select();

    if (error) {
      console.log("Error al cambiar la cantidad:", error);
      return false;
    }
    // Si RLS bloquea el update no hay error: simplemente no cambia ninguna fila
    if (data.length === 0) {
      console.log("No se actualizó el detalle (¿RLS? ¿el pedido ya no es 'carrito'?)");
      return false;
    }
  } else {
    // Producto nuevo en el carrito. NUNCA mandamos el precio: lo copia
    // un trigger desde products_practice (y no tenemos permiso de enviarlo)
    const { data, error } = await db
      .from('detalles_pedidos')
      .insert({ pedido_id: pedido, producto_id: Number(id), cantidad })
      .select('id')
      .single();

    if (error) {
      // 23505 = ese producto ya tiene fila en este carrito (se agregó en otra
      // pestaña, o antes de que terminara cargarCarritoDesdeBD). La buscamos
      // y volvemos a intentar: esta vez entra por el UPDATE.
      if (error.code === '23505') {
        const { data: existente, error: errorBuscar } = await db
          .from('detalles_pedidos')
          .select('id, cantidad')
          .eq('pedido_id', pedido)
          .eq('producto_id', Number(id))
          .maybeSingle();

        if (errorBuscar || !existente) {
          console.log("Error al buscar el detalle repetido:", errorBuscar || error);
          return false;
        }
        detalleIds[id] = existente.id;
        carrito[id] = existente.cantidad;
        return agregarAlCarrito(id, cantidad);
      }
      console.log("Error al agregar el producto:", error.code, error.message, error);
      return false;
    }
    detalleIds[id] = data.id;
  }

  carrito[id] = nueva;
  return true;
}

// Saca un producto del carrito. Si tiene fila en detalles_pedidos, la borra.
// El pedido NO se borra aunque quede vacío: se reutiliza como carrito.
async function quitarDelCarrito(id) {
  if (detalleIds[id]) {
    const { data, error } = await db
      .from('detalles_pedidos')
      .delete()
      .eq('id', detalleIds[id])
      .select();

    // Igual que con update: si RLS bloquea el delete no hay error, solo 0 filas
    if (error || data.length === 0) {
      console.log("No se pudo quitar el producto:", error || "0 filas borradas (¿RLS?)");
      mostrarAviso("No se pudo quitar el producto 😕");
      return;   // el carrito local queda igual que la base de datos
    }
    delete detalleIds[id];
  }

  delete carrito[id];
  actualizarCarrito();
}

// Al abrir la página: trae el carrito abierto del cliente desde Supabase
// (pedido en estado 'carrito' + sus detalles) en UNA sola consulta.
async function cargarCarritoDesdeBD() {
  await productosListos;   // pintarCarrito necesita "productos" para nombres y precios
  vaciarCarritoLocal();

  const usuario = await obtenerUsuario();
  if (!usuario) return;

  // Select anidado: Supabase sigue la foreign key detalles_pedidos.pedido_id
  // y trae los detalles dentro del pedido: { id, detalles_pedidos: [...] }
  const { data, error } = await db
    .from('pedidos')
    .select('id, detalles_pedidos(id, producto_id, cantidad)')
    .eq('cliente_id', usuario.id)
    .eq('estado', 'carrito')
    .maybeSingle();

  if (error) {
    console.log("Error al cargar el carrito:", error);
    return;
  }
  if (!data) return;   // todavía no tiene carrito: se crea al agregar algo

  pedidoId = data.id;
  for (const d of data.detalles_pedidos) {
    carrito[d.producto_id] = d.cantidad;
    detalleIds[d.producto_id] = d.id;
  }
  actualizarCarrito();
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

  // "Agregar al carrito" va a Supabase; el selector − n + sigue igual que antes
  if (boton.classList.contains("btn-agregar")) {
    clicAgregar(boton);
    return;
  }

  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "sumar") cambiarCantidad(id, +1);
  if (boton.dataset.accion === "restar") cambiarCantidad(id, -1);
});

// Clic en "Agregar al carrito" de una tarjeta
async function clicAgregar(btn) {
  const id = btn.dataset.id;   // texto, como lo espera agregarAlCarrito
  const cantidad = cantidadesSeleccionadas[id] || 1;

  btn.disabled = true;   // mientras viaja a Supabase: evita el doble clic
  const ok = await agregarAlCarrito(id, cantidad);
  btn.disabled = false;

  cantidadesSeleccionadas[id] = 1;   // el contador de la tarjeta vuelve a 1

  btn.innerText = ok ? "Agregado ✓" : "Error";
  btn.classList.add(ok ? "agregado" : "con-error");   // verde o rojo (galeria.css)
  if (ok) animarContador();
  pintarCarrito();   // el numerito y el panel se actualizan ya

  // actualizarCarrito() redibuja el pie de la tarjeta (cambia el botón por
  // el selector − n +), así que esperamos a que se vea el mensaje
  setTimeout(() => {
    btn.innerText = "Agregar al carrito";
    btn.classList.remove("agregado", "con-error");
    actualizarCarrito();
  }, 1200);
}

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
    // Sin productos no hay nada que confirmar: cerramos el formulario
    formCheckout.hidden = true;
    btnCheckout.hidden = false;
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
  // "quitar" borra el producto también en Supabase (si hay sesión)
  if (boton.dataset.accion === "quitar") quitarDelCarrito(id);
});

document.getElementById("btn-vaciar").addEventListener("click", () => {
  if (!confirm("¿Vaciar todo el carrito?")) return;
  const ids = Object.keys(carrito).map(Number);
  carrito = {};
  guardarCarrito();
  ids.forEach(actualizarPieTarjeta);
  pintarCarrito();
});



// ===================== CHECKOUT (formulario de envío) =====================
// btnCheckout es el botón "Finalizar compra" (#btn-finalizar)
const btnCheckout = document.getElementById("btn-finalizar");
const formCheckout = document.getElementById("form-checkout");
const mensajeCarrito = document.getElementById("mensaje-carrito");
const checkEnvio = document.getElementById("checkout-envio");

// "Finalizar compra": muestra el formulario solo si hay productos y sesión
btnCheckout.addEventListener("click", async () => {
  mensajeCarrito.textContent = "";

  if (totalUnidades() === 0) {
    mensajeCarrito.textContent = "Tu carrito está vacío.";
    return;
  }

  const usuario = await obtenerUsuario();
  if (!usuario) {
    mensajeCarrito.textContent = "Para comprar, inicia sesión en Mi perfil (cliente.html).";
    return;
  }

  formCheckout.hidden = false;
  btnCheckout.hidden = true;
});

document.getElementById("btn-cancelar-checkout").addEventListener("click", () => {
  formCheckout.hidden = true;
  btnCheckout.hidden = false;
});

// Dirección y teléfono solo son obligatorios si hay envío a domicilio
checkEnvio.addEventListener("change", () => {
  document.getElementById("checkout-direccion").required = checkEnvio.checked;
  document.getElementById("checkout-telefono").required = checkEnvio.checked;
});

// Texto del campo sin espacios, o null si quedó vacío
function textoONull(idCampo) {
  return document.getElementById(idCampo).value.trim() || null;
}

// "Confirmar pedido". IMPORTANTE: el navegador NO calcula el total ni cambia
// el estado: solo llama a confirmar_pedido(), que valida el stock, copia los
// datos de envío y pasa el pedido de 'carrito' a confirmado en la base.
formCheckout.addEventListener("submit", async (evento) => {
  evento.preventDefault();   // un <form> recargaría la página
  if (!pedidoId) return;

  const btnConfirmar = document.getElementById("btn-confirmar");
  btnConfirmar.disabled = true;
  mensajeCarrito.textContent = "";

  const { data, error } = await db.rpc('confirmar_pedido', {
    p_pedido_id: pedidoId,
    p_envio: checkEnvio.checked,
    p_direccion: textoONull("checkout-direccion"),
    p_telefono: textoONull("checkout-telefono"),
    p_observacion: textoONull("checkout-observacion"),
  });

  btnConfirmar.disabled = false;

  if (error) {
    // El mensaje lo escribe la función (ej: "Stock insuficiente para el producto 2").
    // El carrito NO se vacía: el cliente puede corregirlo y volver a intentar.
    console.log("Error al confirmar el pedido:", error);
    mensajeCarrito.textContent = error.message;
    return;
  }

  // data = la fila del pedido ya confirmado. El total lo calcula la vista
  const { data: conTotal, error: errorTotal } = await db
    .from('pedidos_con_total')
    .select('total')
    .eq('id', data.id)
    .single();

  if (errorTotal) console.log("Error al leer el total:", errorTotal);

  vaciarCarritoLocal();   // el próximo "Agregar" crea un carrito nuevo
  formCheckout.reset();
  document.getElementById("checkout-direccion").required = false;
  document.getElementById("checkout-telefono").required = false;

  // El pedido ya quedó confirmado aunque fallara la lectura del total
  mensajeCarrito.textContent = conTotal
    ? `Pedido #${data.id} confirmado. Total: ${formato(Number(conTotal.total))}`
    : `Pedido #${data.id} confirmado.`;
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

// cargarProductos es async: devuelve una promesa que termina cuando los
// productos cargaron (o fallaron). cargarCarritoDesdeBD la espera.
const productosListos = cargarProductos();
cargarCarritoDesdeBD();

// La sesión se abre y se cierra en cliente.html, que es OTRA página (no
// carga este archivo). Al volver aquí con un enlace la página se recarga y
// cargarCarritoDesdeBD() ya hace su trabajo. Quedan dos casos:
// 1) Cerrar sesión en otra pestaña: Supabase avisa a todas las pestañas.
db.auth.onAuthStateChange((evento) => {
  if (evento === "SIGNED_OUT") vaciarCarritoLocal();
});
// 2) Volver con el botón "Atrás": el navegador puede mostrar la página
//    guardada en memoria (bfcache) SIN recargarla; persisted = true.
window.addEventListener("pageshow", (evento) => {
  if (evento.persisted) cargarCarritoDesdeBD();
});
