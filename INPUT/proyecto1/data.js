/*-----Datos privados----------------------------*/

/* Todo el archivo vive dentro de una función que se ejecuta de inmediato (IIFE). Así "albums" y los
objetos no quedan globales y no se pueden modificar desde la consola. Hacia afuera solo sale
obtenerAlbums(), que devuelve una copia para leer. */

const obtenerAlbums = (function() {

  let arirang= {
    id: 1,
    nombre: "Arirang",
    año: 2026,
    tipo: "Álbum de estudio (álbum coreano)",
    era: "Comeback",

    estilo: "Pop",
    canciones: 14,
    favorito: true,
    cancionesDestacadas: ["Swim", "Hooligan", "Normal", "Body to Body"],

    descripcion:"Representa el esperado regreso de BTS tras el servicio militar, abordando sus raíces culturales e identidad profunda como artistas globales con un sonido renovado.",

    imagen:"https://i.scdn.co/image/ab67616d0000b273dfa17fad7f190c901603270e"
  };


  let proof = {
    id: 2,
    nombre: "Proof",
    año: 2022,
    tipo: "Álbum antológico",
    era: "Proof",

    estilo: "Hip-hop",
    canciones: 48,
    favorito: true,
    cancionesDestacadas: ["Yet To Come", "Run BTS", "For Youth", "Born Singer"],

    descripcion:"Álbum antológico que repasa los 9 años de trayectoria del grupo, combinando sus mayores éxitos, maquetas inéditas y temas dedicados a sus fans.",

    imagen:"https://i.scdn.co/image/ab67616d00001e0217db30ce3f081d6818a8ad49"
  };


  let be = {
    id: 3,
    nombre: "BE",
    año: 2020,
    tipo: "Álbum de estudio",
    era: "BE",

    estilo: "Pop",
    canciones: 8,
    favorito: true,
    cancionesDestacadas: ["Dynamite", "Life Goes On", "Blue & Grey", "Telepathy",],

    descripcion:"Album producido directamente por los miembros durante la pandemia para ofrecer consuelo, esperanza y una mirada íntima a sus emociones en tiempos inciertos.",

    imagen:"https://cdn-images.dzcdn.net/images/cover/7218df00a126bf159d852516400a1127/1900x1900-000000-81-0-0.jpg"
  };


  let mots7 = {
    id: 4,
    nombre: "Map of the Soul: 7",
    año: 2020,
    tipo: "Álbum de estudio",
    era: "MOTS",

    estilo: "Hip-hop",
    canciones: 20,
    favorito: true,
    cancionesDestacadas: ["ON", "Black Swan", "We are Bulletproof", "Boy With Luv"],

    descripcion:"Obra introespectiva inspirada en la psicología de Jung que celebra 7 años de carrera, aceptando tanto los éxitos como las sombras de la fama.",

    imagen:"https://cdn-images.dzcdn.net/images/cover/ba01e3de4d64a272543c427914c49e8b/1900x1900-000000-81-0-0.jpg"
  };


  let persona = {
    id: 5,
    nombre: "Map of the Soul: Persona",
    año: 2019,
    tipo: "Mini álbum",
    era: "MOTS",

    estilo: "Pop",
    canciones: 7,
    favorito: true,
    cancionesDestacadas: ["Boy With Luv","Mikrokosmos","Dionysus","Make iIt Right"],

    descripcion:"Explora el concepto de la máscara social, analizando el amor, la fama y la reconexión con sus fans a través de un pop vibrante.",

    imagen:"https://i.scdn.co/image/ab67616d0000b27318d0ed4f969b376893f9a38f"
  };


  let answer = {
    id: 6,
    nombre: "Love Yourself 結 'Answer'",
    año: 2018,
    tipo: "Álbum recopilatorio",
    era: "Love Yourself",

    estilo: "EDM",
    canciones: 26,
    favorito: true,
    cancionesDestacadas: ["IDOL","Answer: Love Myself","Euphoria","Mic Drop"],

    descripcion:"El cierre de la trilogía que reúne el viaje emocional del grupo, concluyendo que la clave de la felicidad está en aprender a amarse a uno mismo.",

    imagen:"https://i.scdn.co/image/ab67616d0000b273af396dce4438624ec801ff1a"
  };


  let tear = {
    id: 7,
    nombre: "Love Yourself 轉 'Tear'",
    año: 2018,
    tipo: "Álbum de estudio",
    era: "Love Yourself",

    estilo: "Pop rock",
    canciones: 11,
    favorito: true,
    cancionesDestacadas: ["Fake Love","The Truth Untold","Magic Shop","Anpanman",],

    descripcion:"Un trabajo más oscuro y emotivo que aborda el dolor de la separación, la mentira y la pérdida de identidad al fingir por amor.",

    imagen:"https://static.wikia.nocookie.net/bangtan/images/3/33/Tear_cover.jpg/revision/latest?cb=20180514022556&path-prefix=es"
  };


  let her = {
    id: 8,
    nombre: "Love Yourself 承 'Her'",
    año: 2017,
    tipo: "Mini álbum",
    era: "Love Yourself",

    estilo: "EDM",
    canciones: 9,
    favorito: true,
    cancionesDestacadas: ["DNA","Best of Me","Serendipity","Go Go"],

    descripcion:"Marca el inicio de la era enfocándose en las emociones, la fascinación y el entusiasmo del primer amor con sonidos pop y EDM.",

    imagen:"https://http2.mlstatic.com/D_NQ_NP_967932-CBT86230040128_062025-O.webp"
  };


  let youNeverWalkAlone = {
    id: 9,
    nombre: "You Never Walk Alone",
    año: 2017,
    tipo: "Álbum especial",
    era: "Wings",

    estilo: "Balada",
    canciones: 18,
    favorito: true,
    cancionesDestacadas: ["Spring Day","Not Today","A Supplementary Story","Outro: Wings",],

    descripcion:"Continuación de Wings centrada en la empatía, el apoyo mutuo y la promesa de no dejar a nadie solo durante los momentos más difíciles de la juventud.",

    imagen:"https://i.scdn.co/image/ab67616d0000b2731fd0a8fc28b2a0a5d9cdc6c6"
  };


  let skoolLuvAffair = {
    id: 10,
    nombre: "Skool Luv Affair",
    año: 2014,
    tipo: "Mini álbum",
    era: "School Trilogy",

    estilo: "Hip-hop",
    canciones: 10,
    favorito: false,
    cancionesDestacadas: ["Boy In Luv","Just One Day","Spine Breaker", "Tomorrow"],

    descripcion:"Cierra la trilogía escolar explorando el amor adolescente y las presiones sociales desde la perspectiva de los jóvenes a través del hip-hop.",

    imagen:"https://i.scdn.co/image/ab67616d0000b273ab9433cc4b9cda9431be879a"
  };


  /*-----Array de álbumes----------------------------*/

  /* Reuni los 10 objetos en un solo array. Y se reutilizara este array para hacer 
  automáticamente todas las tarjetas de la galería.*/

  let albums = [
    arirang,
    proof,
    be,
    mots7,
    persona,
    answer,
    tear,
    her,
    youNeverWalkAlone,
    skoolLuvAffair
  ];


  /*-----Persistencia----------------------------*/

  /* Si gestion.html guardó cambios, se cargan aquí para que index.html y gestion.html usen los mismos datos. */

  const guardado = localStorage.getItem("albums");

  if (guardado) {
    albums = JSON.parse(guardado);
  }

  /* Álbumes guardados antes de que existieran los ids reciben uno aquí. */
  let idLibre = Math.max(0, ...albums.map(function(album) { return album.id || 0; })) + 1;

  albums.forEach(function(album) {
    if (!album.id) album.id = idLibre++;
  });

  /* Álbumes guardados antes de que existiera "estilo" lo toman del objeto original con el mismo id. */
  const originales = [arirang, proof, be, mots7, persona, answer, tear, her, youNeverWalkAlone, skoolLuvAffair];

  albums.forEach(function(album) {
    const original = originales.find(function(o) { return o.id === album.id; });
    if (!album.estilo && original) album.estilo = original.estilo;
  });


  /*-----Acceso de solo lectura----------------------------*/

  /* Solo sale de aquí una copia: quien la modifique no cambia los datos originales. */

  return function() {
    return JSON.parse(JSON.stringify(albums));
  };

})();
