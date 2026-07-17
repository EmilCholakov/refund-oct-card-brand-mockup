const map = [
    { chk: 'chkAutoRefund',   col: 'autoRefund',   th: 'thAutoRefund',   label: 'Automatic Refund' },
    { chk: 'chkManualRefund', col: 'manualRefund', th: 'thManualRefund', label: 'Manual Refund' },
    { chk: 'chkAutoOct',      col: 'autoOct',       th: 'thAutoOct',      label: 'Automatic OCT / Payout' },
    { chk: 'chkManualOct',    col: 'manualOct',     th: 'thManualOct',    label: 'Manual OCT / Payout' },
  ];

  function syncColumns(){
    let lockedLabels = [];
    map.forEach(m => {
      const mainEnabled = document.getElementById(m.chk).checked;
      const cells = document.querySelectorAll('.col-' + m.col);
      const th = document.getElementById(m.th);
      cells.forEach(cb => {
        cb.disabled = !mainEnabled;
        if(!mainEnabled) cb.checked = false;
      });
      th.style.opacity = mainEnabled ? '1' : '.4';
      th.style.color = mainEnabled ? '' : '#c0392b';
      if(!mainEnabled) lockedLabels.push(m.label);
    });
    const lockedMsg = document.getElementById('lockedMsg');
    lockedMsg.textContent = lockedLabels.length
      ? '🔒 Locked: ' + lockedLabels.join(', ') + ' — enable on the main account configuration to allow per-brand control.'
      : '';
  }

  map.forEach(m => document.getElementById(m.chk).addEventListener('change', syncColumns));

  function openModal(){
    syncColumns();
    document.getElementById('overlay').classList.add('open');
  }
  function closeModal(){
    document.getElementById('overlay').classList.remove('open');
  }
  document.getElementById('overlay').addEventListener('click', e => {
    if(e.target.id === 'overlay') closeModal();
  });

  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = '✓ ' + msg;
    t.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function saveBrandConfig(){
    showToast('Card brand settings saved');
  }

  let brandCounter = 0;
  const brandSwatchColors = ['#0f6b3f','#8e2de2','#c2185b','#e67e22','#00796b','#5d4037'];

  function promptAddBrand(){
    const name = prompt('Card brand name (e.g. Amex, Discover, Maestro):');
    if(!name || !name.trim()) return;
    addBrandRow(name.trim());
  }

  function addBrandRow(name){
    brandCounter++;
    const color = brandSwatchColors[brandCounter % brandSwatchColors.length];
    const initials = name.trim().slice(0,4).toUpperCase();
    const rowId = 'brand-' + brandCounter;
    const tr = document.createElement('tr');
    tr.setAttribute('data-brand', rowId);
    tr.innerHTML = `
      <td><div class="brand-row-inner">
        <div class="brand-cell"><div class="brand-swatch" style="background:${color};font-size:7px;">${initials}</div>${name}</div>
        <button class="remove-brand" title="Remove ${name}" onclick="askRemove('${rowId}','${name.replace(/'/g,"")}')">✕</button>
      </div></td>
      <td><input type="checkbox" class="cb-check col-autoRefund" checked></td>
      <td><input type="checkbox" class="cb-check col-manualRefund" checked></td>
      <td><input type="checkbox" class="cb-check col-autoOct" checked></td>
      <td><input type="checkbox" class="cb-check col-manualOct" checked></td>
    `;
    document.getElementById('brandRows').appendChild(tr);
    // New brand defaults to whatever the master toggles currently allow
    syncColumns();
    showToast(name + ' added — defaults follow the main toggles');
  }

  let pendingRemove = null;
  function askRemove(rowId, name){
    pendingRemove = rowId;
    document.getElementById('confirmTitle').textContent = 'Remove ' + name + '?';
    document.getElementById('confirmText').textContent =
      'This removes the per-brand override for ' + name + '. It will go back to following the main toggles directly. This may affect live transactions for this brand — are you sure?';
    document.getElementById('confirmOverlay').classList.add('open');
  }
  function closeConfirm(){
    pendingRemove = null;
    document.getElementById('confirmOverlay').classList.remove('open');
  }
  function confirmRemove(){
    if(pendingRemove){
      const row = document.querySelector(`tr[data-brand="${pendingRemove}"]`);
      if(row){
        const label = row.querySelector('.brand-cell').textContent.trim();
        row.remove();
        showToast(label + ' removed');
      }
    }
    closeConfirm();
  }

  syncColumns();
