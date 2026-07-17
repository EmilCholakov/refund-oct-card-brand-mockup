const map = [
    { chk: 'chkAutoRefund',   col: 'autoRefund',   th: 'thAutoRefund',   label: 'Automatic Refund' },
    { chk: 'chkManualRefund', col: 'manualRefund', th: 'thManualRefund', label: 'Manual Refund' },
    { chk: 'chkAutoOct',      col: 'autoOct',       th: 'thAutoOct',      label: 'Automatic OCT / Payout' },
    { chk: 'chkManualOct',    col: 'manualOct',     th: 'thManualOct',    label: 'Manual OCT / Payout' },
  ];

  // Tracks the previous state of each master toggle so we can tell an
  // OFF -> ON transition apart from just re-rendering the modal.
  const prevMasterState = {};
  map.forEach(m => { prevMasterState[m.chk] = document.getElementById(m.chk).checked; });

  // Applies the current lock/grey state to every brand column, based on the
  // master toggles. Does NOT change checked values on its own (except forcing
  // false while locked) — safe to call any time the UI re-renders.
  function applyLockState(){
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

  // Fires only when a master toggle's checkbox actually changes. An OFF -> ON
  // transition resets that column to active (checked) for every brand, per
  // the spec: enabling the main toggle enables the card brand config by
  // default. Flipping it back OFF clears/locks the column as before.
  function handleMasterToggleChange(m){
    const nowEnabled = document.getElementById(m.chk).checked;
    if(nowEnabled && !prevMasterState[m.chk]){
      document.querySelectorAll('.col-' + m.col).forEach(cb => { cb.checked = true; });
    }
    prevMasterState[m.chk] = nowEnabled;
    applyLockState();
  }

  map.forEach(m => document.getElementById(m.chk).addEventListener('change', () => handleMasterToggleChange(m)));

  function openModal(){
    applyLockState();
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

  const AVAILABLE_BRANDS = [
    { name: 'Maestro',        initials: 'MAE',  color: '#0099df' },
    { name: 'American Express', initials: 'AMEX', color: '#2557a4' },
    { name: 'Discover',       initials: 'DISC', color: '#f68121' },
    { name: 'Diners Club',    initials: 'DINE', color: '#0079be' },
    { name: 'JCB',            initials: 'JCB',  color: '#0b7b3e' },
    { name: 'UnionPay',       initials: 'UP',   color: '#e21836' },
    { name: 'Amex Corporate', initials: 'AMEX', color: '#1b3f73' },
    { name: 'Aura',           initials: 'AURA', color: '#7b3fa0' },
    { name: 'Bancontact',     initials: 'BCMC', color: '#ffd200' },
    { name: 'Cartes Bancaires', initials: 'CB',  color: '#003d7c' },
    { name: 'Elo',            initials: 'ELO',  color: '#000000' },
    { name: 'Interac',        initials: 'INT',  color: '#f26522' },
    { name: 'Mir',            initials: 'MIR',  color: '#4bb44b' },
    { name: 'RuPay',          initials: 'RUP',  color: '#0f4c81' },
    { name: 'Sodexo',         initials: 'SDX',  color: '#e2001a' },
    { name: 'Troy',           initials: 'TROY', color: '#00a651' },
    { name: 'Verve',          initials: 'VRV',  color: '#003057' },
    { name: 'Visa Electron',  initials: 'VE',   color: '#1a1f71' },
  ];

  function addedBrandNames(){
    return Array.from(document.querySelectorAll('#brandRows tr'))
      .map(tr => tr.querySelector('.brand-cell').textContent.trim().replace(/\s*\(default\)\s*$/, ''));
  }

  function renderBrandPicker(query){
    query = (query || '').trim().toLowerCase();
    const list = document.getElementById('brandPickerList');
    const already = addedBrandNames();
    let remaining = AVAILABLE_BRANDS.filter(b => !already.includes(b.name));
    if(query){
      remaining = remaining.filter(b => b.name.toLowerCase().startsWith(query));
    }
    remaining.sort((a, b) => a.name.localeCompare(b.name));

    if(remaining.length === 0){
      list.innerHTML = `<div class="brand-picker-empty">${already.length >= AVAILABLE_BRANDS.length ? 'All available brands have been added.' : 'No card brand matches “' + query + '”.'}</div>`;
      return;
    }
    list.innerHTML = remaining.map(b => `
      <button type="button" class="brand-picker-item" onclick="pickBrand('${b.name}')">
        <span class="brand-swatch" style="background:${b.color};font-size:7px;">${b.initials}</span>
        ${b.name}
      </button>
    `).join('');
  }

  function toggleBrandPicker(e){
    e.stopPropagation();
    const picker = document.getElementById('brandPicker');
    const willOpen = !picker.classList.contains('open');
    picker.classList.toggle('open', willOpen);
    if(willOpen){
      const search = document.getElementById('brandSearch');
      search.value = '';
      renderBrandPicker('');
      search.focus();
    }
  }
  document.addEventListener('click', e => {
    const picker = document.getElementById('brandPicker');
    if(picker && !picker.contains(e.target) && !e.target.classList.contains('add-brand-btn')){
      picker.classList.remove('open');
    }
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') document.getElementById('brandPicker').classList.remove('open');
  });

  function pickBrand(name){
    const brand = AVAILABLE_BRANDS.find(b => b.name === name);
    document.getElementById('brandPicker').classList.remove('open');
    if(brand) addBrandRow(brand.name, brand.color, brand.initials);
  }

  let brandCounter = 0;

  function addBrandRow(name, color, initials){
    brandCounter++;
    const rowId = 'brand-' + brandCounter;
    const tr = document.createElement('tr');
    tr.setAttribute('data-brand', rowId);
    tr.className = 'brand-row-new';
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
    // New brand defaults to whatever the master toggles currently allow —
    // this is the same lock/inherit logic every other brand uses.
    applyLockState();
    showToast(name + ' added — inherited the current main toggle settings');
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

  applyLockState();