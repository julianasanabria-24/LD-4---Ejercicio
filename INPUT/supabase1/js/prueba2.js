document.getElementById('btn-traer').addEventListener('click', async () => {

  // "async" convierte esta función (el listener del clic) en una función
  // ASÍNCRONA: una función que PUEDE usar "await" adentro para esperar
  // algo que tarda, sin congelar el resto de la página mientras espera.
  //
  // Diferencia clave con localStorage (semana 7): localStorage.getItem()
  // y localStorage.setItem() son operaciones SINCRÓNICAS — ocurren al
  // instante, en tu propio computador, sin viajar a ningún lado. Por eso
  // nunca necesitaste "async"/"await" para leer o escribir en
  // localStorage. Una consulta a Supabase, en cambio, viaja por internet
  // hasta el servidor de Supabase y la respuesta tiene que volver — eso
  // toma un tiempo real (aunque sea poco), y JavaScript necesita una
  // forma explícita de decir "espera aquí a que llegue la respuesta".

  // "await" pausa la ejecución DE ESTA FUNCIÓN (no de toda la página)
  // hasta que la consulta a Supabase responda. Mientras tanto, el resto
  // de tu página sigue funcionando con normalidad — solo esta función
  // en particular se detiene en esta línea hasta tener respuesta real.
  const { data, error } = await db.from('products_practice').select('*');

  // Sin "await" en la línea de arriba, "data" y "error" NO tendrían el
  // resultado todavía — tendrías una "Promise" (promesa) sin resolver,
  // no los datos reales. Eso es justo lo que "await" evita: te obliga
  // a esperar antes de seguir usando el resultado.
  console.log(data, error);

if (error) {
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  else {
    document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
   }
   
   const nombres = data.map(producto => producto.nombre);
  // nombres es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';

  // OJO: el nombre después del punto tiene que ser EXACTAMENTE el nombre
  // de la columna en Supabase (descripcion, no "descripciones").
  // Si no existe, JavaScript devuelve "undefined".
  const descripciones = data.map(producto => producto.description);

  document.getElementById('resultado3').innerHTML =
    '<ul>' + descripciones.map(n => `<li>${n}</li>`).join('') + '</ul>';

  const precios = data.map(producto => producto.precio);

  document.getElementById('resultado4').innerHTML =
    '<ul>' + precios.map(n => `<li>${n}</li>`).join('') + '</ul>';

  const disponibles = data.map(producto => producto.disponible);

  document.getElementById('resultado5').innerHTML =
    '<ul>' + disponibles.map(n => `<li>${n ? 'Disponible' : 'Agotado'}</li>`).join('') + '</ul>';

  const categorias = data.map(producto => producto.categorias);

  document.getElementById('resultado6').innerHTML =
    '<ul>' + categorias.map(n => `<li>${n}</li>`).join('') + '</ul>';

  const unidades = data.map(producto => producto.unidades);

  document.getElementById('resultado8').innerHTML =
    '<ul>' + unidades.map(n => `<li>${n} unidades</li>`).join('') + '</ul>';

  const imagenes = data.map(producto => producto.imagen_url);

  document.getElementById('resultado7').innerHTML =
    imagenes.map(url => `<img src="${url}" width="120">`).join('');
});


//crud

const productoPrueba = {
    nombre : "Televisor",
    description : "Este es el producto de prueba",
    precio: 90000,   // sin punto: en JS 90.000 es 90 (el punto es decimal)
    unidades : 10,
    descuento : 0.1,
    disponible : true,
    categorias : ["tecnologia" , "accesorios"],
    imagen_url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjL9b13d__nkrztj6gbmIkRPY5dYBo1i6iOzmMttIxO2uH0VtotGcP0HJi&s=10",
}

    // ANTES (si lo hubieras hecho con localStorage, como en la semana 7):
// AHORA (Supabase):
async function agregarProducto(datos) {

  const { data, error } = await db
    .from('products_practice')  // la tabla
    .insert([datos])             // insert() siempre recibe un ARRAY de objetos,
                                  // aunque insertes uno solo
    .select();                    // .select() le pide a Supabase que te
                                   // devuelva la fila ya creada (con su id
                                   // nuevo) — sin esto, insert() no te
                                   // devuelve nada útil

  if (error) {
    console.log("Error al agregar:", error);
    return null;
  }

  return data[0];   // data siempre es un array — tomamos el primer
                     // elemento, que es la fila recién creada
}

// MODIFICAR (UPDATE): igual que agregarProducto, pero en vez de crear
// una fila nueva cambia una que ya existe, identificada por su id.
async function modificarProducto(id, cambios) {

  const { data, error } = await db
    .from('products_practice')
    .update(cambios)       // update() recibe UN objeto (no un array) con
                            // solo las columnas que quieres cambiar
    .eq('id', id)          // ¡IMPORTANTE! Sin .eq(), update() intentaría
                            // cambiar TODAS las filas de la tabla
    .select();             // igual que en insert: devuélveme la fila ya cambiada

  if (error) {
    console.log("Error al modificar:", error);
    return null;
  }

  // Si no existe ese id, o si la tabla no tiene una política RLS que
  // permita "update", Supabase NO da error: solo devuelve un array vacío.
  if (data.length === 0) {
    console.log("No se modificó nada: revisa el id o la política RLS de update");
    return null;
  }

  return data[0];
}

// ELIMINAR (DELETE): borra la fila con ese id
async function eliminarProducto(id) {

  const { data, error } = await db
    .from('products_practice')
    .delete()              // delete() no recibe nada: QUÉ borrar lo dice .eq()
    .eq('id', id)          // ¡IMPORTANTE! Sin .eq(), borraría TODA la tabla
    .select();             // devuélveme la fila que se borró (para confirmar)

  if (error) {
    console.log("Error al eliminar:", error);
    return null;
  }

  // Igual que en modificar: sin política RLS de "delete", Supabase no da
  // error, solo devuelve un array vacío y no borra nada
  if (data.length === 0) {
    console.log("No se eliminó nada: revisa el id o la política RLS de delete");
    return null;
  }

  return data[0];
}

// FORMULARIO → SUPABASE
// En vez de escuchar el "click" del botón, escuchamos el "submit" del
// formulario. El botón "Agregar Producto" es type="submit", así que al
// hacer clic (o presionar Enter) se dispara este evento. Ventaja: el
// navegador revisa primero los campos "required" antes de llegar aquí.
const formProducto = document.getElementById("form-producto");

formProducto.addEventListener("submit", async (evento) => {

    // Por defecto, un formulario recarga la página al enviarse.
    // preventDefault() lo impide, para que nuestro código haga el trabajo.
    evento.preventDefault();

    // FormData lee todos los campos del formulario de una vez.
    // form.get("nombre") devuelve lo que se escribió en el input con name="nombre".
    // OJO: todo lo que viene de un input llega como TEXTO (string).
    const form = new FormData(formProducto);

    // Armamos un objeto con la MISMA forma que productoPrueba.
    // Las claves deben llamarse igual que las columnas de la tabla.
    const nuevoProducto = {
        nombre: form.get("nombre").trim(),
        description: form.get("description").trim(),

        // Number() convierte el texto "90000" en el número 90000
        precio: Number(form.get("precio")),
        unidades: Number(form.get("unidades")),
        descuento: Number(form.get("descuento")),

        // Un checkbox sin marcar NO aparece en FormData (da null).
        // Por eso preguntamos si existe: marcado → true, sin marcar → false
        disponible: form.get("disponible") !== null,

        // "tecnologia, audio" → split(",") → ["tecnologia", " audio"]
        // → map(trim) quita espacios → filter quita textos vacíos
        categorias: form.get("categorias")
            .split(",")
            .map(c => c.trim())
            .filter(c => c !== ""),

        // Si no escribieron URL, guardamos null (vacío) en vez de ""
        imagen_url: form.get("imagen_url").trim() || null,
    };

    console.log("Enviando a Supabase:", nuevoProducto);

    // El campo oculto "id" decide qué hacer: vacío → agregar, con número → modificar
    const id = form.get("id");
    const notificacion = document.getElementById("notificacion");

    if (id) {
        const respuesta = await modificarProducto(Number(id), nuevoProducto);

        if (respuesta) {
            notificacion.innerText = "Producto " + respuesta.id + " actualizado";
            salirModoEdicion();
            document.getElementById("btn-traer").click();

            // Refrescamos el recuadro de productos para ver el cambio
            document.getElementById("form-busqueda").requestSubmit();
        } else {
            notificacion.innerText = "Error al modificar producto (mira la consola con F12)";
        }
        return;
    }

    // Reutilizamos la función agregarProducto de arriba: ella hace el insert
    const respuesta = await agregarProducto(nuevoProducto);

    if (respuesta) {
        notificacion.innerText = "Producto agregado con ID " + respuesta.id;
        formProducto.reset();   // limpia el formulario para agregar otro
        actualizarVistaPrevia();

        // El producto nuevo también aparece en el recuadro de productos
        document.getElementById("form-busqueda").requestSubmit();

        // Las listas de la página NO se actualizan solas: muestran lo que
        // se trajo la última vez. .click() "presiona" por código el botón
        // "Traer productos", que vuelve a consultar Supabase y redibuja
        // las listas, ahora incluyendo el producto nuevo.
        document.getElementById("btn-traer").click();
    } else {
        notificacion.innerText = "Error al agregar producto (mira la consola con F12)";
    }
});

// MODO EDICIÓN: reutilizamos el MISMO formulario de "Agregar producto".
// Llenamos sus campos con los datos del producto y guardamos su id en
// el campo oculto, así el "submit" de arriba sabe que debe modificar.
function entrarModoEdicion(p) {
    const campos = formProducto.elements;   // los inputs, por su "name"

    campos.id.value = p.id;
    campos.nombre.value = p.nombre ?? "";
    campos.description.value = p.description ?? "";
    campos.precio.value = p.precio ?? 0;
    campos.unidades.value = p.unidades ?? 0;
    campos.descuento.value = p.descuento ?? 0;
    campos.disponible.checked = p.disponible;          // checkbox → .checked, no .value
    campos.categorias.value = (p.categorias || []).join(", ");   // array → texto
    campos.imagen_url.value = p.imagen_url ?? "";
    actualizarVistaPrevia();   // muestra la foto actual del producto

    document.getElementById("titulo-form").innerText = "Modificar producto #" + p.id;
    document.getElementById("btn2").innerText = "Guardar cambios";
    document.getElementById("btn-cancelar").hidden = false;

    // Sube la pantalla hasta el formulario
    formProducto.scrollIntoView({ behavior: "smooth" });
}

function salirModoEdicion() {
    formProducto.reset();
    // OJO: reset() NO limpia un input hidden al que le pusimos .value por
    // código, así que lo vaciamos a mano
    formProducto.elements.id.value = "";
    actualizarVistaPrevia();

    document.getElementById("titulo-form").innerText = "Agregar producto";
    document.getElementById("btn2").innerText = "Agregar Producto";
    document.getElementById("btn-cancelar").hidden = true;
}

document.getElementById("btn-cancelar").addEventListener("click", salirModoEdicion);

// VISTA PREVIA DE LA IMAGEN: mientras escribes/pegas la URL, intentamos
// cargarla en un <img> pequeño. Así sabes ANTES de guardar si la URL
// realmente es una imagen.
const inputImagen = formProducto.elements.imagen_url;
const vistaPrevia = document.getElementById("vista-previa");
const ayudaImagen = document.getElementById("ayuda-imagen");

function actualizarVistaPrevia() {
  const url = inputImagen.value.trim();
  vistaPrevia.classList.remove("cargada", "con-error");

  if (url === "") {
    vistaPrevia.removeAttribute("src");
    ayudaImagen.innerText = "Clic derecho en la foto → «Copiar dirección de imagen»";
    return;
  }

  ayudaImagen.innerText = "Cargando imagen...";
  vistaPrevia.src = url;   // el navegador intenta descargarla → dispara "load" o "error"
}

vistaPrevia.addEventListener("load", () => {
  vistaPrevia.classList.add("cargada");
  ayudaImagen.innerText = "✓ Imagen encontrada";
});

vistaPrevia.addEventListener("error", () => {
  // Si el campo está vacío no es un error de verdad
  if (inputImagen.value.trim() === "") return;
  vistaPrevia.removeAttribute("src");   // sin src no se ve el ícono de "imagen rota"
  vistaPrevia.classList.add("con-error");
  ayudaImagen.innerText = "✗ Esa URL no es una imagen (¿copiaste la página en vez de la foto?)";
});

// "input" se dispara con cada tecla o al pegar
inputImagen.addEventListener("input", actualizarVistaPrevia);
actualizarVistaPrevia();


// ===================== BÚSQUEDA =====================
// Estas funciones van FUERA de cualquier addEventListener, para que
// existan desde que carga la página y cualquier parte del código las use.

async function buscarProductoPorId(id) {
  const { data, error } = await db
    .from('products_practice')
    .select('*')
    .eq('id', id)    // eq = "equal" (igual a) — equivalente a find(p => p.id === id)
    .single();         // single() = "espero exactamente una fila, dámela
                        // como objeto, no como array de un elemento"

  if (error) return null;
  return data;
}

async function buscarProductosPorNombre(texto) {
  const { data, error } = await db
    .from('products_practice')
    .select('*')
    .ilike('nombre', `%${texto}%`);
    // ilike = "like" insensible a mayúsculas/minúsculas.
    // los símbolos % significan "cualquier texto antes/después" —
    // equivalente a .toLowerCase().includes(texto)

  if (error) return [];
  return data;
}

// Quita tildes y pasa a minúsculas: "Tecnología" → "tecnologia".
// Así buscar "tecnologia" (sin tilde) también encuentra "tecnología".
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

async function buscarProductosPorCategoria(texto) {
  // La columna "categorias" es de tipo json, y Supabase NO puede filtrar
  // dentro de ese tipo (ni con ilike ni con contains). Por eso traemos
  // todos los productos y filtramos aquí en JavaScript.
  const { data, error } = await db.from('products_practice').select('*');
  if (error) return [];

  const buscado = normalizar(texto);

  // Un producto sirve si ALGUNA (some) de sus categorías contiene el texto.
  // "|| []" evita errores si un producto no tiene categorías (null).
  return data.filter(producto =>
    (producto.categorias || []).some(cat => normalizar(cat).includes(buscado))
  );
}

// Cuadrito de reemplazo cuando un producto no tiene foto (o la foto
// no carga): muestra la primera letra del nombre sobre el degradado
function fotoSinImagen(nombre) {
  const inicial = (nombre || "?").trim().charAt(0).toUpperCase();
  return `<span class="miniatura sin-foto" title="Sin imagen">${inicial}</span>`;
}

// Si una imagen NO carga (URL rota, o la URL es de una página web y no
// de una imagen), el navegador lanza el evento "error" en ese <img>.
// Ese evento no "sube" al contenedor como un clic, por eso usamos el
// tercer parámetro "true" (fase de captura) para poder atraparlo aquí.
document.getElementById("resultados-busqueda").addEventListener("error", (evento) => {
  const img = evento.target;
  if (img.classList && img.classList.contains("miniatura")) {
    img.outerHTML = fotoSinImagen(img.alt);
  }
}, true);

// Dibuja los productos como una TABLA dentro de #resultados-busqueda:
// una fila (<tr>) por producto y una celda (<td>) por dato
function mostrarResultados(productos) {
  const contenedor = document.getElementById("resultados-busqueda");

  if (productos.length === 0) {
    contenedor.innerHTML = "<p class='sin-resultados'>No se encontraron productos.</p>";
    return;
  }

  // 90000 → "$90.000" (formato colombiano, con punto de miles)
  const formato = (n) => '$' + Number(n).toLocaleString('es-CO');

  // "i" es la posición de la fila (0, 1, 2...). La pasamos al CSS como
  // --i para que cada fila aparezca un poquito después que la anterior
  const filas = productos.map((p, i) => `
    <tr style="--i: ${i}">
      <td>
        <!-- La foto es un botón: al hacer clic abre el producto para cambiar su imagen -->
        <button type="button" class="btn-foto" data-id="${p.id}" title="Cambiar imagen">
          ${p.imagen_url
            ? `<img class="miniatura" src="${p.imagen_url}" alt="${p.nombre.trim()}" loading="lazy">`
            : fotoSinImagen(p.nombre)}
        </button>
      </td>
      <td>
        <span class="nombre-producto">${p.nombre.trim()}</span>
        <span class="categorias">${(p.categorias || []).join(", ")}</span>
      </td>
      <td class="precio-celda">${formato(p.precio)}</td>
      <td>${p.unidades}</td>
      <td>
        <span class="estado ${p.disponible ? "disponible" : "agotado"}">
          ${p.disponible ? "Disponible" : "Agotado"}
        </span>
      </td>
      <td>
        <div class="acciones-fila">
          <button type="button" class="btn-editar" data-id="${p.id}">Editar</button>
          <button type="button" class="btn-eliminar" data-id="${p.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  contenedor.innerHTML = `
    <table class="tabla-productos">
      <thead>
        <tr>
          <th></th>
          <th>Producto</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>`;
}

// Los botones "Editar" y "Eliminar" se crean y se borran con cada
// búsqueda, así que escuchamos el clic en el contenedor (que siempre
// existe) y miramos qué botón se clicó ("delegación de eventos")
document.getElementById("resultados-busqueda").addEventListener("click", async (evento) => {

  const botonEditar = evento.target.closest(".btn-editar");
  if (botonEditar) {
    // data-id="5" se lee como boton.dataset.id (llega como texto: "5")
    const producto = await buscarProductoPorId(Number(botonEditar.dataset.id));
    if (producto) entrarModoEdicion(producto);
    return;
  }

  // Clic en la FOTO: abre el producto en el formulario y pone el cursor
  // directo en "URL de la imagen", con el texto seleccionado para que al
  // pegar la nueva URL reemplace la anterior
  const botonFoto = evento.target.closest(".btn-foto");
  if (botonFoto) {
    const producto = await buscarProductoPorId(Number(botonFoto.dataset.id));
    if (producto) {
      entrarModoEdicion(producto);
      inputImagen.focus({ preventScroll: true });
      inputImagen.select();
    }
    return;
  }

  const botonEliminar = evento.target.closest(".btn-eliminar");
  if (botonEliminar) {
    const id = Number(botonEliminar.dataset.id);
    // closest("tr") = la fila del botón; de ahí sacamos el nombre del producto
    const nombre = botonEliminar.closest("tr").querySelector(".nombre-producto").innerText;

    // Borrar NO se puede deshacer, así que pedimos confirmación.
    // confirm() muestra una ventanita con "Aceptar" (true) y "Cancelar" (false)
    if (!confirm(`¿Seguro que quieres eliminar "${nombre}"? No se puede deshacer.`)) return;

    const eliminado = await eliminarProducto(id);
    const notificacion = document.getElementById("notificacion");

    if (eliminado) {
      notificacion.innerText = "Producto " + eliminado.id + " eliminado";

      // Si justo estábamos editando ese producto, limpiamos el formulario
      if (Number(formProducto.elements.id.value) === id) salirModoEdicion();

      // Repetimos la búsqueda y refrescamos el catálogo: el producto ya no sale
      document.getElementById("form-busqueda").requestSubmit();
      document.getElementById("btn-traer").click();
    } else {
      alert("No se pudo eliminar el producto (mira la consola con F12)");
    }
  }
});

// El buscador también es un <form>, así funciona con clic o con Enter
document.getElementById("form-busqueda").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const texto = document.getElementById("input-busqueda").value.trim();

  // Siempre que se recarga el recuadro, actualizamos los números del encabezado
  actualizarEstadisticas();

  // Campo vacío → mostramos TODOS los productos
  if (texto === "") {
    const { data, error } = await db.from('products_practice').select('*').order('id');
    mostrarResultados(error ? [] : data);
    return;
  }

  // Si lo escrito es solo un número (ej: "3"), buscamos por ID
  if (/^\d+$/.test(texto)) {
    const producto = await buscarProductoPorId(Number(texto));
    // buscarProductoPorId devuelve UN objeto (o null), pero
    // mostrarResultados espera un ARRAY, así que lo envolvemos en [ ]
    mostrarResultados(producto ? [producto] : []);
    return;
  }

  // Si es texto, buscamos por nombre Y por categoría al mismo tiempo.
  // Promise.all espera a que terminen las dos consultas.
  const [porNombre, porCategoria] = await Promise.all([
    buscarProductosPorNombre(texto),
    buscarProductosPorCategoria(texto),
  ]);

  // Juntamos los dos resultados sin repetir: un producto puede salir en
  // ambos (ej: buscar "gamer" coincide en nombre y en categoría "gaming").
  // Usamos un Map con el id como clave: si el id ya está, se sobrescribe.
  const unicos = new Map();
  [...porNombre, ...porCategoria].forEach(p => unicos.set(p.id, p));

  mostrarResultados([...unicos.values()]);
});

// ===================== MODO CLARO / OSCURO =====================
// El tema se guarda como atributo en <html data-tema="oscuro">, y el CSS
// cambia las variables de color según ese atributo. El script pequeño del
// <head> ya puso el tema guardado al cargar; aquí solo lo cambiamos.
const btnTema = document.getElementById("btn-tema");

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  btnTema.innerText = tema === "oscuro" ? "☀️ Modo claro" : "🌙 Modo oscuro";

  // localStorage (semana 7) recuerda la elección aunque recargues la página
  try { localStorage.setItem("tema", tema); } catch (e) {}
}

btnTema.addEventListener("click", () => {
  const actual = document.documentElement.dataset.tema;
  aplicarTema(actual === "oscuro" ? "claro" : "oscuro");

  async function eliminarProducto(id) {

  const { error } = await db
    .from('productos_practica')
    .delete()
    .eq('id', id);

  return !error;   // true si NO hubo error (se borró bien), false si falló
}

});

aplicarTema(document.documentElement.dataset.tema);

// ===================== ESTADÍSTICAS DEL ENCABEZADO =====================
// Traemos solo las 2 columnas que necesitamos (no "*") y contamos aquí.
async function actualizarEstadisticas() {
  const { data, error } = await db.from('products_practice').select('disponible, unidades');
  if (error) return;

  // filter(...).length = cuántos cumplen la condición
  // reduce suma todas las unidades: 0 + 25 + 12 + ...
  const disponibles = data.filter(p => p.disponible).length;
  const unidades = data.reduce((suma, p) => suma + (p.unidades || 0), 0);

  document.getElementById("stat-total").innerText = data.length;
  document.getElementById("stat-disponibles").innerText = disponibles;
  document.getElementById("stat-agotados").innerText = data.length - disponibles;
  document.getElementById("stat-unidades").innerText = unidades.toLocaleString('es-CO');
}

// Al abrir la página, el recuadro de productos se llena con todos:
// requestSubmit() "envía" el buscador vacío por código
document.getElementById("form-busqueda").requestSubmit();
