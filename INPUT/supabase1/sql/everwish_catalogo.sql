-- =================================================================
-- EVERWISH · CATÁLOGO
-- Convierte los productos de práctica en kits y accesorios de Everwish.
-- Ejecútalo en Supabase → SQL Editor → New query → pega TODO → Run
-- (sin seleccionar nada: si hay texto seleccionado, solo corre eso).
--
-- NO cambia la estructura: misma tabla products_practice, mismas
-- columnas, mismas políticas. Solo cambia FILAS:
--   - UPDATE de los productos 1 a 5 (no se pueden borrar: el pedido de
--     prueba los usa y la foreign key es ON DELETE RESTRICT). El pedido
--     viejo conserva su precio_unitario; solo verá el nombre nuevo.
--   - INSERT de 4 productos nuevos, solo si todavía no existen (se puede
--     ejecutar varias veces sin duplicarlos).
--
-- categorias: la 1.ª es el TIPO (kits / accesorios) y la 2.ª el MUNDO
-- (clásicos, princesas, bajo el mar, país de las maravillas). Los chips
-- de la tienda y las colecciones de la portada salen de aquí.
-- imagen_url: ruta dentro del proyecto (carpeta img/productos/).
-- =================================================================

-- 1) Los 5 kits principales (reutilizan los ids 1 a 5)
update products_practice set
  nombre      = 'Mickey Magic Box',
  description = 'Kit de accesorios clásico: diadema de orejitas con lazo rojo de lunares, llavero de guante, set de pines y libreta mágica, en caja de regalo.',
  precio      = 129000,
  unidades    = 24,
  descuento   = 0.10,
  disponible  = true,
  categorias  = '["kits", "clásicos"]'::json,
  imagen_url  = 'img/productos/mickey-magic-box.svg'
where id = 1;

update products_practice set
  nombre      = 'Cinderella Dream Kit',
  description = 'Inspirado en la zapatilla de cristal: collar con dije de zapatilla, tiara con brillo, aretes de calabaza y un reloj de bolsillo que marca la medianoche.',
  precio      = 159000,
  unidades    = 18,
  descuento   = 0,
  disponible  = true,
  categorias  = '["kits", "princesas"]'::json,
  imagen_url  = 'img/productos/cinderella-dream-kit.svg'
where id = 2;

update products_practice set
  nombre      = 'Ocean Dreams Kit',
  description = 'Temática marina inspirada en La Sirenita: pinzas de concha, collar de perlas, pulsera de escamas tornasol y neceser con estrellas de mar.',
  precio      = 139000,
  unidades    = 20,
  descuento   = 0.15,
  disponible  = true,
  categorias  = '["kits", "bajo el mar"]'::json,
  imagen_url  = 'img/productos/ocean-dreams-kit.svg'
where id = 3;

update products_practice set
  nombre      = 'Wonderland Box',
  description = 'Una caja para tomar el té en el País de las Maravillas: taza de rayas con plato, reloj de bolsillo del conejo, baraja de corazones y broche «Bébeme».',
  precio      = 149000,
  unidades    = 14,
  descuento   = 0,
  disponible  = true,
  categorias  = '["kits", "país de las maravillas"]'::json,
  imagen_url  = 'img/productos/wonderland-box.svg'
where id = 4;

update products_practice set
  nombre      = 'Golden Sun Kit',
  description = 'Inspirado en Enredados y Rapunzel: farolillo LED, peine dorado, horquillas con el emblema del sol y pulsera trenzada para el pelo más largo del reino.',
  precio      = 135000,
  unidades    = 5,
  descuento   = 0.20,
  disponible  = true,
  categorias  = '["kits", "princesas"]'::json,
  imagen_url  = 'img/productos/golden-sun-kit.svg'
where id = 5;

-- 2) Accesorios y edición limitada (nuevos, sin repetir si ya existen)
insert into products_practice (nombre, description, precio, unidades, descuento, disponible, categorias, imagen_url)
select v.nombre, v.description, v.precio, v.unidades, v.descuento, v.disponible, v.categorias::json, v.imagen_url
from (values
  ('Collar Zapatilla de Cristal',
   'Cadena dorada con un dije de zapatilla de cristal tallado. Para llevar un pedacito del baile a todas partes.',
   59000, 30, 0, true, '["accesorios", "princesas"]', 'img/productos/collar-zapatilla-cristal.svg'),
  ('Pinzas Concha y Perla',
   'Par de pinzas para el pelo con forma de concha y una perla en el centro. Ideales para un peinado de sirena.',
   39000, 40, 0.10, true, '["accesorios", "bajo el mar"]', 'img/productos/pinzas-concha-perla.svg'),
  ('Reloj del Conejo Blanco',
   'Reloj de bolsillo dorado con cadena, siempre a punto de dar las doce. ¡Es tarde, es tarde!',
   79000, 12, 0, true, '["accesorios", "país de las maravillas"]', 'img/productos/reloj-conejo-blanco.svg'),
  ('Midnight Wish Box',
   'Edición limitada: caja azul medianoche con estrellas doradas, luna creciente y una selección sorpresa de accesorios clásicos.',
   249000, 0, 0, false, '["kits", "clásicos"]', 'img/productos/midnight-wish-box.svg')
) as v(nombre, description, precio, unidades, descuento, disponible, categorias, imagen_url)
where not exists (
  select 1 from products_practice p where p.nombre = v.nombre
);

-- 3) Comprobación: deben salir 9 productos de Everwish con su imagen
select id, nombre, precio, unidades, descuento, disponible, categorias, imagen_url
from products_practice
order by id;
