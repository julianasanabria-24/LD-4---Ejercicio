-- Llena la columna "imagen_url" (que ya existe) de products_practice.
-- Cómo usarlo: Supabase → SQL Editor → New query → pega todo esto → Run.
-- Usamos el "id" de cada producto para no depender de cómo está escrito el nombre.

update public.products_practice set imagen_url = 'https://co.tiendasishop.com/cdn/shop/files/IMG-14858589.jpg?v=1726245557&width=823' where id = 1; -- Audífonos Bluetooth X200
update public.products_practice set imagen_url = 'https://elaco.vtexassets.com/arquivos/ids/802516/CAMISETAS-BLANCO-E600746-2.jpg?v=638968240145000000' where id = 2; -- Camiseta Básica Algodón
update public.products_practice set imagen_url = 'https://media.falabella.com/falabellaCO/130344776_01/w=1500,h=1500,fit=cover' where id = 3; -- Silla Gamer ProMax

-- El nombre del producto 1 tiene tabs y un salto de línea al final; esto los quita.
update public.products_practice set nombre = trim(regexp_replace(nombre, '\s+$', '')) where id = 1;
