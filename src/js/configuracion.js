let configId = null;

async function cargarConfig() {
  const { data, error } = await db.from('configuracion').select('*').limit(1).single();
  if (error) { console.error(error); return; }
  if (!data) return;

  configId = data.id;

  // Datos de la parroquia
  document.getElementById('c-nombre').value      = data.parroquia_nombre || '';
  document.getElementById('c-parroco').value     = data.parroco_nombre || '';
  document.getElementById('c-direccion').value   = data.parroquia_direccion || '';
  document.getElementById('c-municipio').value   = data.parroquia_municipio || '';
  document.getElementById('c-departamento').value= data.parroquia_departamento || '';
  document.getElementById('c-telefono').value    = data.parroquia_telefono || '';
  document.getElementById('c-email').value       = data.parroquia_email || '';

  // Bautismo
  document.getElementById('b-frase-inicio').value = data.b_frase_inicio || 'El infrascrito Párroco de';
  document.getElementById('b-frase-libro').value  = data.b_frase_libro  || 'En el libro de bautismos N.°';
  document.getElementById('b-verbo').value        = data.b_verbo        || 'bautizó solemnemente a';
  document.getElementById('b-frase-padres').value = data.b_frase_padres || 'hijo legítimo/a de';

  // Confirmacion
  document.getElementById('c2-frase-inicio').value = data.c2_frase_inicio || 'El infrascrito Párroco de';
  document.getElementById('c2-frase-libro').value  = data.c2_frase_libro  || 'En el libro de confirmaciones N.°';
  document.getElementById('c2-verbo').value        = data.c2_verbo        || 'confirmó a';

  // Comunion
  document.getElementById('co-frase-inicio').value = data.co_frase_inicio || 'El infrascrito Párroco de';
  document.getElementById('co-frase-libro').value  = data.co_frase_libro  || 'En el libro de primeras comuniones N.°';
  document.getElementById('co-verbo').value        = data.co_verbo        || 'administró por primera vez la Sagrada Eucaristía a';

  // Matrimonio
  document.getElementById('m-frase-inicio').value   = data.m_frase_inicio   || 'El infrascrito Párroco de';
  document.getElementById('m-frase-libro').value    = data.m_frase_libro    || 'En el libro de matrimonios N.°';
  document.getElementById('m-verbo').value          = data.m_verbo          || 'asistió al matrimonio';
  document.getElementById('m-frase-testigos').value = data.m_frase_testigos || 'Testigos';

  // Actualizar nombre en sidebar
  const sidebarNombre = document.getElementById('nombre-parroquia-sidebar');
  if (sidebarNombre) sidebarNombre.textContent = data.parroquia_nombre || 'Archivo Digital';
}

