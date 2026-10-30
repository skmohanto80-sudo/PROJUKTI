/* Focus — pomodoro / stopwatch / subject timers, session history, manual logging */
(function () {
  const P = window.P, esc = P.esc;
  const T = () => P.S.timer;
  const elapsed = () => { const t = T(); return t ? t.acc + (t.running ? Date.now() - t.start : 0) : 0; };
  const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const hms = ms => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const topicList = sid => { const s = P.subj(sid); return s ? s.chapters.flatMap(c => c.topics.map(t => t.name)) : []; };

  P.sessionFields = (sid) => [
    { k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), req: true, half: true },
    { k: 'topic', label: 'Chapter / topic', list: topicList(sid || P.S.subjects[0]?.id), half: true },
    { k: 'mins', label: 'Minutes', type: 'number', min: 1, max: 600, req: true, half: true },
    { k: 'method', label: 'Study method', type: 'select', opts: P.METHODS, half: true },
    { k: 'focus', label: 'Focus rating', type: 'select', opts: [[1, '1 – Very distracted'], [2, '2'], [3, '3 – Okay'], [4, '4'], [5, '5 – Deep focus']], half: true },
    { k: 'distr', label: 'Distractions', type: 'number', min: 0, max: 99, half: true },
    { k: 'date', label: 'Date', type: 'date', req: true, half: true },
    { k: 'work', label: 'Work completed', type: 'textarea', rows: 3, ph: 'e.g. Solved exercise 3.1 Q1–10, summarised the lesson…' }
  ];

  /* create a session + reward (once, capped per day) */
  const createSession = o => {
    const s = { id: P.uid(), date: o.date || P.today(), subjectId: o.subjectId, topic: o.topic || '', mins: Math.max(1, Math.round(o.mins)), method: o.method || 'Reading', focus: +o.focus || 3, distr: +o.distr || 0, work: o.work || '', kind: o.kind || 'timer' };
    P.S.sessions.push(s);
    const xp = Math.round(s.mins * 0.8);
    const g = P.award('session:' + s.id, xp, 'Study session · ' + P.fmtMin(s.mins), { act: true, cap: ['study', 300] });
    if (!g && s.date === P.today() && xp > 0) P.toast('Daily XP cap reached — time logged, now rest well!', '');
    return s;
  };
  const editSession = (s, title) => P.form({
    title: title || 'Edit session', values: s, fields: P.sessionFields(s.subjectId), wide: true,
    extra: { label: 'Delete', onClick: () => P.confirm('Delete this session? Time will be removed from stats (XP already earned stays).', () => { P.S.sessions = P.S.sessions.filter(x => x.id !== s.id); P.render(); }) },
    onSubmit: v => { Object.assign(s, { ...v, mins: Math.max(1, v.mins), focus: +v.focus, distr: +v.distr || 0 }); P.render(); }
  });

  /* ---- timer machine ---- */
  const mkTimer = () => {
    const S = P.S, mode = S.ui.tmode || 'pomo', g = id => (document.getElementById(id) || {}).value;
    return { mode, phase: 'focus', dur: mode === 'pomo' ? S.settings.focus * 6e4 : 0, acc: 0, start: Date.now(), running: false, sid: g('t_subj') || S.ui.tsid || S.subjects[0]?.id, topic: g('t_topic') || '', method: g('t_method') || 'Reading', distr: 0, cycle: 0 };
  };
  const nextPhase = () => {
    const t = T(), s = P.S.settings;
    if (t.phase === 'focus') { t.cycle++; t.phase = t.cycle % s.cycles === 0 ? 'long' : 'short'; t.dur = (t.phase === 'long' ? s.long : s.short) * 6e4; }
    else { t.phase = 'focus'; t.dur = s.focus * 6e4; t.distr = 0; }
    t.acc = 0; t.start = Date.now(); t.running = t.phase !== 'focus' ? s.autoBreak : false;
  };
  const finishFocus = (mins, thenBreak) => {
    const t = T(), ses = createSession({ subjectId: t.sid, topic: t.topic, mins, method: t.method, focus: 4, distr: t.distr, kind: 'timer' });
    if (thenBreak) nextPhase(); else P.S.timer = null;
    P.render();
    editSession(ses, 'Session logged — add details');
  };
  P.timerTick = () => {
    const t = T(); if (!t) { P.timerTitle = ''; return; }
    const el = elapsed(), left = t.dur - el;
    if (t.mode === 'pomo' && t.running && left <= 0) {
      t.running = false; P.beep();
      if (t.phase === 'focus') { P.notify('Focus session complete', 'Great work — log it and take a break.'); finishFocus(t.dur / 6e4, true); }
      else { const w = P.S.well[P.today()] = P.S.well[P.today()] || {}; w.breaks = (w.breaks || 0) + 1; P.notify('Break over', 'Ready for the next focus session?'); P.toast('Break over — ready when you are'); nextPhase(); P.render(); }
      return;
    }
    const disp = document.getElementById('tdisp');
    P.timerTitle = t.running ? (t.mode === 'pomo' ? mmss(left) : hms(el)) : '';
    if (document.title !== undefined && t.running) document.title = P.timerTitle + ' · PROJUKTI';
    if (disp) {
      disp.textContent = t.mode === 'pomo' ? mmss(left) : hms(el);
      const ring = document.getElementById('tring'); if (ring && t.dur) ring.style.strokeDashoffset = String(603 * (1 - Math.min(1, el / t.dur)));
    }
  };

  P.views.timer = {
    render() {
      const S = P.S, t = T(), set = S.settings, td = P.today(), mode = S.ui.tmode || 'pomo';
      const sid = t ? t.sid : (S.ui.tsid || S.subjects[0]?.id);
      const ses = [...S.sessions].sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
      const byDay = {}; ses.slice(0, 40).forEach(x => (byDay[x.date] = byDay[x.date] || []).push(x));
      const phaseLabel = !t ? '' : t.phase === 'focus' ? 'Focus' : t.phase === 'short' ? 'Short break' : 'Long break';
      const left = t ? t.dur - elapsed() : 0;
      return `<header class="vh"><div><h1>Focus</h1><small class="muted">Today: ${P.fmtMin(P.minsOn(td))} of ${P.fmtMin(set.dailyGoal)} goal</small></div>
        <div class="vh-r"><button class="btn" data-a="manualSession">${P.icon('plus', 16)} Log session manually</button></div></header>
      <section class="grid g2w">
        <div class="card glass timer">
          ${!t ? `<div class="seg" role="tablist"><button class="${mode === 'pomo' ? 'on' : ''}" data-a="tmode" data-v="pomo">Pomodoro</button><button class="${mode === 'stop' ? 'on' : ''}" data-a="tmode" data-v="stop">Stopwatch</button></div>` : `<div class="phase ${t.phase}">${phaseLabel}${t.mode === 'pomo' ? ' · cycle ' + (t.cycle + 1) : ''}</div>`}
          <div class="ringwrap"><svg viewBox="0 0 220 220" class="ring" aria-hidden="true"><circle cx="110" cy="110" r="96" class="rbg"/><circle id="tring" cx="110" cy="110" r="96" class="rfg" stroke-dasharray="603" stroke-dashoffset="${t && t.dur ? 603 * (1 - Math.min(1, elapsed() / t.dur)) : 603}" transform="rotate(-90 110 110)"/></svg>
            <div class="tdisp" id="tdisp" role="timer" aria-live="off">${t ? (t.mode === 'pomo' ? mmss(left) : hms(elapsed())) : mode === 'pomo' ? mmss(set.focus * 6e4) : '00:00:00'}</div></div>
          <div class="tsel">
            <div class="fld half"><label for="t_subj">Subject</label><select id="t_subj" data-c="tsubj" ${t && t.phase === 'focus' && t.running ? 'disabled' : ''}>${P.subjOpts().map(([v, l]) => `<option value="${v}" ${v === sid ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
            <div class="fld half"><label for="t_topic">Chapter / topic</label><input id="t_topic" list="dl_tt" value="${esc(t ? t.topic : '')}" data-i="ttopic" autocomplete="off"><datalist id="dl_tt">${topicList(sid).map(x => `<option value="${esc(x)}">`).join('')}</datalist></div>
            <div class="fld"><label for="t_method">Study method</label><select id="t_method" data-c="tmethod">${P.METHODS.map(m => `<option ${t && t.method === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
          </div>
          <div class="tctl">${!t ? `<button class="btn primary lg" data-a="tstart">${P.icon('play', 18)} Start</button>` :
          `${t.running ? `<button class="btn lg" data-a="tpause">${P.icon('pause', 18)} Pause</button>` : `<button class="btn primary lg" data-a="tresume">${P.icon('play', 18)} ${t.acc ? 'Resume' : 'Start'}</button>`}
            ${t.phase === 'focus' ? `<button class="btn lg" data-a="tfinish">${P.icon('check', 18)} Finish & log</button><button class="btn ghost" data-a="tdistr">${P.icon('alert', 16)} Distracted (${t.distr})</button>` : `<button class="btn lg" data-a="tskip">Skip break</button>`}
            <button class="btn ghost danger" data-a="tdiscard">${P.icon('reset', 16)} Discard</button>`}</div>
          <small class="muted center">Timer keeps running if you switch tabs or reload. Sessions under 1 minute are not logged.</small>
        </div>
        <div class="card glass"><div class="ch"><h2>Pomodoro settings</h2></div>
          <div class="grid g3 tight">${[['focus', 'Focus (min)', 5, 90], ['short', 'Short break', 1, 30], ['long', 'Long break', 5, 60]].map(([k, l, mi, ma]) => `<div class="fld"><label for="s_${k}">${l}</label><input id="s_${k}" type="number" min="${mi}" max="${ma}" value="${set[k]}" data-c="setnum" data-k="${k}"></div>`).join('')}</div>
          <div class="fld"><label for="s_cycles">Long break every N sessions</label><input id="s_cycles" type="number" min="2" max="8" value="${set.cycles}" data-c="setnum" data-k="cycles"></div>
          <label class="chk"><input type="checkbox" ${set.autoBreak ? 'checked' : ''} data-c="setbool" data-k="autoBreak"> <span>Start breaks automatically</span></label>
          <label class="chk"><input type="checkbox" ${set.sound ? 'checked' : ''} data-c="setbool" data-k="sound"> <span>Play sound when a phase ends</span></label>
          <hr><div class="ch"><h3>Subject timers — tap to start</h3></div>
          <div class="chips">${S.subjects.map(s => `<button class="btn small subjbtn" style="--c:${s.color}" data-a="quickTimer" data-id="${s.id}"><i class="dot" style="background:${s.color}"></i>${esc(s.name)}<small>${P.fmtMin(P.minsOn(td, s.id))}</small></button>`).join('')}</div>
        </div>
      </section>
      <section class="card glass"><div class="ch"><h2>Session history</h2><small class="muted">${S.sessions.length} total</small></div>
        ${ses.length ? Object.entries(byDay).map(([d, arr]) => `<div class="day"><div class="dayh"><b>${P.fmtDate(d)}</b><small class="muted">${P.fmtMin(arr.reduce((a, x) => a + x.mins, 0))}</small></div>${arr.map(x => `<div class="row"><span class="dot" style="background:${P.subjColor(x.subjectId)}"></span><div class="grow"><b>${esc(P.subjName(x.subjectId))}${x.topic ? ' · ' + esc(x.topic) : ''}</b><small class="muted">${esc(x.method)} · focus ${x.focus}/5${x.distr ? ' · ' + x.distr + ' distractions' : ''}${x.work ? ' — ' + esc(x.work) : ''}</small></div><b>${P.fmtMin(x.mins)}</b><button class="icon-btn" data-a="editSession" data-id="${x.id}" aria-label="Edit session">${P.icon('edit', 16)}</button></div>`).join('')}</div>`).join('') : `<div class="empty"><img src="assets/illustrations/planet.svg" alt="" width="130"><p>No sessions yet. Start the timer above or log one manually.</p></div>`}
      </section>`;
    }
  };

  P.act.tmode = d => { P.S.ui.tmode = d.v; P.render(); };
  P.chg.tsubj = v => { P.S.ui.tsid = v; if (T()) T().sid = v; P.render(); };
  P.chg.tmethod = v => { P.S.ui.tmethod = v; if (T()) T().method = v; P.save(); };
  P.inp.ttopic = v => { if (T()) { T().topic = v; P.save(); } };
  P.chg.setnum = (v, el, d) => { const n = Math.max(+el.min || 1, Math.min(+el.max || 999, Math.round(+v) || +el.min)); P.S.settings[d.k] = n; P.render(); };
  P.chg.setbool = (v, el, d) => { P.S.settings[d.k] = v; P.save(); };
  P.act.tstart = () => { P.S.timer = mkTimer(); P.S.timer.running = true; P.S.timer.start = Date.now(); P.render(); };
  P.act.tpause = () => { const t = T(); t.acc += Date.now() - t.start; t.running = false; P.render(); };
  P.act.tresume = () => { const t = T(); t.start = Date.now(); t.running = true; P.render(); };
  P.act.tdistr = () => { T().distr++; P.render(); };
  P.act.tskip = () => { nextPhase(); P.render(); };
  P.act.tdiscard = () => P.confirm('Discard this timer without logging?', () => { P.S.timer = null; P.timerTitle = ''; P.render(); }, 'Discard');
  P.act.tfinish = () => {
    const t = T(), mins = Math.round(elapsed() / 6e4);
    if (mins < 1) { P.toast('Under a minute — not logged.'); P.S.timer = null; P.render(); return; }
    t.running = false; finishFocus(mins, t.mode === 'pomo');
  };
  P.act.quickTimer = d => {
    if (T() && !confirm('A timer is already active. Replace it?')) return;
    P.S.ui.tsid = d.id; P.S.timer = mkTimer(); P.S.timer.sid = d.id; P.S.timer.running = true; P.S.timer.start = Date.now(); P.render();
  };
  P.act.manualSession = () => P.form({
    title: 'Log a study session', wide: true, submit: 'Log session', fields: P.sessionFields(),
    values: { subjectId: P.S.subjects[0]?.id, mins: 30, focus: 3, distr: 0, date: P.today(), method: 'Reading' },
    onSubmit: v => { createSession({ ...v, kind: 'manual' }); P.render(); }
  });
  P.act.editSession = d => editSession(P.S.sessions.find(x => x.id === d.id));
})();
