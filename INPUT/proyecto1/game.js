/*-----Reglas de la contraseña----------------------------*/

/* Cada regla es independiente: se muestra como un ítem de checklist que se marca
en verde apenas se cumple, sin esperar al submit. */

const reglas = [
  { texto: "Al menos 6 caracteres", test: function(v) { return v.length >= 6; } },
  { texto: "Al menos 6 números", test: function(v) { return (v.match(/[0-9]/g) || []).length >= 6; } },
  { texto: "Al menos 1 mayúscula", test: function(v) { return (v.match(/[A-Z]/g) || []).length >= 1; } },
  { texto: "Al menos 1 carácter especial", test: function(v) { return (v.match(/[^A-Za-z0-9]/g) || []).length >= 1; } }
];

/* La misma exigencia de las reglas, en una sola regex con lookaheads, para decidir
si se deja continuar el formulario. */

const passwordValida = /^(?=(?:.*[0-9]){6,})(?=(?:.*[A-Z]){1,})(?=(?:.*[^A-Za-z0-9]){1,}).{6,}$/;

/*-----Regla del email----------------------------*/

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("form-login-game");
const error = document.getElementById("login-error-game");
const passwordInput = form.elements.password;
const checklist = document.getElementById("password-checklist");
const emailInput = form.elements.email;
const emailError = document.getElementById("email-error-game");

function actualizarEmail() {
  emailError.hidden = emailInput.value === "" || emailValido.test(emailInput.value);
}

emailInput.addEventListener("input", actualizarEmail);

reglas.forEach(function(regla) {
  const item = document.createElement("li");
  item.textContent = regla.texto;
  checklist.appendChild(item);
});

function actualizarChecklist() {
  const password = passwordInput.value;
  checklist.querySelectorAll("li").forEach(function(item, indice) {
    item.classList.toggle("cumple", reglas[indice].test(password));
  });
}

passwordInput.addEventListener("input", actualizarChecklist);
actualizarChecklist();

/*-----Usuarios registrados (localStorage)----------------------------*/

const CLAVE_USUARIOS = "usuariosGame";

/* Da el siguiente id disponible de una lista de objetos con "id", el mismo patrón
que ya usa data.js para los álbumes. */
function siguienteId(lista) {
  return Math.max(0, ...lista.map(function(item) { return item.id || 0; })) + 1;
}

function obtenerUsuarios() {
  const guardado = localStorage.getItem(CLAVE_USUARIOS);
  const usuarios = guardado ? JSON.parse(guardado) : [];

  /* Usuarios guardados antes de que existieran "id" o "intentos" los reciben aquí,
  para no romper con datos ya guardados en sesiones anteriores. */
  usuarios.forEach(function(usuario) {
    if (!usuario.id) usuario.id = siguienteId(usuarios);
    if (!usuario.intentos) usuario.intentos = [];
  });

  return usuarios;
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

function guardarUsuario(usuario) {
  const usuarios = obtenerUsuarios();
  usuario.id = siguienteId(usuarios);
  usuario.intentos = [];
  usuarios.push(usuario);
  guardarUsuarios(usuarios);
}

function buscarUsuario(email) {
  return obtenerUsuarios().find(function(u) { return u.email === email; });
}

/* Agrega un intento (partida completada) al usuario dueño del email, con su propio id. */
function registrarIntento(email, numeroIntentos, tiempo) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(function(u) { return u.email === email; });
  if (!usuario) return;

  usuario.intentos.push({
    id: siguienteId(usuario.intentos),
    fecha: new Date().toISOString(),
    numeroIntentos: numeroIntentos,
    tiempo: tiempo
  });

  guardarUsuarios(usuarios);
}


/*-----Login / registro----------------------------*/

const credencialesError = document.getElementById("credenciales-error-game");
const loginExito = document.getElementById("login-exito-game");

/* Email del usuario logueado en esta sesión: sirve para saber a quién asociarle
los intentos del juego de memoria una vez que gana una partida. */
let emailUsuarioActual = null;

function mostrarExito(mensaje) {
  credencialesError.hidden = true;
  loginExito.textContent = mensaje;
  loginExito.hidden = false;
  setTimeout(mostrarJuego, 700);
}

form.addEventListener("submit", function(e) {
  e.preventDefault();

  loginExito.hidden = true;
  credencialesError.hidden = true;

  const nombre = form.elements.nombre.value;
  const alias = form.elements.alias.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!emailValido.test(email)) {
    emailError.hidden = false;
    return;
  }
  emailError.hidden = true;

  if (!passwordValida.test(password)) {
    error.hidden = false;
    return;
  }
  error.hidden = true;

  const existente = buscarUsuario(email);

  if (existente) {
    if (existente.password === password) {
      emailUsuarioActual = existente.email;
      mostrarExito(`¡Bienvenido de nuevo, ${existente.alias}!`);
    } else {
      credencialesError.hidden = false;
    }
    return;
  }

  const quiereRegistrarse = confirm("No hay ningún registro con este email. ¿Querés registrarte?");
  if (!quiereRegistrarse) return;

  guardarUsuario({ nombre: nombre, alias: alias, email: email, password: password });
  emailUsuarioActual = email;
  mostrarExito(`¡Registro exitoso! Bienvenido, ${alias}.`);
});


/*-----Juego de memoria----------------------------*/

