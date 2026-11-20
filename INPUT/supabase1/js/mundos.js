// =================================================================
// MUNDOS Y TIPOS DE JOYA (los usan index, galeria y cliente)
// Cada producto tiene categorias = [TIPO, MUNDO], por ejemplo
// ["collares", "princesas"]. Aquí está lo que NO vive en la base:
// el nombre bonito, la frase, la portada y el estudio de cada mundo.
// La "clave" es el nombre sin tildes ni mayúsculas, para comparar.
// =================================================================

const MUNDOS = [
  { clave: "princesas", nombre: "Princesas", estudio: "Disney", imagen: "img/mundos/princesas.svg",
    frase: "Tiaras, zapatillas de cristal y rosas encantadas." },
  { clave: "clasicos", nombre: "Clásicos", estudio: "Disney", imagen: "img/mundos/clasicos.svg",
    frase: "Lunares, estrellas de los deseos y polvo de hadas." },
  { clave: "bajo el mar", nombre: "Bajo el mar", estudio: "Disney", imagen: "img/mundos/bajo-el-mar.svg",
    frase: "Conchas, perlas y olas que siempre vuelven." },
  { clave: "pais de las maravillas", nombre: "País de las Maravillas", estudio: "Disney", imagen: "img/mundos/maravillas.svg",
    frase: "Llaves doradas, naipes y tazas de té." },
  { clave: "villanos", nombre: "Villanos", estudio: "Disney", imagen: "img/mundos/villanos.svg",
    frase: "El lado oscuro también brilla." },
  { clave: "mundo magico", nombre: "Mundo mágico", estudio: "Warner Bros.", imagen: "img/mundos/mundo-magico.svg",
    frase: "Varitas, lechuzas y relojes de arena." },
  { clave: "aventuras", nombre: "Aventuras", estudio: "Universal", imagen: "img/mundos/aventuras.svg",
    frase: "Dinosaurios, dragones y bicicletas a la luna." },
];

const TIPOS = [
  { clave: "collares",   nombre: "Collares",   icono: "📿" },
  { clave: "aretes",     nombre: "Aretes",     icono: "✨" },
  { clave: "anillos",    nombre: "Anillos",    icono: "💍" },
  { clave: "pulseras",   nombre: "Pulseras",   icono: "🔗" },
  { clave: "accesorios", nombre: "Accesorios", icono: "🎀" },
  { clave: "kits",       nombre: "Kits regalo", icono: "🎁" },
];

// "País" → "pais" (sin tildes, en minúsculas)
function sinTildes(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Clave del mundo y del tipo de un producto ("" si no tiene)
const mundoDe = (p) => sinTildes((p.categorias || [])[1]);
const tipoDe  = (p) => sinTildes((p.categorias || [])[0]);

const datosMundo = (clave) => MUNDOS.find((m) => m.clave === clave);
const datosTipo  = (clave) => TIPOS.find((t) => t.clave === clave);

// Enlace a la tienda ya filtrada por un mundo o un tipo
const enlaceMundo = (clave) => `galeria.html?mundo=${encodeURIComponent(clave)}`;
const enlaceTipo  = (clave) => `galeria.html?tipo=${encodeURIComponent(clave)}`;
