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

/* Recorremos todos los álbumes del array.
  Por cada álbum:
  1. Llamamos a crearCarta().
  2. La función construye una tarjeta.
  3. Agregamos la tarjeta a la galería. */

albums.forEach(function(album) {

  galeria.appendChild(
    crearCarta(album)
  );

});


/*-----Seleccionar una tarjeta----------------------------*/

/* Cuando hacemos clic sobre una tarjeta, mostramos únicamente esa tarjeta.*/

const tarjetas = document.querySelectorAll(".card");

tarjetas.forEach(function(tarjeta) {

  tarjeta.addEventListener("click", function() {

    tarjeta.classList.add("seleccionada");
    galeria.classList.add("mostrar-una");
    btnVolver.classList.add("mostrar");

  });

});


/*-----Boton para volver a ver todos los albumes----------------------------*/

/* Al hacer clic, quitamos la selección y mostramos nuevamente todas las tarjetas. */

const btnVolver = document.getElementById("btn-volver");

btnVolver.addEventListener("click", function() {

  galeria.classList.remove("mostrar-una");

  tarjetas.forEach(function(tarjeta) {

    tarjeta.classList.remove("seleccionada");

  });

  btnVolver.classList.remove("mostrar");

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