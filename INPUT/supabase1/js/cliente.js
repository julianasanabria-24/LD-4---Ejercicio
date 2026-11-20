async function registrarCliente(nombre, correo, contrasena) {

  // db.auth.signUp() NO toca ninguna tabla tuya todavía — habla directo con
  // el sistema de autenticación interno de Supabase (algo así como una
  // tabla especial, auth.users, que tú no administras a mano). Le mandas
  // correo y contraseña, y Supabase por detrás: valida el formato del
  // correo, guarda la contraseña de forma segura (nunca en texto plano),
  // y crea un identificador único nuevo (un uuid) para esta persona.
  //
  // El resultado llega en dos partes, igual que en todas las llamadas a
  // Supabase que ya conoces (data / error):
  //   - data.user   → los datos del usuario recién creado. data.user.id
  //                   es el uuid real — EL MISMO que vamos a usar como id
  //                   en clientes_practica, dos líneas más abajo.
  //   - data.session → si tu proyecto exige confirmar el correo antes de
  //                   dejar entrar (ver guía, sección 7), esto llega en
  //                   null: el usuario ya existe, pero todavía no hay
  //                   sesión iniciada hasta que confirme.
  const { data, error } = await db.auth.signUp({
    email: correo,
    password: contrasena,
  });

  // Mismo patrón de "revisar error antes de seguir" que ya usaste en el
  // CRUD de productos — si signUp() falló (correo repetido, contraseña
  // muy corta, etc.), ni siquiera intentamos el segundo paso.
  if (error) {
    console.log('Error al registrar:', error);
    return null;
  }

  // Ahora sí tocamos una tabla tuya: clientes_practica. Este insert() es
  // igual al que ya usaste en agregarProducto() — la única diferencia es
  // que aquí SÍ mandamos el id a mano (data.user.id), en vez de dejar que
  // Supabase lo autogenere, porque este id tiene que coincidir exactamente
  // con el que Auth le acaba de asignar al usuario.
  const { data: cliente, error: errorCliente } = await db
    .from('clientes_practica')
    .insert([{ id: data.user.id, nombre, correo, rol: 'cliente' }])
    .select();

  if (errorCliente) {
    console.log('Error al crear el perfil:', errorCliente);
    return null;
  }

  return cliente[0];
}

// 'submit' es el evento que dispara un <form> cuando alguien hace clic en
// su botón de tipo submit (o presiona Enter dentro de un campo). Por
// defecto, ese evento hace que el navegador RECARGUE la página entera —
// comportamiento heredado de cuando los formularios mandaban sus datos a
// otra página de servidor, décadas atrás. Como aquí todo lo manejamos con
// JavaScript (sin recargar nada), hay que apagar ese comportamiento a
// propósito.
document.getElementById('form-registro').addEventListener('submit', async (event) => {

  // event.preventDefault() le dice al navegador "no hagas lo que harías
  // normalmente con este evento" — en este caso, no recargues la página.
  // Sin esta línea, la página se refrescaría apenas se hiciera clic en
  // "Crear cuenta", y perderías cualquier mensaje que fueras a mostrar.
  event.preventDefault();

  // event.target es el elemento que disparó el evento — en un 'submit',
  // siempre es el propio <form>. Lo guardamos en una variable para poder
  // usarlo más abajo (form.reset()) sin tener que volver a buscarlo.
  const form = event.target;

  const cliente = await registrarCliente(
    document.getElementById('registro-nombre').value.trim(),
    document.getElementById('registro-correo').value.trim(),
    document.getElementById('registro-password').value
  );

  if (cliente) {
    // Pasamos a la pestaña "Iniciar sesión" con el correo ya escrito
    // (el clic borra el mensaje, por eso el texto va después)
    document.querySelector('[data-acceso="form-login"]').click();
    document.getElementById('login-correo').value = document.getElementById('registro-correo').value.trim();
    document.getElementById('estado-sesion').textContent =
      'Cuenta creada ✦ Ahora escribe tu contraseña para entrar.';
    form.reset(); // vacía los 3 campos del formulario, para la próxima persona
  } else {
    document.getElementById('estado-sesion').textContent =
      'No se pudo crear la cuenta. Revisa la consola.';
  }
});


