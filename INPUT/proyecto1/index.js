/*-----Carta Principal----------------------------*/

/* Esta función recibe un álbum y construye una tarjeta HTML utilizando la información almacenada en sus propiedades. */

function crearCarta(album) {

  /* Creamos un elemento div que funcionará como contenedor principal de cada álbum. */

  const card = document.createElement("div");
  card.classList.add("card");

  /* Para la portada de la tarjeta, utilice la propiedad imagen de cada objeto. */

  const imagen = document.createElement("img");
  imagen.src = album.imagen;
  imagen.alt = `Portada del álbum ${album.nombre}`;
  imagen.classList.add("card-imagen");

  /* Se creo un contenedor para organizar toda la iformación. */

  const body = document.createElement("div");
  body.classList.add("card-body");


  /*-----Carta Principal - contenido----------------------------*/

  const header = document.createElement("div");
  header.classList.add("card-header");

  const nombre = document.createElement("h2");
  nombre.classList.add("card-nombre");
  nombre.textContent = album.nombre;

  const año = document.createElement("span");
  año.classList.add("card-año");
  año.textContent = album.año;

  header.appendChild(nombre);
  header.appendChild(año);

  const subtitle = document.createElement("p");
  subtitle.classList.add("card-subtitle");
  subtitle.textContent = `${album.tipo} · Era ${album.era}`;

  const stats = document.createElement("div");
  stats.classList.add("card-stats");

  function agregarStat(etiqueta, valor) {

    const stat = document.createElement("div");
    stat.classList.add("stat");

    const label = document.createElement("span");
    label.classList.add("stat-label");
    label.textContent = etiqueta;

    const value = document.createElement("span");
    value.classList.add("stat-value");
    value.textContent = valor;

    stat.appendChild(label);
    stat.appendChild(value);

    stats.appendChild(stat);
  }

  agregarStat("Canciones", album.canciones);
  agregarStat("Favorito", album.favorito ? "Sí" : "No");


  const descripcion = document.createElement("p");
  descripcion.classList.add("card-descripcion");
  descripcion.textContent = album.descripcion;


  const cancionesTitulo = document.createElement("h3");
  cancionesTitulo.classList.add("card-canciones-titulo");
  cancionesTitulo.textContent = "Canciones destacadas";


  const cancionesLista = document.createElement("ul");
  cancionesLista.classList.add("card-canciones");

  album.cancionesDestacadas.forEach(function(cancion) {

    const item = document.createElement("li");
    item.textContent = cancion;

    cancionesLista.appendChild(item);
  });


  /*-----Armar la tarjeta----------------------------*/

  /* Organizamos todos los elementos creados dentro del contenido de la tarjeta.*/

  body.appendChild(header);
  body.appendChild(subtitle);
  body.appendChild(stats);
  body.appendChild(descripcion);
  body.appendChild(cancionesTitulo);
  body.appendChild(cancionesLista);

  card.appendChild(imagen);
  card.appendChild(body);

  return card;
}


/*-----Renderizar----------------------------*/

const galeria = document.getElementById("galeria");

/* Esta función recibe un array de objetos y los pinta en la galería.
  1. Vacía la galería, para poder llamarla varias veces sin duplicar tarjetas.
  2. Por cada objeto llama a crearCarta(), que construye la tarjeta.
  3. Agrega la tarjeta a la galería. */

function renderizarHeroes(listaObjetos) {

  galeria.innerHTML = "";

  listaObjetos.forEach(function(objeto) {

    galeria.appendChild(
      crearCarta(objeto)
    );

  });

}

renderizarHeroes(obtenerAlbums());


/*-----Seleccionar una tarjeta----------------------------*/

/* Cuando hacemos clic sobre una tarjeta, mostramos únicamente esa tarjeta.
  El evento se escucha en la galería (delegación de eventos) y no en cada tarjeta:
  así también funciona con las tarjetas que se vuelven a pintar al filtrar. */

const btnVolver = document.getElementById("btn-volver");