async function guardarConfig() {
  const alerta = document.getElementById('alerta');
  alerta.style.display = 'none';

  const datos = {
    parroquia_nombre:       document.getElementById('c-nombre').value.trim(),
    parroco_nombre:         document.getElementById('c-parroco').value.trim(),
    parroquia_direccion:    document.getElementById('c-direccion').value.trim(),
    parroquia_municipio:    document.getElementById('c-municipio').value.trim(),
    parroquia_departamento: document.getElementById('c-departamento').value.trim(),
    parroquia_telefono:     document.getElementById('c-telefono').value.trim(),
    parroquia_email:        document.getElementById('c-email').value.trim(),
    b_frase_inicio:  document.getElementById('b-frase-inicio').value.trim(),
    b_frase_libro:   document.getElementById('b-frase-libro').value.trim(),
    b_verbo:         document.getElementById('b-verbo').value.trim(),
    b_frase_padres:  document.getElementById('b-frase-padres').value.trim(),
    c2_frase_inicio: document.getElementById('c2-frase-inicio').value.trim(),
    c2_frase_libro:  document.getElementById('c2-frase-libro').value.trim(),
    c2_verbo:        document.getElementById('c2-verbo').value.trim(),
    co_frase_inicio: document.getElementById('co-frase-inicio').value.trim(),
    co_frase_libro:  document.getElementById('co-frase-libro').value.trim(),
    co_verbo:        document.getElementById('co-verbo').value.trim(),
    m_frase_inicio:   document.getElementById('m-frase-inicio').value.trim(),
    m_frase_libro:    document.getElementById('m-frase-libro').value.trim(),
    m_verbo:          document.getElementById('m-verbo').value.trim(),
    m_frase_testigos: document.getElementById('m-frase-testigos').value.trim(),
    updated_at: new Date().toISOString(),
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

  // Limpiar cache de configuracion en constancia.js
  if (typeof _config !== 'undefined') _config = null;

  alerta.textContent = 'Configuracion guardada correctamente.';
  alerta.className = 'alert alert-success';
  alerta.style.display = 'flex';
  setTimeout(() => alerta.style.display = 'none', 3000);
}

function verPreview(tipo) {
  // Jalar datos actuales del formulario para la preview
  const config = {
    parroquia_nombre:    document.getElementById('c-nombre').value || 'San Juan Evangelista',
    parroquia_municipio: document.getElementById('c-municipio').value || 'San Juan Opico',
    b_frase_inicio:  document.getElementById('b-frase-inicio').value,
    b_frase_libro:   document.getElementById('b-frase-libro').value,
    b_verbo:         document.getElementById('b-verbo').value,
    b_frase_padres:  document.getElementById('b-frase-padres').value,
    c2_frase_inicio: document.getElementById('c2-frase-inicio').value,
    c2_frase_libro:  document.getElementById('c2-frase-libro').value,
    c2_verbo:        document.getElementById('c2-verbo').value,
    co_frase_inicio: document.getElementById('co-frase-inicio').value,
    co_frase_libro:  document.getElementById('co-frase-libro').value,
    co_verbo:        document.getElementById('co-verbo').value,
    m_frase_inicio:   document.getElementById('m-frase-inicio').value,
    m_frase_libro:    document.getElementById('m-frase-libro').value,
    m_verbo:          document.getElementById('m-verbo').value,
    m_frase_testigos: document.getElementById('m-frase-testigos').value,
  };

  const lugar    = config.parroquia_municipio;
  const parroquia = config.parroquia_nombre;
  const titulos = {
    bautismo:     'FE DE BAUTISMO.',
    confirmacion: 'FE DE CONFIRMACION.',
    comunion:     'FE DE PRIMERA COMUNION.',
    matrimonio:   'FE DE MATRIMONIO.',
  };

  let intro = '', cuerpo = '';

  if (tipo === 'bautismo') {
    intro  = `${config.b_frase_inicio} ${parroquia}, CERTIFICA QUE:\n${config.b_frase_libro} 48, folio 124, asiento 496, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a diez días del mes de marzo del año mil novecientos noventa y uno, el Padre: Oscar Martel, ${config.b_verbo}: JUAN CARLOS MARTINEZ LOPEZ que nació el día veintiún días del mes de noviembre del año mil novecientos noventa, ${config.b_frase_padres}: Carlos Martinez y de Maria Lopez. Madrina: Ana Flores. Padrino: Jose Garcia.`;
  } else if (tipo === 'confirmacion') {
    intro  = `${config.c2_frase_inicio} ${parroquia}, CERTIFICA QUE:\n${config.c2_frase_libro} 12, folio 45, asiento 123, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a quince días del mes de mayo del año dos mil diez, el Ministro: Oscar Martel, ${config.c2_verbo}: JUAN CARLOS MARTINEZ LOPEZ que nació el día veintiún días del mes de noviembre del año mil novecientos noventa, tomó el nombre de confirmación: Francisco. Madrina: Ana Flores.`;
  } else if (tipo === 'comunion') {
    intro  = `${config.co_frase_inicio} ${parroquia}, CERTIFICA QUE:\n${config.co_frase_libro} 08, folio 32, asiento 201, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a veinte días del mes de abril del año dos mil cinco, el Padre: Oscar Martel, ${config.co_verbo}: JUAN CARLOS MARTINEZ LOPEZ que nació el día veintiún días del mes de noviembre del año mil novecientos noventa.`;
  } else if (tipo === 'matrimonio') {
    intro  = `${config.m_frase_inicio} ${parroquia}, CERTIFICA QUE:\n${config.m_frase_libro} 05, folio 18, asiento 089, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a doce días del mes de febrero del año dos mil veinte, el Padre: Oscar Martel, ${config.m_verbo} canónico de: JUAN CARLOS MARTINEZ LOPEZ, originario de ${lugar}, y ANA MARIA GARCIA FLORES, originaria de ${lugar}. ${config.m_frase_testigos}: Pedro Ramirez y Luis Hernandez.`;
  }

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Vista previa — ${titulos[tipo]}</title>
  <style>
    body { font-family:'Times New Roman',serif; padding:2cm; font-size:12pt; color:#000; line-height:1.9; }
    .aviso { background:#FFF3CD; border:1px solid #FFC107; border-radius:6px; padding:10px 14px; font-size:11pt; margin-bottom:1.5rem; font-family:Arial,sans-serif; }
    .titulo { text-align:center; font-size:13pt; font-weight:bold; text-decoration:underline; margin-bottom:1.5rem; }
    .intro { margin-bottom:1.5rem; text-align:justify; white-space:pre-wrap; }
    .cuerpo { text-align:justify; margin-bottom:1.5rem; }
    .rubrica { margin:1.5rem 0; }
    .margen { font-weight:bold; margin-bottom:1.5rem; }
    .cierre { text-align:justify; }
  </style></head><body>
  <div class="aviso">⚠️ Esta es una vista previa con datos de ejemplo. Asi quedara la constancia real con los datos del registro.</div>
  <div class="titulo">${titulos[tipo]}</div>
  <div class="intro">${intro}</div>
  <div class="cuerpo">${cuerpo}</div>
  <div class="rubrica">Rúbrica, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Oscar Martel.</div>
  <div class="margen">Al margen se lee N.° 496, JUAN CARLOS MARTINEZ LOPEZ H.L.</div>
  <div class="cierre">Es conforme a su original con la cual se confrontó, y para los efectos de Recibir el sacramento del matrimonio, se extiende la presente en ${lugar}, a veintiún días del mes de mayo del año dos mil veintiséis.</div>
  </body></html>`;

  const v = window.open('', '_blank');
  v.document.write(html);
  v.document.close();
}