// INICIAR SESION//
async function iniciarSesion(correo, contrasena) {

  // db.auth.signInWithPassword() es para alguien que YA se registró antes
  // (sección 4.1) — no crea ningún usuario nuevo, solo verifica que el
  // correo y la contraseña coincidan con uno que ya existe en Auth.
  //
  // Lo importante pasa "por detrás", sin que se vea en este código: si la
  // verificación sale bien, el cliente de Supabase (la variable db, la
  // misma de siempre) GUARDA la sesión internamente — normalmente en el
  // almacenamiento del navegador — y, desde este momento, la adjunta sola
  // a cada petición futura que hagas con db, sea a productos_practica, a
  // clientes_practica o a cualquier otra tabla. No hay que "pasarle" el
  // usuario a mano a ninguna otra función.
  const { data, error } = await db.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    console.log('Error al iniciar sesión:', error);
    return null;
  }

  // Aquí data.user también trae el id real del usuario — el mismo valor
  // que auth.uid() va a devolver dentro de cualquier política de RLS
  // mientras esta sesión siga activa.
  return data.user;
}

// Mismo patrón explicado en el formulario de registro: 'submit' es el
// evento del <form>, y hay que apagar la recarga automática de página.
document.getElementById('form-login').addEventListener('submit', async (event) => {
  event.preventDefault(); // evita que el navegador recargue la página
  const form = event.target; // el propio <form>, guardado para usar después

  const usuario = await iniciarSesion(
    document.getElementById('login-correo').value.trim(),
    document.getElementById('login-password').value
  );

  if (usuario) {
    form.reset();
    mostrarEstadoSesion(); // definida en la sección 5 (más abajo)
  } else {
    document.getElementById('estado-sesion').textContent =
      'Correo o contraseña incorrectos.';
  }
});


// ===================== PESTAÑAS DEL ACCESO =====================
// "Iniciar sesión | Crear cuenta": muestra un formulario y oculta el otro
document.querySelector('.selector-acceso').addEventListener('click', (event) => {
  const pestana = event.target.closest('[data-acceso]');
  if (!pestana) return;
  document.querySelectorAll('[data-acceso]').forEach((b) => {
    const activa = b === pestana;
    b.setAttribute('aria-selected', activa);
    document.getElementById(b.dataset.acceso).hidden = !activa;
  });
  document.getElementById('estado-sesion').textContent = '';
});


// ===================== ESTADO DE LA SESIÓN =====================
// Va AFUERA del listener del login: si estuviera adentro, solo existiría
// dentro de esa función y el botón de cerrar sesión no la encontraría.
// Sin sesión: pantalla de acceso. Con sesión: el panel de la cuenta.
async function mostrarEstadoSesion() {
  const { data } = await db.auth.getUser();
  const conSesion = Boolean(data.user);

  document.getElementById('zona-acceso').hidden = conSesion;
  document.getElementById('zona-cuenta').hidden = !conSesion;

  // El botón de tema es UNO solo: con sesión va en la barra; sin sesión
  // flota arriba a la derecha de la pantalla de acceso
  const botonTema = document.getElementById('btn-tema');
  if (conSesion) {
    document.querySelector('#zona-cuenta .barra-acciones').prepend(botonTema);
    botonTema.classList.remove('tema-flotante');
  } else {
    document.body.append(botonTema);
    botonTema.classList.add('tema-flotante');
  }

  if (!conSesion) return;

  cargarPerfil(data.user.id);
  cargarCarritoDesdeBD();          // galeria.js: el carrito guardado en Supabase
  mostrarVista(vistaDesdeUrl());   // la pestaña que diga la URL (#pedidos...) o Inicio
}


// ===================== VISTAS (pestañas de la cuenta) =====================
const VISTAS = ['inicio', 'catalogo', 'mundos', 'pedidos', 'perfil'];

// cliente.html#pedidos abre directamente "Mis pedidos"
const vistaDesdeUrl = () => (VISTAS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'inicio');

function mostrarVista(nombre) {
  VISTAS.forEach((v) => {
    document.getElementById('vista-' + v).hidden = v !== nombre;
  });
  document.querySelectorAll('[data-vista]').forEach((b) => {
    if (b.dataset.vista === nombre) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  // replaceState cambia la URL (#catalogo) sin recargar ni llenar el historial
  history.replaceState(null, '', '#' + nombre);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cada vista se refresca al abrirla: siempre datos actuales
  if (nombre === 'inicio') cargarInicio();
  if (nombre === 'pedidos') cargarMisPedidos();
}

// Botones de la barra (data-vista) y atajos dentro de la página (data-ir)
document.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-vista], [data-ir]');
  if (boton) mostrarVista(boton.dataset.vista || boton.dataset.ir);
});


// ===================== INICIO =====================
// Saludo, números de la cuenta, último pedido y ofertas
let misPedidos = [];

