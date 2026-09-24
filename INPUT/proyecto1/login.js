/*-----Verificación de login----------------------------*/

/* Las credenciales se copian al cargar la página dentro de una IIFE. Así, si alguien cambia "usuario"
o "password" desde la consola después, la verificación sigue usando los valores originales. */

/* Se declara con const (no con function) para que nadie pueda reemplazarla desde la consola,
por ejemplo con verificarLogin = () => true. */

const verificarLogin = (function() {

  const usuarioValido = usuario;
  const passwordValido = password;

  return function(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado === usuarioValido && passwordIngresado === passwordValido;
  };

})();
