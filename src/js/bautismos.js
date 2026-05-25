let todosLosBautismos = [];
let editandoId = null;
const POR_PAGINA = 20;
let paginaActual = 1;
let totalRegistros = 0;

async function cargarBautismos() {
  const desde = (paginaActual - 1) * POR_PAGINA;

  const { count } = await db
    .from('bautismos')
    .select('*', { count: 'exact', head: true });

  totalRegistros = count || 0;

  const { data, error } = await db
    .from('bautismos')
    .select('*')
    .order('created_at', { ascending: false })
    .range(desde, desde + POR_PAGINA - 1);

  if (error) { console.error(error); return; }
  todosLosBautismos = data || [];
  renderTabla(todosLosBautismos);
  renderPaginacion();
}

function renderTabla(registros) {
  const cont = document.getElementById('tabla-bautismos');
  if (!registros.length) {
    cont.innerHTML = '<div class="empty-state"><i class="ti ti-notes"></i><p>No hay registros de bautismo aun.</p></div>';
    return;
  }
  const desde = (paginaActual - 1) * POR_PAGINA;
  cont.innerHTML = `<table>
    <thead><tr>
      <th>#</th><th>Nombre completo</th><th>Fecha de bautismo</th>
      <th>Libro</th><th>Folio</th><th>Partida</th><th>Filiacion</th><th></th>
    </tr></thead>
    <tbody>
      ${registros.map((r,i) => `<tr>
        <td class="muted">${desde + i + 1}</td>
        <td><strong>${r.nombres} ${r.apellidos}</strong></td>
        <td>${r.fecha_bautismo ? new Date(r.fecha_bautismo+'T12:00:00').toLocaleDateString('es-SV') : '—'}</td>
        <td class="muted">${r.libro||'—'}</td>
        <td class="muted">${r.folio||'—'}</td>
        <td><span class="badge badge-bautismo">${r.partida||'—'}</span></td>
        <td class="muted">${r.filiacion||'H.L.'}</td>
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
  const cont = document.getElementById('paginacion-bautismos');
  if (!cont) return;
  if (totalPaginas <= 1) { cont.innerHTML = ''; return; }

  let html = `<div style="display:flex; align-items:center; gap:8px; justify-content:flex-end; margin-top:1rem; font-size:13px;">`;
  html += `<span style="color:var(--gray-400);">Mostrando ${((paginaActual-1)*POR_PAGINA)+1}–${Math.min(paginaActual*POR_PAGINA, totalRegistros)} de ${totalRegistros}</span>`;
  html += `<button onclick="cambiarPagina(${paginaActual-1})" ${paginaActual===1?'disabled':''} class="btn-icon"><i class="ti ti-chevron-left"></i></button>`;

  const totalPaginasN = Math.ceil(totalRegistros / POR_PAGINA);
  for (let i = 1; i <= totalPaginasN; i++) {
    if (i === 1 || i === totalPaginasN || (i >= paginaActual-2 && i <= paginaActual+2)) {
      html += `<button onclick="cambiarPagina(${i})" class="btn-icon" style="${i===paginaActual?'background:var(--navy);color:#fff;border-color:var(--navy);':''}">${i}</button>`;
    } else if (i === paginaActual-3 || i === paginaActual+3) {
      html += `<span style="color:var(--gray-400);">...</span>`;
    }
  }

  html += `<button onclick="cambiarPagina(${paginaActual+1})" ${paginaActual===totalPaginasN?'disabled':''} class="btn-icon"><i class="ti ti-chevron-right"></i></button>`;
  html += `</div>`;
  cont.innerHTML = html;
}

function cambiarPagina(n) {
  const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA);
  if (n < 1 || n > totalPaginas) return;
  paginaActual = n;
  cargarBautismos();
}

