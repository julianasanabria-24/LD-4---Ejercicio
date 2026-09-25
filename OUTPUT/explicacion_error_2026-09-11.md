# Explicación de error — 2026-09-11

## Archivo
`INPUT/objetos1/index.js`

## Tipo de error
`ReferenceError` (nombre/referencia no definida) — ocurre cuando el código intenta usar un
identificador (variable, función) que no existe en ningún alcance accesible en ese momento.

## Qué pasó exactamente
Renombraste varios objetos de personajes:

| Nombre viejo | Nombre nuevo |
|---|---|
| `batman` | `capitanamerica` |
| `superman` | `hulk` |
| `wonderWoman` | `scarletWitch` |
| `joker` | `blackPanter` |
| `harleyQuinn` | `gamora` |
| `thanos` | `starLord` |
| `loki` | `rocket` |

Pero el array al final del archivo se quedó así:

```js
let heroes = [
  heroe, ironman, batman, superman, wonderWoman, thor,
  blackWidow, deadpool, joker, harleyQuinn, thanos, loki,
];
```

`batman`, `superman`, `wonderWoman`, `joker`, `harleyQuinn`, `thanos` y `loki` ya no existen en
ningún lado del archivo — dejaron de ser esos nombres cuando renombraste los objetos. JavaScript
lee ese array de arriba a abajo, y en cuanto encuentra el primer nombre que no reconoce
(`batman`), lanza un `ReferenceError` y **detiene la ejecución de todo el script ahí mismo**.

Eso explica por qué "se borraron las tarjetas": el `forEach` que arma las cartas y las mete en
`#galeria` nunca llegó a ejecutarse, porque el error ocurrió antes, en la línea del array.

## Concepto clave
Renombrar una variable en JavaScript **no es un cambio global automático**: cada vez que escribes
un nombre en el código, es un identificador independiente. Si lo cambias en un lugar pero lo
dejas igual en otro, para JS son "dos cosas distintas" — una que existe y otra que nunca se
declaró. Por eso, al renombrar algo, hay que revisar (o buscar con Ctrl+F) todos los lugares
donde ese nombre se usa.

## Corrección aplicada
Se actualizó el array `heroes` para usar los nombres nuevos:

```js
let heroes = [
  heroe, ironman, capitanamerica, hulk, scarletWitch, thor,
  blackWidow, deadpool, blackPanter, gamora, starLord, rocket,
];
```

## Patrón detectado
Este es el **tercer** `ReferenceError` registrado en la bitácora (los dos anteriores fueron por
variables usadas sin declarar en el ejercicio de p5.js). Vale la pena repasar el concepto de
*scope y declaración de variables en JavaScript* — específicamente, que el nombre de una variable
tiene que coincidir exactamente en todo el código donde se usa.
