# Explicación de errores — 2026-11-20

Sesión: botón para agregar admins, registro de admins con código de invitación y rediseño de Everwish (joyería de fantasía, 7 mundos × 10 joyas).

---

## 1. "No me sale el botón para crear otro admin" (contraseña olvidada)

**Tipo:** acceso, no es un error del código.

**Causa:** el botón vive dentro de `#panel-admin`, que `admin.js` solo muestra si hay sesión iniciada **y** existe tu fila en `admins_practica`. Sin la contraseña no hay sesión, así que la página se queda en el login.

**Solución:** cambiar la contraseña desde el SQL Editor (ahí trabajas como dueño de la base):

```sql
update auth.users
set encrypted_password = extensions.crypt('ClaveNueva123', extensions.gen_salt('bf'))
where email = 'correo@ejemplo.com';
```

**Concepto:**
- **Autenticación:** quién eres (correo y contraseña).
- **Autorización:** qué puedes hacer (tener fila en `admins_practica`).
- Ocultar el panel es solo lo visual. Lo que protege los datos son las políticas RLS.

Supabase guarda un *hash* bcrypt, no la contraseña. Por eso nadie puede "verla", solo reemplazarla.

---

## 2. `fatal: detected dubious ownership in repository`

**Tipo:** configuración de git en Windows.

**Causa:** la carpeta del repo pertenece a otro usuario de Windows. Git no trabaja en carpetas ajenas para que nadie pueda colarte configuración maliciosa.

**Solución sin cambiar nada global:**

```bash
git -c safe.directory=D:/Agente/LD-4---Ejercicio status
```

Permanente (solo si confías en la carpeta): `git config --global --add safe.directory D:/Agente/LD-4---Ejercicio`.

---

## 3. `UPDATE ... where nombre = '...'` afecta 0 filas y no da error

**Tipo:** lógica de datos.

**Causa:** el script cambiaba las categorías de los 9 productos de Everwish por su nombre. Pero la base todavía tenía los productos de práctica (tesla, televisor, camiseta, audífonos), porque `everwish_catalogo.sql` nunca se ejecutó. Un `UPDATE` cuyo `WHERE` no coincide con ninguna fila **no falla**: dice "0 rows" y sigue.

**Solución:** hacer el script autosuficiente. `sql/everwish_mundos.sql` inserta los 70 productos que falten y termina con una comprobación:

```sql
select categorias->>1 as mundo, count(*) as productos
from products_practice
group by 1 order by 1;
```

**Patrón que se repite:** es la **2.ª vez** que algo "no hace nada" sin dar error. La primera fue el `update` bloqueado por RLS que devolvía `[]` (2026-11-12). En los dos casos, revisa **cuántas filas** cambiaron (`data.length`, o el "rows affected" del SQL Editor), no solo si hubo error.
