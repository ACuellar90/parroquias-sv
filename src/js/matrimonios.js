let todosLosMatrimonios = [];
let editandoId = null;
const POR_PAGINA = 20;
let paginaActual = 1;
let totalRegistros = 0;

async function cargarMatrimonios() {
  const desde = (paginaActual - 1) * POR_PAGINA;
  const { count } = await db.from('matrimonios').select('*', { count: 'exact', head: true });
  totalRegistros = count || 0;
  const { data, error } = await db.from('matrimonios').select('*').order('created_at', { ascending: false }).range(desde, desde + POR_PAGINA - 1);
  if (error) { console.error(error); return; }
  todosLosMatrimonios = data || [];
  renderTabla(todosLosMatrimonios);
  renderPaginacion();
}

function renderTabla(registros) {
  const cont = document.getElementById('tabla-matrimonios');
  if (!registros.length) {
    cont.innerHTML = '<div class="empty-state"><i class="ti ti-notes"></i><p>No hay registros de matrimonio aun.</p></div>';
    return;
  }
  const desde = (paginaActual - 1) * POR_PAGINA;
  cont.innerHTML = `<table>
    <thead><tr><th>#</th><th>Esposo</th><th>Esposa</th><th>Fecha</th><th>Expediente</th><th>Ministro</th><th></th></tr></thead>
    <tbody>
      ${registros.map((r,i) => `<tr>
        <td class="muted">${desde+i+1}</td>
        <td><strong>${r.esposo_nombres} ${r.esposo_apellidos}</strong></td>
        <td><strong>${r.esposa_nombres} ${r.esposa_apellidos}</strong></td>
        <td>${r.fecha_matrimonio ? new Date(r.fecha_matrimonio+'T12:00:00').toLocaleDateString('es-SV') : '—'}</td>
        <td><span class="badge badge-matrimonio">${r.expediente||r.partida||'—'}</span></td>
        <td class="muted">${r.ministro||'—'}</td>
        <td style="display:flex; gap:6px; justify-content:flex-end;">
          <button onclick="editarRegistro('${r.id}')" class="btn-icon"><i class="ti ti-pencil"></i> Editar</button>
          <button onclick="eliminarRegistro('${r.id}', '${r.esposo_nombres} ${r.esposo_apellidos}')" class="btn-icon" style="color:#C0392B; border-color:#FECACA;"><i class="ti ti-trash"></i></button>
          <button onclick="imprimirConstancia(${JSON.stringify(r).replace(/"/g,'&quot;')})" class="btn-icon"><i class="ti ti-printer"></i> Constancia</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function renderPaginacion() {
  const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA);
  const cont = document.getElementById('paginacion-matrimonios');
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
  cargarMatrimonios();
}

async function buscar() {
  const q = document.getElementById('busqueda').value.trim().toLowerCase();
  if (!q) { paginaActual = 1; cargarMatrimonios(); return; }
  const { data } = await db.from('matrimonios').select('*')
    .or(`esposo_nombres.ilike.%${q}%,esposo_apellidos.ilike.%${q}%,esposa_nombres.ilike.%${q}%,esposa_apellidos.ilike.%${q}%`)
    .order('created_at', { ascending: false }).limit(50);
  todosLosMatrimonios = data || [];
  renderTabla(todosLosMatrimonios);
  document.getElementById('paginacion-matrimonios').innerHTML = '';
}

async function eliminarRegistro(id, nombre) {
  if (!confirm(`¿Seguro que deseas eliminar el registro de ${nombre}? Esta accion no se puede deshacer.`)) return;
  const { error } = await db.from('matrimonios').delete().eq('id', id);
  if (error) { alert('Error al eliminar: ' + error.message); return; }
  await cargarMatrimonios();
}

