// =================================================================
// "MI CUENTA" SEGÚN QUIÉN ESTÉ CONECTADO (index.html y galeria.html)
// - Sin sesión o cliente → cliente.html (como siempre)
// - Administrador        → admin.html (el panel con el catálogo de productos)
// Necesita db (supabaseClient.js).
// =================================================================
async function ajustarEnlacesCuenta() {
  const { data } = await db.auth.getUser();
  if (!data.user) return;

  // admins_practica solo deja leer la fila propia: si vuelve algo, es admin
  const { data: admin } = await db
    .from('admins_practica')
    .select('nombre')
    .eq('id', data.user.id)
    .maybeSingle();
  if (!admin) return;

  document.querySelectorAll('.barra a[href="cliente.html"], .pie-enlaces a[href="cliente.html"]').forEach((enlace) => {
    enlace.href = 'admin.html';
    enlace.setAttribute('aria-label', 'Ir a mi panel de administración');
    const texto = enlace.querySelector('.texto-boton');
    if (texto) texto.textContent = 'Mi panel';
    else if (enlace.closest('.pie-enlaces')) enlace.textContent = 'Panel de administración';
  });
}
ajustarEnlacesCuenta();
