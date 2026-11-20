-- =================================================================
-- EVERWISH · CATÁLOGO POR MUNDOS (10 productos en cada mundo = 70)
-- Ejecútalo en Supabase → SQL Editor → New query → pega TODO → Run.
-- Se puede ejecutar varias veces: no duplica productos (compara por nombre).
--
-- categorias = [TIPO, MUNDO]
--   TIPO:  collares · aretes · anillos · pulseras · accesorios · kits
--   MUNDO: clásicos · princesas · bajo el mar · país de las maravillas ·
--          villanos (Disney) · mundo mágico (Warner Bros.) · aventuras (Universal)
-- imagen_url apunta a ilustraciones PROVISIONALES (img/productos/*.svg).
-- Cuando tengas las fotos reales, cámbialas desde admin.html (clic en la foto).
-- =================================================================

-- 1) Los 9 productos de everwish_catalogo.sql: si ya existen, se les
--    ponen las categorías nuevas [tipo, mundo]
update products_practice set categorias = '["kits","clásicos"]'::json where nombre = 'Mickey Magic Box';
update products_practice set categorias = '["kits","clásicos"]'::json where nombre = 'Midnight Wish Box';
update products_practice set categorias = '["kits","princesas"]'::json where nombre = 'Cinderella Dream Kit';
update products_practice set categorias = '["kits","princesas"]'::json where nombre = 'Golden Sun Kit';
update products_practice set categorias = '["collares","princesas"]'::json where nombre = 'Collar Zapatilla de Cristal';
update products_practice set categorias = '["kits","bajo el mar"]'::json where nombre = 'Ocean Dreams Kit';
update products_practice set categorias = '["accesorios","bajo el mar"]'::json where nombre = 'Pinzas Concha y Perla';
update products_practice set categorias = '["kits","país de las maravillas"]'::json where nombre = 'Wonderland Box';
update products_practice set categorias = '["accesorios","país de las maravillas"]'::json where nombre = 'Reloj del Conejo Blanco';

-- 2) Los 70 productos (9 originales + 61 nuevos), solo los que todavía no existen
insert into products_practice (nombre, description, precio, unidades, descuento, disponible, categorias, imagen_url)
select v.nombre, v.description, v.precio, v.unidades, v.descuento, v.unidades > 0, v.categorias::json, v.imagen_url
from (values
  ('Mickey Magic Box', 'Kit de accesorios clásico: diadema de orejitas con lazo rojo de lunares, llavero de guante, set de pines y libreta mágica, en caja de regalo.', 129000, 24, 0.1, '["kits","clásicos"]', 'img/productos/mickey-magic-box.svg'),
  ('Midnight Wish Box', 'Edición limitada: caja azul medianoche con estrellas doradas, luna creciente y una selección sorpresa de accesorios clásicos.', 249000, 0, 0, '["kits","clásicos"]', 'img/productos/midnight-wish-box.svg'),
  ('Cinderella Dream Kit', 'Inspirado en la zapatilla de cristal: collar con dije de zapatilla, tiara con brillo, aretes de calabaza y un reloj de bolsillo que marca la medianoche.', 159000, 18, 0, '["kits","princesas"]', 'img/productos/cinderella-dream-kit.svg'),
  ('Golden Sun Kit', 'Inspirado en Enredados y Rapunzel: farolillo LED, peine dorado, horquillas con el emblema del sol y pulsera trenzada para el pelo más largo del reino.', 135000, 5, 0.2, '["kits","princesas"]', 'img/productos/golden-sun-kit.svg'),
  ('Collar Zapatilla de Cristal', 'Cadena dorada con un dije de zapatilla de cristal tallado. Para llevar un pedacito del baile a todas partes.', 59000, 30, 0, '["collares","princesas"]', 'img/productos/collar-zapatilla-cristal.svg'),
  ('Ocean Dreams Kit', 'Temática marina inspirada en La Sirenita: pinzas de concha, collar de perlas, pulsera de escamas tornasol y neceser con estrellas de mar.', 139000, 20, 0.15, '["kits","bajo el mar"]', 'img/productos/ocean-dreams-kit.svg'),
  ('Pinzas Concha y Perla', 'Par de pinzas para el pelo con forma de concha y una perla en el centro. Ideales para un peinado de sirena.', 39000, 40, 0.1, '["accesorios","bajo el mar"]', 'img/productos/pinzas-concha-perla.svg'),
  ('Wonderland Box', 'Una caja para tomar el té en el País de las Maravillas: taza de rayas con plato, reloj de bolsillo del conejo, baraja de corazones y broche «Bébeme».', 149000, 14, 0, '["kits","país de las maravillas"]', 'img/productos/wonderland-box.svg'),
  ('Reloj del Conejo Blanco', 'Reloj de bolsillo dorado con cadena, siempre a punto de dar las doce. ¡Es tarde, es tarde!', 79000, 12, 0, '["accesorios","país de las maravillas"]', 'img/productos/reloj-conejo-blanco.svg'),
  ('Collar Orejitas de Lunares', 'Dije de orejitas redondas con lazo rojo de lunares blancos, en cadena dorada de 45 cm.', 69000, 22, 0, '["collares","clásicos"]', 'img/productos/collar-orejitas-de-lunares.svg'),
  ('Aretes Lazo Rojo de Lunares', 'Par de aretes de lazo rojo con lunares, ligeros y con cierre de presión.', 45000, 30, 0.1, '["aretes","clásicos"]', 'img/productos/aretes-lazo-rojo-de-lunares.svg'),
  ('Anillo Estrella de los Deseos', 'Anillo ajustable con una estrella de cristal: para pedirle un deseo cada noche.', 55000, 18, 0, '["anillos","clásicos"]', 'img/productos/anillo-estrella-de-los-deseos.svg'),
  ('Pulsera Pluma Mágica', 'Pulsera de cadena fina con una pluma dorada: la que te recuerda que sí puedes volar.', 49000, 25, 0, '["pulseras","clásicos"]', 'img/productos/pulsera-pluma-magica.svg'),
  ('Collar Polvo de Hadas', 'Frasquito de cristal con brillo dorado que se mueve, colgado de una cadena larga.', 72000, 12, 0.15, '["collares","clásicos"]', 'img/productos/collar-polvo-de-hadas.svg'),
  ('Aretes Cervatillo y Flor', 'Aretes asimétricos: un cervatillo de esmalte y una florecita silvestre.', 48000, 20, 0, '["aretes","clásicos"]', 'img/productos/aretes-cervatillo-y-flor.svg'),
  ('Broche Grillo Consciente', 'Broche esmaltado con sombrero de copa y paraguas, para la chaqueta o la mochila.', 39000, 35, 0, '["accesorios","clásicos"]', 'img/productos/broche-grillo-consciente.svg'),
  ('Pulsera Segunda Estrella', 'Pulsera con estrellas que crecen hasta la segunda a la derecha… y todo recto hasta el amanecer.', 58000, 14, 0, '["pulseras","clásicos"]', 'img/productos/pulsera-segunda-estrella.svg'),
  ('Tiara Rosa Encantada', 'Tiara dorada con una rosa roja en el centro y pétalos de cristal que caen a los lados.', 89000, 10, 0, '["accesorios","princesas"]', 'img/productos/tiara-rosa-encantada.svg'),
  ('Anillo Rosa Bajo Cristal', 'Una rosa diminuta dentro de una cúpula de cristal, sobre un anillo dorado ajustable.', 65000, 16, 0.1, '["anillos","princesas"]', 'img/productos/anillo-rosa-bajo-cristal.svg'),
  ('Aretes Manzana Roja', 'Manzanitas rojas brillantes con hoja verde: dulces, no envenenadas.', 45000, 28, 0, '["aretes","princesas"]', 'img/productos/aretes-manzana-roja.svg'),
  ('Pulsera Hojas de Otoño', 'Hojas doradas y cobrizas que tintinean con el viento.', 52000, 20, 0, '["pulseras","princesas"]', 'img/productos/pulsera-hojas-de-otono.svg'),
  ('Collar Flor de Magnolia', 'Flor de magnolia esmaltada en rosa pálido, símbolo de valentía, en cadena dorada.', 62000, 15, 0, '["collares","princesas"]', 'img/productos/collar-flor-de-magnolia.svg'),
  ('Aretes Copo de Hielo', 'Copos de nieve de cristal azul hielo que brillan como un palacio congelado.', 49000, 24, 0.2, '["aretes","princesas"]', 'img/productos/aretes-copo-de-hielo.svg'),
  ('Anillo Gema del Sol', 'Anillo con el emblema del sol dorado y una gema lila en el centro.', 59000, 4, 0, '["anillos","princesas"]', 'img/productos/anillo-gema-del-sol.svg'),
  ('Collar Concha de la Voz', 'Concha nacarada que se abre y guarda un brillo dorado: tu voz, a salvo.', 69000, 18, 0, '["collares","bajo el mar"]', 'img/productos/collar-concha-de-la-voz.svg'),
  ('Aretes Cola de Sirena', 'Colas de sirena con escamas tornasol que cambian de color con la luz.', 52000, 22, 0.1, '["aretes","bajo el mar"]', 'img/productos/aretes-cola-de-sirena.svg'),
  ('Anillo Tenedor Peinador', 'Un cachivache humano convertido en anillo: un tenedor plateado enrollado.', 45000, 26, 0, '["anillos","bajo el mar"]', 'img/productos/anillo-tenedor-peinador.svg'),
  ('Pulsera Ola del Océano', 'Pulsera de olas azules que vuelven siempre a la orilla, como tú a casa.', 49000, 20, 0, '["pulseras","bajo el mar"]', 'img/productos/pulsera-ola-del-oceano.svg'),
  ('Collar Corazón de la Isla', 'Piedra verde con una espiral grabada: el corazón que devuelve la vida a la isla.', 75000, 9, 0, '["collares","bajo el mar"]', 'img/productos/collar-corazon-de-la-isla.svg'),
  ('Aretes Pececito Tropical', 'Pececitos naranjas con rayas blancas. Uno tiene la aleta más pequeña, y está bien.', 42000, 30, 0, '["aretes","bajo el mar"]', 'img/productos/aretes-pececito-tropical.svg'),
  ('Pulsera Perlas del Arrecife', 'Perlas cultivadas de colores pastel con un dije de caballito de mar.', 56000, 16, 0, '["pulseras","bajo el mar"]', 'img/productos/pulsera-perlas-del-arrecife.svg'),
  ('Broche Estrella de Mar', 'Estrella de mar esmaltada en coral para el pelo o la ropa.', 35000, 40, 0.15, '["accesorios","bajo el mar"]', 'img/productos/broche-estrella-de-mar.svg'),
  ('Collar Llave Dorada', 'La llave dorada que abre la puertecita del jardín, con un lazo azul.', 59000, 20, 0, '["collares","país de las maravillas"]', 'img/productos/collar-llave-dorada.svg'),
  ('Aretes Naipe de Corazones', 'Naipes rojos y blancos que se pintan solos de rojo.', 45000, 26, 0, '["aretes","país de las maravillas"]', 'img/productos/aretes-naipe-de-corazones.svg'),
  ('Anillo Bébeme', 'Frasquito diminuto con la etiqueta «Bébeme» sobre un anillo dorado.', 52000, 14, 0, '["anillos","país de las maravillas"]', 'img/productos/anillo-bebeme.svg'),
  ('Pulsera Taza de Té', 'Tacitas, teteras y relojes para un no-cumpleaños que nunca termina.', 49000, 22, 0.1, '["pulseras","país de las maravillas"]', 'img/productos/pulsera-taza-de-te.svg'),
  ('Collar Sonrisa de Gato', 'Una sonrisa de rayas lilas y rosas que aparece… y desaparece.', 62000, 12, 0, '["collares","país de las maravillas"]', 'img/productos/collar-sonrisa-de-gato.svg'),
  ('Aretes Rosa Pintada', 'Rosas blancas a medio pintar de rojo, con su gota de pintura.', 46000, 18, 0, '["aretes","país de las maravillas"]', 'img/productos/aretes-rosa-pintada.svg'),
  ('Anillo Hongo Encantado', 'Hongo con lunares: un lado te hace crecer, el otro encoger. Edición agotada.', 48000, 0, 0, '["anillos","país de las maravillas"]', 'img/productos/anillo-hongo-encantado.svg'),
  ('Diadema Lazo de Alicia', 'Diadema negra con lazo de satín: el accesorio para cruzar el espejo.', 39000, 30, 0, '["accesorios","país de las maravillas"]', 'img/productos/diadema-lazo-de-alicia.svg'),
  ('Collar Manzana Envenenada', 'Manzana roja con un brillo violeta en el centro. Un solo bocado…', 72000, 16, 0, '["collares","villanos"]', 'img/productos/collar-manzana-envenenada.svg'),
  ('Anillo Espejo Mágico', 'Espejo ovalado con marco dorado: pregúntale quién es la más bella.', 65000, 12, 0, '["anillos","villanos"]', 'img/productos/anillo-espejo-magico.svg'),
  ('Aretes Cuernos Oscuros', 'Cuernos negros con un toque verde esmeralda, para un hechizo elegante.', 55000, 18, 0.1, '["aretes","villanos"]', 'img/productos/aretes-cuernos-oscuros.svg'),
  ('Collar Concha de la Bruja del Mar', 'Concha dorada que brilla en amarillo cuando roba una voz.', 69000, 10, 0, '["collares","villanos"]', 'img/productos/collar-concha-de-la-bruja-del-mar.svg'),
  ('Pulsera Tentáculos', 'Tentáculos lila que abrazan la muñeca, con ventosas de cristal.', 52000, 20, 0, '["pulseras","villanos"]', 'img/productos/pulsera-tentaculos.svg'),
  ('Anillo Cetro de Serpiente', 'Serpiente dorada con ojos de rubí enrollada en el dedo.', 58000, 14, 0, '["anillos","villanos"]', 'img/productos/anillo-cetro-de-serpiente.svg'),
  ('Aretes Llama Azul', 'Llamas azules del inframundo que no queman (casi nunca).', 49000, 22, 0.2, '["aretes","villanos"]', 'img/productos/aretes-llama-azul.svg'),
  ('Broche Rosa Marchita', 'Rosa negra con espinas plateadas para la solapa más malvada.', 42000, 25, 0, '["accesorios","villanos"]', 'img/productos/broche-rosa-marchita.svg'),
  ('Pulsera Blanco y Negro', 'Pulsera de lunares negros sobre blanco, para una diva de pelo bicolor.', 47000, 18, 0, '["pulseras","villanos"]', 'img/productos/pulsera-blanco-y-negro.svg'),
  ('Villains Night Box', 'Caja negra con manzana, espejo, cuernos y rosa marchita: los villanos favoritos, juntos.', 189000, 8, 0.1, '["kits","villanos"]', 'img/productos/villains-night-box.svg'),
  ('Collar Reloj de Arena Giratorio', 'Reloj de arena dorado que gira dentro de dos anillos: para volver una hora atrás.', 79000, 10, 0, '["collares","mundo mágico"]', 'img/productos/collar-reloj-de-arena-giratorio.svg'),
  ('Anillo Alas Doradas', 'Esfera dorada con alas finas: el anillo más difícil de atrapar.', 62000, 15, 0, '["anillos","mundo mágico"]', 'img/productos/anillo-alas-doradas.svg'),
  ('Aretes Rayo', 'Rayos dorados pequeños y brillantes, con cierre de presión.', 45000, 30, 0, '["aretes","mundo mágico"]', 'img/productos/aretes-rayo.svg'),
  ('Pulsera Cuatro Casas', 'Cuatro cuentas de colores: rojo, azul, amarillo y verde. ¿Cuál es tu casa?', 55000, 24, 0.15, '["pulseras","mundo mágico"]', 'img/productos/pulsera-cuatro-casas.svg'),
  ('Collar Triángulo de las Reliquias', 'Triángulo, círculo y línea: las tres reliquias en un solo dije. Agotado.', 69000, 0, 0, '["collares","mundo mágico"]', 'img/productos/collar-triangulo-de-las-reliquias.svg'),
  ('Broche Varita de Saúco', 'Varita tallada en madera oscura convertida en broche.', 42000, 20, 0, '["accesorios","mundo mágico"]', 'img/productos/broche-varita-de-sauco.svg'),
  ('Aretes Lechuza Mensajera', 'Lechuzas blancas con una carta en el pico: llegó tu invitación.', 48000, 18, 0, '["aretes","mundo mágico"]', 'img/productos/aretes-lechuza-mensajera.svg'),
  ('Anillo Piedra Roja', 'Piedra roja tallada sobre un anillo antiguo: la piedra que todos buscan.', 66000, 12, 0, '["anillos","mundo mágico"]', 'img/productos/anillo-piedra-roja.svg'),
  ('Collar Andén Nueve y Tres Cuartos', 'Placa de andén con un pequeño carrito de equipaje: el tren sale a las once.', 58000, 22, 0, '["collares","mundo mágico"]', 'img/productos/collar-anden-nueve-y-tres-cuartos.svg'),
  ('Wizard School Box', 'Caja de colegio de magia: varita, bufanda, carta de admisión y collar de reloj de arena.', 199000, 6, 0.1, '["kits","mundo mágico"]', 'img/productos/wizard-school-box.svg'),
  ('Collar Ámbar Prehistórico', 'Gota de ámbar con un mosquito atrapado hace millones de años.', 75000, 14, 0, '["collares","aventuras"]', 'img/productos/collar-ambar-prehistorico.svg'),
  ('Aretes Huella de Dinosaurio', 'Huellas de tres dedos en bronce: la vida se abre camino.', 45000, 26, 0, '["aretes","aventuras"]', 'img/productos/aretes-huella-de-dinosaurio.svg'),
  ('Anillo Escama de Dragón', 'Escamas negras con reflejos verdes de un dragón nocturno amigable.', 62000, 16, 0.1, '["anillos","aventuras"]', 'img/productos/anillo-escama-de-dragon.svg'),
  ('Pulsera Jinete de Dragón', 'Cuero trenzado con un dije de aleta roja: para volar con tu dragón.', 52000, 20, 0, '["pulseras","aventuras"]', 'img/productos/pulsera-jinete-de-dragon.svg'),
  ('Collar Bicicleta a la Luna', 'Una bicicleta que cruza la luna llena. Teléfono… casa.', 66000, 12, 0, '["collares","aventuras"]', 'img/productos/collar-bicicleta-a-la-luna.svg'),
  ('Aretes Pantano Encantado', 'Ranitas verdes y flores de pantano para un cuento de ogros con final feliz.', 42000, 24, 0, '["aretes","aventuras"]', 'img/productos/aretes-pantano-encantado.svg'),
  ('Pulsera Banana Amarilla', 'Cuentas amarillas y azules para los ayudantes más traviesos del villano.', 39000, 35, 0.2, '["pulseras","aventuras"]', 'img/productos/pulsera-banana-amarilla.svg'),
  ('Anillo Gafas de Explorador', 'Unas gafas de explorador redondas convertidas en anillo.', 48000, 18, 0, '["anillos","aventuras"]', 'img/productos/anillo-gafas-de-explorador.svg'),
  ('Broche Huevo de Dragón', 'Huevo moteado con brillo dorado, a punto de abrirse.', 44000, 22, 0, '["accesorios","aventuras"]', 'img/productos/broche-huevo-de-dragon.svg'),
  ('Jurassic Explorer Box', 'Caja de exploradora: collar de ámbar, aretes de huella, lupa y libreta de campo.', 179000, 7, 0, '["kits","aventuras"]', 'img/productos/jurassic-explorer-box.svg')
) as v(nombre, description, precio, unidades, descuento, categorias, imagen_url)
where not exists (
  select 1 from products_practice p where p.nombre = v.nombre
);

-- 3) Comprobación: cada mundo debe tener 10 productos.
--    Una fila con mundo vacío (null) = productos viejos de práctica
--    (tesla, televisor, camiseta...) que no pertenecen a ningún mundo.
select categorias->>1 as mundo, count(*) as productos
from products_practice
group by 1
order by 1;

-- 4) OPCIONAL: borrar los productos viejos de práctica (sin mundo).
--    Solo borra los que NO están en ningún pedido (la foreign key no deja
--    borrar los que sí). Revisa el resultado del paso 3 antes; para
--    ejecutarlo, quita los dos guiones del comienzo de cada línea.
-- delete from products_practice p
-- where p.categorias->>1 is null
--   and not exists (select 1 from detalles_pedidos d where d.producto_id = p.id);
