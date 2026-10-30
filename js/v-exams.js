/* Exams, grades, mock tests, accuracy, weak subjects + Achievements */
(function () {
  const P = window.P, esc = P.esc;

  P.subjectAccuracy = sid => {
    const m = P.S.mocks.filter(x => x.subjectId === sid && x.total), q = P.S.questions.filter(x => x.subjectId === sid).flatMap(x => x.hist || []);
    const mockPct = m.length ? P.avg(m.map(x => x.score / x.total * 100)) : null, qPct = q.length ? P.pct(q.filter(x => x.ok).length, q.length) : null;
    return { mockPct, qPct, nm: m.length, nq: q.length };
  };

  P.views.exams = {
    render() {
      const S = P.S, td = P.today();
      const rows = S.subjects.map(s => {
        const st = P.subjectStats(s), a = P.subjectAccuracy(s.id), parts = [];
        if (a.mockPct != null) parts.push(a.mockPct); if (a.qPct != null) parts.push(a.qPct); if (st.total) parts.push(st.mastery / 4 * 100);
        return { s, st, a, score: parts.length ? P.avg(parts) : null };
      });
      const ranked = rows.filter(r => r.score != null).sort((a, b) => a.score - b.score), weakest = ranked.slice(0, 2).map(r => r.s.id);
      const od = P.overdueRevisions(), mocks = [...S.mocks].sort((a, b) => b.date.localeCompare(a.date));
      const hw = S.tasks.filter(x => !x.series && !x.done && (x.kind === 'homework' || x.kind === 'assignment')).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
      return `<header class="vh"><div><h1>Exams & Grades</h1><small class="muted">Countdowns, coverage, mock results and where to focus next.</small></div><div class="vh-r"><button class="btn" data-a="addMock">${P.icon('plus', 16)} Add mock / test</button></div></header>
      <section class="grid g2">${S.exams.map(P.countdown).join('')}</section>
      <section class="grid g2w">
        <div class="card glass"><div class="ch"><h2>${P.icon('chart', 18)} Subject accuracy & focus</h2></div>
          <div class="tscroll"><table class="tbl"><thead><tr><th>Subject</th><th>Syllabus</th><th>Mock avg</th><th>Questions</th><th>Mastery</th></tr></thead><tbody>${rows.map(r => `<tr class="${weakest.includes(r.s.id) ? 'hl' : ''}"><td><i class="dot" style="background:${r.s.color}"></i> ${esc(r.s.name)} ${weakest.includes(r.s.id) ? P.chip('Focus here', 'var(--bad)') : ''}</td><td>${r.st.total ? r.st.covPct + '%' : '—'}</td><td>${r.a.mockPct != null ? Math.round(r.a.mockPct) + '% (' + r.a.nm + ')' : '—'}</td><td>${r.a.qPct != null ? r.a.qPct + '% (' + r.a.nq + ')' : '—'}</td><td>${r.st.total ? P.MASTERY[Math.round(r.st.mastery)] : '—'}</td></tr>`).join('')}</tbody></table></div>
          <small class="muted">“Focus here” marks the lowest blended score of mock results, practice accuracy and mastery. It appears once there is data.</small></div>
        <div class="card glass"><div class="ch"><h2>${P.icon('alert', 18)} Overdue revisions</h2><small class="muted">${od.length}</small></div><div class="list">${od.slice(0, 8).map(x => `<div class="row"><span class="dot" style="background:${x.s.color}"></span><div class="grow"><b>${esc(x.t.name)}</b><small class="muted">${esc(x.s.name)}</small></div>${P.revChip(x.t)}<button class="btn small" data-a="revise" data-id="${x.t.id}">Done</button></div>`).join('') || '<div class="empty small">No overdue revisions. 🎉</div>'}</div></div>
      </section>
      <section class="grid g2w">
        <div class="card glass"><div class="ch"><h2>${P.icon('file', 18)} Mock tests & results</h2></div><div class="tscroll"><table class="tbl"><thead><tr><th>Date</th><th>Test</th><th>Subject</th><th>Score</th><th>Grade</th><th></th></tr></thead><tbody>${mocks.map(m => { const p = m.total ? m.score / m.total * 100 : 0, g = P.grade(p); return `<tr><td>${P.fmtDate(m.date)}</td><td>${esc(m.name)}<br><small class="muted">${esc(m.type)}</small></td><td>${esc(P.subjName(m.subjectId))}</td><td>${m.score}/${m.total} (${Math.round(p)}%)</td><td><b>${g[0]}</b> <small class="muted">GPA ${g[1]}</small></td><td><button class="icon-btn" data-a="editMock" data-id="${m.id}">${P.icon('edit', 15)}</button><button class="icon-btn" data-a="delMock" data-id="${m.id}">${P.icon('trash', 15)}</button></td></tr>`; }).join('') || '<tr><td colspan="6"><div class="empty small">No results yet. Record class tests, board-style practice papers and scholarship mocks.</div></td></tr>'}</tbody></table></div>
          <small class="muted">Grades use the Bangladesh scale: A+ 80–100 · A 70–79 · A- 60–69 · B 50–59 · C 40–49 · D 33–39 · F below 33.</small></div>
        <div class="card glass"><div class="ch"><h2>${P.icon('calendar', 18)} Assignment deadlines</h2></div><div class="list">${hw.map(x => `<div class="row"><div class="grow"><b>${esc(x.title)}</b><small class="muted">${esc(P.subjName(x.subjectId))}</small></div>${P.chip(x.date < td ? 'Overdue' : P.diff(td, x.date) === 0 ? 'Today' : 'in ' + P.diff(td, x.date) + 'd', x.date < td ? 'var(--bad)' : 'var(--warn)')}</div>`).join('') || '<div class="empty small">No pending homework or assignments.</div>'}</div></div>
      </section>
      <section class="card glass"><div class="ch"><h2>Reports</h2></div><div class="chips"><button class="btn" data-a="report" data-r="day">Today's report</button><button class="btn" data-a="report" data-r="week">Weekly report (last 7 days)</button><button class="btn" data-a="report" data-r="month">Monthly report (last 30 days)</button></div></section>`;
    }
  };

  const mFields = () => [{ k: 'name', label: 'Test name', req: true, ph: 'e.g. Maths model test 1' }, { k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true },
    { k: 'type', label: 'Type', type: 'select', opts: ['Class test', 'School exam', 'Board-style paper', 'Scholarship mock', 'Chapter quiz'], half: true },
    { k: 'score', label: 'Marks obtained', type: 'number', min: 0, step: '0.5', req: true, half: true }, { k: 'total', label: 'Total marks', type: 'number', min: 1, req: true, half: true },
    { k: 'date', label: 'Date', type: 'date', req: true, half: true }, { k: 'exam', label: 'Prepares for', type: 'select', opts: P.EXAMKIND, half: true }, { k: 'notes', label: 'What to improve', type: 'textarea', rows: 2 }];
  const okM = v => { if (v.score > v.total) { P.toast('Marks obtained cannot exceed total marks.', 'warn'); return false; } return true; };
  P.act.addMock = () => P.form({ title: 'Add test result', fields: mFields(), values: { subjectId: P.S.subjects[0]?.id, date: P.today(), total: 100, type: 'Class test', exam: 'both' }, onSubmit: v => { if (!okM(v)) return false; const m = { id: P.uid(), ...v }; P.S.mocks.push(m); P.award('mock:' + m.id, 20 + (v.score / v.total >= 0.8 ? 10 : 0), 'Test recorded', { act: true }); P.render(); } });
  P.act.editMock = d => { const m = P.S.mocks.find(x => x.id === d.id); P.form({ title: 'Edit test result', fields: mFields(), values: m, onSubmit: v => { if (!okM(v)) return false; Object.assign(m, v); P.render(); } }); };
  P.act.delMock = d => P.confirm('Delete this result?', () => { P.S.mocks = P.S.mocks.filter(x => x.id !== d.id); P.render(); });
  P.act.report = d => {
    const td = P.today(), from = d.r === 'day' ? td : P.addDays(td, d.r === 'week' ? -6 : -29);
    P.showReport(d.r === 'day' ? 'Daily report' : d.r === 'week' ? 'Weekly report' : 'Monthly report', P.reportHTML(from, td, d.r === 'day' ? 'Daily progress report' : d.r === 'week' ? 'Weekly progress report' : 'Monthly progress report'));
  };

  /* ---------- Achievements ---------- */
  P.views.awards = {
    render() {
      const S = P.S, lv = P.level(), st = P.streak(), xp = P.totalXP(), got = P.ACH.filter(a => S.ach[a.id]).length;
      const led = Object.values(S.ledger).filter(e => e.xp > 0).sort((a, b) => b.ts - a.ts).slice(0, 14);
      const nextStreak = [3, 7, 14, 30].find(n => n > st.cur);
      return `<header class="vh"><div><h1>Achievements</h1><small class="muted">XP rewards genuine work only — every activity pays out once, and daily caps protect against over-studying.</small></div></header>
      <section class="grid g2w"><div class="card glass levelcard"><div class="lvl"><b>${lv.lv}</b><small>LEVEL</small></div><div class="grow"><h2>${xp} XP total</h2>${P.bar(lv.pct, 'var(--acc2)')}<small class="muted">${lv.need - lv.cur} XP to level ${lv.lv + 1}</small>
        <div class="kv"><span>Badges</span><b>${got}/${P.ACH.length}</b></div><div class="kv"><span>Current streak</span><b>${st.cur} days</b></div>${nextStreak ? `<small class="muted">Next streak milestone: ${nextStreak} days (${nextStreak - st.cur} to go)</small>` : ''}</div></div>
        <div class="card glass"><div class="ch"><h2>Recent XP</h2></div><div class="list">${led.map(e => `<div class="row"><div class="grow"><b>${esc(e.label)}</b><small class="muted">${P.fmtDate(e.day)}</small></div><b class="ok">+${e.xp}</b></div>`).join('') || '<div class="empty small">Complete tasks, sessions and revisions to earn XP.</div>'}</div></div></section>
      <section class="card glass"><div class="ch"><h2>${P.icon('medal', 18)} Badge gallery</h2></div><div class="badges">${P.ACH.map(a => { const u = S.ach[a.id]; return `<div class="badge ${u ? '' : 'locked'}" title="${esc(a.desc)}">${P.badgeSVG(a, !u, 84)}<b>${esc(a.name)}</b><small class="muted">${u ? 'Unlocked ' + P.fmtDate(P.today(new Date(u))) : esc(a.desc)}</small></div>`; }).join('')}</div></section>`;
    }
  };
})();
