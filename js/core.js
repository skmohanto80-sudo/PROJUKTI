/* PROJUKTI core — state, persistence, XP, streaks, stats, UI helpers, charts */
(function () {
  const P = window.P;
  const KEY = 'projukti.v1';
  P.views = {}; P.act = {}; P.chg = {}; P.inp = {};

  /* ---------- helpers ---------- */
  P.uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  P.today = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  P.addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return P.today(d); };
  P.diff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  P.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  P.fmtDate = (s, o) => s ? new Date(s + 'T12:00:00').toLocaleDateString(undefined, o || { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
  P.fmtMin = m => { m = Math.round(m || 0); return m >= 60 ? Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '') : m + 'm'; };
  P.pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  P.avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  P.nl = s => P.esc(s).replace(/\n/g, '<br>');
  P.lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  P.COLORS = ['#22d3ee', '#8b5cf6', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#fb7185', '#a3e635', '#f97316', '#2dd4bf'];
  P.METHODS = ['Reading', 'Writing notes', 'Practice questions', 'Flashcards / recall', 'Revision', 'Problem solving', 'Memorisation', 'Mock test', 'Class / video'];
  P.MASTERY = ['New', 'Learning', 'Familiar', 'Strong', 'Mastered'];
  P.STAGES = [
    { n: 'Basics', d: 'Prerequisites, key terms and the simplest examples.' },
    { n: 'Clear explanation', d: 'Explain it in your own words — teach it aloud to an imaginary classmate.' },
    { n: 'Textbook / syllabus', d: 'Read every textbook section; mark definitions, formulas and examples.' },
    { n: 'School-level questions', d: 'Textbook exercises and class-test style questions.' },
    { n: 'Board-style questions', d: 'MCQ, short and creative/structured questions under time.' },
    { n: 'Higher-level / Olympiad', d: 'Tougher problems — only when relevant to your goals.' }
  ];
  P.PRIO = { high: 0, med: 1, low: 2 };
  P.EXAMKIND = [['both', 'Both exams'], ['final', 'Final exam only'], ['scholarship', 'Scholarship only']];

  /* ---------- state ---------- */
  P.mkSubject = (name, color) => ({ id: P.uid(), name, color, chapters: [], resources: [] });
  P.mkTopic = name => ({
    id: P.uid(), name, diff: 3, mastery: 0, stages: [0, 0, 0, 0, 0, 0], weak: false, exam: 'both',
    lastRev: '', nextRev: '', revN: 0,
    intel: { prio: 'med', prob: '', marks: '', defs: '', formulas: '', examples: '', diagram: '', mistakes: '', mnemonic: '' },
    out: { write: '', memo: '', read: '' }
  });
  P.defaults = () => ({
    v: 1,
    profile: { name: '', school: '', grade: 'Class 8', goal: '', avatar: 1, photo: '', theme: 'dark', accent: '#7dd3fc', accent2: '#a78bfa', onboarded: false },
    settings: { focus: 25, short: 5, long: 15, cycles: 4, dailyGoal: 120, notify: false, sound: true, autoBreak: true, reminder: '17:00' },
    exams: [{ id: 'final', name: 'Class 8 Final Exam', date: '' }, { id: 'scholarship', name: 'Junior Scholarship 2026', date: '' }],
    subjects: [
      ['Bangla 1st Paper', 0], ['Bangla 2nd Paper', 2], ['English 1st Paper', 1], ['English 2nd Paper', 5],
      ['Mathematics', 4], ['Science', 3], ['Bangladesh & Global Studies', 8]
    ].map(([n, c]) => P.mkSubject(n, P.COLORS[c])),
    sessions: [], tasks: [], templates: [], notes: [], cards: [], formulas: [], links: [], reading: [], refs: [],
    timetable: [], explorer: [], questions: [], mocks: [], errors: [],
    habits: ['Revise yesterday\'s work', 'Practise questions', 'Read the textbook 20 min', 'Screen-free break'].map(n => ({ id: P.uid(), name: n })),
    hlog: {}, well: {}, ledger: {}, medals: [], timer: null, ui: {}
  });
  P.load = () => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* ignore */ }
    const d = P.defaults();
    if (s && typeof s === 'object') {
      for (const k in d) {
        if (s[k] === undefined) s[k] = d[k];
        else if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) s[k] = Object.assign({}, d[k], s[k]);
      }
      P.S = s;
    } else P.S = d;
  };
  P.save = () => {
    try { P.S._t = P.S._t || 0; localStorage.setItem(KEY, JSON.stringify(P.S)); P.saveFail = false; if (P.cloudSchedule) P.cloudSchedule(); }
    catch (e) { if (!P.saveFail) P.toast('Could not save — storage is full or blocked. Export your data now.', 'warn'); P.saveFail = true; }
  };
  P.exportData = () => {
    P.download('projukti-backup-' + P.today() + '.json', JSON.stringify(P.S, null, 2), 'application/json');
  };
  P.importData = text => {
    const o = JSON.parse(text);
    if (!o || typeof o !== 'object' || !Array.isArray(o.subjects) || !o.profile) throw new Error('This file is not a PROJUKTI backup.');
    P.S = o; P.load2(); P.save();
  };
  P.load2 = () => { // re-merge defaults into freshly imported state
    const d = P.defaults(), s = P.S;
    for (const k in d) { if (s[k] === undefined) s[k] = d[k]; else if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) s[k] = Object.assign({}, d[k], s[k]); }
  };
  P.download = (name, text, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------- lookups ---------- */
  P.subj = id => P.S.subjects.find(s => s.id === id);
  P.subjName = id => (P.subj(id) || {}).name || '—';
  P.subjColor = id => (P.subj(id) || {}).color || '#94a3b8';
  P.subjOpts = (none) => (none ? [['', none]] : []).concat(P.S.subjects.map(s => [s.id, s.name]));
  P.topics = () => P.S.subjects.flatMap(s => s.chapters.flatMap(c => c.topics.map(t => ({ s, c, t }))));
  P.findTopic = id => P.topics().find(x => x.t.id === id);
  P.covered = t => !!(t.stages[0] && t.stages[1] && t.stages[2]);
  P.chip = (txt, col) => `<span class="chip" style="--c:${col || 'var(--muted)'}">${P.esc(txt)}</span>`;

  P.sessionsOn = d => P.S.sessions.filter(x => x.date === d);
  P.minsOn = (d, sid) => P.S.sessions.filter(x => x.date === d && (!sid || x.subjectId === sid)).reduce((a, x) => a + x.mins, 0);
  P.minsRange = (from, to, sid) => P.S.sessions.filter(x => x.date >= from && x.date <= to && (!sid || x.subjectId === sid)).reduce((a, x) => a + x.mins, 0);
  P.tasksOn = d => P.S.tasks.filter(t => !t.series && t.date === d).sort((a, b) => (a.done - b.done) || (a.time || '99').localeCompare(b.time || '99') || (P.PRIO[a.prio] - P.PRIO[b.prio]));
  P.overdueTasks = () => P.S.tasks.filter(t => !t.series && !t.done && t.date && t.date < P.today());
  P.dueRevisions = () => P.topics().filter(x => P.covered(x.t) && x.t.nextRev && x.t.nextRev <= P.today());
  P.overdueRevisions = () => P.topics().filter(x => P.covered(x.t) && x.t.nextRev && x.t.nextRev < P.today());

  P.subjectStats = s => {
    const ts = s.chapters.flatMap(c => c.topics);
    const cov = ts.filter(P.covered).length;
    return {
      total: ts.length, cov, covPct: P.pct(cov, ts.length),
      mastery: ts.length ? P.avg(ts.map(t => t.mastery)) : 0,
      weak: ts.filter(t => t.weak || (P.covered(t) && t.mastery <= 1)).length,
      overdue: ts.filter(t => P.covered(t) && t.nextRev && t.nextRev < P.today()).length,
      mins: P.S.sessions.filter(x => x.subjectId === s.id).reduce((a, x) => a + x.mins, 0)
    };
  };

  /* ---------- XP, levels, streaks ---------- */
  P.award = (key, xp, label, o = {}) => {
    const L = P.S.ledger;
    if (L[key]) return false;                       // never reward the same activity twice
    const day = P.today();
    let give = xp;
    if (o.cap) {
      const used = Object.values(L).filter(e => e.grp === o.cap[0] && e.day === day).reduce((a, e) => a + e.xp, 0);
      give = Math.max(0, Math.min(xp, o.cap[1] - used));
    }
    L[key] = { xp: give, label, ts: Date.now(), day, grp: o.cap ? o.cap[0] : '', act: !!o.act };
    if (give > 0) P.toast('+' + give + ' XP · ' + label, 'xp');
    return give > 0;
  };
  P.localXP = () => Object.values(P.S.ledger).reduce((a, e) => a + e.xp, 0);
  P.totalXP = () => P.localXP() + ((P.cloud && P.cloud.otherXP) || 0);   // + XP earned in OLC on the same account
  P.level = (xp = P.totalXP()) => {
    let lv = 1, need = 100;
    while (xp >= need) { xp -= need; lv++; need = Math.round(need * 1.25); }
    return { lv, cur: xp, need, pct: P.pct(xp, need) };
  };
  P.activeDays = () => {
    const s = new Set(P.S.sessions.map(x => x.date));
    Object.values(P.S.ledger).forEach(e => { if (e.act && e.xp >= 0) s.add(e.day); });
    return s;
  };
  // Streak with one rest-day allowance per week: a single missed day between active days does not break it.
  P.streakFrom = (set, end) => {
    let cur = 0, d = end, lastRest = null, guard = 0;
    while (guard++ < 800) {
      if (set.has(d)) cur++;
      else if (set.has(P.addDays(d, -1)) && (lastRest === null || P.diff(d, lastRest) >= 7)) lastRest = d;
      else break;
      d = P.addDays(d, -1);
    }
    return cur;
  };
  P.streak = () => {
    const set = P.activeDays(), t = P.today();
    const cur = P.streakFrom(set, set.has(t) ? t : P.addDays(t, -1));
    let best = 0; set.forEach(d => { best = Math.max(best, P.streakFrom(set, d)); });
    return { cur: set.size ? cur : 0, best: Math.max(best, cur), active: set };
  };

  /* ---------- recurring tasks ---------- */
  P.ensureRecurring = () => {
    const S = P.S, t = P.today(); let n = 0;
    S.tasks.filter(x => x.series && x.recur).forEach(m => {
      for (let i = 0; i < 14; i++) {
        const d = P.addDays(t, i);
        if (d < m.date) continue;
        const wd = new Date(d + 'T12:00:00').getDay();
        const ok = m.recur === 'daily' || (m.recur === 'weekdays' && wd !== 5 && wd !== 6) ||
          (m.recur === 'weekly' && wd === new Date(m.date + 'T12:00:00').getDay());
        if (ok && !(m.skip || []).includes(d) && !S.tasks.some(x => x.seriesId === m.id && x.date === d)) {
          S.tasks.push({ id: P.uid(), title: m.title, kind: m.kind, subjectId: m.subjectId, date: d, time: m.time, prio: m.prio, notes: m.notes, done: false, seriesId: m.id });
          n++;
        }
      }
    });
    return n;
  };

  /* ---------- images (profile photo, medal art) ---------- */
  P.imgToData = (file, max, jpeg, cb) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) { P.toast('Please choose an image file.', 'warn'); return; }
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        let out = jpeg ? c.toDataURL('image/jpeg', 0.85) : c.toDataURL('image/webp', 0.88);
        if (!jpeg && !out.startsWith('data:image/webp')) out = c.toDataURL('image/png');
        cb(out);
      };
      im.onerror = () => P.toast('Could not read that image.', 'warn');
      im.src = r.result;
    };
    r.readAsDataURL(file);
  };
  P.avatar = () => P.S.profile.photo || 'assets/avatars/av' + (P.S.profile.avatar || 1) + '.svg';

  /* ---------- theme ---------- */
  P.applyTheme = () => {
    const p = P.S.profile, r = document.documentElement;
    r.dataset.theme = p.theme;
    r.style.setProperty('--acc', p.accent);
    r.style.setProperty('--acc2', p.accent2);
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = p.theme === 'dark' ? '#050a18' : '#eef2fb';
  };

  /* ---------- UI: toast, modal form, confirm ---------- */
  P.toast = (msg, type) => {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.textContent = msg;
    box.appendChild(t); setTimeout(() => t.classList.add('out'), 3200); setTimeout(() => t.remove(), 3700);
  };

  P.modal = (html, cls) => {
    const dlg = document.createElement('dialog'); dlg.className = 'modal ' + (cls || '');
    dlg.innerHTML = html; document.body.appendChild(dlg);
    dlg.addEventListener('close', () => dlg.remove());
    dlg.addEventListener('mousedown', e => { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.showModal(); return dlg;
  };

  P.form = ({ title, fields, values = {}, submit = 'Save', onSubmit, wide, extra }) => {
    const esc = P.esc;
    const fh = f => {
      const v = values[f.k] ?? f.def ?? '', id = 'f_' + f.k, req = f.req ? 'required' : '';
      if (f.type === 'checkbox') return `<div class="fld"><label class="chk"><input type="checkbox" id="${id}" name="${f.k}" ${v ? 'checked' : ''}> <span>${esc(f.label)}</span></label></div>`;
      let inp;
      if (f.type === 'select') inp = `<select id="${id}" name="${f.k}" ${req}>${(f.opts || []).map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(ov) === String(v) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`;
      else if (f.type === 'textarea') inp = `<textarea id="${id}" name="${f.k}" rows="${f.rows || 4}" placeholder="${esc(f.ph || '')}" ${req}>${esc(v)}</textarea>`;
      else inp = `<input id="${id}" name="${f.k}" type="${f.type || 'text'}" value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''} placeholder="${esc(f.ph || '')}" ${req} ${f.list ? `list="dl_${f.k}"` : ''} ${f.maxlen ? `maxlength="${f.maxlen}"` : ''} autocomplete="${f.ac || 'off'}">` +
        (f.list ? `<datalist id="dl_${f.k}">${f.list.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : '');
      return `<div class="fld ${f.half ? 'half' : ''}"><label for="${id}">${esc(f.label)}</label>${inp}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</div>`;
    };
    const dlg = P.modal(`<form class="mform" novalidate><header><h3>${esc(title)}</h3><button type="button" class="icon-btn" data-close aria-label="Close">${P.icon('x')}</button></header><div class="fields">${fields.map(fh).join('')}</div><footer>${extra ? `<button type="button" class="btn ghost danger" data-extra>${esc(extra.label)}</button>` : ''}<span class="grow"></span><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary" type="submit">${esc(submit)}</button></footer></form>`, wide ? 'wide' : '');
    const form = dlg.querySelector('form');
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      const out = {};
      fields.forEach(f => {
        const el = form.elements[f.k]; if (!el) return;
        if (f.type === 'checkbox') out[f.k] = el.checked;
        else if (f.type === 'number') out[f.k] = el.value === '' ? '' : Number(el.value);
        else out[f.k] = el.value.trim();
      });
      if (onSubmit(out) !== false) dlg.close();
    });
    const ex = dlg.querySelector('[data-extra]'); if (ex) ex.addEventListener('click', () => { dlg.close(); extra.onClick(); });
    const first = form.querySelector('input:not([type=checkbox]),textarea,select'); if (first) first.focus();
    return dlg;
  };

  P.confirm = (msg, fn, ok = 'Delete') => {
    const dlg = P.modal(`<div class="mform"><header><h3>Please confirm</h3></header><p class="pad">${P.esc(msg)}</p><footer><span class="grow"></span><button class="btn ghost" data-close>Cancel</button><button class="btn danger" data-ok>${P.esc(ok)}</button></footer></div>`, 'small');
    dlg.querySelector('[data-ok]').addEventListener('click', () => { dlg.close(); fn(); });
  };

  /* printable / downloadable report window */
  P.showReport = (title, bodyHtml) => {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${P.esc(title)}</title><style>body{font:15px/1.55 system-ui,sans-serif;max-width:820px;margin:24px auto;padding:0 18px;color:#0f172a}h1{font-size:24px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 6px;border-bottom:2px solid #22d3ee;padding-bottom:4px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #cbd5e1;padding:5px 8px;text-align:left;font-size:13px}th{background:#f1f5f9}.m{color:#64748b;font-size:13px}.k{display:inline-block;border:1px solid #cbd5e1;border-radius:8px;padding:6px 12px;margin:0 8px 8px 0}.k b{display:block;font-size:20px}</style></head><body>${bodyHtml}</body></html>`;
    const dlg = P.modal(`<div class="mform"><header><h3>${P.esc(title)}</h3><button class="icon-btn" data-close aria-label="Close">${P.icon('x')}</button></header><iframe class="rpt" title="${P.esc(title)}"></iframe><footer><span class="grow"></span><button class="btn ghost" data-dl>${P.icon('download', 16)} Download .html</button><button class="btn primary" data-pr>Print / Save PDF</button></footer></div>`, 'wide');
    dlg.querySelector('iframe').srcdoc = doc;
    dlg.querySelector('[data-dl]').onclick = () => P.download(title.replace(/\W+/g, '-').toLowerCase() + '.html', doc, 'text/html');
    dlg.querySelector('[data-pr]').onclick = () => { const f = dlg.querySelector('iframe'); f.contentWindow.focus(); f.contentWindow.print(); };
  };

  /* ---------- charts (inline SVG, no libraries) ---------- */
  P.bars = (d, o = {}) => {
    const W = Math.max(300, d.length * 36), H = o.h || 150, max = Math.max(o.max || 0, ...d.map(x => x.v), 1), bw = (W - 10) / d.length;
    const gl = [0.25, 0.5, 0.75, 1].map(f => `<line x1="0" x2="${W}" y1="${H - f * (H - 16)}" y2="${H - f * (H - 16)}" class="gl"/>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="${P.esc(o.label || 'Bar chart')}">${gl}${d.map((x, i) => {
      const h = Math.round(x.v / max * (H - 16)), x0 = 5 + i * bw;
      return `<g><rect x="${x0 + bw * .18}" y="${H - h}" width="${bw * .64}" height="${Math.max(h, x.v > 0 ? 2 : 0)}" rx="4" style="fill:${x.c || 'var(--acc)'}"><title>${P.esc(x.l)}: ${o.fmt ? o.fmt(x.v) : x.v}</title></rect>${o.vals && x.v ? `<text x="${x0 + bw / 2}" y="${H - h - 4}" text-anchor="middle" class="ax">${o.fmt ? o.fmt(x.v) : x.v}</text>` : ''}<text x="${x0 + bw / 2}" y="${H + 14}" text-anchor="middle" class="ax">${P.esc(x.s ?? x.l)}</text></g>`;
    }).join('')}</svg>`;
  };
  P.line = (d, o = {}) => {
    const W = Math.max(300, d.length * 30), H = o.h || 140, pts = d.map((x, i) => ({ ...x, i })).filter(x => x.v != null);
    if (pts.length < 1) return '<div class="empty small">Not enough data yet.</div>';
    const max = Math.max(o.max || 0, ...pts.map(x => x.v), 1), step = (W - 20) / Math.max(d.length - 1, 1);
    const X = i => 10 + i * step, Y = v => H - 6 - v / max * (H - 24);
    const path = pts.map((p, k) => (k ? 'L' : 'M') + X(p.i).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join('');
    const area = path + `L${X(pts[pts.length - 1].i)} ${H - 6}L${X(pts[0].i)} ${H - 6}Z`;
    const every = Math.ceil(d.length / 8);
    return `<svg class="chart" viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="${P.esc(o.label || 'Line chart')}">${[0.5, 1].map(f => `<line x1="0" x2="${W}" y1="${Y(max * f)}" y2="${Y(max * f)}" class="gl"/>`).join('')}<path d="${area}" class="area"/><path d="${path}" class="ln" style="stroke:${o.color || 'var(--acc)'}"/>${pts.map(p => `<circle cx="${X(p.i)}" cy="${Y(p.v)}" r="3.5" style="fill:${o.color || 'var(--acc)'}"><title>${P.esc(p.l)}: ${o.fmt ? o.fmt(p.v) : p.v}</title></circle>`).join('')}${d.map((x, i) => i % every === 0 ? `<text x="${X(i)}" y="${H + 12}" text-anchor="middle" class="ax">${P.esc(x.s ?? x.l)}</text>` : '').join('')}</svg>`;
  };
  P.donut = (d, o = {}) => {
    const tot = d.reduce((a, x) => a + x.v, 0); if (!tot) return '<div class="empty small">No study time logged yet.</div>';
    const R = 52, C = 2 * Math.PI * R; let off = 0;
    const segs = d.filter(x => x.v > 0).map(x => { const len = x.v / tot * C; const s = `<circle r="${R}" cx="70" cy="70" fill="none" stroke-width="22" style="stroke:${x.c}" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${P.esc(x.l)}: ${o.fmt ? o.fmt(x.v) : x.v}</title></circle>`; off += len; return s; }).join('');
    return `<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="${P.esc(o.label || 'Distribution')}">${segs}<text x="70" y="68" text-anchor="middle" class="dv">${o.center || ''}</text><text x="70" y="84" text-anchor="middle" class="ax">${o.sub || ''}</text></svg><ul class="legend">${d.filter(x => x.v > 0).map(x => `<li><i style="background:${x.c}"></i>${P.esc(x.l)} <b>${o.fmt ? o.fmt(x.v) : x.v}</b></li>`).join('')}</ul></div>`;
  };
  P.heat = (map, days = 84, goal = 60) => {
    const t = P.today(), start = P.addDays(t, -(days - 1)), pad = new Date(start + 'T12:00:00').getDay();
    let h = '<div class="heat" role="img" aria-label="Activity calendar">';
    for (let i = 0; i < pad; i++) h += '<i class="e"></i>';
    for (let i = 0; i < days; i++) {
      const d = P.addDays(start, i), v = map[d] || 0, lv = v <= 0 ? 0 : v < goal * .5 ? 1 : v < goal ? 2 : v < goal * 1.5 ? 3 : 4;
      h += `<i class="l${lv} ${d === t ? 'today' : ''}" title="${P.fmtDate(d)} — ${P.fmtMin(v)}"></i>`;
    }
    return h + '</div>';
  };
  P.bar = (pct, color) => `<div class="pbar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, Math.max(0, pct))}%;--c:${color || 'var(--acc)'}"></i></div>`;

  /* Bangladesh GPA scale */
  P.grade = pct => pct >= 80 ? ['A+', 5] : pct >= 70 ? ['A', 4] : pct >= 60 ? ['A-', 3.5] : pct >= 50 ? ['B', 3] : pct >= 40 ? ['C', 2] : pct >= 33 ? ['D', 1] : ['F', 0];

  /* ---------- sound ---------- */
  P.beep = () => {
    if (!P.S.settings.sound) return;
    try {
      const ac = P.ac || (P.ac = new (window.AudioContext || window.webkitAudioContext)());
      [0, 0.22, 0.44].forEach((t, i) => {
        const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 660 + i * 110; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.2);
        o.connect(g); g.connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.22);
      });
    } catch (e) { /* audio unavailable */ }
  };
  P.notify = (title, body) => {
    if (P.S.settings.notify && 'Notification' in window && Notification.permission === 'granted') { try { new Notification(title, { body, icon: 'assets/logo/icon-192.png' }); } catch (e) { /* ignore */ } }
  };

  /* ambient sound generator (real, offline) */
  P.ambient = {
    node: null, gain: null, kind: '',
    start(kind, vol) {
      this.stop();
      const ac = P.ac || (P.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === 'suspended') ac.resume();
      const len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === 'white') d[i] = w * 0.5;
        else if (kind === 'pink') { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
        else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      }
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const g = ac.createGain(); g.gain.value = vol; src.connect(g);
      if (kind === 'rain') { const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900; g.disconnect(); src.disconnect(); src.connect(f); f.connect(g); }
      g.connect(ac.destination); src.start(); this.node = src; this.gain = g; this.kind = kind;
    },
    stop() { if (this.node) { try { this.node.stop(); } catch (e) { /* ignore */ } } this.node = null; this.gain = null; this.kind = ''; },
    vol(v) { if (this.gain) this.gain.gain.value = v; }
  };

  /* ---------- reports ---------- */
  P.reportHTML = (from, to, title) => {
    const S = P.S, esc = P.esc, ss = S.sessions.filter(x => x.date >= from && x.date <= to);
    const mins = ss.reduce((a, x) => a + x.mins, 0), days = P.diff(from, to) + 1;
    const bySub = S.subjects.map(s => ({ s, m: ss.filter(x => x.subjectId === s.id).reduce((a, x) => a + x.mins, 0), n: ss.filter(x => x.subjectId === s.id).length })).filter(x => x.m);
    const tasks = S.tasks.filter(t => !t.series && t.date >= from && t.date <= to), tdone = tasks.filter(t => t.done).length;
    const xp = Object.values(S.ledger).filter(e => e.day >= from && e.day <= to).reduce((a, e) => a + e.xp, 0);
    const wl = Object.entries(S.well).filter(([d]) => d >= from && d <= to).map(([, w]) => w);
    const mocks = S.mocks.filter(m => m.date >= from && m.date <= to);
    const weak = P.topics().filter(x => x.t.weak || (P.covered(x.t) && x.t.mastery <= 1)).slice(0, 12);
    const od = P.overdueRevisions().slice(0, 12);
    return `<h1>${esc(title)}</h1><p class="m">${esc(S.profile.name || 'Student')} · ${P.fmtDate(from)} – ${P.fmtDate(to)} · generated by PROJUKTI</p>
<div><span class="k"><b>${P.fmtMin(mins)}</b>study time</span><span class="k"><b>${ss.length}</b>sessions</span><span class="k"><b>${ss.length ? P.avg(ss.map(x => x.focus)).toFixed(1) : '—'}/5</b>avg focus</span><span class="k"><b>${tdone}/${tasks.length}</b>tasks done</span><span class="k"><b>${xp}</b>XP earned</span><span class="k"><b>${P.fmtMin(mins / days)}</b>daily average</span></div>
<h2>Time by subject</h2>${bySub.length ? `<table><tr><th>Subject</th><th>Time</th><th>Sessions</th></tr>${bySub.map(x => `<tr><td>${esc(x.s.name)}</td><td>${P.fmtMin(x.m)}</td><td>${x.n}</td></tr>`).join('')}</table>` : '<p class="m">No sessions logged in this period.</p>'}
<h2>Well-being</h2><p>${wl.length ? `Average sleep ${P.avg(wl.filter(w => w.sleep).map(w => w.sleep)).toFixed(1)} h · mood ${P.avg(wl.filter(w => w.mood).map(w => w.mood)).toFixed(1)}/5 · energy ${P.avg(wl.filter(w => w.energy).map(w => w.energy)).toFixed(1)}/5` : '<span class="m">No check-ins recorded.</span>'}</p>
<h2>Mock tests</h2>${mocks.length ? `<table><tr><th>Date</th><th>Test</th><th>Subject</th><th>Score</th><th>Grade</th></tr>${mocks.map(m => `<tr><td>${m.date}</td><td>${esc(m.name)}</td><td>${esc(P.subjName(m.subjectId))}</td><td>${m.score}/${m.total}</td><td>${P.grade(m.score / m.total * 100)[0]}</td></tr>`).join('')}</table>` : '<p class="m">None in this period.</p>'}
<h2>Needs attention</h2>${weak.length || od.length ? `<p><b>Weak topics:</b> ${weak.map(x => esc(x.s.name + ' → ' + x.t.name)).join('; ') || '—'}</p><p><b>Overdue revisions:</b> ${od.map(x => esc(x.s.name + ' → ' + x.t.name)).join('; ') || '—'}</p>` : '<p class="m">Nothing flagged. Nice work.</p>'}`;
  };
})();
