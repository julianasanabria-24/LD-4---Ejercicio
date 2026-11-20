// =================================================================
// PANEL DEL ADMIN: pestañas, "Pedidos" y "Mis clientes" (admin.html)
// Usa db (supabaseClient.js) y las funciones de pedidos.js.
//
// Las pestañas solo se ven dentro de #panel-admin, que admin.js muestra
// únicamente a un admin confirmado. Pero lo que de verdad protege los
// datos son las políticas RLS: un cliente que llamara a estas consultas
// solo vería sus propios pedidos y no podría cambiar ningún estado.
// =================================================================


// ===================== PESTAÑAS =====================
const SECCIONES_ADMIN = ['seccion-productos', 'seccion-pedidos', 'seccion-clientes', 'seccion-admins'];

function mostrarSeccionAdmin(id) {
  document.querySelectorAll('.pestanas-admin .pestana').forEach((boton) => {
    boton.setAttribute('aria-selected', boton.dataset.seccion === id);
  });
  SECCIONES_ADMIN.forEach((s) => {
    document.getElementById(s).hidden = s !== id;
  });

  // Se recargan al abrir la pestaña: siempre datos frescos
  if (id === 'seccion-pedidos') cargarPedidosAdmin();
  if (id === 'seccion-clientes') cargarClientesAdmin();
  if (id === 'seccion-admins') cargarAdmins();
}

document.querySelector('.pestanas-admin').addEventListener('click', (evento) => {
  const boton = evento.target.closest('.pestana');
  if (boton) mostrarSeccionAdmin(boton.dataset.seccion);
});


// ===================== PEDIDOS =====================
// Los clientes se guardan aquí para poner nombre y correo en cada pedido
// (y para reutilizarlos en "Mis clientes")
let clientesAdmin = [];

async function traerClientes() {
  const { data, error } = await db
    .from('clientes_practica')
    .select('id, nombre, correo, telefono, ciudad, direccion, created_at')
    .order('nombre');

  if (error) {
    console.log('Error al traer clientes:', error);
    return null;
  }
  clientesAdmin = data;
  return data;
}

// El historial de cambios de estado de varios pedidos, en UNA consulta.
// Lo escribe el trigger registrar_cambio_estado(); aquí solo se lee.
async function traerHistorial(ids) {
  const { data, error } = await db
    .from('historial_estados_pedido')
    .select('pedido_id, estado_anterior, estado_nuevo, cambiado_por, cambiado_en')
    .in('pedido_id', ids)
    .order('cambiado_en');

  if (error) {
    console.log('Error al traer el historial:', error);
    return [];
  }
  return data;
}

// Lo que el admin agrega a cada tarjeta: arriba el cliente, abajo el
// selector de estado y el historial (un <details> se abre con clic)
function extrasPedidoAdmin(p, cliente, historial) {
  const opciones = ['confirmado', 'enviado', 'entregado', 'cancelado']
    .map((e) => `<option value="${e}" ${e === p.estado ? 'selected' : ''}>${ESTADOS_PEDIDO[e]}</option>`)
    .join('');

  const pasos = historial.map((h) => {
    const quien = h.cambiado_por === p.cliente_id ? 'cliente'
                : h.cambiado_por ? 'admin' : 'sistema';
    const desde = h.estado_anterior ? ESTADOS_PEDIDO[h.estado_anterior] + ' → ' : '';
    return `<li><span>${desde}<strong>${ESTADOS_PEDIDO[h.estado_nuevo] || escaparHTML(h.estado_nuevo)}</strong> · ${quien}</span>
                <time>${fechaPedido(h.cambiado_en)}</time></li>`;
  }).join('');

  return {
    arriba: `
      <p class="pedido-cliente">👤 ${escaparHTML(cliente?.nombre || 'Cliente sin perfil')}
        <span>${escaparHTML(cliente?.correo || p.cliente_id)}</span></p>`,
    abajo: `
      <div class="pedido-acciones">
        <select aria-label="Nuevo estado del pedido ${p.id}">${opciones}</select>
        <button type="button" data-accion="cambiar-estado" data-id="${p.id}" data-actual="${p.estado}">Guardar estado</button>
      </div>
      ${pasos ? `<details class="pedido-historial"><summary>Historial</summary><ol>${pasos}</ol></details>` : ''}`,
  };
}

