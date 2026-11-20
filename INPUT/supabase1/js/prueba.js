// Fotos de cada producto, según su "id" en Supabase.
// Para cambiar o agregar una foto: copia la dirección de la imagen y
// ponla aquí con el id del producto.
const imagenes = {
  1: 'https://co.tiendasishop.com/cdn/shop/files/IMG-14858589.jpg?v=1726245557&width=823', // Audífonos Bluetooth X200
  2: 'https://elaco.vtexassets.com/arquivos/ids/802516/CAMISETAS-BLANCO-E600746-2.jpg?v=638968240145000000', // Camiseta Básica Algodón
  3: 'https://media.falabella.com/falabellaCO/130344776_01/w=1500,h=1500,fit=cover',                       // Silla Gamer ProMax
};

document.getElementById('btn-traer').addEventListener('click', async () => {

  // Mismo "async" que en el Paso 2: esta función necesita "await" para
  // esperar la respuesta real de Supabase antes de seguir.
  const { data, error } = await db.from('products_practice').select('*');
  // ↑ El código se DETIENE en esta línea hasta que la base de datos
  //   responde. Compáralo con localStorage.getItem('productos'): esa
  //   llamada te devuelve el valor guardado EN EL MISMO INSTANTE, sin
  //   esperar nada, porque no sale de tu computador. Esta línea sí
  //   puede tardar (viaja a internet y vuelve) — por eso necesita await.

  if (error) {
    // Revisamos "error" ANTES de tocar "data": si la consulta falló,
    // "data" llega como null, y usar null más adelante (ej. null.map())
    // rompería el script. Mismo patrón de "validar antes de operar"
    // que ya usaste en el CRUD de la semana 7.
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // Armamos una tarjeta por cada producto. Esto es sincrónico (no
  // necesita await): ya no esperamos a Supabase, solo recorremos "data".
  // Los nombres de las columnas son los de TU tabla: "description" e
  // "imagen_url" (no "descripcion" ni "imagen").
  let tarjetas = '';
  for (const p of data) {
    const formato = (n) => '$' + n.toLocaleString('es-CO');
    const precioFinal = Math.round(p.precio * (1 - p.descuento));
    // Primero la foto de la lista "imagenes" de arriba; si no hay, la de
    // Supabase (imagen_url); si tampoco hay, un cuadro gris.
    const imagen = imagenes[p.id] || p.imagen_url || 'https://placehold.co/400x400/eeeeee/999999?text=Sin+imagen';

    tarjetas += `
      <article class="tarjeta ${p.disponible ? '' : 'agotado'}">
        <div class="tarjeta-foto">
          <img src="${imagen}" alt="${p.nombre.trim()}">
          ${p.descuento > 0 ? `<span class="etiqueta-descuento">-${Math.round(p.descuento * 100)}%</span>` : ''}
          ${p.disponible ? '' : '<span class="etiqueta-agotado">Agotado</span>'}
        </div>
        <div class="tarjeta-info">
          <p class="categorias">${p.categorias.join(' · ')}</p>
          <h3>${p.nombre.trim()}</h3>
          <p class="descripcion">${p.description}</p>
          <p class="precio">
            ${formato(precioFinal)}
            ${p.descuento > 0 ? `<s>${formato(p.precio)}</s>` : ''}
          </p>
          <p class="stock">${p.unidades} unidades disponibles</p>
          <button ${p.disponible ? '' : 'disabled'}>
            ${p.disponible ? 'Agregar al carrito' : 'Sin stock'}
          </button>
        </div>
      </article>`;
  }

  document.getElementById('resultado').innerHTML =
    `<section class="galeria">${tarjetas}</section>`;
});

// Carga la galería apenas se abre la página, sin tener que hacer clic.
document.getElementById('btn-traer').click();

/* Paso 4 desactivado: si lo activas, escribe encima del JSON del Paso 3.
document.getElementById('btn-traer').addEventListener('click', async () => {

  // async/await, igual que en los Pasos 2 y 3: necesitamos esperar la
  // respuesta real de Supabase antes de poder usar "data".
  const { data, error } = await db.from('products_practice').select('*');

  if (error) {
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // map() es SINCRÓNICO (igual que con cualquier array normal, como ya
  // usaste en localStorage/semana 8) — por eso NO lleva await. No viaja
  // a ningún lado: solo transforma el array "data" que ya tienes en
  // memoria, después de que el await de arriba terminó de esperar.
  // Esta es la diferencia clave a quedarte con esta sección: "await" es
  // solo para lo que viaja por la red (la consulta a Supabase); una vez
  // que los datos ya están en tu computador, trabajar con ellos
  // (map, filter, etc.) es exactamente igual que con localStorage.
  const nombres = data.map(producto => producto.nombre);
  // nombres es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';
});
*/