async function buscar() {
  const q = document.getElementById('busqueda').value.trim().toLowerCase();
  if (!q) { paginaActual = 1; cargarBautismos(); return; }

  const { data } = await db
    .from('bautismos')
    .select('*')
    .or(`nombres.ilike.%${q}%,apellidos.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  todosLosBautismos = data || [];
  renderTabla(todosLosBautismos);
  document.getElementById('paginacion-bautismos').innerHTML = '';
}

async function eliminarRegistro(id, nombre) {
  if (!confirm(`¿Seguro que deseas eliminar el registro de ${nombre}? Esta accion no se puede deshacer.`)) return;
  const { error } = await db.from('bautismos').delete().eq('id', id);
  if (error) { alert('Error al eliminar: ' + error.message); return; }
  await cargarBautismos();
}

function mostrarFormulario() {
  editandoId = null;
  limpiar();
  document.querySelector('#vista-formulario h2').textContent = 'Nuevo Registro de Bautismo';
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
  const r = todosLosBautismos.find(x => x.id === id);
  if (!r) return;
  editandoId = id;
  document.querySelector('#vista-formulario h2').textContent = 'Editar Registro de Bautismo';
  document.getElementById('vista-lista').style.display = 'none';
  document.getElementById('vista-formulario').style.display = 'block';
  document.getElementById('f-nombres').value    = r.nombres || '';
  document.getElementById('f-apellidos').value  = r.apellidos || '';
  document.getElementById('f-fechnac').value    = r.fecha_nacimiento || '';
  document.getElementById('f-lugarnac').value   = r.lugar_nacimiento || '';
  document.getElementById('f-sexo').value       = r.sexo || '';
  document.getElementById('f-fechbaut').value   = r.fecha_bautismo || '';
  document.getElementById('f-filiacion').value  = r.filiacion || 'H.L.';
  document.getElementById('f-libro').value      = r.libro || '';
  document.getElementById('f-folio').value      = r.folio || '';
  document.getElementById('f-partida').value    = r.partida || '';
  document.getElementById('f-parroquia').value  = r.parroquia || '';
  document.getElementById('f-lugar').value      = r.municipio || '';
  document.getElementById('f-ministro').value   = r.ministro || '';
  document.getElementById('f-padre').value      = r.padre_nombre || '';
  document.getElementById('f-madre').value      = r.madre_nombre || '';
  document.getElementById('f-padrino').value    = r.padrino_nombre || '';
  document.getElementById('f-madrina').value    = r.madrina_nombre || '';
  document.getElementById('f-notas').value      = r.notas || '';
  irPaso(1);
}

function limpiar() {
  ['f-nombres','f-apellidos','f-fechnac','f-lugarnac','f-sexo','f-fechbaut',
   'f-filiacion','f-libro','f-folio','f-partida','f-parroquia','f-lugar',
   'f-ministro','f-padre','f-madre','f-padrino','f-madrina','f-notas']
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'f-filiacion' ? 'H.L.' : '';
  });
}

async function guardar() {
  const nombres   = document.getElementById('f-nombres').value.trim();
  const apellidos = document.getElementById('f-apellidos').value.trim();
  const fechbaut  = document.getElementById('f-fechbaut').value;
  const alerta    = document.getElementById('alerta');

  alerta.style.display = 'none';
  if (!nombres || !apellidos || !fechbaut) {
    alerta.textContent = 'Nombres, apellidos y fecha de bautismo son obligatorios.';
    alerta.className = 'alert alert-error';
    alerta.style.display = 'flex';
    return;
  }

  const registro = {
    nombres,
    apellidos,
    fecha_nacimiento:  document.getElementById('f-fechnac').value || null,
    lugar_nacimiento:  document.getElementById('f-lugarnac').value.trim() || null,
    sexo:              document.getElementById('f-sexo').value || null,
    fecha_bautismo:    fechbaut,
    filiacion:         document.getElementById('f-filiacion').value,
    libro:             document.getElementById('f-libro').value.trim() || null,
    folio:             document.getElementById('f-folio').value.trim() || null,
    partida:           document.getElementById('f-partida').value.trim() || null,
    parroquia:         document.getElementById('f-parroquia').value.trim() || null,
    municipio:         document.getElementById('f-lugar').value.trim() || null,
    ministro:          document.getElementById('f-ministro').value.trim() || null,
    padre_nombre:      document.getElementById('f-padre').value.trim() || null,
    madre_nombre:      document.getElementById('f-madre').value.trim() || null,
    padrino_nombre:    document.getElementById('f-padrino').value.trim() || null,
    madrina_nombre:    document.getElementById('f-madrina').value.trim() || null,
    notas:             document.getElementById('f-notas').value.trim() || null,
  };

  let error;
  if (editandoId) {
    ({ error } = await db.from('bautismos').update(registro).eq('id', editandoId));
  } else {
    ({ error } = await db.from('bautismos').insert([registro]));
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
  await cargarBautismos();
  setTimeout(() => mostrarLista(), 1200);
}

function imprimirConstancia(r) {
  mostrarDialogoImpresion(r, 'bautismo');
}