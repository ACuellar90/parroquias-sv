let todosLosBautismos = [];

async function cargarBautismos() {
  const { data, error } = await db
    .from('bautismos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }
  todosLosBautismos = data || [];
  renderTabla(todosLosBautismos);
}

function renderTabla(registros) {
  const cont = document.getElementById('tabla-bautismos');
  if (!registros.length) {
    cont.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--texto-muted);font-size:14px;">No hay registros de bautismo aún.</p>';
    return;
  }
  cont.innerHTML = `<table>
    <thead><tr>
      <th>Nombre</th><th>Fecha bautismo</th><th>Libro</th><th>Folio</th><th>Partida</th><th>Ministro</th><th></th>
    </tr></thead>
    <tbody>
      ${registros.map(r => `<tr>
        <td><strong>${r.nombres} ${r.apellidos}</strong></td>
        <td>${r.fecha_bautismo ? new Date(r.fecha_bautismo + 'T12:00:00').toLocaleDateString('es-SV') : '—'}</td>
        <td>${r.libro || '—'}</td>
        <td>${r.folio || '—'}</td>
        <td>${r.partida || '—'}</td>
        <td>${r.ministro || '—'}</td>
        <td style="text-align:right;">
          <button onclick="imprimirConstancia(${JSON.stringify(r).replace(/"/g,'&quot;')})"
            style="padding:5px 12px;font-size:12px;background:transparent;border:1px solid var(--borde);border-radius:6px;cursor:pointer;color:var(--texto-muted);font-family:var(--font-body);">
            <i class="ti ti-printer"></i> Constancia
          </button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function buscar() {
  const q = document.getElementById('busqueda').value.toLowerCase();
  const filtrados = todosLosBautismos.filter(r =>
    (r.nombres + ' ' + r.apellidos).toLowerCase().includes(q)
  );
  renderTabla(filtrados);
}

function mostrarFormulario() {
  document.getElementById('vista-lista').style.display = 'none';
  document.getElementById('vista-formulario').style.display = 'block';
}

function mostrarLista() {
  document.getElementById('vista-formulario').style.display = 'none';
  document.getElementById('vista-lista').style.display = 'block';
}

function limpiar() {
  ['f-nombres','f-apellidos','f-fechnac','f-lugarnac','f-sexo','f-fechbaut',
   'f-libro','f-folio','f-partida','f-parroquia','f-lugar','f-ministro',
   'f-padre','f-madre','f-padrino','f-madrina','f-notas'].forEach(id => {
    document.getElementById(id).value = '';
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
    alerta.style.display = 'block';
    return;
  }

  const registro = {
    nombres,
    apellidos,
    fecha_nacimiento:  document.getElementById('f-fechnac').value || null,
    lugar_nacimiento:  document.getElementById('f-lugarnac').value.trim() || null,
    sexo:              document.getElementById('f-sexo').value || null,
    fecha_bautismo:    fechbaut,
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

  const { error } = await db.from('bautismos').insert([registro]);
  if (error) {
    alerta.textContent = 'Error al guardar: ' + error.message;
    alerta.className = 'alert alert-error';
    alerta.style.display = 'block';
    return;
  }

  alerta.textContent = 'Registro guardado correctamente.';
  alerta.className = 'alert alert-success';
  alerta.style.display = 'block';
  limpiar();
  await cargarBautismos();
  setTimeout(() => mostrarLista(), 1200);
}

function imprimirConstancia(r) {
  mostrarDialogoImpresion(r, 'bautismo');
}