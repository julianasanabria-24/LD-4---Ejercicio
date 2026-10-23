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

    // Reutilizamos la función agregarProducto de arriba: ella hace el insert
    const respuesta = await agregarProducto(nuevoProducto);

    const notificacion = document.getElementById("notificacion");

    if (respuesta) {
        notificacion.innerText = "Producto agregado con ID " + respuesta.id;
        formProducto.reset();   // limpia el formulario para agregar otro

        // Las listas de la página NO se actualizan solas: muestran lo que
        // se trajo la última vez. .click() "presiona" por código el botón
        // "Traer productos", que vuelve a consultar Supabase y redibuja
        // las listas, ahora incluyendo el producto nuevo.
        document.getElementById("btn-traer").click();
    } else {
        notificacion.innerText = "Error al agregar producto (mira la consola con F12)";
    }
});


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

// Dibuja una lista de productos como tarjetas dentro de #resultados-busqueda
function mostrarResultados(productos) {
  const contenedor = document.getElementById("resultados-busqueda");

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  contenedor.innerHTML = productos.map(p => `
    <article class="tarjeta-busqueda">
      ${p.imagen_url ? `<img src="${p.imagen_url}" alt="${p.nombre}">` : ""}
      <h3>${p.nombre}</h3>
      <p>${p.description ?? ""}</p>
      <p><strong>$${p.precio}</strong> · ${p.unidades} unidades</p>
      <p>${p.disponible ? "Disponible" : "Agotado"}</p>
      <p class="categorias">${(p.categorias || []).join(", ")}</p>
    </article>
  `).join("");
}

// El buscador también es un <form>, así funciona con clic o con Enter
document.getElementById("form-busqueda").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const texto = document.getElementById("input-busqueda").value.trim();
  if (texto === "") return;

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
