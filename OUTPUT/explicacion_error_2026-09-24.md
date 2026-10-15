# Explicación de error — 2026-09-24

## Código original
```js
for (let i = 1; i <= 10; i++) {
  albums.pop({}
guardarAlbums();
```

## Error
`SyntaxError: missing ) after argument list` (or the console just waits for more input with `...`)

## Tipo de error: sintaxis
El navegador no puede ni siquiera *leer* el código, así que no ejecuta nada: cada `(` necesita su `)` y cada `{` necesita su `}`.

## Dónde está
- `albums.pop({}` → se abrió `(` y nunca se cerró.
- `for (...) {` → se abrió `{` y nunca se cerró.
- `pop` no recibe argumentos: siempre quita el **último** elemento. El `{}` sobra (no rompe, pero es un malentendido de cómo funciona `pop`).

## Concepto
- `push(obj)` **agrega** el objeto que le pases al final.
- `pop()` **quita** el último elemento y lo devuelve; no necesita que le digas cuál.

## Corrección
```js
for (let i = 1; i <= 10; i++) {
  albums.pop();
}
guardarAlbums();
```
