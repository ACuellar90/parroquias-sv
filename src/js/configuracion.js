let configId = null;

async function cargarConfig() {
  const { data, error } = await db.from('configuracion').select('*').limit(1).single();
  if (error) { console.error(error); return; }
  if (!data) return;

  configId = data.id;

  document.getElementById('c-nombre').value      = data.parroquia_nombre || '';
  document.getElementById('c-parroco').value     = data.parroco_nombre || '';
  document.getElementById('c-direccion').value   = data.parroquia_direccion || '';
  document.getElementById('c-municipio').value   = data.parroquia_municipio || '';
  document.getElementById('c-departamento').value= data.parroquia_departamento || '';
  document.getElementById('c-telefono').value    = data.parroquia_telefono || '';
  document.getElementById('c-email').value       = data.parroquia_email || '';

  document.getElementById('c-plantilla-bautismo').value      = data.plantilla_bautismo || '';
  document.getElementById('c-plantilla-confirmacion').value  = data.plantilla_confirmacion || '';
  document.getElementById('c-plantilla-comunion').value      = data.plantilla_comunion || '';
  document.getElementById('c-plantilla-matrimonio').value    = data.plantilla_matrimonio || '';

  // Actualizar nombre en sidebar
  const sidebarNombre = document.getElementById('nombre-parroquia-sidebar');
  if (sidebarNombre) sidebarNombre.textContent = data.parroquia_nombre || 'Archivo Digital';
}

async function guardarConfig() {
  const alerta = document.getElementById('alerta');
  alerta.style.display = 'none';

  const datos = {
    parroquia_nombre:      document.getElementById('c-nombre').value.trim(),
    parroco_nombre:        document.getElementById('c-parroco').value.trim(),
    parroquia_direccion:   document.getElementById('c-direccion').value.trim(),
    parroquia_municipio:   document.getElementById('c-municipio').value.trim(),
    parroquia_departamento:document.getElementById('c-departamento').value.trim(),
    parroquia_telefono:    document.getElementById('c-telefono').value.trim(),
    parroquia_email:       document.getElementById('c-email').value.trim(),
    plantilla_bautismo:    document.getElementById('c-plantilla-bautismo').value,
    plantilla_confirmacion:document.getElementById('c-plantilla-confirmacion').value,
    plantilla_comunion:    document.getElementById('c-plantilla-comunion').value,
    plantilla_matrimonio:  document.getElementById('c-plantilla-matrimonio').value,
    updated_at:            new Date().toISOString(),
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

  alerta.textContent = 'Configuracion guardada correctamente.';
  alerta.className = 'alert alert-success';
  alerta.style.display = 'flex';
  setTimeout(() => alerta.style.display = 'none', 3000);
}

function verPreview(tipo) {
  const plantilla = document.getElementById('c-plantilla-' + tipo).value;
  const municipio = document.getElementById('c-municipio').value || 'San Juan Opico';
  const parroquia = document.getElementById('c-nombre').value || 'Parroquia';

  // Datos de ejemplo para la vista previa
  const ejemplos = {
    '{parroquia}':          parroquia,
    '{municipio}':          municipio,
    '{libro}':              '48',
    '{folio}':              '124',
    '{partida}':            '496',
    '{ministro}':           'Oscar Martel',
    '{nombre}':             'JUAN CARLOS MARTINEZ LOPEZ',
    '{fecha_nacimiento}':   'veintiún días del mes de noviembre del año mil novecientos noventa',
    '{fecha_bautismo}':     'diez días del mes de marzo del año mil novecientos noventa y uno',
    '{fecha_confirmacion}': 'quince días del mes de mayo del año dos mil diez',
    '{fecha_comunion}':     'veinte días del mes de abril del año dos mil cinco',
    '{fecha_matrimonio}':   'doce días del mes de febrero del año dos mil veinte',
    '{padre}':              'Carlos Martinez',
    '{madre}':              'Maria Lopez',
    '{padrino}':            ' Padrino: Jose Garcia.',
    '{madrina}':            ' Madrina: Ana Flores.',
    '{nombre_confirmacion}':', tomó el nombre de confirmación: Francisco.',
    '{hijo_hija}':          'hijo',
    '{esposo}':             'JUAN CARLOS MARTINEZ LOPEZ',
    '{esposa}':             'ANA MARIA GARCIA FLORES',
    '{testigo1}':           'Pedro Ramirez',
    '{testigo2}':           'Luis Hernandez',
    '{tipo_matrimonio}':    'canónico',
  };

  let texto = plantilla;
  Object.keys(ejemplos).forEach(v => {
    texto = texto.split(v).join(ejemplos[v]);
  });

  const titulos = {
    bautismo: 'FE DE BAUTISMO.',
    confirmacion: 'FE DE CONFIRMACION.',
    comunion: 'FE DE PRIMERA COMUNION.',
    matrimonio: 'FE DE MATRIMONIO.',
  };

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Vista previa</title>
  <style>
    @page { size: 216mm 356mm; margin: 10cm 3.5cm 2.5cm 2.5cm; }
    body { font-family:'Times New Roman',serif; font-size:12pt; color:#000; line-height:1.9; }
    .titulo { text-align:center; font-size:13pt; font-weight:bold; text-decoration:underline; margin-bottom:1.5rem; }
    .cuerpo { text-align:justify; white-space:pre-wrap; }
  </style></head><body>
  <div class="titulo">${titulos[tipo]}</div>
  <div class="cuerpo">${texto}</div>
  <script>window.onload=()=>{}<\/script>
  </body></html>`;

  const v = window.open('','_blank');
  v.document.write(html);
  v.document.close();
}