async function cargarInicio() {
  const { data } = await db.auth.getUser();
  if (!data.user) return;

  const pedidos = await traerPedidos(data.user.id);   // pedidos.js
  misPedidos = pedidos || [];

  const enCurso = misPedidos.filter((p) => p.estado === 'confirmado' || p.estado === 'enviado').length;
  const comprado = misPedidos
    .filter((p) => p.estado !== 'cancelado')
    .reduce((suma, p) => suma + Number(p.total), 0);

  document.getElementById('stat-pedidos').textContent = misPedidos.length;
  document.getElementById('stat-en-curso').textContent = enCurso;
  document.getElementById('stat-comprado').textContent = pesos(comprado);
  document.getElementById('stat-carrito').textContent = totalUnidades();   // galeria.js

  const ultimo = document.getElementById('ultimo-pedido');
  ultimo.innerHTML = misPedidos.length
    ? tarjetaPedido(misPedidos[0], { arriba: progresoPedido(misPedidos[0].estado) })
    : `<p class="pedidos-vacio">Aún no tienes pedidos.<br>
         <button type="button" class="boton-texto" data-ir="catalogo">Elige tu primera joya →</button></p>`;

  await productosListos;   // galeria.js: espera a que lleguen los productos
  const ofertas = productos
    .filter((p) => sePuedeComprar(p) && p.descuento > 0)
    .sort((a, b) => b.descuento - a.descuento)
    .slice(0, 10);
  document.getElementById('carrusel-recomendados').innerHTML = ofertas.length
    ? ofertas.map(tarjetaProducto).join('')
    : '<p class="sin-resultados">Pronto habrá ofertas nuevas ✦</p>';
}

// Mundos: los mini (Inicio) y los grandes (pestaña Mundos). Al elegir
// uno, galeria.js filtra (data-grupo/data-valor) y aquí abrimos el catálogo.
function pintarMundosCuenta() {
  document.getElementById('mundos-mini').innerHTML = MUNDOS.map((m) => `
    <button type="button" class="mundo-mini" data-grupo="mundo" data-valor="${m.clave}">
      <img src="${m.imagen}" alt="" loading="lazy"><span>${m.nombre}</span>
    </button>`).join('');

  document.getElementById('lista-mundos-cuenta').innerHTML = MUNDOS.map((m, i) => `
    <button type="button" class="mundo-tarjeta" data-grupo="mundo" data-valor="${m.clave}" style="--i: ${i}">
      <img src="${m.imagen}" alt="" loading="lazy">
      <span class="mundo-estudio">${m.estudio}</span>
      <span class="mundo-nombre">${m.nombre}</span>
      <span class="mundo-cuenta">${m.frase}</span>
    </button>`).join('');
}
pintarMundosCuenta();

document.addEventListener('click', (event) => {
  if (event.target.closest('.mundo-mini, #lista-mundos-cuenta .mundo-tarjeta')) mostrarVista('catalogo');
});


// ===================== LEER (SELECT) =====================
// Trae la fila de clientes_practica de este usuario.
// .maybeSingle() devuelve UN objeto (no un array), o null si no hay fila
// — por ejemplo, si el signUp funcionó pero el insert del perfil falló.
async function leerCliente(id) {
  const { data, error } = await db
    .from('clientes_practica')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.log('Error al leer el perfil:', error);
    return null;
  }
  return data;
}

// Lee el cliente y pone cada dato en su campo del formulario.
// "?? ''" = si la columna viene en null, deja el campo vacío.
async function cargarPerfil(id) {
  const cliente = await leerCliente(id);

  if (!cliente) {
    document.getElementById('mensaje-perfil').textContent =
      'Iniciaste sesión, pero no se encontró tu perfil. Revisa la consola.';
    return;
  }

  document.getElementById('perfil-correo').value    = cliente.correo ?? '';
  document.getElementById('perfil-nombre').value    = cliente.nombre ?? '';
  document.getElementById('perfil-telefono').value  = cliente.telefono ?? '';
  document.getElementById('perfil-direccion').value = cliente.direccion ?? '';
  document.getElementById('perfil-ciudad').value    = cliente.ciudad ?? '';

  pintarResumen(cliente);
}

// Escribe los datos en la tarjeta del perfil y en el saludo.
// "|| '—'" = si el dato está vacío o en null, muestra una raya.
function pintarResumen(cliente) {
  const nombre = cliente.nombre || '—';
  document.getElementById('resumen-nombre').textContent    = nombre;
  document.getElementById('resumen-correo').textContent    = cliente.correo || '—';
  document.getElementById('resumen-telefono').textContent  = cliente.telefono || '—';
  document.getElementById('resumen-direccion').textContent = cliente.direccion || '—';
  document.getElementById('resumen-ciudad').textContent    = cliente.ciudad || '—';
  document.getElementById('avatar-inicial').textContent    = (cliente.nombre || '✦').trim().charAt(0).toUpperCase();
  // En el saludo, solo el primer nombre
  document.getElementById('saludo-nombre').textContent     = (cliente.nombre || '').trim().split(' ')[0] || 'de nuevo';
}


