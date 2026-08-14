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
    markFeatureIntroSeen();
    const picker = document.getElementById('brandPicker');
    const btn = document.getElementById('brandToggleBtn');
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

  // Lets an embedding page (compare.html) snapshot this page's state before
  // switching the iframe to a different layout variant, then replay it once
  // the new page has loaded — so switching layouts doesn't reset the form.
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
  window.getMockupState = getMockupState;
  window.applyMockupState = applyMockupState;

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

  // First-time walkthrough for "Configure by Card Brand", with a skip option
  // and a small "?" button (next to the edit panel's close icon) to replay
  // it later. Also stops the attention-grabbing NEW badge/button pulse once
  // the user has either taken the tour or found the button on their own.
  const TOUR_STEPS = [
    {
      target: '#brandToggleBtn',
      title: 'Configure by Card Brand',
      desc: 'Click this any time — it opens a dropdown of card brands directly, no separate popup panel.',
    },
    {
      target: '#boundBrandsWrap',
      title: 'Bound right into the form',
      desc: 'Pick a brand and it lands here with its own checkboxes, fully independent from the main toggles above. Each one has its own ✕ to remove it and fall back to following main.',
    },
  ];
  let tourStep = 0;
  let tourDom = null;

  function markFeatureIntroSeen(){
    try { localStorage.setItem('cardBrandTourSeen', '1'); } catch(e) {}
    document.querySelectorAll('.new-badge, #brandToggleBtn').forEach(el => el.classList.remove('pulse'));
  }

  function buildTourDom(){
    const backdrop = document.createElement('div');
    backdrop.className = 'tour-backdrop';
    const spotlight = document.createElement('div');
    spotlight.className = 'tour-spotlight';
    const tooltip = document.createElement('div');
    tooltip.className = 'tour-tooltip';
    backdrop.appendChild(spotlight);
    backdrop.appendChild(tooltip);
    document.body.appendChild(backdrop);
    return { backdrop, spotlight, tooltip };
  }

  function renderTourStep(){
    const step = TOUR_STEPS[tourStep];
    const targetEl = document.querySelector(step.target);
    if(!targetEl){ endTour(); return; }
    const rect = targetEl.getBoundingClientRect();
    const pad = 8;
    Object.assign(tourDom.spotlight.style, {
      top: (rect.top - pad) + 'px',
      left: (rect.left - pad) + 'px',
      width: (rect.width + pad * 2) + 'px',
      height: (rect.height + pad * 2) + 'px',
    });
    tourDom.tooltip.innerHTML = `
      <div class="tour-tooltip-title">${step.title}</div>
      <div class="tour-tooltip-desc">${step.desc}</div>
      <div class="tour-tooltip-actions">
        <span class="tour-dots">${TOUR_STEPS.map((_, i) => `<span class="tour-dot ${i === tourStep ? 'active' : ''}"></span>`).join('')}</span>
        <span style="display:flex;gap:8px;">
          <button type="button" class="tour-skip" onclick="endTour()">Skip</button>
          <button type="button" class="tour-next" onclick="tourNext()">${tourStep === TOUR_STEPS.length - 1 ? 'Got it' : 'Next'}</button>
        </span>
      </div>
    `;
    tourDom.tooltip.style.left = '16px';
    tourDom.tooltip.style.top = (rect.bottom + pad + 12) + 'px';
    requestAnimationFrame(() => {
      const tw = tourDom.tooltip.offsetWidth;
      const th = tourDom.tooltip.offsetHeight;
      let left = Math.min(Math.max(16, rect.left), window.innerWidth - tw - 16);
      let top = rect.bottom + pad + 12;
      if(top + th > window.innerHeight - 16){
        top = Math.max(16, rect.top - th - pad - 12);
      }
      tourDom.tooltip.style.left = left + 'px';
      tourDom.tooltip.style.top = top + 'px';
    });
  }

  function startTour(){
    if(tourDom) return;
    tourStep = 0;
    tourDom = buildTourDom();
    renderTourStep();
  }
  function tourNext(){
    if(tourStep < TOUR_STEPS.length - 1){
      tourStep++;
      renderTourStep();
    } else {
      endTour();
    }
  }
  function endTour(){
    if(tourDom){ tourDom.backdrop.remove(); tourDom = null; }
    markFeatureIntroSeen();
  }
  window.startTour = startTour;

  (function(){
    let seen = false;
    try { seen = !!localStorage.getItem('cardBrandTourSeen'); } catch(e) {}
    if(!seen){
      document.querySelectorAll('.new-badge, #brandToggleBtn').forEach(el => el.classList.add('pulse'));
      setTimeout(startTour, 600);
    }
  })();
