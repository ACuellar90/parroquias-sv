async function buscar() {
  const nombre  = document.getElementById('filtro-nombre').value.trim().toLowerCase();
  const apellido= document.getElementById('filtro-apellido').value.trim().toLowerCase();
  const partida = document.getElementById('filtro-partida').value.trim();

  const verBautismo     = document.getElementById('f-bautismo').checked;
  const verConfirmacion = document.getElementById('f-confirmacion').checked;
  const verComunion     = document.getElementById('f-comunion').checked;
  const verMatrimonio   = document.getElementById('f-matrimonio').checked;

  if (!nombre && !apellido && !partida) {
    mostrarMensaje('Ingresa al menos un criterio de busqueda.');
    return;
  }

  const wrap = document.getElementById('resultados-wrap');
  wrap.innerHTML = '<div class="card"><div class="loading"><i class="ti ti-loader ti-spin"></i> Buscando...</div></div>';

  let resultados = [];

  // Buscar en bautismos
  if (verBautismo) {
    let q = db.from('bautismos').select('*');
    if (nombre)  q = q.ilike('nombres', `%${nombre}%`);
    if (apellido)q = q.ilike('apellidos', `%${apellido}%`);
    if (partida) q = q.ilike('partida', `%${partida}%`);
    const { data } = await q;
    if (data) resultados.push(...data.map(r => ({ ...r, _tipo: 'bautismo' })));
  }

  // Buscar en confirmaciones
  if (verConfirmacion) {
    let q = db.from('confirmaciones').select('*');
    if (nombre)  q = q.ilike('nombres', `%${nombre}%`);
    if (apellido)q = q.ilike('apellidos', `%${apellido}%`);
    if (partida) q = q.ilike('partida', `%${partida}%`);
    const { data } = await q;
    if (data) resultados.push(...data.map(r => ({ ...r, _tipo: 'confirmacion' })));
  }

  // Buscar en primeras comuniones
  if (verComunion) {
    let q = db.from('primeras_comuniones').select('*');
    if (nombre)  q = q.ilike('nombres', `%${nombre}%`);
    if (apellido)q = q.ilike('apellidos', `%${apellido}%`);
    if (partida) q = q.ilike('partida', `%${partida}%`);
    const { data } = await q;
    if (data) resultados.push(...data.map(r => ({ ...r, _tipo: 'comunion' })));
  }

  // Buscar en matrimonios (por esposo o esposa)
  if (verMatrimonio) {
    let queries = [];
    if (nombre || apellido) {
      // Buscar como esposo
      let q1 = db.from('matrimonios').select('*');
      if (nombre)  q1 = q1.ilike('esposo_nombres', `%${nombre}%`);
      if (apellido)q1 = q1.ilike('esposo_apellidos', `%${apellido}%`);
      if (partida) q1 = q1.ilike('partida', `%${partida}%`);
      queries.push(q1);

      // Buscar como esposa
      let q2 = db.from('matrimonios').select('*');
      if (nombre)  q2 = q2.ilike('esposa_nombres', `%${nombre}%`);
      if (apellido)q2 = q2.ilike('esposa_apellidos', `%${apellido}%`);
      if (partida) q2 = q2.ilike('partida', `%${partida}%`);
      queries.push(q2);
    } else if (partida) {
      let q = db.from('matrimonios').select('*').ilike('partida', `%${partida}%`);
      queries.push(q);
    }

    for (const q of queries) {
      const { data } = await q;
      if (data) {
        data.forEach(r => {
          if (!resultados.find(x => x.id === r.id && x._tipo === 'matrimonio')) {
            resultados.push({ ...r, _tipo: 'matrimonio' });
          }
        });
      }
    }
  }

  renderResultados(resultados);
}

function renderResultados(resultados) {
  const wrap = document.getElementById('resultados-wrap');

  if (!resultados.length) {
    wrap.innerHTML = `<div class="card"><div class="empty-state"><i class="ti ti-mood-sad"></i><p>No se encontraron registros con esos criterios.</p></div></div>`;
    return;
  }

  const labels     = { bautismo:'Bautismo', confirmacion:'Confirmacion', comunion:'Primera Comunion', matrimonio:'Matrimonio' };
  const badgeClass = { bautismo:'badge-bautismo', confirmacion:'badge-confirmacion', comunion:'badge-comunion', matrimonio:'badge-matrimonio' };
  const iconos     = { bautismo:'ti-droplet', confirmacion:'ti-flame', comunion:'ti-bread', matrimonio:'ti-rings' };

  const getFecha = r => {
    const d = r.fecha_bautismo || r.fecha_confirmacion || r.fecha_comunion || r.fecha_matrimonio;
    return d ? new Date(d+'T12:00:00').toLocaleDateString('es-SV',{day:'2-digit',month:'long',year:'numeric'}) : '—';
  };

  const getNombre = r => r._tipo === 'matrimonio'
    ? `${r.esposo_nombres} ${r.esposo_apellidos} &amp; ${r.esposa_nombres} ${r.esposa_apellidos}`
    : `${r.nombres} ${r.apellidos}`;

  wrap.innerHTML = `
    <div style="font-size:13px; color:var(--gray-400); margin-bottom:0.75rem;">
      Se encontraron <strong style="color:var(--navy);">${resultados.length}</strong> registro(s)
    </div>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${resultados.map(r => `
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="width:42px; height:42px; background:var(--gray-100); border-radius:8px; display:flex; align-items:center; justify-content:center;">
              <i class="ti ${iconos[r._tipo]}" style="font-size:20px; color:var(--navy);"></i>
            </div>
            <div>
              <div style="font-size:15px; font-weight:600; color:var(--navy);">${getNombre(r)}</div>
              <div style="font-size:12px; color:var(--gray-400); margin-top:2px;">
                ${getFecha(r)} &nbsp;·&nbsp; Libro ${r.libro||'—'} &nbsp;·&nbsp; Folio ${r.folio||'—'} &nbsp;·&nbsp; Partida ${r.partida||'—'}
              </div>
              ${r.parroquia ? `<div style="font-size:12px; color:var(--gray-400);">${r.parroquia}</div>` : ''}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="badge ${badgeClass[r._tipo]}">${labels[r._tipo]}</span>
            <button class="btn-gold" style="padding:7px 14px; font-size:13px;" onclick='imprimirConstancia(${JSON.stringify(r).replace(/'/g,"&#39;")})'>
              <i class="ti ti-printer"></i> Imprimir constancia
            </button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function mostrarMensaje(msg) {
  document.getElementById('resultados-wrap').innerHTML = `<div class="card"><div class="empty-state"><i class="ti ti-alert-circle"></i><p>${msg}</p></div></div>`;
}

function imprimirConstancia(r) {
  mostrarDialogoImpresion(r, r._tipo);
}