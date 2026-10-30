/* Analytics & exportable reports */
(function () {
  const P = window.P, esc = P.esc;
  const dayMap = (from, to) => { const m = {}; P.S.sessions.forEach(x => { if (x.date >= from && x.date <= to) m[x.date] = (m[x.date] || 0) + x.mins; }); return m; };

  P.views.analytics = {
    render() {
      const S = P.S, td = P.today(), N = +(S.ui.arange || 14), from = P.addDays(td, -(N - 1)), goal = S.settings.dailyGoal;
      const days = Array.from({ length: N }, (_, i) => P.addDays(td, i - N + 1)), dm = dayMap(from, td);
      const daily = days.map(d => ({ l: P.fmtDate(d), s: N > 14 ? (+d.slice(8) % 5 === 0 || d === td ? d.slice(8) : '') : P.fmtDate(d, { weekday: 'narrow' }) + d.slice(8), v: dm[d] || 0, c: (dm[d] || 0) >= goal ? 'var(--ok)' : 'var(--acc)' }));
      const wk = Array.from({ length: 8 }, (_, i) => { const e = P.addDays(td, -7 * (7 - i)), s = P.addDays(e, -6); return { l: P.fmtDate(s) + ' – ' + P.fmtDate(e), s: P.fmtDate(e, { day: 'numeric', month: 'short' }), v: P.minsRange(s, e), c: 'var(--acc2)' }; });
      const mo = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); const k = P.today(d).slice(0, 7); return { l: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), s: d.toLocaleDateString(undefined, { month: 'short' }), v: S.sessions.filter(x => x.date.startsWith(k)).reduce((a, x) => a + x.mins, 0), c: 'var(--acc)' }; });
      const dist = S.subjects.map(s => ({ l: s.name, c: s.color, v: P.minsRange(from, td, s.id) }));
      const total = dist.reduce((a, x) => a + x.v, 0);
      const focus = days.map(d => { const ss = P.sessionsOn(d); return { l: P.fmtDate(d), s: d.slice(8), v: ss.length ? +P.avg(ss.map(x => x.focus)).toFixed(1) : null }; });
      const hit = days.filter(d => (dm[d] || 0) >= goal).length;
      const grades = [...S.mocks].filter(m => m.total).sort((a, b) => a.date.localeCompare(b.date)).slice(-12).map(m => ({ l: m.name + ' (' + m.date + ')', s: m.date.slice(5), v: Math.round(m.score / m.total * 100) }));
      const acc = S.subjects.map(s => { const a = P.subjectAccuracy(s.id); const v = [a.mockPct, a.qPct].filter(x => x != null); return { l: s.name, s: s.name.split(' ')[0].slice(0, 6), v: v.length ? Math.round(P.avg(v)) : 0, c: s.color }; });
      const cover = S.subjects.map(s => ({ l: s.name, s: s.name.split(' ')[0].slice(0, 6), v: P.subjectStats(s).covPct, c: s.color }));
      const weak = P.topics().filter(x => x.t.weak || (P.covered(x.t) && x.t.mastery <= 1)).slice(0, 10);
      const st = P.streak(), map = {}; S.sessions.forEach(x => map[x.date] = (map[x.date] || 0) + x.mins);
      const recent = [...S.sessions].sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id)).slice(0, 12);
      return `<header class="vh"><div><h1>Analytics</h1><small class="muted">Everything here is calculated from what you actually logged.</small></div>
        <div class="vh-r"><select data-c="arange" aria-label="Range">${[7, 14, 30].map(n => `<option value="${n}" ${N === n ? 'selected' : ''}>Last ${n} days</option>`).join('')}</select><button class="btn" data-a="exportCSV">${P.icon('download', 16)} Sessions CSV</button><button class="btn" data-a="exportReport">${P.icon('file', 16)} Report</button><button class="btn ghost" data-a="exportAll">${P.icon('download', 16)} Backup</button></div></header>
      <section class="grid g4 stats"><div class="stat glass"><small class="muted">Study time</small><b>${P.fmtMin(total)}</b><small class="muted">avg ${P.fmtMin(total / N)} / day</small></div><div class="stat glass"><small class="muted">Goal days</small><b>${hit}/${N}</b>${P.bar(P.pct(hit, N), 'var(--ok)')}</div><div class="stat glass"><small class="muted">Sessions</small><b>${S.sessions.filter(x => x.date >= from).length}</b></div><div class="stat glass"><small class="muted">Streak (best)</small><b>${st.cur} (${st.best})</b></div></section>
      <section class="card glass"><div class="ch"><h2>Daily study time</h2><small class="muted">green = goal reached</small></div>${P.bars(daily, { fmt: P.fmtMin, label: 'Daily study time', h: 150 })}</section>
      <section class="grid g2"><div class="card glass"><div class="ch"><h2>Weekly totals</h2></div>${P.bars(wk, { fmt: P.fmtMin, label: 'Weekly study time' })}</div><div class="card glass"><div class="ch"><h2>Monthly totals</h2></div>${P.bars(mo, { fmt: P.fmtMin, label: 'Monthly study time' })}</div></section>
      <section class="grid g2"><div class="card glass"><div class="ch"><h2>Time by subject</h2></div>${P.donut(dist, { fmt: P.fmtMin, center: P.fmtMin(total), sub: 'last ' + N + ' days', label: 'Time by subject' })}</div><div class="card glass"><div class="ch"><h2>Focus quality trend</h2></div>${focus.some(x => x.v != null) ? P.line(focus, { max: 5, fmt: v => v + '/5', label: 'Focus trend' }) : '<div class="empty small">Rate your sessions\' focus to see a trend.</div>'}</div></section>
      <section class="grid g2"><div class="card glass"><div class="ch"><h2>Syllabus completion</h2></div>${P.bars(cover, { max: 100, vals: true, fmt: v => v + '%', label: 'Syllabus completion' })}</div><div class="card glass"><div class="ch"><h2>Accuracy by subject</h2></div>${acc.some(x => x.v) ? P.bars(acc, { max: 100, vals: true, fmt: v => v + '%', label: 'Accuracy' }) : '<div class="empty small">Record mock tests or practise questions to see accuracy.</div>'}</div></section>
      <section class="grid g2"><div class="card glass"><div class="ch"><h2>Mock-test grades</h2></div>${grades.length ? P.line(grades, { max: 100, fmt: v => v + '%', color: 'var(--warn)', label: 'Mock test percentages' }) : '<div class="empty small">No mock results yet.</div>'}</div><div class="card glass"><div class="ch"><h2>Weak topics</h2></div><div class="list">${weak.map(x => `<div class="row"><span class="dot" style="background:${x.s.color}"></span><div class="grow"><b>${esc(x.t.name)}</b><small class="muted">${esc(x.s.name)} · ${P.MASTERY[x.t.mastery]}</small></div></div>`).join('') || '<div class="empty small">No weak topics flagged.</div>'}</div></div></section>
      <section class="card glass"><div class="ch"><h2>Streak history · 16 weeks</h2></div>${P.heat(map, 112, goal)}</section>
      <section class="card glass"><div class="ch"><h2>Recent sessions</h2></div><div class="tscroll"><table class="tbl"><thead><tr><th>Date</th><th>Subject</th><th>Topic</th><th>Method</th><th>Time</th><th>Focus</th></tr></thead><tbody>${recent.map(x => `<tr><td>${P.fmtDate(x.date)}</td><td>${esc(P.subjName(x.subjectId))}</td><td>${esc(x.topic || '—')}</td><td>${esc(x.method)}</td><td>${P.fmtMin(x.mins)}</td><td>${x.focus}/5</td></tr>`).join('') || '<tr><td colspan="6" class="muted">No sessions logged yet.</td></tr>'}</tbody></table></div></section>`;
    }
  };
  P.chg.arange = v => { P.S.ui.arange = v; P.render(); };
  P.act.exportCSV = () => {
    const q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const rows = [['date', 'subject', 'topic', 'method', 'minutes', 'focus', 'distractions', 'work']].concat(P.S.sessions.map(x => [x.date, P.subjName(x.subjectId), x.topic, x.method, x.mins, x.focus, x.distr, x.work]));
    P.download('projukti-sessions-' + P.today() + '.csv', rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv');
  };
  P.act.exportReport = () => P.showReport('Progress report', P.reportHTML(P.addDays(P.today(), -(+(P.S.ui.arange || 14)) + 1), P.today(), 'Progress report'));
  P.act.exportAll = () => P.exportData();
})();
