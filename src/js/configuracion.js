let configId = null;

async function cargarConfig() {
  const { data, error } = await db.from('configuracion').select('*').limit(1).single();
  if (error) { console.error(error); return; }
  if (!data) return;

  configId = data.id;

  document.getElementById('c-nombre').value       = data.parroquia_nombre || '';
  document.getElementById('c-parroco').value      = data.parroco_nombre || '';
  document.getElementById('c-municipio').value    = data.parroquia_municipio || '';
  document.getElementById('c-departamento').value = data.parroquia_departamento || '';

  const sidebar = document.getElementById('nombre-parroquia-sidebar');
  if (sidebar) sidebar.textContent = data.parroquia_nombre || 'Archivo Digital';
}

async function guardarConfig() {
  const alerta = document.getElementById('alerta');
  alerta.style.display = 'none';

  const datos = {
    parroquia_nombre:       document.getElementById('c-nombre').value.trim(),
    parroco_nombre:         document.getElementById('c-parroco').value.trim(),
    parroquia_municipio:    document.getElementById('c-municipio').value.trim(),
    parroquia_departamento: document.getElementById('c-departamento').value.trim(),
    updated_at:             new Date().toISOString(),
  };

  let error;
  if (configId) {
    ({ error } = await db.from('configuracion').update(datos).eq('id', configId));
  } else {
    ({ error } = await db.from('configuracion').insert([datos]));
  }

  if (error) {
    alerta.textContent = 'Error al guardar: ' + error.message;
    alerta.className = 'alert alert-error';
    alerta.style.display = 'flex';
    return;
  }

  if (typeof _config !== 'undefined') _config = null;

  alerta.textContent = 'Configuracion guardada correctamente.';
  alerta.className = 'alert alert-success';
  alerta.style.display = 'flex';
  setTimeout(() => alerta.style.display = 'none', 3000);

  const sidebar = document.getElementById('nombre-parroquia-sidebar');
  if (sidebar) sidebar.textContent = datos.parroquia_nombre || 'Archivo Digital';
}