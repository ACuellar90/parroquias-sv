// ============================================================
// CONSTANCIAS — Formato oficial parroquial
// ============================================================

let _config = null;

async function cargarConfiguracion() {
  const { data } = await db.from('configuracion').select('*').limit(1).single();
  _config = data || {};
  return _config;
}

function numeroALetras(n) {
  if (!n || isNaN(n)) return '___';
  n = parseInt(n);
  const unidades = ['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
    'diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve'];
  const decenas = ['','diez','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
  const centenas = ['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];

  if (n === 0) return 'cero';
  if (n === 100) return 'cien';
  if (n === 1000) return 'mil';

  let resultado = '';
  if (n >= 1000000) {
    const millones = Math.floor(n / 1000000);
    resultado += (millones === 1 ? 'un millón' : numeroALetras(millones) + ' millones') + ' ';
    n %= 1000000;
  }
  if (n >= 1000) {
    const miles = Math.floor(n / 1000);
    resultado += (miles === 1 ? 'mil' : numeroALetras(miles) + ' mil') + ' ';
    n %= 1000;
  }
  if (n >= 100) {
    resultado += centenas[Math.floor(n / 100)] + ' ';
    n %= 100;
  }
  if (n >= 20) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    resultado += decenas[d] + (u ? ' y ' + unidades[u] : '') + ' ';
    n = 0;
  } else if (n > 0) {
    resultado += unidades[n] + ' ';
  }
  return resultado.trim();
}

function diaALetras(d) {
  const dias = ['','un','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
    'diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve',
    'veinte','veintiún','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis',
    'veintisiete','veintiocho','veintinueve','treinta','treinta y un'];
  return dias[parseInt(d)] || d;
}

function mesALetras(m) {
  const meses = ['','enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return meses[parseInt(m)];
}

function fechaALetras(fechaStr) {
  if (!fechaStr) return '_______________';
  const [anio, mes, dia] = fechaStr.split('-');
  return `${diaALetras(dia)} días del mes de ${mesALetras(mes)} del año ${numeroALetras(anio)}`;
}

function mostrarDialogoImpresion(r, tipo) {
  const prev = document.getElementById('dialogo-impresion');
  if (prev) prev.remove();

  const opciones = [
    'recibir el sacramento del matrimonio',
    'recibir el sacramento de la confirmacion',
    'recibir el sacramento de la primera comunion',
    'apadrinar un sacramento',
    'tramites migratorios',
    'tramites de estudio',
    'tramites de trabajo',
    'tramites civiles',
    'los efectos que se estimen convenientes',
    'ser padrino',
    'ser madrina',
    'Otros',
  ];

  const dialogo = document.createElement('div');
  dialogo.id = 'dialogo-impresion';
  dialogo.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.5);
    display:flex; align-items:center; justify-content:center; z-index:999;
  `;

  dialogo.innerHTML = `
    <div style="background:#fff; border-radius:10px; padding:2rem; width:500px; box-shadow:0 8px 32px rgba(0,0,0,0.2);">
      <h3 style="font-family:'Playfair Display',serif; font-size:18px; color:#0D1B3E; margin-bottom:1.25rem;">
        Datos para la constancia
      </h3>
      <div style="margin-bottom:1rem;">
        <label style="font-size:11.5px; font-weight:600; color:#5A6480; text-transform:uppercase; display:block; margin-bottom:4px;">
          Para efectos de
        </label>
        <select id="dialogo-efectos" style="width:100%; padding:8px 11px; border:1px solid #DDE1EA; border-radius:6px; font-size:14px; font-family:'DM Sans',sans-serif; outline:none;">
          ${opciones.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>
        <input type="text" id="dialogo-efectos-otro" placeholder="Especifica el motivo..."
          style="width:100%; padding:8px 11px; border:1px solid #DDE1EA; border-radius:6px; font-size:14px; font-family:'DM Sans',sans-serif; margin-top:8px; display:none; outline:none;">
      </div>
      <div style="margin-bottom:1.5rem;">
        <label style="font-size:11.5px; font-weight:600; color:#5A6480; text-transform:uppercase; display:block; margin-bottom:4px;">
          Anotaciones al margen <span style="font-weight:400; text-transform:none;">(opcional)</span>
        </label>
        <textarea id="dialogo-anotaciones" placeholder="Escribe las anotaciones si las hay..."
          style="width:100%; padding:8px 11px; border:1px solid #DDE1EA; border-radius:6px; font-size:14px; font-family:'DM Sans',sans-serif; resize:vertical; min-height:80px; outline:none;"></textarea>
      </div>
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button onclick="document.getElementById('dialogo-impresion').remove()"
          style="padding:9px 20px; background:#fff; border:1px solid #DDE1EA; border-radius:6px; font-size:14px; font-family:'DM Sans',sans-serif; cursor:pointer; color:#5A6480;">
          Cancelar
        </button>
        <button onclick="generarConstancia()"
          style="padding:9px 20px; background:#C9A84C; border:none; border-radius:6px; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; color:#0D1B3E;">
          Imprimir
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialogo);

  document.getElementById('dialogo-efectos').addEventListener('change', function() {
    document.getElementById('dialogo-efectos-otro').style.display = this.value === 'Otros' ? 'block' : 'none';
  });

  window._registroActual = r;
  window._tipoActual = tipo;
}

async function generarConstancia() {
  const r           = window._registroActual;
  const tipo        = window._tipoActual;
  const efectosEl   = document.getElementById('dialogo-efectos');
  const efectos     = efectosEl.value === 'Otros'
    ? document.getElementById('dialogo-efectos-otro').value.trim() || 'los efectos que se estimen convenientes'
    : efectosEl.value;
  const anotaciones = document.getElementById('dialogo-anotaciones').value.trim();

  document.getElementById('dialogo-impresion').remove();

  const config   = await cargarConfiguracion();
  const hoyObj   = new Date();
  const hoyTexto = `${diaALetras(hoyObj.getDate())} días del mes de ${mesALetras(hoyObj.getMonth()+1)} del año ${numeroALetras(hoyObj.getFullYear())}`;
  const municipio = config.parroquia_municipio || '___';
  const parroquia = config.parroquia_nombre    || '___';

  let titulo = '', intro = '', cuerpo = '', rubrica = '', margen = '';

  if (tipo === 'bautismo') {
    const nombre    = `${r.nombres} ${r.apellidos}`.toUpperCase();
    const filiacion = r.filiacion || 'H.L.';
    const hijoHija  = filiacion === 'H.L.'
      ? (r.sexo === 'Femenino' ? 'hija legítima' : 'hijo legítimo')
      : (r.sexo === 'Femenino' ? 'hija natural'  : 'hijo natural');

    titulo = 'FE DE BAUTISMO.';
    intro  = `El infrascrito Párroco de la Parroquia ${parroquia}, CERTIFICA QUE:\nEn el libro de bautismos N.º <strong>${r.libro||'__'}</strong>, folio <strong>${r.folio||'__'}</strong>, asiento <strong>${r.partida||'__'}</strong>, se encuentra la que literalmente dice:`;
    cuerpo = `En ${municipio} a ${fechaALetras(r.fecha_bautismo)}, el Padre: ${r.ministro||'___'}, bautizó solemnemente a: <strong>${nombre}</strong> que nació el día ${fechaALetras(r.fecha_nacimiento)}, ${hijoHija} de: ${r.padre_nombre||'___'} y de ${r.madre_nombre||'___'}.${r.padrino_nombre||r.madrina_nombre ? ' Padrinos: '+(r.padrino_nombre||'')+(r.padrino_nombre&&r.madrina_nombre?', ':' ')+(r.madrina_nombre||'')+'.':''}`;
    rubrica = `Rúbrica, ${r.ministro||'___'}.`;
    margen  = `Al margen se lee N.º <strong>${r.partida||'__'}</strong>, <strong>${nombre}</strong> ${filiacion}.`;

  } else if (tipo === 'confirmacion') {
    const nombre     = `${r.nombres} ${r.apellidos}`.toUpperCase();
    const anioInicio = r.anio_inicio ? numeroALetras(r.anio_inicio) : '___';
    const anioFin    = r.anio_fin    ? numeroALetras(r.anio_fin)    : '___';
    const hijaHijo   = r.sexo === 'Femenino' ? 'hija' : 'hijo';
    const bautizadaO = r.sexo === 'Femenino' ? 'Bautizada' : 'Bautizado';

    titulo = 'ACTA DE CONFIRMACIÓN';
    intro  = `El infrascrito Párroco de la parroquia ${parroquia}, CERTIFICA QUE:\n\nEn el libro de expedientes de confirmaciones realizadas en el año ${anioInicio} al año ${anioFin}, folio <strong>${r.folio||'__'}</strong>, se encuentra la que literalmente dice:`;
    cuerpo = `En la Parroquia ${parroquia}, el día ${fechaALetras(r.fecha_confirmacion)}, previa preparación catequética y doctrinal, se administró solemnemente el SACRAMENTO DE LA CONFIRMACIÓN a: <strong>${nombre}</strong>, ${hijaHijo} de: ${r.padre_nombre||'___'} y de ${r.madre_nombre||'___'}.${r.padrino_nombre||r.madrina_nombre?' Padrinos: '+(r.padrino_nombre||'')+(r.padrino_nombre&&r.madrina_nombre?', ' :'')+(r.madrina_nombre||'')+'.':''} ${bautizadaO} en la parroquia ${r.lugar_bautismo||parroquia}.\n\nMinistro Confirmante: ${r.ministro||'___'}.`;
    rubrica = '';
    margen  = '';

  } else if (tipo === 'comunion') {
    const nombre     = `${r.nombres} ${r.apellidos}`.toUpperCase();
    const anioInicio = r.anio_inicio ? numeroALetras(r.anio_inicio) : '___';
    const anioFin    = r.anio_fin    ? numeroALetras(r.anio_fin)    : '___';
    const hijaHijo   = r.sexo === 'Femenino' ? 'hija' : 'hijo';

    titulo = 'CONSTANCIA DE PRIMERA COMUNION';
    intro  = `El infrascrito Párroco de la parroquia ${parroquia}, CERTIFICA QUE:\n\nEn el libro de expedientes de primeras comuniones realizadas en el año ${anioInicio} al año ${anioFin}, folio <strong>${r.folio||'__'}</strong>, se encuentra la que literalmente dice:`;
    cuerpo = `En la Parroquia ${parroquia}, el día ${fechaALetras(r.fecha_comunion)}, previa preparación catequética y doctrinal, se administró solemnemente el SACRAMENTO DE LA PRIMERA COMUNION a: <strong>${nombre}</strong>, ${hijaHijo} de: ${r.padre_nombre||'___'} y de ${r.madre_nombre||'___'}.`;
    rubrica = '';
    margen  = '';

  } else if (tipo === 'matrimonio') {
    const anioInicio  = r.anio_inicio ? numeroALetras(r.anio_inicio) : '___';
    const anioFin     = r.anio_fin    ? numeroALetras(r.anio_fin)    : '___';
    const esposo      = `${r.esposo_nombres} ${r.esposo_apellidos}`.toUpperCase();
    const esposa      = `${r.esposa_nombres} ${r.esposa_apellidos}`.toUpperCase();

    titulo = 'ACTA DE MATRIMONIO';
    intro  = `El infrascrito Párroco de la parroquia ${parroquia}, CERTIFICA QUE:\n\nEn el libro de expedientes matrimoniales realizados en el año ${anioInicio} al año ${anioFin}. Expediente: <strong>${r.expediente||r.partida||'__'}</strong>, se encuentra la que literalmente dice:`;
    cuerpo = `En la parroquia ${parroquia}, el día ${fechaALetras(r.fecha_matrimonio)}. Previo los trámites de Derecho civil y canónico el Sr. <strong>${esposo}</strong>${r.edad_esposo?', de '+r.edad_esposo+' años de edad':''}. Hijo de: ${r.padre_esposo||'___'} y de ${r.madre_esposo||'___'}. Contrajo matrimonio eclesiástico con: <strong>${esposa}</strong>${r.edad_esposa?', de '+r.edad_esposa+' años de edad':''}, hija de: ${r.padre_esposa||'___'} y de ${r.madre_esposa||'___'}.${r.padrinos?' Fueron padrinos: '+r.padrinos+'.':''}`;
    rubrica = '';
    margen  = '';
  }

  const anotacionesHtml = anotaciones ? `<p style="margin-top:0.75rem; font-style:italic;">${anotaciones}</p>` : '';
  const cierre = `Es conforme a su original con la cual se confrontó y para los efectos de: ${efectos}, se extiende la presente en ${municipio}, a ${hoyTexto}.`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>.</title>
  <style>
    @page { size: 216mm 356mm; margin: 10cm 3.5cm 2.5cm 2.5cm; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; line-height:1.9; text-align:justify; }
    .titulo { text-align:center; font-size:13pt; font-weight:bold; text-decoration:underline; margin-bottom:1.5rem; }
    .intro { margin-bottom:1.5rem; white-space:pre-wrap; }
    .cuerpo { margin-bottom:1.5rem; }
    .rubrica { margin-top:1.5rem; margin-bottom:1.5rem; }
    .margen { margin-bottom:1.5rem; font-weight:bold; padding-left:2cm; }
    .cierre { }
  </style></head><body>
  <div class="titulo">${titulo}</div>
  <div class="intro">${intro}</div>
  <div class="cuerpo">${cuerpo}${anotacionesHtml}</div>
  ${rubrica ? `<div class="rubrica">${rubrica}</div>` : ''}
  ${margen  ? `<div class="margen">${margen}</div>`   : ''}
  <div class="cierre">${cierre}</div>
  </body></html>`;

  const prevFrame = document.getElementById('frame-impresion');
  if (prevFrame) prevFrame.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'frame-impresion';
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
}