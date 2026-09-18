/*-----Campos del formulario----------------------------*/

const campos = [
  { clave: "nombre", etiqueta: "Nombre", tipo: "text" },
  { clave: "año", etiqueta: "Año", tipo: "number" },
  { clave: "tipo", etiqueta: "Tipo", tipo: "text" },
  { clave: "era", etiqueta: "Era", tipo: "text" },
  { clave: "canciones", etiqueta: "Canciones", tipo: "number" },
  { clave: "cancionesDestacadas", etiqueta: "Canciones destacadas (separadas por coma)", tipo: "text" },
  { clave: "descripcion", etiqueta: "Descripción", tipo: "text" },
  { clave: "imagen", etiqueta: "URL de la imagen", tipo: "text" },
  { clave: "favorito", etiqueta: "Favorito", tipo: "checkbox" }
];

function construirFormulario(form, textoBoton) {
  form.innerHTML = "";
  campos.forEach(function(c) {
    const label = document.createElement("label");
    label.textContent = c.etiqueta;
    const input = document.createElement("input");
    input.type = c.tipo;
    input.name = c.clave;
    if (c.tipo !== "checkbox") input.required = true;
    label.appendChild(input);
    form.appendChild(label);
  });
  const boton = document.createElement("button");
  boton.type = "submit";
  boton.textContent = textoBoton;
  form.appendChild(boton);
}

function leerFormulario(form) {
  const datos = {};
  campos.forEach(function(c) {
    const input = form.elements[c.clave];
    if (c.tipo === "checkbox") datos[c.clave] = input.checked;
    else if (c.tipo === "number") datos[c.clave] = Number(input.value);
    else if (c.clave === "cancionesDestacadas") datos[c.clave] = input.value.split(",").map(function(s) { return s.trim(); });
    else datos[c.clave] = input.value;
  });
  return datos;
}

function llenarFormulario(form, album) {
  campos.forEach(function(c) {
    const input = form.elements[c.clave];
    if (c.tipo === "checkbox") input.checked = album[c.clave];
    else if (c.clave === "cancionesDestacadas") input.value = album[c.clave].join(", ");
    else input.value = album[c.clave];
  });
}


/*-----Mostrar todos----------------------------*/

const cuerpo = document.querySelector("#tabla-albums tbody");

function mostrarTodos() {
  cuerpo.innerHTML = "";
  albums.forEach(function(album) {
    const fila = document.createElement("tr");
    [album.nombre, album.año, album.tipo, album.era, album.canciones, album.favorito ? "Sí" : "No"].forEach(function(valor) {
      const celda = document.createElement("td");
      celda.textContent = valor;
      fila.appendChild(celda);
    });
    cuerpo.appendChild(fila);
  });
}


/*-----Selectores----------------------------*/

const selectLeer = document.getElementById("select-leer");
const selectActualizar = document.getElementById("select-actualizar");
const selectEliminar = document.getElementById("select-eliminar");

function llenarSelectores() {
  [selectLeer, selectActualizar, selectEliminar].forEach(function(select) {
    select.innerHTML = "";
    albums.forEach(function(album, indice) {
      const opcion = document.createElement("option");
      opcion.value = indice;
      opcion.textContent = album.nombre;
      select.appendChild(opcion);
    });
  });
}


/*-----Crear----------------------------*/

const formCrear = document.getElementById("form-crear");
construirFormulario(formCrear, "Crear");

formCrear.addEventListener("submit", function(e) {
  e.preventDefault();
  albums.push(leerFormulario(formCrear));
  formCrear.reset();
  guardarAlbums();
  refrescar();
  cambiarVista("todos");
});


/*-----Consultar----------------------------*/

const detalle = document.getElementById("detalle");

function mostrarDetalle() {
  const album = albums[selectLeer.value];
  detalle.innerHTML = "";
  if (!album) return;
  campos.forEach(function(c) {
    const p = document.createElement("p");
    let valor = album[c.clave];
    if (c.clave === "favorito") valor = valor ? "Sí" : "No";
    if (c.clave === "cancionesDestacadas") valor = valor.join(", ");
    p.textContent = `${c.etiqueta}: ${valor}`;
    detalle.appendChild(p);
  });
}

selectLeer.addEventListener("change", mostrarDetalle);


/*-----Actualizar----------------------------*/

const formActualizar = document.getElementById("form-actualizar");
construirFormulario(formActualizar, "Guardar cambios");

function cargarParaActualizar() {
  const album = albums[selectActualizar.value];
  if (album) llenarFormulario(formActualizar, album);
}

selectActualizar.addEventListener("change", cargarParaActualizar);

formActualizar.addEventListener("submit", function(e) {
  e.preventDefault();
  albums[selectActualizar.value] = leerFormulario(formActualizar);
  guardarAlbums();
  refrescar();
  cambiarVista("todos");
});


/*-----Eliminar----------------------------*/

const btnEliminar = document.getElementById("btn-eliminar");

btnEliminar.addEventListener("click", function() {
  const album = albums[selectEliminar.value];
  if (!album || !confirm(`¿Eliminar el álbum "${album.nombre}"?`)) return;
  albums.splice(selectEliminar.value, 1);
  guardarAlbums();
  refrescar();
  cambiarVista("todos");
});


/*-----Sidebar----------------------------*/

const items = document.querySelectorAll(".sidebar-item");
const vistas = document.querySelectorAll(".vista");

function cambiarVista(nombre) {
  vistas.forEach(function(v) { v.hidden = v.id !== `vista-${nombre}`; });
  items.forEach(function(i) { i.classList.toggle("activo", i.dataset.vista === nombre); });
}

items.forEach(function(item) {
  item.addEventListener("click", function() { cambiarVista(item.dataset.vista); });
});

function refrescar() {
  mostrarTodos();
  llenarSelectores();
  mostrarDetalle();
  cargarParaActualizar();
}

refrescar();