// ===================== ACTUALIZAR (UPDATE) =====================
// Mismo patrón que modificarProducto(): update + .eq('id', id), porque
// sin el .eq() el update intentaría cambiar TODAS las filas.
// Con RLS, si la política no deja editar, Supabase no da error: devuelve
// un array vacío. Por eso revisamos data.length === 0.
async function actualizarCliente(id, cambios) {
  const { data, error } = await db
    .from('clientes_practica')
    .update(cambios)
    .eq('id', id)
    .select();

  if (error) {
    console.log('Error al actualizar el perfil:', error);
    return null;
  }
  if (data.length === 0) {
    console.log('No se actualizó ninguna fila (¿falta la política RLS de update?)');
    return null;
  }
  return data[0];
}

document.getElementById('form-perfil').addEventListener('submit', async (event) => {
  event.preventDefault();
  const mensaje = document.getElementById('mensaje-perfil');

  const { data } = await db.auth.getUser();

  const cliente = await actualizarCliente(data.user.id, {
    nombre:    document.getElementById('perfil-nombre').value.trim(),
    telefono:  document.getElementById('perfil-telefono').value.trim(),
    direccion: document.getElementById('perfil-direccion').value.trim(),
    ciudad:    document.getElementById('perfil-ciudad').value.trim(),
  });

  if (cliente) {
    pintarResumen(cliente);
    mensaje.textContent = 'Datos guardados ✔';
    mostrarAviso('Perfil actualizado ✦');   // galeria.js
  } else {
    mensaje.textContent = 'No se pudieron guardar los cambios. Revisa la consola.';
  }
});


// ===================== MIS PEDIDOS =====================
// Usa traerPedidos() y tarjetaPedido() de pedidos.js. El cliente solo ve
// el estado: quien lo cambia (enviado, entregado...) es el admin.
let filtroPedidos = 'todos';

async function cargarMisPedidos() {
  const lista = document.getElementById('lista-mis-pedidos');
  lista.innerHTML = '<p class="pedidos-vacio">Cargando tus pedidos…</p>';

  const { data } = await db.auth.getUser();
  if (!data.user) return;

  const pedidos = await traerPedidos(data.user.id);
  if (!pedidos) {
    lista.innerHTML = '<p class="pedidos-vacio">No pudimos cargar tus pedidos. Revisa la consola (F12).</p>';
    return;
  }
  misPedidos = pedidos;
  pintarMisPedidos();
}

function pintarMisPedidos() {
  const lista = document.getElementById('lista-mis-pedidos');
  const visibles = misPedidos.filter((p) =>
    filtroPedidos === 'todos' ||
    (filtroPedidos === 'curso' && (p.estado === 'confirmado' || p.estado === 'enviado')) ||
    p.estado === filtroPedidos);

  if (visibles.length === 0) {
    lista.innerHTML = misPedidos.length
      ? '<p class="pedidos-vacio">No hay pedidos en este estado.</p>'
      : `<p class="pedidos-vacio">Aún no tienes pedidos.<br>
           <button type="button" class="boton-texto" data-ir="catalogo">Ir al catálogo →</button></p>`;
    return;
  }

  lista.innerHTML = visibles
    .map((p) => tarjetaPedido(p, { arriba: progresoPedido(p.estado) }))
    .join('');
}

// Filtro "Todos / En curso / Entregados / Cancelados" (sin volver a Supabase)
document.querySelector('.filtro-pedidos').addEventListener('click', (event) => {
  const boton = event.target.closest('[data-filtro-pedidos]');
  if (!boton) return;
  filtroPedidos = boton.dataset.filtroPedidos;
  document.querySelectorAll('[data-filtro-pedidos]').forEach((b) => b.setAttribute('aria-pressed', b === boton));
  pintarMisPedidos();
});

// galeria.js avisa cuando se confirma un pedido desde el carrito
document.addEventListener('pedido-confirmado', () => {
  const abierta = vistaDesdeUrl();
  if (abierta === 'inicio') cargarInicio();
  if (abierta === 'pedidos') cargarMisPedidos();
});


// ===================== CERRAR SESIÓN =====================
// Una sola función para los DOS botones (el de Mi perfil y el de la barra)
async function cerrarSesion() {
  await db.auth.signOut();   // galeria.js vacía el carrito local al oír SIGNED_OUT
  history.replaceState(null, '', location.pathname);
  mostrarEstadoSesion();
}

document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
document.getElementById('btn-logout-superior').addEventListener('click', cerrarSesion);


// ===================== ARRANQUE =====================
// Al abrir la página: ¿ya había una sesión guardada?
mostrarEstadoSesion();
