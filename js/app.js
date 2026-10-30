/* PROJUKTI app shell — navigation, rendering, event delegation, timers & reminders */
(function () {
  const P = window.P;
  const NAV = [
    ['home', 'Command Center', 'home'], ['subjects', 'Subjects', 'book'], ['timer', 'Focus', 'timer'],
    ['planner', 'Planner', 'calendar'], ['learn', 'OLC Protocol', 'brain'], ['practice', 'Practice', 'cards'],
    ['wellbeing', 'Well-being', 'heart'], ['exams', 'Exams & Grades', 'target'], ['awards', 'Achievements', 'trophy'],
    ['resources', 'Resources', 'folder'], ['analytics', 'Analytics', 'chart'], ['settings', 'Settings', 'cog']
  ];
  const BOTTOM = ['home', 'subjects', 'timer', 'planner'];
  P.NAV = NAV;

  P.go = (v) => { P.S.ui.view = v; P.save(); P.render(true); window.scrollTo(0, 0); };

  let rendering = false;
  P.render = (reset) => {
    if (rendering) return;
    rendering = true;
    try { P._render(reset); } finally { rendering = false; }
  };
  P._render = (reset) => {
    const a = document.activeElement, mn = document.getElementById('main');
    if (a && a !== document.body && mn.contains(a) && a.blur) a.blur();
    const S = P.S, v = S.ui.view && P.views[S.ui.view] ? S.ui.view : 'home', y = window.scrollY;
    const view = P.views[v];
    document.getElementById('main').innerHTML = `<div class="view" data-view="${v}">${view.render()}</div>`;
    if (view.after) view.after();
    chrome(v);
    P.save();
    if (!reset) window.scrollTo(0, y);
  };

  function chrome(v) {
    const S = P.S, lv = P.level(), st = P.streak(), p = S.profile;
    const link = ([id, label, ic]) => `<button class="nav ${id === v ? 'on' : ''}" data-a="go" data-v="${id}" ${id === v ? 'aria-current="page"' : ''}>${P.icon(ic, 20)}<span>${label}</span></button>`;
    document.getElementById('side').innerHTML = `
      <div class="brand"><img src="assets/logo/logo-mark.svg" alt="" width="40" height="40"><div><b>PROJUKTI</b><small>Academic Mission 2026</small></div></div>
      <nav aria-label="Main">${NAV.map(link).join('')}</nav>
      <div class="side-foot glass">
        <div class="me"><img src="${P.avatar()}" alt="" width="38" height="38" class="photo-s"><div><b>${P.esc(p.name || 'Student')}</b><small>Level ${lv.lv} · ${P.icon('flame', 12)} ${st.cur}</small></div></div>
        ${P.bar(lv.pct)}<small class="muted">${lv.cur} / ${lv.need} XP</small>
        ${P.cloudChip ? P.cloudChip() : ''}
      </div>`;
    const more = !BOTTOM.includes(v);
    document.getElementById('bottom').innerHTML = BOTTOM.map(id => { const n = NAV.find(x => x[0] === id); return `<button class="bn ${id === v ? 'on' : ''}" data-a="go" data-v="${id}" aria-label="${n[1]}">${P.icon(n[2], 22)}<span>${n[1].split(' ')[0]}</span></button>`; }).join('') +
      `<button class="bn ${more ? 'on' : ''}" data-a="moreNav" aria-label="More">${P.icon('more', 22)}<span>More</span></button>`;
    document.title = (P.timerTitle ? P.timerTitle + ' · ' : '') + 'PROJUKTI';
  }

  P.act.go = d => P.go(d.v);
  P.act.moreNav = () => {
    const dlg = P.modal(`<div class="mform"><header><h3>Menu</h3><button class="icon-btn" data-close aria-label="Close">${P.icon('x')}</button></header><div class="moregrid">${NAV.filter(n => !BOTTOM.includes(n[0])).map(n => `<button class="nav" data-a="go" data-v="${n[0]}" data-close>${P.icon(n[2], 22)}<span>${n[1]}</span></button>`).join('')}</div></div>`, 'small');
    dlg.querySelectorAll('[data-a=go]').forEach(b => b.addEventListener('click', () => dlg.close()));
  };

  /* ---- event delegation ---- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-a]'); if (!t || t.disabled) return;
    const f = P.act[t.dataset.a]; if (f) { e.preventDefault(); f(t.dataset, t, e); }
  });
  document.addEventListener('change', e => {
    const t = e.target.closest('[data-c]'); if (!t) return;
    const f = P.chg[t.dataset.c]; if (f) f(t.type === 'checkbox' ? t.checked : t.value, t, t.dataset);
  });
  document.addEventListener('input', e => {
    const t = e.target.closest('[data-i]'); if (!t) return;
    const f = P.inp[t.dataset.i]; if (f) f(t.value, t, t.dataset);
  });
  /* drag & drop (planner) */
  document.addEventListener('dragstart', e => { const t = e.target.closest('[data-drag]'); if (t) { e.dataTransfer.setData('text/plain', t.dataset.drag); e.dataTransfer.effectAllowed = 'move'; t.classList.add('dragging'); } });
  document.addEventListener('dragend', e => { document.querySelectorAll('.dragging,.over').forEach(x => x.classList.remove('dragging', 'over')); });
  document.addEventListener('dragover', e => { const z = e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('over'); } });
  document.addEventListener('dragleave', e => { const z = e.target.closest('[data-drop]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
  document.addEventListener('drop', e => {
    const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault();
    const id = e.dataTransfer.getData('text/plain'), t = P.S.tasks.find(x => x.id === id);
    if (t && t.date !== z.dataset.drop) { t.date = z.dataset.drop; P.toast('Moved to ' + P.fmtDate(t.date)); P.render(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('[data-enter]')) { e.preventDefault(); const f = P.act[e.target.dataset.enter]; if (f) f(e.target.dataset, e.target, e); }
  });

  /* ---- ticks: timer, midnight rollover, reminders ---- */
  let lastDay = P.today();
  setInterval(() => {
    if (P.timerTick) P.timerTick();
  }, 250);
  setInterval(() => {
    const t = P.today();
    if (t !== lastDay) { lastDay = t; P.ensureRecurring(); P.render(); }
    const s = P.S.settings, d = new Date(), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (s.notify && s.reminder === hm && P.S.ui.lastRem !== t) {
      P.S.ui.lastRem = t; P.save();
      if (!P.minsOn(t)) P.notify('PROJUKTI', 'No study logged yet today — even 20 focused minutes counts.');
    }
  }, 20000);

  /* ---- onboarding ---- */
  function onboard() {
    P.form({
      title: 'Welcome to PROJUKTI', submit: 'Start my mission', wide: false,
      fields: [
        { k: 'name', label: 'Your name', req: true, ph: 'e.g. Rahim' },
        { k: 'school', label: 'School (optional)' },
        { k: 'final', label: 'Class 8 final exam date', type: 'date', half: true },
        { k: 'sch', label: 'Junior Scholarship exam date', type: 'date', half: true },
        { k: 'goal', label: 'Daily study goal (minutes)', type: 'number', min: 20, max: 360, def: 120, hint: 'Realistic is better than heroic. 90–180 focused minutes is a solid target.' }
      ],
      values: { name: P.S.profile.name },
      onSubmit: v => {
        const S = P.S; S.profile.name = v.name; S.profile.school = v.school; S.profile.onboarded = true;
        S.exams[0].date = v.final; S.exams[1].date = v.sch; S.settings.dailyGoal = v.goal || 120;
        P.save(); P.render(); P.toast('Welcome, ' + v.name + '! Add chapters under Subjects to begin.');
      }
    });
  }

  /* ---- boot ---- */
  P.load(); P.applyTheme(); P.ensureRecurring();
  document.getElementById('app').innerHTML = '<aside id="side" class="glass"></aside><main id="main" tabindex="-1"></main><nav id="bottom" class="glass" aria-label="Quick"></nav>';
  P.render(true);
  P.cloudBoot(() => { if (!P.S.profile.onboarded) setTimeout(onboard, 200); });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
