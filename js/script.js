const map = [
    { chk: 'chkAutoRefund',   col: 'autoRefund',   label: 'Automatic Refund' },
    { chk: 'chkManualRefund', col: 'manualRefund', label: 'Manual Refund' },
    { chk: 'chkAutoOct',      col: 'autoOct',       label: 'Automatic OCT / Payout' },
    { chk: 'chkManualOct',    col: 'manualOct',     label: 'Manual OCT / Payout' },
  ];

  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = '✓ ' + msg;
    t.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  const AVAILABLE_BRANDS = [
    { name: 'Visa',            initials: 'VISA', swatchClass: 'visa-swatch' },
    { name: 'Mastercard',      initials: '',     swatchClass: 'mc-swatch' },
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

  function swatchHtml(b){
    return b.swatchClass
      ? `<span class="brand-swatch ${b.swatchClass}" style="font-size:7px;">${b.initials}</span>`
      : `<span class="brand-swatch" style="background:${b.color};font-size:7px;">${b.initials}</span>`;
  }

  function addedBrandNames(){
    return Array.from(document.querySelectorAll('#boundBrands .bound-brand'))
      .map(el => el.dataset.brandName);
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
        ${swatchHtml(b)}
        ${b.name}
      </button>
    `).join('');
  }

  function toggleBrandPicker(e){
    e.stopPropagation();
    const btn = document.getElementById('brandToggleBtn');
    if(btn) btn.classList.remove('pulse');
    const picker = document.getElementById('brandPicker');
    const willOpen = !picker.classList.contains('open');
    picker.classList.toggle('open', willOpen);
    if(btn) btn.classList.toggle('active', willOpen);
    if(willOpen){
      const search = document.getElementById('brandSearch');
      search.value = '';
      renderBrandPicker('');
      search.focus();
    }
  }
  document.addEventListener('click', e => {
    const picker = document.getElementById('brandPicker');
    const btn = document.getElementById('brandToggleBtn');
    if(picker && !picker.contains(e.target) && !(btn && btn.contains(e.target))){
      picker.classList.remove('open');
      if(btn) btn.classList.remove('active');
    }
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') document.getElementById('brandPicker').classList.remove('open');
  });

  function pickBrand(name){
    const brand = AVAILABLE_BRANDS.find(b => b.name === name);
    document.getElementById('brandPicker').classList.remove('open');
    document.getElementById('brandToggleBtn').classList.remove('active');
    if(brand) addBoundBrand(brand);
  }

  let brandCounter = 0;

  // Adding a brand binds it straight into the general Refund Settings UI —
  // its own block of checkboxes, starting from whatever the main toggles
  // currently are, then fully independent and removable from there on.
  function addBoundBrand(brand){
    brandCounter++;
    const rowId = 'brand-' + brandCounter;
    const card = document.createElement('div');
    card.className = 'bound-brand';
    card.setAttribute('data-brand', rowId);
    card.dataset.brandName = brand.name;
    card.innerHTML = `
      <div class="bound-brand-head">
        <div class="brand-cell">${swatchHtml(brand)}${brand.name}</div>
        <button class="remove-brand" title="Remove ${brand.name}" onclick="askRemove('${rowId}','${brand.name.replace(/'/g,"")}')">✕</button>
      </div>
      <div class="checkrow">
        ${map.map(m => `
          <label class="checkline">
            <input type="checkbox" class="col-${m.col}" ${document.getElementById(m.chk).checked ? 'checked' : ''}>
            ${m.label}
          </label>
        `).join('')}
      </div>
    `;
    document.getElementById('boundBrands').appendChild(card);
    updateBoundBrandsEmptyState();
    showToast(brand.name + ' added — control its settings independently below');
  }

  function updateBoundBrandsEmptyState(){
    const empty = document.getElementById('boundBrandsEmpty');
    if(!empty) return;
    empty.style.display = document.querySelectorAll('#boundBrands .bound-brand').length ? 'none' : '';
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
      const card = document.querySelector(`.bound-brand[data-brand="${pendingRemove}"]`);
      if(card){
        const label = card.dataset.brandName;
        card.remove();
        updateBoundBrandsEmptyState();
        showToast(label + ' removed');
      }
    }
    closeConfirm();
  }

  function getMockupState(){
    return {
      mainToggles: Object.fromEntries(map.map(m => [m.chk, document.getElementById(m.chk).checked])),
      brands: Array.from(document.querySelectorAll('#boundBrands .bound-brand')).map(card => {
        const values = {};
        map.forEach(m => { values[m.col] = card.querySelector('.col-' + m.col).checked; });
        return { name: card.dataset.brandName, values };
      }),
    };
  }
  function applyMockupState(state){
    if(!state) return;
    Object.keys(state.mainToggles).forEach(chk => {
      const el = document.getElementById(chk);
      if(el) el.checked = state.mainToggles[chk];
    });
    document.getElementById('boundBrands').innerHTML = '';
    const tabsBar = document.getElementById('boundBrandsTabs');
    if(tabsBar) tabsBar.innerHTML = '';
    const realToast = showToast;
    showToast = function(){};
    state.brands.forEach(b => {
      const brand = AVAILABLE_BRANDS.find(x => x.name === b.name);
      if(!brand) return;
      addBoundBrand(brand);
      const card = document.querySelector('#boundBrands .bound-brand:last-child');
      map.forEach(m => {
        const cb = card.querySelector('.col-' + m.col);
        if(cb) cb.checked = b.values[m.col];
      });
    });
    showToast = realToast;
    updateBoundBrandsEmptyState();
  }
  window.applyMockupState = applyMockupState;

  // Saving hands the current state up to the embedding compare.html page (if
  // any) so it survives switching layout variants — but only what was
  // explicitly saved, and only for as long as compare.html itself isn't
  // reloaded (a real refresh always starts clean).
  function saveAccountForm(){
    showToast('Saved');
    try {
      if(window.parent && window.parent !== window && typeof window.parent.receiveMockupSave === 'function'){
        window.parent.receiveMockupSave(getMockupState());
      }
    } catch(e) { /* not embedded, or cross-origin — nothing to hand up */ }
  }
  window.saveAccountForm = saveAccountForm;

  // Draws the eye to the button on every page load, until it's clicked.
  document.getElementById('brandToggleBtn').classList.add('pulse');
