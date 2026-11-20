// =================================================================
// INTERFAZ DEL PANEL (admin.html) — solo cosas visuales:
// 1. Tema y "Salir": flotan en el login; con el panel, van a la barra superior
// 2. Título de la barra superior según la sección abierta
// 3. Cajón del formulario de producto (abrir / cerrar)
// 4. Aviso (#notificacion) que se esconde solo
// No toca Supabase: admin.js y admin-pedidos.js siguen haciendo todo.
// =================================================================
(() => {
  const panel = document.getElementById('panel-admin');
  const esquina = document.querySelector('.esquina-admin');
  const accionesBarra = document.getElementById('acciones-admin');
  const btnTema = document.getElementById('btn-tema');
  const btnSalir = document.getElementById('btn-logout-admin');


  // ===================== 1. TEMA Y SALIR =====================
  // admin.js cambia panel.hidden al entrar o salir; lo observamos
  function ubicarBotones() {
    const destino = panel.hidden ? esquina : accionesBarra;
    destino.append(btnTema, btnSalir);
    esquina.hidden = !panel.hidden;   // con el panel abierto, la esquina queda vacía
  }
  new MutationObserver(ubicarBotones).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  ubicarBotones();


  // ===================== 2. TÍTULO POR SECCIÓN =====================
  const TITULOS = {
    'seccion-productos': ['Catálogo', 'Tu <span class="texto-degradado">catálogo</span> mágico', 'Crea y edita las joyas de los 7 mundos.'],
    'seccion-pedidos': ['Pedidos', 'Deseos <span class="texto-degradado">en camino</span>', 'Cambia el estado de cada pedido: confirmado, enviado, entregado.'],
    'seccion-clientes': ['Clientes', 'Quienes <span class="texto-degradado">sueñan</span> contigo', 'Datos de contacto, pedidos y total comprado de cada cliente.'],
    'seccion-admins': ['Equipo', 'Guardianes del <span class="texto-degradado">taller</span>', 'Agrega administradores y cambia el código de invitación.'],
  };

  document.querySelector('.pestanas-admin').addEventListener('click', (evento) => {
    const boton = evento.target.closest('.pestana');
    if (!boton) return;
    const [etiqueta, titulo, subtitulo] = TITULOS[boton.dataset.seccion];
    document.getElementById('admin-etiqueta').textContent = etiqueta;
    document.getElementById('admin-titulo').innerHTML = titulo;
    document.getElementById('admin-subtitulo').textContent = subtitulo;
    // Reinicia la animación del título
    const cabecera = document.querySelector('.admin-titulos');
    cabecera.classList.remove('cambiando');
    void cabecera.offsetWidth;
    cabecera.classList.add('cambiando');
  });


  // ===================== 3. CAJÓN DEL FORMULARIO =====================
  const cajon = document.getElementById('cajon-producto');
  const fondo = document.getElementById('fondo-cajon');
  const formulario = document.getElementById('form-producto');

  function abrirCajon() {
    cajon.classList.add('abierto');
    fondo.classList.add('visible');
    cajon.inert = false;
    document.body.classList.add('cajon-abierto');
    setTimeout(() => formulario.elements.nombre.focus({ preventScroll: true }), 350);
  }
  function cerrarCajon() {
    cajon.classList.remove('abierto');
    fondo.classList.remove('visible');
    cajon.inert = true;
    document.body.classList.remove('cajon-abierto');
  }

  // "＋ Nuevo producto": formulario limpio (el botón Cancelar de admin.js lo limpia)
  document.getElementById('btn-nuevo-producto').addEventListener('click', () => {
    document.getElementById('btn-cancelar').click();
    abrirCajon();
  });

  // Editar: admin.js cambia el título a "Modificar producto #id" → abrimos
  new MutationObserver(() => {
    if (document.getElementById('titulo-form').textContent.startsWith('Modificar')) abrirCajon();
  }).observe(document.getElementById('titulo-form'), { childList: true, characterData: true, subtree: true });

  document.getElementById('btn-cerrar-cajon').addEventListener('click', cerrarCajon);
  document.getElementById('btn-cancelar').addEventListener('click', cerrarCajon);
  fondo.addEventListener('click', cerrarCajon);
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && cajon.classList.contains('abierto')) cerrarCajon();
  });


  // ===================== 4. AVISO =====================
  // Después de guardar bien, cerramos el cajón; el aviso se va a los 4 s
  const aviso = document.getElementById('notificacion');
  let temporizador;
  new MutationObserver(() => {
    const texto = aviso.textContent;
    if (!texto) return;
    aviso.classList.toggle('error', texto.startsWith('Error'));
    aviso.classList.remove('saliendo-aviso');
    if (/agregado|actualizado/.test(texto)) cerrarCajon();
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      aviso.classList.add('saliendo-aviso');
      setTimeout(() => { aviso.textContent = ''; aviso.classList.remove('saliendo-aviso'); }, 300);
    }, 4000);
  }).observe(aviso, { childList: true, characterData: true, subtree: true });
})();
