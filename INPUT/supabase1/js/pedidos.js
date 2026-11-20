// =================================================================
// PEDIDOS: funciones COMPARTIDAS por cliente.html ("Mis pedidos") y
// admin.html ("Pedidos"). Se carga después de supabaseClient.js (usa db)
// y antes de cliente.js / admin-pedidos.js.
//
// Ojo con los nombres: todos los <script> comparten las variables
// globales, por eso aquí NO usamos "formato" ni "normalizar" (ya existen
// en admin.js) y elegimos nombres que no choquen.
// =================================================================

// Los 5 estados que permite la base (restricción pedidos_estado_check)
const ESTADOS_PEDIDO = {
  carrito:    'En carrito',
  confirmado: 'Confirmado',
  enviado:    'Enviado',
  entregado:  'Entregado',
  cancelado:  'Cancelado',
};

// 90000 → "$90.000"
const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO');

// "2026-11-19T15:45:00+00:00" → "19 nov 2026, 10:45 a. m." (hora local)
function fechaPedido(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

// Lo que escribe un cliente (dirección, observación, su nombre...) va a
// parar dentro de innerHTML. Si alguien escribe "<img onerror=...>", sin
// esto el navegador lo ejecutaría (¡en la página del admin!). Escapar
// convierte < > & " ' en texto inofensivo.
function escaparHTML(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}


// ===================== LEER PEDIDOS =====================
// Dos consultas:
//  1) pedidos_con_total: los pedidos con el total YA calculado por la base
//     (el navegador nunca suma precios). Sin los carritos abiertos.
//  2) detalles_pedidos de esos pedidos, con el nombre de cada producto
//     (select anidado: sigue la FK producto_id → products_practice).
// clienteId: solo los de ese cliente (Mis pedidos). Sin él trae todos los
// que RLS deje ver: el cliente ve los suyos; el admin, todos.
// Devuelve un array (puede estar vacío) o null si hubo error.
async function traerPedidos(clienteId = null) {
  let consulta = db
    .from('pedidos_con_total')
    .select('*')
    .neq('estado', 'carrito')
    .order('confirmado_en', { ascending: false, nullsFirst: false });

  if (clienteId) consulta = consulta.eq('cliente_id', clienteId);

  const { data: pedidos, error } = await consulta;
  if (error) {
    console.log('Error al traer pedidos:', error);
    return null;
  }
  if (pedidos.length === 0) return [];

  const { data: detalles, error: errorDetalles } = await db
    .from('detalles_pedidos')
    .select('pedido_id, producto_id, cantidad, precio_unitario, products_practice(nombre)')
    .in('pedido_id', pedidos.map((p) => p.id))
    .order('id');

  if (errorDetalles) {
    console.log('Error al traer los productos de los pedidos:', errorDetalles);
    return null;
  }

  // A cada pedido le colgamos sus productos
  for (const p of pedidos) {
    p.detalles = detalles.filter((d) => d.pedido_id === p.id);
  }
  return pedidos;
}


// ===================== DIBUJAR UN PEDIDO =====================

// Pastilla de color con el estado actual
function etiquetaEstado(estado) {
  return `<span class="estado-pedido estado-${escaparHTML(estado)}">${ESTADOS_PEDIDO[estado] || escaparHTML(estado)}</span>`;
}

// Línea de pasos Confirmado → Enviado → Entregado (no aplica a cancelados)
function progresoPedido(estado) {
  if (estado === 'cancelado') return '';
  const pasos = ['confirmado', 'enviado', 'entregado'];
  const actual = pasos.indexOf(estado);
  return `
    <ol class="pedido-progreso" aria-label="Avance del pedido">
      ${pasos.map((e, i) => `<li class="${i <= actual ? 'hecho' : ''}">${ESTADOS_PEDIDO[e]}</li>`).join('')}
    </ol>`;
}

// Tarjeta de un pedido. "extra" deja a cada página agregar lo suyo:
//   arriba: debajo de la cabecera (ej: el avance, o el cliente en admin)
//   abajo:  al final (ej: el selector de estado del admin)
function tarjetaPedido(p, extra = {}) {
  const items = p.detalles.map((d) => `
    <li>
      <span>${d.cantidad} × ${escaparHTML(d.products_practice?.nombre || 'Producto ' + d.producto_id)}</span>
      <span>${pesos(d.cantidad * d.precio_unitario)}</span>
    </li>`).join('');

  const entrega = p.envio
    ? `🚚 Envío a domicilio: ${escaparHTML(p.direccion)} · Tel. ${escaparHTML(p.telefono)}`
    : '🏬 Recoge en tienda';

  return `
    <article class="pedido" data-pedido="${p.id}">
      <header class="pedido-cabecera">
        <div>
          <strong>Pedido #${p.id}</strong>
          <span class="pedido-fecha">${fechaPedido(p.confirmado_en || p.created_at)}</span>
        </div>
        ${etiquetaEstado(p.estado)}
      </header>
      ${extra.arriba || ''}
      <ul class="pedido-items">${items}</ul>
      <p class="pedido-entrega">${entrega}</p>
      ${p.observacion ? `<p class="pedido-nota">“${escaparHTML(p.observacion)}”</p>` : ''}
      <footer class="pedido-total"><span>Total</span><strong>${pesos(p.total)}</strong></footer>
      ${extra.abajo || ''}
    </article>`;
}
