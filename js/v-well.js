/* Well-being — mood, energy, sleep, screen time, habits, reflection, streak calendar */
(function () {
  const P = window.P, esc = P.esc;
  const wd = () => (P.S.well[P.today()] = P.S.well[P.today()] || {});

  P.views.wellbeing = {
    render() {
      const S = P.S, td = P.today(), w = S.well[td] || {}, set = S.settings, mins = P.minsOn(td), st = P.streak();
      const hl = S.hlog[td] || {}, ss = P.sessionsOn(td), fq = ss.length ? P.avg(ss.map(x => x.focus)).toFixed(1) : '—';
      const last = n => Array.from({ length: n }, (_, i) => P.addDays(td, i - n + 1));
      const sleepD = last(14).map(d => ({ l: P.fmtDate(d), s: d.slice(8), v: (S.well[d] || {}).sleep || null }));
      const moodD = last(14).map(d => ({ l: P.fmtDate(d), s: d.slice(8), v: (S.well[d] || {}).mood || null }));
      const map = {}; S.sessions.forEach(x => map[x.date] = (map[x.date] || 0) + x.mins);
      const warns = [];
      if (w.sleep && w.sleep < 6) warns.push('You slept under 6 hours. Keep today lighter — short sessions, more breaks, and an early night. Memory depends on sleep.');
      if (mins >= 360) warns.push('You have studied over 6 hours today. Stop for now — extra hours tonight give diminishing returns and cost tomorrow\'s focus.');
      if (w.screen && w.screen > 4) warns.push('Recreational screen time is high today. Try a screen-free break: stretch, walk, or drink water.');
      const hs = S.habits.map(h => { let n = 0, d = hl[h.id] ? td : P.addDays(td, -1); while (S.hlog[d] && S.hlog[d][h.id] && n < 400) { n++; d = P.addDays(d, -1); } return { ...h, done: !!hl[h.id], n }; });
      const num = (k, label, min, max, step, ph) => `<div class="fld"><label for="w_${k}">${label}</label><input id="w_${k}" type="number" min="${min}" max="${max}" step="${step}" value="${w[k] ?? ''}" placeholder="${ph || ''}" data-c="wnum" data-k="${k}"></div>`;
      return `<header class="vh"><div><h1>Well-being</h1><small class="muted">Good study needs good sleep, breaks and a calm mind. XP is never given for overworking.</small></div></header>
      ${warns.map(m => `<div class="notice warn">${P.icon('alert', 18)}<div>${m}</div></div>`).join('')}
      <section class="grid g2w">
        <div class="card glass"><div class="ch"><h2>${P.icon('heart', 18)} Today's check-in</h2></div>
          <small class="muted">Mood</small><div class="moods" role="group" aria-label="Mood">${['😞', '🙁', '😐', '🙂', '😄'].map((m, i) => `<button class="mood ${w.mood === i + 1 ? 'on' : ''}" data-a="setMood" data-k="mood" data-v="${i + 1}" aria-label="Mood ${i + 1}">${m}</button>`).join('')}</div>
          <small class="muted">Energy</small><div class="moods" role="group" aria-label="Energy">${[1, 2, 3, 4, 5].map(i => `<button class="mood ${w.energy === i ? 'on' : ''}" data-a="setMood" data-k="energy" data-v="${i}" aria-label="Energy ${i}">${P.icon('bolt', 16)}<small>${i}</small></button>`).join('')}</div>
          <div class="grid g3 tight">${num('sleep', 'Sleep last night (h)', 0, 16, 0.5, '8')}${num('screen', 'Recreational screen (h)', 0, 16, 0.5, '1.5')}${num('breaks', 'Breaks taken', 0, 40, 1, '0')}</div>
          <div class="kv"><span>Focus quality today (from sessions)</span><b>${fq}/5</b></div>
          <div class="fld"><label for="w_ref">Daily reflection <small>(what went well? what will I improve tomorrow?)</small></label><textarea id="w_ref" rows="4" data-c="wref">${esc(w.reflection || '')}</textarea></div>
          <small class="muted">Sleep of 8–10 hours and a written reflection earn a small one-time XP bonus each day.</small></div>
        <div class="card glass"><div class="ch"><h2>${P.icon('check', 18)} Habits</h2><button class="btn small" data-a="addHabit">${P.icon('plus', 14)} Add</button></div>
          <div class="list">${hs.map(h => `<div class="row"><button class="check ${h.done ? 'on' : ''}" data-a="toggleHabit" data-id="${h.id}" role="checkbox" aria-checked="${h.done}" aria-label="${esc(h.name)}">${h.done ? P.icon('check', 14) : ''}</button><div class="grow"><b>${esc(h.name)}</b><small class="muted">${h.n} day streak</small></div><button class="icon-btn" data-a="delHabit" data-id="${h.id}" aria-label="Delete habit">${P.icon('trash', 15)}</button></div>`).join('') || '<div class="empty small">No habits yet.</div>'}</div>
          <hr><div class="fld"><label for="goal">Daily study goal: <b id="goalv">${P.fmtMin(set.dailyGoal)}</b></label><input id="goal" type="range" min="30" max="360" step="15" value="${set.dailyGoal}" data-c="goal" data-i="goalv"><small class="muted">${set.dailyGoal > 240 ? 'That is ambitious. Make sure sleep and breaks stay protected.' : set.dailyGoal < 60 ? 'A light goal — fine for starting out. You can raise it later.' : 'A realistic, sustainable target.'}</small></div>
        </div>
      </section>
      <section class="grid g2">
        <div class="card glass"><div class="ch"><h2>${P.icon('moon', 18)} Sleep · 14 days</h2></div>${P.line(sleepD, { max: 12, fmt: v => v + ' h', color: 'var(--acc2)', label: 'Sleep hours' })}<small class="muted">Aim for 8–10 hours.</small></div>
        <div class="card glass"><div class="ch"><h2>${P.icon('smile', 18)} Mood · 14 days</h2></div>${P.line(moodD, { max: 5, fmt: v => v + '/5', color: 'var(--ok)', label: 'Mood' })}</div>
      </section>
      <section class="card glass"><div class="ch"><h2>${P.icon('flame', 18)} Streak calendar</h2><small class="muted">current ${st.cur} · best ${st.best} · one rest day per week never breaks a streak</small></div>${P.heat(map, 84, set.dailyGoal)}<div class="legend-h"><small class="muted">Less</small><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><small class="muted">More</small></div></section>`;
    }
  };

  P.chg.wnum = (v, el, d) => {
    const w = wd(); w[d.k] = v === '' ? undefined : Math.max(+el.min, Math.min(+el.max, +v));
    if (d.k === 'sleep' && w.sleep >= 8 && w.sleep <= 11) P.award('sleep:' + P.today(), 10, 'Well rested');
    P.render();
  };
  P.chg.wref = v => { const w = wd(); w.reflection = v.trim(); if (w.reflection.length >= 20) P.award('refl:' + P.today(), 5, 'Daily reflection'); P.render(); };
  P.chg.goal = v => { P.S.settings.dailyGoal = +v; P.render(); };
  P.inp.goalv = v => { const e = document.getElementById('goalv'); if (e) e.textContent = P.fmtMin(+v); };
  P.act.addHabit = () => P.form({ title: 'New habit', fields: [{ k: 'name', label: 'Habit', req: true, ph: 'e.g. Pack school bag the night before' }], onSubmit: v => { P.S.habits.push({ id: P.uid(), name: v.name }); P.render(); } });
  P.act.delHabit = d => P.confirm('Delete this habit?', () => { P.S.habits = P.S.habits.filter(h => h.id !== d.id); P.render(); });
  P.act.toggleHabit = d => {
    const td = P.today(), l = P.S.hlog[td] = P.S.hlog[td] || {};
    l[d.id] = !l[d.id];
    if (l[d.id]) P.award('habit:' + d.id + ':' + td, 3, 'Habit done', { cap: ['habit', 15] });
    P.render();
  };
})();
