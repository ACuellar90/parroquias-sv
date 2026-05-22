let todasLasComuniones = [];
let editandoId = null;

async function cargarComuniones() {
  const { data, error } = await db.from('primeras_comuniones').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  todasLasComuniones = data || [];
  renderTabla(todasLasComuniones);
}

function renderTabla(registros) {
  const cont = document.getElementById('tabla-comuniones');
  if (!registros.length) {
    cont.innerHTML = '<div class="empty-state"><i class="ti ti-notes"></i><p>No hay registros de primera comunion aun.</p></div>';
    return;
  }
  cont.innerHTML = `<table>
    <thead><tr><th>#</th><th>Nombre completo</th><th>Fecha</th><th>Libro</th><th>Partida</th><th>Ministro</th><th></th></tr></thead>
    <tbody>
      ${registros.map((r,i) => `<tr>
        <td class="muted">${i+1}</td>
        <td><strong>${r.nombres} ${r.apellidos}</strong></td>
        <td>${r.fecha_comunion ? new Date(r.fecha_comunion+'T12:00:00').toLocaleDateString('es-SV') : '—'}</td>
        <td class="muted">${r.libro||'—'}</td>
        <td><span class="badge badge-comunion">${r.partida||'—'}</span></td>
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
  renderTabla(todasLasComuniones.filter(r => (r.nombres+' '+r.apellidos).toLowerCase().includes(q)));
}

function mostrarFormulario() {
  editandoId = null;
  limpiar();
  document.querySelector('#vista-formulario h2').textContent = 'Nuevo Registro de Primera Comunion';
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
  const r = todasLasComuniones.find(x => x.id === id);
  if (!r) return;
  editandoId = id;
  document.querySelector('#vista-formulario h2').textContent = 'Editar Registro de Primera Comunion';
  document.getElementById('vista-lista').style.display = 'none';
  document.getElementById('vista-formulario').style.display = 'block';
  document.getElementById('f-nombres').value   = r.nombres || '';
  document.getElementById('f-apellidos').value = r.apellidos || '';
  document.getElementById('f-fechnac').value   = r.fecha_nacimiento || '';
  document.getElementById('f-lugarnac').value  = r.lugar_nacimiento || '';
  document.getElementById('f-sexo').value      = r.sexo || '';
  document.getElementById('f-fechcom').value   = r.fecha_comunion || '';
  document.getElementById('f-libro').value     = r.libro || '';
  document.getElementById('f-folio').value     = r.folio || '';
  document.getElementById('f-partida').value   = r.partida || '';
  document.getElementById('f-parroquia').value = r.parroquia || '';
  document.getElementById('f-lugar').value     = r.municipio || '';
  document.getElementById('f-ministro').value  = r.ministro || '';
  document.getElementById('f-notas').value     = r.notas || '';
  irPaso(1);
}

function limpiar() {
  ['f-nombres','f-apellidos','f-fechnac','f-lugarnac','f-sexo','f-fechcom',
   'f-libro','f-folio','f-partida','f-parroquia','f-lugar','f-ministro','f-notas']
  .forEach(id => document.getElementById(id).value = '');
}

async function guardar() {
  const nombres   = document.getElementById('f-nombres').value.trim();
  const apellidos = document.getElementById('f-apellidos').value.trim();
  const fechcom   = document.getElementById('f-fechcom').value;
  const alerta    = document.getElementById('alerta');
  alerta.style.display = 'none';

  if (!nombres || !apellidos || !fechcom) {
    alerta.textContent = 'Nombres, apellidos y fecha de comunion son obligatorios.';
    alerta.className = 'alert alert-error';
    alerta.style.display = 'flex';
    return;
  }

  const registro = {
    nombres, apellidos,
    fecha_nacimiento: document.getElementById('f-fechnac').value || null,
    lugar_nacimiento: document.getElementById('f-lugarnac').value.trim() || null,
    sexo:             document.getElementById('f-sexo').value || null,
    fecha_comunion:   fechcom,
    libro:            document.getElementById('f-libro').value.trim() || null,
    folio:            document.getElementById('f-folio').value.trim() || null,
    partida:          document.getElementById('f-partida').value.trim() || null,
    parroquia:        document.getElementById('f-parroquia').value.trim() || null,
    municipio:        document.getElementById('f-lugar').value.trim() || null,
    ministro:         document.getElementById('f-ministro').value.trim() || null,
    notas:            document.getElementById('f-notas').value.trim() || null,
  };

  let error;
  if (editandoId) {
    ({ error } = await db.from('primeras_comuniones').update(registro).eq('id', editandoId));
  } else {
    ({ error } = await db.from('primeras_comuniones').insert([registro]));
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
  await cargarComuniones();
  setTimeout(() => mostrarLista(), 1200);
}

function imprimirConstancia(r) {
  mostrarDialogoImpresion(r, 'comunion');
}