let todosLosMatrimonios = [];
let editandoId = null;

async function cargarMatrimonios() {
  const { data, error } = await db.from('matrimonios').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  todosLosMatrimonios = data || [];
  renderTabla(todosLosMatrimonios);
}

function renderTabla(registros) {
  const cont = document.getElementById('tabla-matrimonios');
  if (!registros.length) {
    cont.innerHTML = '<div class="empty-state"><i class="ti ti-notes"></i><p>No hay registros de matrimonio aun.</p></div>';
    return;
  }
  cont.innerHTML = `<table>
    <thead><tr><th>#</th><th>Esposo</th><th>Esposa</th><th>Fecha</th><th>Libro</th><th>Partida</th><th>Ministro</th><th></th></tr></thead>
    <tbody>
      ${registros.map((r,i) => `<tr>
        <td class="muted">${i+1}</td>
        <td><strong>${r.esposo_nombres} ${r.esposo_apellidos}</strong></td>
        <td><strong>${r.esposa_nombres} ${r.esposa_apellidos}</strong></td>
        <td>${r.fecha_matrimonio ? new Date(r.fecha_matrimonio+'T12:00:00').toLocaleDateString('es-SV') : '—'}</td>
        <td class="muted">${r.libro||'—'}</td>
        <td><span class="badge badge-matrimonio">${r.partida||'—'}</span></td>
        <td class="muted">${r.ministro||'—'}</td>
        <td style="display:flex; gap:6px; justify-content:flex-end;">
          <button onclick="editarRegistro('${r.id}')" class="btn-icon"><i class="ti ti-pencil"></i> Editar</button>
          <button onclick="imprimirConstancia(${JSON.stringify(r).replace(/"/g,'&quot;')})" class="btn-icon"><i class="ti ti-printer"></i> Constancia</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function buscar() {
  const q = document.getElementById('busqueda').value.toLowerCase();
  renderTabla(todosLosMatrimonios.filter(r =>
    (r.esposo_nombres+' '+r.esposo_apellidos+' '+r.esposa_nombres+' '+r.esposa_apellidos).toLowerCase().includes(q)
  ));
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
  document.getElementById('f-espanombres').value   = r.esposa_nombres || '';
  document.getElementById('f-espaapellidos').value = r.esposa_apellidos || '';
  document.getElementById('f-espafechnac').value   = r.esposa_fecha_nacimiento || '';
  document.getElementById('f-espalugarnac').value  = r.esposa_lugar_nacimiento || '';
  document.getElementById('f-testigo1').value      = r.testigo1_nombre || '';
  document.getElementById('f-testigo2').value      = r.testigo2_nombre || '';
  document.getElementById('f-fecha').value         = r.fecha_matrimonio || '';
  document.getElementById('f-tipo').value          = r.tipo || 'canonico';
  document.getElementById('f-libro').value         = r.libro || '';
  document.getElementById('f-folio').value         = r.folio || '';
  document.getElementById('f-partida').value       = r.partida || '';
  document.getElementById('f-parroquia').value     = r.parroquia || '';
  document.getElementById('f-lugar').value         = r.municipio || '';
  document.getElementById('f-ministro').value      = r.ministro || '';
  document.getElementById('f-notas').value         = r.notas || '';
  irPaso(1);
}

function limpiar() {
  ['f-espnombres','f-espapellidos','f-espfechnac','f-esplugarnac',
   'f-espanombres','f-espaapellidos','f-espafechnac','f-espalugarnac',
   'f-testigo1','f-testigo2','f-fecha','f-libro','f-folio','f-partida',
   'f-parroquia','f-lugar','f-ministro','f-notas']
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
    esposa_fecha_nacimiento: document.getElementById('f-espafechnac').value || null,
    esposa_lugar_nacimiento: document.getElementById('f-espalugarnac').value.trim() || null,
    testigo1_nombre:         document.getElementById('f-testigo1').value.trim() || null,
    testigo2_nombre:         document.getElementById('f-testigo2').value.trim() || null,
    fecha_matrimonio:        fecha,
    tipo:                    document.getElementById('f-tipo').value,
    libro:                   document.getElementById('f-libro').value.trim() || null,
    folio:                   document.getElementById('f-folio').value.trim() || null,
    partida:                 document.getElementById('f-partida').value.trim() || null,
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