async function cargarPedidosAdmin() {
  const lista = document.getElementById('lista-pedidos-admin');
  const resumen = document.getElementById('resumen-pedidos');
  lista.innerHTML = '<p class="pedidos-vacio">Cargando pedidos…</p>';
  resumen.textContent = '';

  // Pedidos y clientes a la vez: Promise.all espera las dos consultas
  const [pedidos] = await Promise.all([traerPedidos(), traerClientes()]);

  if (!pedidos) {
    lista.innerHTML = '<p class="pedidos-vacio">No pudimos cargar los pedidos. Revisa la consola (F12).</p>';
    return;
  }

  // Resumen: cuántos hay en cada estado y cuánto se ha vendido
  // (los cancelados no cuentan como venta)
  const cuantos = (estado) => pedidos.filter((p) => p.estado === estado).length;
  const vendido = pedidos
    .filter((p) => p.estado !== 'cancelado')
    .reduce((suma, p) => suma + Number(p.total), 0);
  resumen.textContent =
    `${pedidos.length} pedidos · ${cuantos('confirmado')} por enviar · ${cuantos('enviado')} enviados · ` +
    `${cuantos('entregado')} entregados · ${cuantos('cancelado')} cancelados · Vendido: ${pesos(vendido)}`;

  const filtro = document.getElementById('filtro-estado-pedidos').value;
  const visibles = filtro ? pedidos.filter((p) => p.estado === filtro) : pedidos;

  if (visibles.length === 0) {
    lista.innerHTML = `<p class="pedidos-vacio">${pedidos.length ? 'No hay pedidos con ese estado.' : 'Todavía no hay pedidos.'}</p>`;
    return;
  }

  const historial = await traerHistorial(visibles.map((p) => p.id));

  lista.innerHTML = visibles.map((p) => {
    const cliente = clientesAdmin.find((c) => c.id === p.cliente_id);
    const pasos = historial.filter((h) => h.pedido_id === p.id);
    return tarjetaPedido(p, extrasPedidoAdmin(p, cliente, pasos));
  }).join('');
}

// Cambia el estado. El trigger validar_transicion_estado() decide si el
// cambio está permitido (ej: no se puede "des-entregar"); si no, su
// mensaje llega en error.message. registrar_cambio_estado() guarda el
// historial solo. El navegador no hace ninguna de esas dos cosas.
async function cambiarEstadoPedido(id, estado) {
  const { data, error } = await db
    .from('pedidos')
    .update({ estado })
    .eq('id', id)
    .select('id, estado');

  if (error) {
    console.log('Error al cambiar el estado:', error);
    return error.message;
  }
  // Con RLS, si no hay permiso no hay error: solo 0 filas cambiadas
  if (data.length === 0) return 'No se actualizó el pedido (¿tu usuario está en admins_practica?)';
  return null;
}

document.getElementById('lista-pedidos-admin').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-accion="cambiar-estado"]');
  if (!boton) return;

  const nuevo = boton.closest('.pedido-acciones').querySelector('select').value;
  const mensaje = document.getElementById('mensaje-pedidos');

  if (nuevo === boton.dataset.actual) {
    mensaje.textContent = `El pedido #${boton.dataset.id} ya está en "${ESTADOS_PEDIDO[nuevo]}".`;
    return;
  }

  boton.disabled = true;
  const error = await cambiarEstadoPedido(Number(boton.dataset.id), nuevo);
  boton.disabled = false;

  mensaje.textContent = error
    ? `No se pudo cambiar el pedido #${boton.dataset.id}: ${error}`
    : `Pedido #${boton.dataset.id} → ${ESTADOS_PEDIDO[nuevo]} ✓`;

  if (!error) cargarPedidosAdmin();   // repinta con el estado y el historial nuevos
});

document.getElementById('filtro-estado-pedidos').addEventListener('change', cargarPedidosAdmin);
document.getElementById('btn-recargar-pedidos').addEventListener('click', () => {
  document.getElementById('mensaje-pedidos').textContent = '';
  cargarPedidosAdmin();
});


// ===================== MIS CLIENTES =====================
// Para cada cliente: cuántos pedidos hizo y cuánto ha comprado.
// Los totales salen de la vista pedidos_con_total (los calcula la base).
let resumenPorCliente = {};

async function cargarClientesAdmin() {
  const cuerpo = document.getElementById('tabla-clientes');
  cuerpo.innerHTML = '<tr><td colspan="7" class="pedidos-vacio">Cargando clientes…</td></tr>';

  const [clientes, { data: totales, error }] = await Promise.all([
    traerClientes(),
    db.from('pedidos_con_total').select('cliente_id, estado, total').neq('estado', 'carrito'),
  ]);

  if (!clientes || error) {
    if (error) console.log('Error al traer los totales:', error);
    cuerpo.innerHTML = '<tr><td colspan="7" class="pedidos-vacio">No pudimos cargar los clientes. Revisa la consola (F12).</td></tr>';
    return;
  }

  resumenPorCliente = {};
  for (const t of totales) {
    const r = (resumenPorCliente[t.cliente_id] ??= { pedidos: 0, comprado: 0 });
    r.pedidos += 1;
    if (t.estado !== 'cancelado') r.comprado += Number(t.total);
  }

  const conPedidos = clientes.filter((c) => resumenPorCliente[c.id]).length;
  document.getElementById('resumen-clientes').textContent =
    `${clientes.length} clientes registrados · ${conPedidos} con al menos un pedido`;

  pintarClientes();
}

