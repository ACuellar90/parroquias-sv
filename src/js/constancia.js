// ============================================================
// CONSTANCIAS — Formato oficial parroquial
// ============================================================

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
    'Recibir el sacramento del matrimonio',
    'Recibir el sacramento de la confirmacion',
    'Recibir el sacramento de la primera comunion',
    'Apadrinar un sacramento',
    'Tramites migratorios',
    'Tramites de estudio',
    'Tramites de trabajo',
    'Tramites civiles',
    'Para los efectos que se estimen convenientes',
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
          <i class="ti ti-printer"></i> Imprimir
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

function generarConstancia() {
  const r           = window._registroActual;
  const tipo        = window._tipoActual;
  const efectosEl   = document.getElementById('dialogo-efectos');
  const efectos     = efectosEl.value === 'Otros'
    ? document.getElementById('dialogo-efectos-otro').value.trim() || 'los efectos que se estimen convenientes'
    : efectosEl.value;
  const anotaciones = document.getElementById('dialogo-anotaciones').value.trim();

  document.getElementById('dialogo-impresion').remove();

  const hoyObj   = new Date();
  const hoyTexto = `${diaALetras(hoyObj.getDate())} días del mes de ${mesALetras(hoyObj.getMonth()+1)} del año ${numeroALetras(hoyObj.getFullYear())}`;
  const lugar    = r.municipio || r.parroquia || '___';

  let titulo = '';
  let intro  = '';
  let cuerpo = '';
  let nombre = '';
  let margen = '';

  if (tipo === 'bautismo') {
    titulo = 'FE DE BAUTISMO.';
    nombre = `${r.nombres} ${r.apellidos}`.toUpperCase();
    intro  = `El infrascrito Párroco de ${r.parroquia||'___'}, CERTIFICA QUE:<br>
      En el libro de bautismos N.° <strong>${r.libro||'__'}</strong>, folio <strong>${r.folio||'__'}</strong>, asiento <strong>${r.partida||'__'}</strong>, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a <u><strong>${fechaALetras(r.fecha_bautismo)}</strong></u>, el Padre: ${r.ministro||'___'}, bautizó solemnemente a: <strong>${nombre}</strong> que nació el día ${fechaALetras(r.fecha_nacimiento)}, ${r.sexo==='Femenino'?'hija':'hijo'} legítimo/a de: <em>${r.padre_nombre||'___'} y de ${r.madre_nombre||'___'}.</em>${r.madrina_nombre?' Madrina: '+r.madrina_nombre+'.':''}${r.padrino_nombre?' Padrino: '+r.padrino_nombre+'.':''}`;
    rubrica = `Rúbrica, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${r.ministro||'___'}.`;
    margen = `Al margen se lee N.° <strong>${r.partida||'__'}</strong>, <strong>${nombre}</strong> H.L.`;

  } else if (tipo === 'confirmacion') {
    titulo = 'FE DE CONFIRMACION.';
    nombre = `${r.nombres} ${r.apellidos}`.toUpperCase();
    intro  = `El infrascrito Párroco de ${r.parroquia||'___'}, CERTIFICA QUE:<br>
      En el libro de confirmaciones N.° <strong>${r.libro||'__'}</strong>, folio <strong>${r.folio||'__'}</strong>, asiento <strong>${r.partida||'__'}</strong>, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a <u><strong>${fechaALetras(r.fecha_confirmacion)}</strong></u>, el Ministro: ${r.ministro||'___'}, confirmó a: <strong>${nombre}</strong> que nació el día ${fechaALetras(r.fecha_nacimiento)}.${r.nombre_confirmacion?' Tomó el nombre de confirmación: <strong>'+r.nombre_confirmacion+'</strong>.':''}${r.madrina_nombre?' Madrina: '+r.madrina_nombre+'.':''}${r.padrino_nombre?' Padrino: '+r.padrino_nombre+'.':''}`;
    margen = `Al margen se lee N.° <strong>${r.partida||'__'}</strong>, <strong>${nombre}</strong> H.L.`;

  } else if (tipo === 'comunion') {
    titulo = 'FE DE PRIMERA COMUNION.';
    nombre = `${r.nombres} ${r.apellidos}`.toUpperCase();
    intro  = `El infrascrito Párroco de ${r.parroquia||'___'}, CERTIFICA QUE:<br>
      En el libro de primeras comuniones N.° <strong>${r.libro||'__'}</strong>, folio <strong>${r.folio||'__'}</strong>, asiento <strong>${r.partida||'__'}</strong>, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a <u><strong>${fechaALetras(r.fecha_comunion)}</strong></u>, el Padre: ${r.ministro||'___'}, administró por primera vez la Sagrada Eucaristía a: <strong>${nombre}</strong> que nació el día ${fechaALetras(r.fecha_nacimiento)}.`;
    margen = `Al margen se lee N.° <strong>${r.partida||'__'}</strong>, <strong>${nombre}</strong> H.L.`;

  } else if (tipo === 'matrimonio') {
    titulo = 'FE DE MATRIMONIO.';
    nombre = `${r.esposo_nombres} ${r.esposo_apellidos} y ${r.esposa_nombres} ${r.esposa_apellidos}`.toUpperCase();
    intro  = `El infrascrito Párroco de ${r.parroquia||'___'}, CERTIFICA QUE:<br>
      En el libro de matrimonios N.° <strong>${r.libro||'__'}</strong>, folio <strong>${r.folio||'__'}</strong>, asiento <strong>${r.partida||'__'}</strong>, se encuentra la partida que literalmente dice:`;
    cuerpo = `En ${lugar} a <u><strong>${fechaALetras(r.fecha_matrimonio)}</strong></u>, el Padre: ${r.ministro||'___'}, asistió al matrimonio ${r.tipo==='civil'?'canónico y civil':'canónico'} de: <strong>${r.esposo_nombres.toUpperCase()} ${r.esposo_apellidos.toUpperCase()}</strong>${r.esposo_lugar_nacimiento?', originario de '+r.esposo_lugar_nacimiento:''}, y <strong>${r.esposa_nombres.toUpperCase()} ${r.esposa_apellidos.toUpperCase()}</strong>${r.esposa_lugar_nacimiento?', originaria de '+r.esposa_lugar_nacimiento:''}. Testigos: ${r.testigo1_nombre||'___'} y ${r.testigo2_nombre||'___'}.`;
    margen = `Al margen se lee N.° <strong>${r.partida||'__'}</strong>, <strong>${nombre}</strong>.`;
  }

  const anotacionesHtml = anotaciones
    ? `<p style="margin-top:0.75rem;">${anotaciones}</p>` : '';

  const cierre = `Es conforme a su original con la cual se confrontó, y para los efectos de <u><strong>${efectos}</strong></u>, se extiende la presente en ${lugar}, a ${hoyTexto}.`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    @page { size: 216mm 356mm; margin: 7cm 2.5cm 2.5cm 2.5cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      color: #000;
      line-height: 1.9;
    }
    .titulo {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 1.5rem;
    }
    .intro { margin-bottom: 1.5rem; text-align: justify; }
    .cuerpo { text-align: justify; margin-bottom: 1.5rem; }
    .rubrica { margin-top: 1.5rem; margin-bottom: 1.5rem; }
    .margen { margin-top: 1.5rem; margin-bottom: 1.5rem; }
    .cierre { text-align: justify; margin-top: 0.5rem; }
  </style></head><body>

  <div class="titulo">${titulo}</div>
  <div class="intro">${intro}</div>
  <div class="cuerpo">${cuerpo}</div>
  <div class="rubrica">${rubrica}</div>
  <div class="margen">
    ${margen}
    ${anotacionesHtml}
  </div>
  <div class="cierre">${cierre}</div>

  <script>window.onload = () => { window.print(); }<\/script>
  </body></html>`;

  const v = window.open('', '_blank');
  v.document.write(html);
  v.document.close();
}