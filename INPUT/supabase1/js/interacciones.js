// =================================================================
// INTERACCIONES COMPARTIDAS (index, galeria, cliente, admin)
//  1. Pantalla splash (la primera vez en la sesión)
//  2. Fondo en movimiento: estrellas que flotan, constelaciones cerca
//     del mouse y estrellas fugaces + orbes de color
//  3. Transición al salir hacia otra página del sitio
//  4. Cursor mágico: aro con resorte, texto sobre tarjetas, estela y
//     explosión de chispas al hacer clic
//  5. Botones magnéticos + onda al hacer clic
//  6. Tarjetas: luz que sigue al mouse e inclinación 3D
//  7. Carruseles: cinta de joyas en el acceso y avance automático
//  8. Barra de progreso del scroll
// Nada de esto toca Supabase. Los estilos están en css/interacciones.css.
// =================================================================
(() => {
  const raiz = document.documentElement;
  const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const temaOscuro = () => raiz.dataset.tema === 'oscuro';

  // Elementos "con clic": sobre ellos el aro del cursor crece
  const SELECTOR_CLIC = 'a, button, [role="tab"], select, label.casilla-filtro, label.casilla, summary, .producto, .mundo-tarjeta, .tipo-tarjeta';
  const SELECTOR_TEXTO = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea';
  // Texto que aparece dentro del aro sobre cada tipo de tarjeta
  const ETIQUETAS = [['.producto', 'Ver ✦'], ['.mundo-tarjeta', 'Explorar'], ['.tipo-tarjeta', 'Ver'], ['.banner', 'Ir →']];


  // ===================== 1. SPLASH =====================
  if (raiz.classList.contains('splash')) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.setAttribute('role', 'presentation');
    const letras = [...'Everwish'].map((l, n) => `<span style="--n:${n}">${l}</span>`).join('');
    splash.innerHTML = `
      <div class="splash-centro">
        <div class="splash-simbolo" aria-hidden="true">
          <svg viewBox="0 0 150 150">
            <defs>
              <linearGradient id="splash-oro" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="#f0d48c"/><stop offset="1" stop-color="#c9963f"/>
              </linearGradient>
            </defs>
            <circle class="splash-orbita" cx="75" cy="75" r="68"/>
            <circle class="splash-luna" cx="75" cy="7" r="3"/>
            <path class="splash-estrella" d="M75 14 C79 52 98 71 136 75 C98 79 79 98 75 136 C71 98 52 79 14 75 C52 71 71 52 75 14 Z"/>
            <path class="splash-mini m1" d="M118 22 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z"/>
            <path class="splash-mini m2" d="M28 112 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/>
            <path class="splash-mini m3" d="M30 30 l1.6 5 5 1.6 -5 1.6 -1.6 5 -1.6 -5 -5 -1.6 5 -1.6z"/>
          </svg>
        </div>
        <div class="splash-marca">${letras}</div>
        <div class="splash-lema">Joyería de fantasía</div>
        <div class="splash-barra"></div>
        <div class="splash-saltar">Clic para entrar</div>
      </div>`;
    raiz.append(splash);   // en <html>: así no lo afecta la animación de entrada del <body>

    let cerrado = false;
    const cerrarSplash = () => {
      if (cerrado) return;
      cerrado = true;
      try { sessionStorage.setItem('splash-visto', '1'); } catch (e) {}
      raiz.classList.remove('splash');   // la página aparece debajo del círculo que se cierra
      splash.classList.add('cerrando');
      setTimeout(() => splash.remove(), 1000);
    };
    splash.addEventListener('click', cerrarSplash);
    setTimeout(cerrarSplash, reducirMovimiento ? 600 : 2500);
  }


  // ===================== 2. FONDO EN MOVIMIENTO =====================
  const orbes = document.createElement('div');
  orbes.className = 'orbes';
  orbes.setAttribute('aria-hidden', 'true');
  orbes.innerHTML = '<span></span><span></span><span></span>';
  raiz.append(orbes);

  // Posición del mouse (la usan el cielo y el cursor). Empieza en el centro.
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, activo: false };

  if (!reducirMovimiento) {
    const cielo = document.createElement('canvas');
    cielo.className = 'cielo-magico';
    cielo.setAttribute('aria-hidden', 'true');
    raiz.append(cielo);
    const ctx = cielo.getContext('2d');
    let ancho, alto, escala, estrellas = [], fugaz = null;

    const preparar = () => {
      escala = Math.min(devicePixelRatio || 1, 2);
      ancho = innerWidth;
      alto = innerHeight;
      cielo.width = ancho * escala;
      cielo.height = alto * escala;
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      const cantidad = Math.min(120, Math.round((ancho * alto) / 14000));
      estrellas = Array.from({ length: cantidad }, () => ({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.2,      // suben despacio, como polvo de hadas
        fase: Math.random() * Math.PI * 2,
        prof: 0.3 + Math.random() * 0.7,      // profundidad: las cercanas se mueven más con el mouse
        dorada: Math.random() < 0.25,
      }));
    };
    preparar();
    addEventListener('resize', preparar);

    const dibujarCielo = (t) => {
      if (document.hidden) { requestAnimationFrame(dibujarCielo); return; }
      ctx.clearRect(0, 0, ancho, alto);
      const oscuro = temaOscuro();
      const base = oscuro ? '255,255,255' : '108,74,216';
      const oro = oscuro ? '243,216,150' : '217,79,130';
      // Paralaje: el cielo se corre un poco al contrario del mouse
      const px = (mouse.x / ancho - 0.5) * -30;
      const py = (mouse.y / alto - 0.5) * -30;

      const posiciones = estrellas.map((e) => {
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < -10) { e.y = alto + 10; e.x = Math.random() * ancho; }
        if (e.x < -10) e.x = ancho + 10;
        if (e.x > ancho + 10) e.x = -10;
        return { e, x: e.x + px * e.prof, y: e.y + py * e.prof };
      });

      // Constelaciones: líneas entre estrellas cercanas al mouse
      if (mouse.activo) {
        for (let i = 0; i < posiciones.length; i++) {
          const a = posiciones[i];
          const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dm > 190) continue;
          ctx.strokeStyle = `rgba(${base},${(1 - dm / 190) * (oscuro ? 0.35 : 0.25)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          for (let j = i + 1; j < posiciones.length; j++) {
            const b = posiciones[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 110 && Math.hypot(b.x - mouse.x, b.y - mouse.y) < 190) {
              ctx.strokeStyle = `rgba(${oro},${(1 - d / 110) * 0.3})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
      }

      // Las estrellas titilan (seno del tiempo)
      for (const { e, x, y } of posiciones) {
        const brillo = 0.35 + 0.65 * Math.abs(Math.sin(t / 1400 + e.fase));
        ctx.fillStyle = `rgba(${e.dorada ? oro : base},${brillo * (oscuro ? 0.9 : 0.45)})`;
        ctx.beginPath(); ctx.arc(x, y, e.r, 0, Math.PI * 2); ctx.fill();
      }

      // Estrella fugaz de vez en cuando
      if (!fugaz && Math.random() < 0.004) {
        fugaz = { x: Math.random() * ancho * 0.7, y: Math.random() * alto * 0.4, vida: 0 };
      }
      if (fugaz) {
        fugaz.vida += 1;
        const avance = fugaz.vida * 14;
        const x = fugaz.x + avance, y = fugaz.y + avance * 0.45;
        const cola = ctx.createLinearGradient(x, y, x - 140, y - 63);
        cola.addColorStop(0, `rgba(${oro},${oscuro ? 0.95 : 0.7})`);
        cola.addColorStop(1, `rgba(${oro},0)`);
        ctx.strokeStyle = cola;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 140, y - 63); ctx.stroke();
        if (fugaz.vida > 45) fugaz = null;
      }
      requestAnimationFrame(dibujarCielo);
    };
    requestAnimationFrame(dibujarCielo);
  }


  // ===================== 3. TRANSICIÓN ENTRE PÁGINAS =====================
  // La cortina va dentro de <html> (no de <body>) para que no se
  // desvanezca junto con la página
  const cortina = document.createElement('div');
  cortina.className = 'cortina-pagina';
  raiz.append(cortina);

  document.addEventListener('click', (evento) => {
    const enlace = evento.target.closest('a[href]');
    if (!enlace || evento.defaultPrevented || reducirMovimiento) return;
    // Ctrl/Cmd + clic, clic central o target="_blank": abre otra pestaña, no animamos
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || enlace.target === '_blank') return;

    const destino = new URL(enlace.href, location.href);
    if (destino.origin !== location.origin) return;
    // Solo cambia el #ancla de esta misma página: que haga su scroll normal
    if (destino.pathname === location.pathname && destino.search === location.search) return;

    evento.preventDefault();
    raiz.style.setProperty('--cx', evento.clientX + 'px');
    raiz.style.setProperty('--cy', evento.clientY + 'px');
    raiz.classList.add('saliendo');
    setTimeout(() => { location.href = destino.href; }, 380);
  });

  // Al volver con "atrás" el navegador puede mostrar la página tal como quedó
  window.addEventListener('pageshow', () => raiz.classList.remove('saliendo'));


  // ===================== 4. CURSOR MÁGICO =====================
  let chispas = [];   // partículas de la estela y de los clics

  if (conMouse && !reducirMovimiento) {
    const aro = document.createElement('div');
    aro.className = 'cursor-aro';
    aro.innerHTML = '<div class="cursor-forma"><span class="cursor-etiqueta"></span></div>';
    const punto = document.createElement('div');
    punto.className = 'cursor-punto';
    const estela = document.createElement('canvas');
    estela.className = 'cursor-estela';
    raiz.append(estela, aro, punto);

    const etiqueta = aro.querySelector('.cursor-etiqueta');
    const ctx = estela.getContext('2d');
    let escala = 1;
    const prepararEstela = () => {
      escala = Math.min(devicePixelRatio || 1, 2);
      estela.width = innerWidth * escala;
      estela.height = innerHeight * escala;
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
    };
    prepararEstela();
    addEventListener('resize', prepararEstela);

    // El aro sigue al mouse como un RESORTE: tiene velocidad propia
    let ax = mouse.x, ay = mouse.y, vx = 0, vy = 0;
    const rastro = [];   // últimas posiciones del mouse (la cola de la estela)
    const COLORES = ['243,216,150', '255,143,183', '165,140,255'];

    const lanzarChispas = (x, y, cantidad, fuerza) => {
      for (let i = 0; i < cantidad; i++) {
        const angulo = Math.random() * Math.PI * 2;
        const v = fuerza * (0.4 + Math.random() * 0.6);
        chispas.push({
          x, y,
          vx: Math.cos(angulo) * v,
          vy: Math.sin(angulo) * v,
          vida: 1,
          tam: 2 + Math.random() * 3.5,
          giro: Math.random() * Math.PI,
          color: COLORES[Math.floor(Math.random() * COLORES.length)],
        });
      }
    };

    document.addEventListener('mousemove', (evento) => {
      const dx = evento.clientX - mouse.x, dy = evento.clientY - mouse.y;
      mouse.x = evento.clientX;
      mouse.y = evento.clientY;
      mouse.activo = true;
      raiz.classList.add('con-cursor');
      punto.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      rastro.push({ x: mouse.x, y: mouse.y, t: performance.now() });

      // Al moverse rápido suelta polvo de estrellas
      const rapidez = Math.hypot(dx, dy);
      if (rapidez > 14 && Math.random() < 0.5) lanzarChispas(mouse.x, mouse.y, 1, 1.2);

      const destino = evento.target;
      const clicable = destino.closest?.(SELECTOR_CLIC);
      const texto = clicable && ETIQUETAS.find(([sel]) => clicable.matches(sel));
      raiz.classList.toggle('cursor-sobre', Boolean(clicable));
      raiz.classList.toggle('cursor-con-texto', Boolean(texto));
      if (texto) etiqueta.textContent = texto[1];
      raiz.classList.toggle('cursor-texto', Boolean(destino.closest?.(SELECTOR_TEXTO)));
    }, { passive: true });

    document.addEventListener('mousedown', (evento) => {
      raiz.classList.add('cursor-presionado');
      lanzarChispas(evento.clientX, evento.clientY, 14, 4.5);   // explosión de chispas
    });
    document.addEventListener('mouseup', () => raiz.classList.remove('cursor-presionado'));
    raiz.addEventListener('mouseleave', () => { raiz.classList.remove('con-cursor'); mouse.activo = false; });

    // Estrella de 4 puntas (la misma forma del logo)
    const dibujarEstrella = (x, y, r, giro) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(giro);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const radio = i % 2 === 0 ? r : r * 0.32;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(Math.cos(a) * radio, Math.sin(a) * radio);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const animarCursor = () => {
      // Resorte: acelera hacia el mouse y frena (rigidez 0.16, fricción 0.68)
      vx = (vx + (mouse.x - ax) * 0.16) * 0.68;
      vy = (vy + (mouse.y - ay) * 0.16) * 0.68;
      ax += vx;
      ay += vy;
      // Se estira en la dirección del movimiento, como una gota
      const velocidad = Math.min(Math.hypot(vx, vy), 40);
      const angulo = Math.atan2(vy, vx);
      const estirar = 1 + velocidad / 60;
      aro.style.transform =
        `translate(${ax}px, ${ay}px) rotate(${angulo}rad) scale(${estirar}, ${1 / estirar})`;

      // Estela: una cinta que se afina y se desvanece (dura 280 ms)
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const ahora = performance.now();
      while (rastro.length && ahora - rastro[0].t > 280) rastro.shift();
      if (rastro.length > 1) {
        ctx.lineCap = 'round';
        for (let i = 1; i < rastro.length; i++) {
          const vida = 1 - (ahora - rastro[i].t) / 280;
          ctx.strokeStyle = `rgba(${temaOscuro() ? '243,216,150' : '176,79,198'},${vida * 0.55})`;
          ctx.lineWidth = vida * 5;
          ctx.beginPath();
          ctx.moveTo(rastro[i - 1].x, rastro[i - 1].y);
          ctx.lineTo(rastro[i].x, rastro[i].y);
          ctx.stroke();
        }
      }

      // Chispas: se mueven, caen un poco y se apagan
      chispas = chispas.filter((c) => c.vida > 0);
      for (const c of chispas) {
        c.x += c.vx;
        c.y += c.vy;
        c.vx *= 0.92;
        c.vy = c.vy * 0.92 + 0.08;
        c.giro += 0.12;
        c.vida -= 0.025;
        ctx.fillStyle = `rgba(${c.color},${Math.max(c.vida, 0)})`;
        dibujarEstrella(c.x, c.y, c.tam * c.vida + 0.5, c.giro);
      }
      requestAnimationFrame(animarCursor);
    };
    animarCursor();
  }


  // ===================== 5. BOTONES MAGNÉTICOS + ONDA =====================
  // Al pasar el mouse, el botón se inclina un poco HACIA el cursor.
  // Usa la propiedad "translate" (aparte de "transform"), así no pisa
  // los efectos de hover que ya tiene cada botón.
  const SELECTOR_MAGNETICO = '.boton, .boton-barra, .boton-icono, #btn-tema, #btn-nuevo-producto, .volver-tienda, .hero-botones a, .saludo-botones button, .formulario-acceso button, #form-busqueda button';
  let magneticoActivo = null;
  const TRANSICION_MAGNETICA = 'translate 0.3s cubic-bezier(0.2, 0.8, 0.2, 1.3), transform 0.25s, box-shadow 0.25s, background 0.3s, background-position 0.5s, color 0.2s, border-color 0.2s';

  if (conMouse && !reducirMovimiento) {
    document.addEventListener('mousemove', (evento) => {
      const boton = evento.target.closest?.(SELECTOR_MAGNETICO);
      if (magneticoActivo && magneticoActivo !== boton) {
        const anterior = magneticoActivo;
        anterior.style.translate = '';   // vuelve a su lugar con la transición de abajo
        setTimeout(() => { if (anterior !== magneticoActivo) anterior.style.transition = ''; }, 450);
        magneticoActivo = null;
      }
      if (!boton) return;
      // Transición suave del "translate" (junto con los efectos normales del botón)
      boton.style.transition = TRANSICION_MAGNETICA;
      const caja = boton.getBoundingClientRect();
      const dx = evento.clientX - (caja.left + caja.width / 2);
      const dy = evento.clientY - (caja.top + caja.height / 2);
      boton.style.translate = `${dx * 0.22}px ${dy * 0.32}px`;
      magneticoActivo = boton;
    }, { passive: true });
  }

  const SELECTOR_ONDA = 'button:not(.mundo-tarjeta):not(.mundo-mini):not(.pestana):not(#btn-carrito), .boton, .boton-barra:not(#btn-carrito), .volver-tienda';

  document.addEventListener('pointerdown', (evento) => {
    const boton = evento.target.closest(SELECTOR_ONDA);
    if (!boton || boton.disabled || reducirMovimiento) return;

    const caja = boton.getBoundingClientRect();
    const onda = document.createElement('span');
    onda.className = 'onda-clic';
    onda.style.left = (evento.clientX - caja.left) + 'px';
    onda.style.top = (evento.clientY - caja.top) + 'px';
    // Lo bastante grande para cubrir todo el botón
    onda.style.setProperty('--escala', Math.ceil(Math.max(caja.width, caja.height) / 5));
    boton.append(onda);
    onda.addEventListener('animationend', () => onda.remove());
  });


  // ===================== 6. TARJETAS VIVAS =====================
  // Luz: --mx/--my con la posición del mouse dentro de la tarjeta.
  // Inclinación 3D: solo en productos, mundos y tipos (las demás solo se elevan).
  const SELECTOR_LUZ = '.producto, .mundo-tarjeta, .tipo-tarjeta, .tarjeta, .pedido, .dato-cuenta, .estadistica';
  const SELECTOR_INCLINAR = '.producto, .mundo-tarjeta, .tipo-tarjeta, .tarjeta';
  let tarjetaActiva = null;

  if (conMouse) {
    document.addEventListener('mousemove', (evento) => {
      const tarjeta = evento.target.closest?.(SELECTOR_LUZ);

      if (tarjetaActiva && tarjetaActiva !== tarjeta) {
        tarjetaActiva.style.transform = '';
        tarjetaActiva = null;
      }
      if (!tarjeta) return;

      const caja = tarjeta.getBoundingClientRect();
      const px = (evento.clientX - caja.left) / caja.width;    // 0 (izq) … 1 (der)
      const py = (evento.clientY - caja.top) / caja.height;    // 0 (arriba) … 1 (abajo)
      tarjeta.style.setProperty('--mx', px * 100 + '%');
      tarjeta.style.setProperty('--my', py * 100 + '%');

      if (!reducirMovimiento && tarjeta.matches(SELECTOR_INCLINAR)) {
        tarjetaActiva = tarjeta;
        const giroY = (px - 0.5) * 12;    // máximo ±6 grados
        const giroX = (0.5 - py) * 12;
        tarjeta.style.transform =
          `perspective(900px) rotateX(${giroX}deg) rotateY(${giroY}deg) translateY(-6px)`;
      }
    }, { passive: true });
  }


  // ===================== 7. CARRUSELES =====================
  // a) Cinta infinita de joyas en las pantallas de acceso (cliente y admin).
  //    Las imágenes van DOS veces seguidas: al llegar a la mitad, la
  //    animación vuelve a empezar y no se nota el salto.
  const arteAcceso = document.querySelectorAll('.acceso-arte');
  if (arteAcceso.length) {
    const JOYAS = [
      'collar-flor-de-magnolia', 'anillo-espejo-magico', 'aretes-lechuza-mensajera', 'tiara-rosa-encantada',
      'collar-manzana-envenenada', 'anillo-alas-doradas', 'pulsera-ola-del-oceano', 'collar-llave-dorada',
      'aretes-rayo', 'broche-huevo-de-dragon', 'collar-zapatilla-cristal', 'anillo-bebeme',
      'collar-polvo-de-hadas', 'aretes-llama-azul', 'pulsera-segunda-estrella', 'collar-ambar-prehistorico',
    ];
    const fila = (lista) => {
      const imgs = lista.map((n) => `<img src="img/productos/${n}.svg" alt="" loading="lazy">`).join('');
      return `<div class="cinta-fila"><div class="cinta-pista">${imgs}${imgs}</div></div>`;
    };
    arteAcceso.forEach((arte) => {
      const cinta = document.createElement('div');
      cinta.className = 'cinta-joyas';
      cinta.setAttribute('aria-hidden', 'true');
      cinta.innerHTML = fila(JOYAS.slice(0, 8)) + fila(JOYAS.slice(8));
      arte.append(cinta);
    });
  }

  // b) Los carruseles de la tienda avanzan solos cada 4 s; se detienen
  //    mientras el mouse está encima y vuelven al inicio al llegar al final.
  if (!reducirMovimiento) {
    setInterval(() => {
      if (document.hidden) return;
      document.querySelectorAll('.carrusel').forEach((carrusel) => {
        if (carrusel.matches(':hover') || carrusel.offsetParent === null) return;
        const final = carrusel.scrollWidth - carrusel.clientWidth;
        if (final <= 4) return;
        const primera = carrusel.firstElementChild;
        const paso = primera ? primera.getBoundingClientRect().width + 16 : carrusel.clientWidth * 0.5;
        if (carrusel.scrollLeft >= final - 4) carrusel.scrollTo({ left: 0, behavior: 'smooth' });
        else carrusel.scrollBy({ left: paso, behavior: 'smooth' });
      });
    }, 4000);
  }


  // ===================== 8. PROGRESO DEL SCROLL =====================
  const progreso = document.createElement('div');
  progreso.className = 'progreso-scroll';
  progreso.setAttribute('aria-hidden', 'true');
  raiz.append(progreso);

  const actualizarProgreso = () => {
    const total = raiz.scrollHeight - innerHeight;
    progreso.style.setProperty('--progreso', total > 0 ? Math.min(scrollY / total, 1) : 0);
  };
  addEventListener('scroll', actualizarProgreso, { passive: true });
  addEventListener('resize', actualizarProgreso);
  actualizarProgreso();
})();
