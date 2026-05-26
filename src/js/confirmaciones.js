let todasLasConfirmaciones = [];
let editandoId = null;
const POR_PAGINA = 20;
let paginaActual = 1;
let totalRegistros = 0;

async function cargarConfirmaciones() {
  const desde = (paginaActual - 1) * POR_PAGINA;
  const { count } = await db.from('confirmaciones').select('*', { count: 'exact', head: true });
  totalRegistros = count || 0;
  const { data, error } = await db.from('confirmaciones').select('*').order('created_at', { ascending: false }).range(desde, desde + POR_PAGINA - 1);
  if (error) { console.error(error); return; }
  todasLasConfirmaciones = data || [];
  renderTabla(todasLasConfirmaciones);
  renderPaginacion();
}

function renderTabla(registros) {
  const cont = document.getElementById('tabla-confirmaciones');
  if (!registros.length) {
    cont.innerHTML = '<div class="empty-state"><i class="ti ti-notes"></i><p>No hay registros de confirmacion aun.</p></div>';
    return;
  }
  const desde = (paginaActual - 1) * POR_PAGINA;
  cont.innerHTML = `<table>
    <thead><tr><th>#</th><th>Nombre completo</th><th>Nombre de confirmacion</th><th>Fecha</th><th>Folio</th><th>Ministro</th><th></th></tr></thead>
    <tbody>
      ${registros.map((r,i) => `<tr>
        <td class="muted">${desde+i+1}</td>
        <td><strong>${r.nombres} ${r.apellidos}</strong></td>
        <td>${r.nombre_confirmacion||'—'}</td>
        <td>${r.fecha_confirmacion ? new Date(r.fecha_confirmacion+'T12:00:00').toLocaleDateString('es-SV') : '—'}</td>
        <td class="muted">${r.folio||'—'}</td>
        <td class="muted">${r.ministro||'—'}</td>
        <td style="display:flex; gap:6px; justify-content:flex-end;">
          <button onclick="editarRegistro('${r.id}')" class="btn-icon"><i class="ti ti-pencil"></i> Editar</button>
          <button onclick="eliminarRegistro('${r.id}', '${r.nombres} ${r.apellidos}')" class="btn-icon" style="color:#C0392B; border-color:#FECACA;"><i class="ti ti-trash"></i></button>
          <button onclick="imprimirConstancia(${JSON.stringify(r).replace(/"/g,'&quot;')})" class="btn-icon"><i class="ti ti-printer"></i> Constancia</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function renderPaginacion() {
  const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA);
  const cont = document.getElementById('paginacion-confirmaciones');
  if (!cont) return;
  if (totalPaginas <= 1) { cont.innerHTML = ''; return; }
  let html = `<div style="display:flex; align-items:center; gap:8px; justify-content:flex-end; margin-top:1rem; font-size:13px;">`;
  html += `<span style="color:var(--gray-400);">Mostrando ${((paginaActual-1)*POR_PAGINA)+1}–${Math.min(paginaActual*POR_PAGINA, totalRegistros)} de ${totalRegistros}</span>`;
  html += `<button onclick="cambiarPagina(${paginaActual-1})" ${paginaActual===1?'disabled':''} class="btn-icon"><i class="ti ti-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPaginas; i++) {
    if (i===1||i===totalPaginas||(i>=paginaActual-2&&i<=paginaActual+2)) {
      html += `<button onclick="cambiarPagina(${i})" class="btn-icon" style="${i===paginaActual?'background:var(--navy);color:#fff;border-color:var(--navy);':''}">${i}</button>`;
    } else if (i===paginaActual-3||i===paginaActual+3) {
      html += `<span style="color:var(--gray-400);">...</span>`;
    }
  }
  html += `<button onclick="cambiarPagina(${paginaActual+1})" ${paginaActual===totalPaginas?'disabled':''} class="btn-icon"><i class="ti ti-chevron-right"></i></button></div>`;
  cont.innerHTML = html;
}

function cambiarPagina(n) {
  const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA);
  if (n < 1 || n > totalPaginas) return;
  paginaActual = n;
  cargarConfirmaciones();
}

async function buscar() {
  const q = document.getElementById('busqueda').value.trim().toLowerCase();
  if (!q) { paginaActual = 1; cargarConfirmaciones(); return; }
  const { data } = await db.from('confirmaciones').select('*').or(`nombres.ilike.%${q}%,apellidos.ilike.%${q}%`).order('created_at', { ascending: false }).limit(50);
  todasLasConfirmaciones = data || [];
  renderTabla(todasLasConfirmaciones);
  document.getElementById('paginacion-confirmaciones').innerHTML = '';
}

async function eliminarRegistro(id, nombre) {
  if (!confirm(`¿Seguro que deseas eliminar el registro de ${nombre}? Esta accion no se puede deshacer.`)) return;
  const { error } = await db.from('confirmaciones').delete().eq('id', id);
  if (error) { alert('Error al eliminar: ' + error.message); return; }
  await cargarConfirmaciones();
}

function mostrarFormulario() {
  editandoId = null;
  limpiar();
  document.querySelector('#vista-formulario h2').textContent = 'Nuevo Registro de Confirmacion';
  document.getElementById('vista-lista').style.display = 'none';
  document.getElementById('vista-formulario').style.display = 'block';
  irPaso(1);
}

function mostrarLista() {
  document.getElementById('vista-formulario').style.display = 'none';
  document.getElementById('vista-lista').style.display = 'block';
  editandoId = null;
}

function editarRegistro(id) {
  const r = todasLasConfirmaciones.find(x => x.id === id);
  if (!r) return;
  editandoId = id;
  document.querySelector('#vista-formulario h2').textContent = 'Editar Registro de Confirmacion';
  document.getElementById('vista-lista').style.display = 'none';
  document.getElementById('vista-formulario').style.display = 'block';
  document.getElementById('f-nombres').value        = r.nombres || '';
  document.getElementById('f-apellidos').value      = r.apellidos || '';
  document.getElementById('f-fechnac').value        = r.fecha_nacimiento || '';
  document.getElementById('f-lugarnac').value       = r.lugar_nacimiento || '';
  document.getElementById('f-sexo').value           = r.sexo || '';
  document.getElementById('f-fechconf').value       = r.fecha_confirmacion || '';
  document.getElementById('f-nombresanto').value    = r.nombre_confirmacion || '';
  document.getElementById('f-padre').value          = r.padre_nombre || '';
  document.getElementById('f-madre').value          = r.madre_nombre || '';
  document.getElementById('f-padrino').value        = r.padrino_nombre || '';
  document.getElementById('f-madrina').value        = r.madrina_nombre || '';
  document.getElementById('f-lugar-bautismo').value = r.lugar_bautismo || '';
  document.getElementById('f-ministro').value       = r.ministro || '';
  document.getElementById('f-anio-inicio').value    = r.anio_inicio || '';
  document.getElementById('f-anio-fin').value       = r.anio_fin || '';
  document.getElementById('f-folio').value          = r.folio || '';
  document.getElementById('f-notas').value          = r.notas || '';
  irPaso(1);
}

function limpiar() {
  ['f-nombres','f-apellidos','f-fechnac','f-lugarnac','f-sexo','f-fechconf','f-nombresanto',
   'f-padre','f-madre','f-padrino','f-madrina','f-lugar-bautismo','f-ministro',
   'f-anio-inicio','f-anio-fin','f-folio','f-notas']
  .forEach(id => document.getElementById(id).value = '');
}

async function guardar() {
  const nombres   = document.getElementById('f-nombres').value.trim();
  const apellidos = document.getElementById('f-apellidos').value.trim();
  const fechconf  = document.getElementById('f-fechconf').value;
  const alerta    = document.getElementById('alerta');
  alerta.style.display = 'none';

  if (!nombres || !apellidos || !fechconf) {
    alerta.textContent = 'Nombres, apellidos y fecha de confirmacion son obligatorios.';
    alerta.className = 'alert alert-error';
    alerta.style.display = 'flex';
    return;
  }

  const registro = {
    nombres, apellidos,
    fecha_nacimiento:    document.getElementById('f-fechnac').value || null,
    lugar_nacimiento:    document.getElementById('f-lugarnac').value.trim() || null,
    sexo:                document.getElementById('f-sexo').value || null,
    fecha_confirmacion:  fechconf,
    nombre_confirmacion: document.getElementById('f-nombresanto').value.trim() || null,
    padre_nombre:        document.getElementById('f-padre').value.trim() || null,
    madre_nombre:        document.getElementById('f-madre').value.trim() || null,
    padrino_nombre:      document.getElementById('f-padrino').value.trim() || null,
    madrina_nombre:      document.getElementById('f-madrina').value.trim() || null,
    lugar_bautismo:      document.getElementById('f-lugar-bautismo').value.trim() || null,
    ministro:            document.getElementById('f-ministro').value.trim() || null,
    anio_inicio:         document.getElementById('f-anio-inicio').value.trim() || null,
    anio_fin:            document.getElementById('f-anio-fin').value.trim() || null,
    folio:               document.getElementById('f-folio').value.trim() || null,
    notas:               document.getElementById('f-notas').value.trim() || null,
  };

  let error;
  if (editandoId) {
    ({ error } = await db.from('confirmaciones').update(registro).eq('id', editandoId));
  } else {
    ({ error } = await db.from('confirmaciones').insert([registro]));
  }

  if (error) {
    alerta.textContent = 'Error al guardar: ' + error.message;
    alerta.className = 'alert alert-error';
    alerta.style.display = 'flex';
    return;
  }

  alerta.textContent = editandoId ? 'Registro actualizado correctamente.' : 'Registro guardado correctamente.';
  alerta.className = 'alert alert-success';
  alerta.style.display = 'flex';
  limpiar();
  editandoId = null;
  await cargarConfirmaciones();
  setTimeout(() => mostrarLista(), 1200);
}

function imprimirConstancia(r) {
  mostrarDialogoImpresion(r, 'confirmacion');
}