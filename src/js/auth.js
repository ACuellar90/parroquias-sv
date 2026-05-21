// Verifica sesión activa — redirige al login si no hay sesión
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = '/index.html';
  }
  return session;
}

// Cierra sesión
async function logout() {
  await db.auth.signOut();
  window.location.href = '/index.html';
}

// Muestra el nombre del usuario en el header
async function mostrarUsuario() {
  const { data: { user } } = await db.auth.getUser();
  if (user) {
    const el = document.getElementById('usuario-nombre');
    if (el) el.textContent = user.email;
  }
}
