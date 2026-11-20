(() => {
  const ar = document.documentElement.lang === 'ar';
  const toolbar = document.querySelector('.catalog-toolbar');
  const rows = [...document.querySelectorAll('.project-row')];
  const search = document.querySelector('#project-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let active = 'all';
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    rows.forEach(row => {
      const show = (active === 'all' || row.dataset.category === active) && row.textContent.toLocaleLowerCase().includes(query);
      row.hidden = !show;
      if (show) count++;
    });
    document.querySelector('.empty-state').hidden = count > 0;
    document.querySelector('.result-count').textContent = ar ? `${count} مشروع ظاهر` : `${count} projects shown`;
  }
  if (toolbar && search) {
    toolbar.hidden = false;
    filters.forEach(button => button.addEventListener('click', () => {
      active = button.dataset.filter;
      filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      filter();
    }));
    search.addEventListener('input', filter);
  }
  function openTarget() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    if (target.matches('.project-row') && toolbar) {
      active = 'all'; search.value = '';
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
      filter();
    }
    const details = target.querySelector('details');
    if (details) {
      details.open = true;
      requestAnimationFrame(() => target.scrollIntoView({behavior:'auto',block:'start'}));
    }
  }
  window.addEventListener('hashchange', openTarget);
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (link && link.hash === location.hash) setTimeout(openTarget, 0);
  });
  openTarget();
  const clock = document.getElementById('shenzhen-clock');
  function updateClock() {
    if (!clock) return;
    const now = new Date();
    clock.textContent = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
    clock.dateTime = now.toISOString();
  }
  updateClock();
  setInterval(updateClock, 60000);
})();
