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
    document.getElementById('estado-sesion').textContent =
      'Cuenta creada. Ahora inicia sesión con ese correo y contraseña.';
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


// ===================== ESTADO DE LA SESIÓN =====================
// Va AFUERA del listener del login: si estuviera adentro, solo existiría
// dentro de esa función y el botón de cerrar sesión no la encontraría.
// Según quién tenga la sesión, muestra Mi perfil o los formularios de
// registro/login.
async function mostrarEstadoSesion() {
  const { data } = await db.auth.getUser();
  const estado = document.getElementById('estado-sesion');

  // hidden = true oculta el elemento; hidden = false lo muestra
  document.querySelector('.tarjetas').hidden = Boolean(data.user);
  document.getElementById('resumen-perfil').hidden = !data.user;
  document.getElementById('btn-logout').hidden = !data.user;

  // classList.toggle(clase, condición): pone la clase si es true y la
  // quita si es false. El CSS usa body.con-sesion para hacer espacio
  // a la columna fija de Mi perfil.
  document.body.classList.toggle('con-sesion', Boolean(data.user));

  if (data.user) {
    estado.textContent = `Sesión iniciada como ${data.user.email}`;
    cargarPerfil(data.user.id);
  } else {
    estado.textContent = 'No has iniciado sesión.';
    cerrarSidebar(); // si cerró sesión con el sidebar abierto
  }
}


// ===================== SIDEBAR =====================
// Abrir y cerrar es solo poner o quitar clases: el movimiento lo hace
// el CSS (transform + transition en #sidebar-perfil).
function abrirSidebar() {
  const sidebar = document.getElementById('sidebar-perfil');
  sidebar.classList.add('abierto');
  sidebar.inert = false; // ya se puede usar con Tab y clic
  document.getElementById('fondo-sidebar').classList.add('visible');
  document.getElementById('perfil-nombre').focus(); // el cursor queda listo para escribir
}

function cerrarSidebar() {
  const sidebar = document.getElementById('sidebar-perfil');
  sidebar.classList.remove('abierto');
  sidebar.inert = true;
  document.getElementById('fondo-sidebar').classList.remove('visible');
}

document.getElementById('btn-editar-perfil').addEventListener('click', abrirSidebar);
document.getElementById('btn-cerrar-sidebar').addEventListener('click', cerrarSidebar);
document.getElementById('fondo-sidebar').addEventListener('click', cerrarSidebar);

// La tecla Escape también lo cierra
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') cerrarSidebar();
});


// ===================== LEER (SELECT) =====================
// Trae la fila de clientes_practica de este usuario.
// .eq('id', id) filtra igual que en modificarProducto(); además, la
// política RLS ya impide ver filas de otras personas.
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
// "?? ''" = si la columna viene en null (aún no la llenó), deja el campo
// vacío en vez de escribir la palabra "null".
async function cargarPerfil(id) {
  const cliente = await leerCliente(id);

  if (!cliente) {
    document.getElementById('estado-sesion').textContent =
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

// Escribe los datos en la tarjeta "Mi perfil".
// "|| '—'" = si el dato está vacío o en null, muestra una raya.
function pintarResumen(cliente) {
  document.getElementById('resumen-nombre').textContent    = cliente.nombre || '—';
  document.getElementById('resumen-correo').textContent    = cliente.correo || '—';
  document.getElementById('resumen-telefono').textContent  = cliente.telefono || '—';
  document.getElementById('resumen-direccion').textContent = cliente.direccion || '—';
  document.getElementById('resumen-ciudad').textContent    = cliente.ciudad || '—';
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

  // El id sale de la sesión, no de un campo del formulario:
  // así nadie puede escribir el id de otra persona.
  const { data } = await db.auth.getUser();

  // Solo mandamos las columnas editables — correo y rol no van aquí
  const cliente = await actualizarCliente(data.user.id, {
    nombre:    document.getElementById('perfil-nombre').value.trim(),
    telefono:  document.getElementById('perfil-telefono').value.trim(),
    direccion: document.getElementById('perfil-direccion').value.trim(),
    ciudad:    document.getElementById('perfil-ciudad').value.trim(),
  });

  if (cliente) {
    // update().select() devuelve la fila YA actualizada: con ella
    // repintamos el resumen sin tener que volver a leer la tabla
    pintarResumen(cliente);
    cerrarSidebar();
    document.getElementById('estado-sesion').textContent = 'Datos guardados ✔';
  } else {
    // El sidebar queda abierto para que no se pierda lo que escribió
    document.getElementById('estado-sesion').textContent =
      'No se pudieron guardar los cambios. Revisa la consola.';
  }
});


//CERRAR SESION//
document.getElementById('btn-logout').addEventListener('click', async () => {
  await db.auth.signOut();
  mostrarEstadoSesion();
});

// Al cargar la página, revisa si ya había una sesión activa
mostrarEstadoSesion();