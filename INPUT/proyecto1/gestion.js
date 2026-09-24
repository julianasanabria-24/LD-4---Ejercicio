/* Todo el archivo vive dentro de una IIFE: ninguna variable ni función queda global,
así que no se pueden usar desde la consola para saltarse el login. */

(function() {

  /*-----Estado privado----------------------------*/

  /* "autenticado" solo cambia a true dentro del submit del login. Los álbumes se cargan recién
  después del login, y guardarAlbums() se niega a escribir si no hay sesión. */

  let autenticado = false;
  let albums = [];
  let siguienteId = 1;

  function guardarAlbums() {
    if (!autenticado) return;
    localStorage.setItem("albums", JSON.stringify(albums));
  }


  /*-----Campos del formulario----------------------------*/

  const campos = [
    { clave: "nombre", etiqueta: "Nombre", tipo: "text" },
    { clave: "año", etiqueta: "Año", tipo: "number" },
    { clave: "tipo", etiqueta: "Tipo", tipo: "text" },
    { clave: "era", etiqueta: "Era", tipo: "text" },
    { clave: "estilo", etiqueta: "Estilo musical", tipo: "text" },
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
    if (!autenticado) return;
    const nuevo = leerFormulario(formCrear);
    nuevo.id = siguienteId;
    siguienteId++;
    albums.push(nuevo);
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
    if (!autenticado) return;
    const actualizado = leerFormulario(formActualizar);
    actualizado.id = albums[selectActualizar.value].id;
    albums[selectActualizar.value] = actualizado;
    guardarAlbums();
    refrescar();
    cambiarVista("todos");
  });


  /*-----Eliminar----------------------------*/

  const btnEliminar = document.getElementById("btn-eliminar");

  btnEliminar.addEventListener("click", function() {
    if (!autenticado) return;
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


  /*-----Login----------------------------*/

  /* El panel CRUD empieza oculto y sin datos. Solo se llena y se muestra si el usuario y la
  contraseña pasan verificarLogin() de login.js. */

  const login = document.getElementById("login");
  const formLogin = document.getElementById("form-login");
  const loginError = document.getElementById("login-error");
  const panelAdmin = document.getElementById("panel-admin");

  formLogin.addEventListener("submit", function(e) {
    e.preventDefault();
    const usuarioIngresado = formLogin.elements.usuario.value.trim();
    const passwordIngresado = formLogin.elements.password.value;

    if (verificarLogin(usuarioIngresado, passwordIngresado)) {
      autenticado = true;
      albums = obtenerAlbums();
      siguienteId = Math.max(0, ...albums.map(function(album) { return album.id; })) + 1;
      login.hidden = true;
      panelAdmin.hidden = false;
      refrescar();
    } else {
      loginError.hidden = false;
      formLogin.elements.password.value = "";
    }
  });

})();