/* Se juega con 6 álbumes elegidos al azar de obtenerAlbums() (data.js), que a su vez
lee de localStorage si hay álbumes editados desde gestion.html. Cada álbum aparece
dos veces en el mazo: encontrar las dos cartas iguales es encontrar el par. */

const PARES_JUEGO = 6;

const loginGame = document.getElementById("login-game");
const juegoSeccion = document.getElementById("juego-memoria");
const juegoTablero = document.getElementById("juego-tablero");
const juegoTimerEl = document.getElementById("juego-timer");
const juegoIntentosEl = document.getElementById("juego-intentos");
const juegoParesEl = document.getElementById("juego-pares");
const juegoOverlay = document.getElementById("juego-overlay-victoria");
const juegoStatTiempo = document.getElementById("juego-stat-tiempo");
const juegoStatIntentos = document.getElementById("juego-stat-intentos");

let cartaUno = null;
let cartaDos = null;
let idCartaUno = null;
let idCartaDos = null;
let esperandoJuego = false;
let paresEncontrados = 0;
let intentosJuego = 0;
let timerJuego = null;
let segundosJuego = 0;

function mezclar(array) {
  const copia = array.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copia[i];
    copia[i] = copia[j];
    copia[j] = tmp;
  }
  return copia;
}

function formatearTiempo(segundos) {
  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function iniciarTimerJuego() {
  clearInterval(timerJuego);
  segundosJuego = 0;
  juegoTimerEl.textContent = "00:00";
  timerJuego = setInterval(function() {
    segundosJuego++;
    juegoTimerEl.textContent = formatearTiempo(segundosJuego);
  }, 1000);
}

function crearCartaJuego(album) {
  const carta = document.createElement("div");
  carta.classList.add("juego-carta");
  carta.dataset.idAlbum = album.id;

  carta.innerHTML = `
    <div class="juego-carta-inner">
      <div class="juego-carta-frente"><span>🎵</span></div>
      <div class="juego-carta-dorso">
        <img src="${album.imagen}" alt="Portada de ${album.nombre}">
        <div class="juego-carta-info">
          <p class="juego-carta-nombre">${album.nombre}</p>
          <p class="juego-carta-año">${album.año}</p>
        </div>
      </div>
    </div>`;

  carta.addEventListener("click", function() { manejarClicCarta(carta); });
  return carta;
}

function renderizarTableroJuego() {
  juegoTablero.innerHTML = "";
  const elegidos = mezclar(obtenerAlbums()).slice(0, PARES_JUEGO);
  const mazo = mezclar(elegidos.concat(elegidos));
  mazo.forEach(function(album) {
    juegoTablero.appendChild(crearCartaJuego(album));
  });
  iniciarTimerJuego();
}

function manejarClicCarta(carta) {
  if (esperandoJuego) return;
  if (carta.classList.contains("volteada")) return;
  if (carta.classList.contains("encontrada")) return;

  carta.classList.add("volteada");

  if (!cartaUno) {
    cartaUno = carta;
    idCartaUno = carta.dataset.idAlbum;
    return;
  }

  cartaDos = carta;
  idCartaDos = carta.dataset.idAlbum;

  intentosJuego++;
  juegoIntentosEl.textContent = intentosJuego;
  esperandoJuego = true;

  if (idCartaUno === idCartaDos) {
    procesarParEncontrado();
  } else {
    setTimeout(voltearDeNuevo, 900);
  }
}

function procesarParEncontrado() {
  cartaUno.classList.remove("volteada");
  cartaDos.classList.remove("volteada");
  cartaUno.classList.add("encontrada");
  cartaDos.classList.add("encontrada");

  paresEncontrados++;
  juegoParesEl.textContent = `${paresEncontrados}/${PARES_JUEGO}`;

  limpiarSeleccionJuego();

  if (paresEncontrados === PARES_JUEGO) {
    clearInterval(timerJuego);
    setTimeout(mostrarVictoriaJuego, 500);
  }
}

function voltearDeNuevo() {
  cartaUno.classList.remove("volteada");
  cartaDos.classList.remove("volteada");
  limpiarSeleccionJuego();
}

function limpiarSeleccionJuego() {
  cartaUno = null;
  cartaDos = null;
  idCartaUno = null;
  idCartaDos = null;
  esperandoJuego = false;
}

function mostrarVictoriaJuego() {
  const tiempo = formatearTiempo(segundosJuego);
  juegoStatTiempo.textContent = tiempo;
  juegoStatIntentos.textContent = intentosJuego;
  juegoOverlay.classList.add("visible");

  if (emailUsuarioActual) {
    registrarIntento(emailUsuarioActual, intentosJuego, tiempo);
  }
}

function reiniciarJuego() {
  juegoOverlay.classList.remove("visible");
  limpiarSeleccionJuego();
  paresEncontrados = 0;
  intentosJuego = 0;
  juegoIntentosEl.textContent = "0";
  juegoParesEl.textContent = `0/${PARES_JUEGO}`;
  renderizarTableroJuego();
}

function mostrarJuego() {
  loginGame.hidden = true;
  juegoSeccion.hidden = false;
  reiniciarJuego();
}

document.getElementById("juego-btn-reiniciar").addEventListener("click", reiniciarJuego);
document.getElementById("juego-btn-de-nuevo").addEventListener("click", reiniciarJuego);