galeria.addEventListener("click", function(e) {

  const tarjeta = e.target.closest(".card");
  if (!tarjeta) return;

  tarjeta.classList.add("seleccionada");
  galeria.classList.add("mostrar-una");
  btnVolver.classList.add("mostrar");

});


/*-----Boton para volver a ver todos los albumes----------------------------*/

/* Al hacer clic, quitamos la selección y mostramos nuevamente todas las tarjetas. */

function quitarSeleccion() {

  galeria.classList.remove("mostrar-una");

  galeria.querySelectorAll(".card").forEach(function(tarjeta) {

    tarjeta.classList.remove("seleccionada");

  });

  btnVolver.classList.remove("mostrar");

}

btnVolver.addEventListener("click", quitarSeleccion);


/*-----Filtros por año y estilo----------------------------*/

/* Los botones se crean a partir de los valores que existen en los datos:
  si se agrega un álbum con un año o estilo nuevo, su botón aparece solo.
  Los dos filtros se combinan: por ejemplo, 2018 + EDM. */

const filtros = { año: "todos", estilo: "todos" };
const filtroVacio = document.getElementById("filtro-vacio");

function valoresUnicos(clave) {

  const valores = obtenerAlbums()
    .map(function(album) { return album[clave]; })
    .filter(function(valor) { return valor !== undefined && valor !== ""; });

  return [...new Set(valores)];
}

function crearBotonesFiltro(clave, valores) {

  const contenedor = document.getElementById(`filtro-${clave}`);

  ["todos", ...valores].forEach(function(valor) {

    const boton = document.createElement("button");
    boton.classList.add("filtro-boton");
    boton.textContent = valor === "todos" ? "Todos" : valor;
    boton.dataset.valor = valor;

    if (valor === "todos") boton.classList.add("activo");

    boton.addEventListener("click", function() {

      filtros[clave] = valor;

      contenedor.querySelectorAll(".filtro-boton").forEach(function(b) {
        b.classList.toggle("activo", b === boton);
      });

      aplicarFiltros();

    });

    contenedor.appendChild(boton);
  });
}

function aplicarFiltros() {

  const filtrados = obtenerAlbums().filter(function(album) {
    const coincideAño = filtros.año === "todos" || String(album.año) === filtros.año;
    const coincideEstilo = filtros.estilo === "todos" || album.estilo === filtros.estilo;
    return coincideAño && coincideEstilo;
  });

  quitarSeleccion();
  renderizarHeroes(filtrados);
  filtroVacio.hidden = filtrados.length > 0;
}

/* Estilos en orden alfabético. */
crearBotonesFiltro("estilo", valoresUnicos("estilo").sort());


/*-----Slider vertical de año----------------------------*/

/* El slider se mueve por índices de un array de años únicos (ascendente), no por los años
mismos: así solo se pueden elegir años que existan de verdad, sin huecos en el rango. */

const añosOrdenados = valoresUnicos("año").sort(function(a, b) { return a - b; });

const sliderAño = document.getElementById("slider-año");
const sliderAñoValor = document.getElementById("slider-año-valor");
const btnAñoTodos = document.getElementById("filtro-año-todos");

sliderAño.min = 0;
sliderAño.max = Math.max(0, añosOrdenados.length - 1);
sliderAño.step = 1;
sliderAño.value = sliderAño.max;
sliderAñoValor.textContent = añosOrdenados[sliderAño.value] || "-";

sliderAño.addEventListener("input", function() {
  filtros.año = String(añosOrdenados[sliderAño.value]);
  sliderAñoValor.textContent = filtros.año;
  btnAñoTodos.classList.remove("activo");
  aplicarFiltros();
});

btnAñoTodos.addEventListener("click", function() {
  filtros.año = "todos";
  btnAñoTodos.classList.add("activo");
  aplicarFiltros();
});


/*-----Boton Modo Oscuro----------------------------*/

const btnDark = document.getElementById("btn-dark");

btnDark.addEventListener("click", function() {

  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {

    btnDark.textContent = "☀️ Modo Claro";

  } else {

    btnDark.textContent = "🌙 Modo Oscuro";

  }

});