function mostrarFormulario() {
  editandoId = null;
  limpiar();
  document.querySelector('#vista-formulario h2').textContent = 'Nuevo Registro de Matrimonio';
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
  const r = todosLosMatrimonios.find(x => x.id === id);
  if (!r) return;
  editandoId = id;
  document.querySelector('#vista-formulario h2').textContent = 'Editar Registro de Matrimonio';
  document.getElementById('vista-lista').style.display = 'none';
  document.getElementById('vista-formulario').style.display = 'block';
  document.getElementById('f-espnombres').value    = r.esposo_nombres || '';
  document.getElementById('f-espapellidos').value  = r.esposo_apellidos || '';
  document.getElementById('f-espfechnac').value    = r.esposo_fecha_nacimiento || '';
  document.getElementById('f-esplugarnac').value   = r.esposo_lugar_nacimiento || '';
  document.getElementById('f-edad-esposo').value   = r.edad_esposo || '';
  document.getElementById('f-padre-esposo').value  = r.padre_esposo || '';
  document.getElementById('f-madre-esposo').value  = r.madre_esposo || '';
  document.getElementById('f-espanombres').value   = r.esposa_nombres || '';
  document.getElementById('f-espaapellidos').value = r.esposa_apellidos || '';
  document.getElementById('f-espafechnac').value   = r.esposa_fecha_nacimiento || '';
  document.getElementById('f-espalugarnac').value  = r.esposa_lugar_nacimiento || '';
  document.getElementById('f-edad-esposa').value   = r.edad_esposa || '';
  document.getElementById('f-padre-esposa').value  = r.padre_esposa || '';
  document.getElementById('f-madre-esposa').value  = r.madre_esposa || '';
  document.getElementById('f-padrinos').value      = r.padrinos || '';
  document.getElementById('f-fecha').value         = r.fecha_matrimonio || '';
  document.getElementById('f-expediente').value    = r.expediente || '';
  document.getElementById('f-anio-inicio').value   = r.anio_inicio || '';
  document.getElementById('f-anio-fin').value      = r.anio_fin || '';
  document.getElementById('f-parroquia').value     = r.parroquia || '';
  document.getElementById('f-lugar').value         = r.municipio || '';
  document.getElementById('f-ministro').value      = r.ministro || '';
  document.getElementById('f-notas').value         = r.notas || '';
  irPaso(1);
}

function limpiar() {
  ['f-espnombres','f-espapellidos','f-espfechnac','f-esplugarnac','f-edad-esposo','f-padre-esposo','f-madre-esposo',
   'f-espanombres','f-espaapellidos','f-espafechnac','f-espalugarnac','f-edad-esposa','f-padre-esposa','f-madre-esposa',
   'f-padrinos','f-fecha','f-expediente','f-anio-inicio','f-anio-fin','f-parroquia','f-lugar','f-ministro','f-notas']
  .forEach(id => document.getElementById(id).value = '');
}

async function guardar() {
  const espnombres    = document.getElementById('f-espnombres').value.trim();
  const espapellidos  = document.getElementById('f-espapellidos').value.trim();
  const espanombres   = document.getElementById('f-espanombres').value.trim();
  const espaapellidos = document.getElementById('f-espaapellidos').value.trim();
  const fecha         = document.getElementById('f-fecha').value;
  const alerta        = document.getElementById('alerta');
  alerta.style.display = 'none';

  if (!espnombres || !espapellidos || !espanombres || !espaapellidos || !fecha) {
    alerta.textContent = 'Los datos del esposo, esposa y fecha son obligatorios.';
    alerta.className = 'alert alert-error';
    alerta.style.display = 'flex';
    return;
  }

  const registro = {
    esposo_nombres:          espnombres,
    esposo_apellidos:        espapellidos,
    esposa_nombres:          espanombres,
    esposa_apellidos:        espaapellidos,
    esposo_fecha_nacimiento: document.getElementById('f-espfechnac').value || null,
    esposo_lugar_nacimiento: document.getElementById('f-esplugarnac').value.trim() || null,
    edad_esposo:             document.getElementById('f-edad-esposo').value.trim() || null,
    padre_esposo:            document.getElementById('f-padre-esposo').value.trim() || null,
    madre_esposo:            document.getElementById('f-madre-esposo').value.trim() || null,
    esposa_fecha_nacimiento: document.getElementById('f-espafechnac').value || null,
    esposa_lugar_nacimiento: document.getElementById('f-espalugarnac').value.trim() || null,
    edad_esposa:             document.getElementById('f-edad-esposa').value.trim() || null,
    padre_esposa:            document.getElementById('f-padre-esposa').value.trim() || null,
    madre_esposa:            document.getElementById('f-madre-esposa').value.trim() || null,
    padrinos:                document.getElementById('f-padrinos').value.trim() || null,
    fecha_matrimonio:        fecha,
    expediente:              document.getElementById('f-expediente').value.trim() || null,
    anio_inicio:             document.getElementById('f-anio-inicio').value.trim() || null,
    anio_fin:                document.getElementById('f-anio-fin').value.trim() || null,
    parroquia:               document.getElementById('f-parroquia').value.trim() || null,
    municipio:               document.getElementById('f-lugar').value.trim() || null,
    ministro:                document.getElementById('f-ministro').value.trim() || null,
    notas:                   document.getElementById('f-notas').value.trim() || null,
  };

  let error;
  if (editandoId) {
    ({ error } = await db.from('matrimonios').update(registro).eq('id', editandoId));
  } else {
    ({ error } = await db.from('matrimonios').insert([registro]));
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
  await cargarMatrimonios();
  setTimeout(() => mostrarLista(), 1200);
}

function imprimirConstancia(r) {
  mostrarDialogoImpresion(r, 'matrimonio');
}