// Dibuja la tabla aplicando el buscador (sin volver a consultar Supabase)
function pintarClientes() {
  const buscado = document.getElementById('buscar-cliente').value.trim().toLowerCase();
  const visibles = clientesAdmin.filter((c) =>
    [c.nombre, c.correo, c.ciudad].some((dato) => (dato || '').toLowerCase().includes(buscado)));

  const cuerpo = document.getElementById('tabla-clientes');
  if (visibles.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="7" class="pedidos-vacio">${clientesAdmin.length ? 'Ningún cliente coincide con la búsqueda.' : 'Todavía no hay clientes.'}</td></tr>`;
    return;
  }

  cuerpo.innerHTML = visibles.map((c, i) => {
    const r = resumenPorCliente[c.id] || { pedidos: 0, comprado: 0 };
    return `
      <tr style="--i: ${i}">
        <td>
          <span class="nombre-producto">${escaparHTML(c.nombre || 'Sin nombre')}</span>
          <span class="correo-cliente">${escaparHTML(c.correo)}</span>
        </td>
        <td>${escaparHTML(c.telefono || '—')}</td>
        <td>${escaparHTML(c.ciudad || '—')}</td>
        <td>${escaparHTML(c.direccion || '—')}</td>
        <td class="numero">${r.pedidos}</td>
        <td class="precio-celda">${pesos(r.comprado)}</td>
        <td>${c.created_at ? new Date(c.created_at).toLocaleDateString('es-CO', { dateStyle: 'medium' }) : '—'}</td>
      </tr>`;
  }).join('');
}

document.getElementById('buscar-cliente').addEventListener('input', pintarClientes);


// ===================== ADMINISTRADORES =====================
// admins_practica está cerrada para el navegador (proteger_admins.sql).
// Por eso la lista y el alta pasan por funciones de Supabase
// (sql/agregar_admin.sql) que primero comprueban que quien llama es admin.

async function cargarAdmins() {
  const cuerpo = document.getElementById('tabla-admins');
  cuerpo.innerHTML = '<tr><td colspan="3" class="pedidos-vacio">Cargando administradores…</td></tr>';

  const { data, error } = await db.rpc('listar_admins');
  if (error) {
    console.log('Error al traer los admins:', error);
    cuerpo.innerHTML = '<tr><td colspan="3" class="pedidos-vacio">No pudimos cargar los administradores. ¿Ya ejecutaste sql/agregar_admin.sql en Supabase?</td></tr>';
    return;
  }

  document.getElementById('resumen-admins').textContent =
    `${data.length} ${data.length === 1 ? 'administrador' : 'administradores'}`;

  cuerpo.innerHTML = data.map((a, i) => `
      <tr style="--i: ${i}">
        <td>
          <span class="nombre-producto">${escaparHTML(a.nombre || 'Sin nombre')}</span>
          <span class="correo-cliente">${escaparHTML(a.correo)}</span>
        </td>
        <td>${escaparHTML(a.rol || 'admin')}</td>
        <td>${a.created_at ? new Date(a.created_at).toLocaleDateString('es-CO', { dateStyle: 'medium' }) : '—'}</td>
      </tr>`).join('');
}

// Cliente TEMPORAL solo para el signUp: no guarda sesión, así crear la
// cuenta del nuevo admin no cierra la sesión del admin que usa el panel
// (db sigue siendo el único cliente "con sesión").
const dbRegistroAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'registro-admin' },
});

document.getElementById('form-nuevo-admin').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;
  const mensaje = document.getElementById('mensaje-admins');
  const boton = document.getElementById('btn-agregar-admin');

  const nombre = form.elements['nombre'].value.trim();
  const correo = form.elements['correo'].value.trim().toLowerCase();
  const contrasena = form.elements['contrasena'].value;

  boton.disabled = true;
  mensaje.textContent = 'Agregando administrador…';

  // 1° La cuenta (auth.users). Si el correo ya está registrado no es
  //    problema: el paso 2 usa esa cuenta existente.
  const { error: errorCuenta } = await dbRegistroAdmin.auth.signUp({ email: correo, password: contrasena });
  if (errorCuenta && !/already registered|already exists/i.test(errorCuenta.message)) {
    console.log('Error al crear la cuenta:', errorCuenta);
    mensaje.textContent = 'No se pudo crear la cuenta: ' + errorCuenta.message;
    boton.disabled = false;
    return;
  }

  // 2° La fila en admins_practica, a través de la función segura
  const { error } = await db.rpc('agregar_admin', { p_nombre: nombre, p_correo: correo });
  boton.disabled = false;

  if (error) {
    console.log('Error al agregar admin:', error);
    mensaje.textContent = 'No se pudo agregar: ' + error.message;
    return;
  }

  form.reset();
  mensaje.textContent = `✓ ${nombre} ahora es administrador. Ya puede iniciar sesión con ${correo}.`;
  cargarAdmins();
});

document.getElementById('btn-recargar-admins').addEventListener('click', cargarAdmins);

// Cambiar el código de invitación (sql/registro_admin_codigo.sql)
document.getElementById('form-codigo-admin').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;
  const mensaje = document.getElementById('mensaje-codigo');

  const { error } = await db.rpc('cambiar_codigo_admin', { p_codigo: form.elements['codigo'].value });
  if (error) {
    console.log('Error al cambiar el código:', error);
    mensaje.textContent = 'No se pudo cambiar el código: ' + error.message;
    return;
  }

  form.reset();
  mensaje.textContent = '✓ Código cambiado. Compártelo solo con los nuevos administradores.';
});
