/* Planner — daily/weekly planner, homework, exam-prep generator, timetable, templates, recurring tasks */
(function () {
  const P = window.P, esc = P.esc;
  const KINDS = [['task', 'Study task'], ['homework', 'Homework'], ['assignment', 'Assignment'], ['lesson', 'Lesson plan'], ['prep', 'Exam preparation']];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const kindName = k => (KINDS.find(x => x[0] === k) || [0, 'Task'])[1];

  P.taskRow = (x, overdue) => `<div class="row task ${x.done ? 'done' : ''}" ${x.date ? `draggable="true" data-drag="${x.id}"` : ''}>
    <button class="check ${x.done ? 'on' : ''}" data-a="toggleTask" data-id="${x.id}" role="checkbox" aria-checked="${!!x.done}" aria-label="Mark ${esc(x.title)} ${x.done ? 'not done' : 'done'}">${x.done ? P.icon('check', 14) : ''}</button>
    <div class="grow"><b>${esc(x.title)}</b><small class="muted">${x.time ? x.time + ' · ' : ''}${x.kind && x.kind !== 'task' ? kindName(x.kind) + ' · ' : ''}${x.subjectId ? esc(P.subjName(x.subjectId)) : 'General'}${overdue ? ' · <span class="bad">overdue since ' + P.fmtDate(x.date) + '</span>' : ''}</small></div>
    <span class="pri ${x.prio}" title="Priority: ${x.prio}"></span>
    <button class="icon-btn" title="Edit" data-a="editTask" data-id="${x.id}">${P.icon('edit', 15)}</button>
    <button class="icon-btn" title="Move to tomorrow" data-a="moveTask" data-id="${x.id}">${P.icon('chev', 15)}</button>
    <button class="icon-btn" title="Delete" data-a="delTask" data-id="${x.id}">${P.icon('trash', 15)}</button></div>`;

  const weekStart = d => { const dow = new Date(d + 'T12:00:00').getDay(); return P.addDays(d, -((dow + 1) % 7)); };

  P.views.planner = {
    render() {
      const S = P.S, tab = S.ui.ptab || 'day', td = P.today(), pd = S.ui.pdate || td;
      const tabs = [['day', 'Day'], ['week', 'Week'], ['hw', 'Homework'], ['prep', 'Exam prep'], ['tt', 'Timetable'], ['tpl', 'Templates & recurring']];
      let body = '';
      if (tab === 'day') {
        const tasks = P.tasksOn(pd), wd = new Date(pd + 'T12:00:00').getDay();
        const classes = S.timetable.filter(e => +e.day === wd).sort((a, b) => a.start.localeCompare(b.start));
        body = `<div class="dnav"><button class="icon-btn" data-a="pshift" data-n="-1" aria-label="Previous day">${P.icon('chev', 18).replace('<svg', '<svg style="transform:rotate(180deg)"')}</button><input type="date" value="${pd}" data-c="pdate" aria-label="Pick date"><button class="icon-btn" data-a="pshift" data-n="1" aria-label="Next day">${P.icon('chev', 18)}</button><button class="btn small ghost" data-a="ptoday">Today</button><span class="grow"></span><button class="btn primary small" data-a="addTask" data-date="${pd}">${P.icon('plus', 14)} Add task</button></div>
        <div class="grid g2w"><div class="card glass"><div class="ch"><h2>${P.fmtDate(pd, { weekday: 'long', day: 'numeric', month: 'long' })}</h2><small class="muted">${tasks.filter(x => x.done).length}/${tasks.length} done</small></div>
          <div class="list">${tasks.length ? tasks.map(x => P.taskRow(x)).join('') : '<div class="empty small">No tasks for this day. Add one, apply a template, or generate an exam plan.</div>'}</div></div>
          <div class="card glass"><div class="ch"><h2>${P.icon('calendar', 18)} Timetable · ${DAYS[wd]}</h2></div><div class="list">${classes.length ? classes.map(e => `<div class="row"><b>${e.start}–${e.end}</b><div class="grow">${esc(e.title)}<small class="muted">${e.kind === 'study' ? 'Study block' : 'Class'}${e.note ? ' · ' + esc(e.note) : ''}</small></div></div>`).join('') : '<div class="empty small">Nothing in your timetable for this weekday.</div>'}</div></div></div>`;
      } else if (tab === 'week') {
        const ws = weekStart(pd);
        body = `<div class="dnav"><button class="icon-btn" data-a="pshift" data-n="-7" aria-label="Previous week">${P.icon('chev', 18).replace('<svg', '<svg style="transform:rotate(180deg)"')}</button><b>${P.fmtDate(ws)} – ${P.fmtDate(P.addDays(ws, 6))}</b><button class="icon-btn" data-a="pshift" data-n="7" aria-label="Next week">${P.icon('chev', 18)}</button><button class="btn small ghost" data-a="ptoday">This week</button><span class="grow"></span><small class="muted">Drag tasks between days to reschedule</small></div>
        <div class="week">${[0, 1, 2, 3, 4, 5, 6].map(i => { const d = P.addDays(ws, i), ts = P.tasksOn(d); return `<div class="wcol glass ${d === td ? 'today' : ''}" data-drop="${d}"><div class="wh"><b>${P.fmtDate(d, { weekday: 'short' })}</b><small>${P.fmtDate(d, { day: 'numeric', month: 'short' })}</small><button class="icon-btn" data-a="addTask" data-date="${d}" aria-label="Add task on ${d}">${P.icon('plus', 14)}</button></div>${ts.map(x => `<div class="wt ${x.done ? 'done' : ''}" draggable="true" data-drag="${x.id}" style="--c:${P.subjColor(x.subjectId)}"><button class="check sm ${x.done ? 'on' : ''}" data-a="toggleTask" data-id="${x.id}" aria-label="Toggle done">${x.done ? P.icon('check', 11) : ''}</button><span data-a="editTask" data-id="${x.id}">${esc(x.title)}</span></div>`).join('') || '<small class="muted">—</small>'}</div>`; }).join('')}</div>`;
      } else if (tab === 'hw') {
        const hw = S.tasks.filter(x => !x.series && (x.kind === 'homework' || x.kind === 'assignment'));
        const sec = (t, arr, ov) => `<div class="card glass"><div class="ch"><h2>${t}</h2><small class="muted">${arr.length}</small></div><div class="list">${arr.length ? arr.map(x => P.taskRow(x, ov)).join('') : '<div class="empty small">Nothing here.</div>'}</div></div>`;
        body = `<div class="dnav"><span class="grow"></span><button class="btn primary small" data-a="addTask" data-date="${td}" data-kind="homework">${P.icon('plus', 14)} Homework</button><button class="btn small" data-a="addTask" data-date="${td}" data-kind="assignment">${P.icon('plus', 14)} Assignment</button></div>` +
          sec('Overdue', hw.filter(x => !x.done && x.date < td).sort((a, b) => a.date.localeCompare(b.date)), true) +
          sec('Upcoming', hw.filter(x => !x.done && x.date >= td).sort((a, b) => a.date.localeCompare(b.date))) +
          sec('Completed', hw.filter(x => x.done).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15));
      } else if (tab === 'prep') {
        const pend = P.topics().filter(x => !P.covered(x.t)).length;
        const sched = P.topics().filter(x => P.covered(x.t) && x.t.nextRev).sort((a, b) => a.t.nextRev.localeCompare(b.t.nextRev)).slice(0, 14);
        body = `<div class="grid g2w"><div class="card glass"><div class="ch"><h2>${P.icon('target', 18)} Exam preparation planner</h2></div>
          <p class="muted">Spreads every <b>not-yet-covered topic</b> (${pend} now) across the days left before the exam, leaving the last two days for revision. Existing plan tasks are never duplicated.</p>
          <div class="inlineform"><div class="fld"><label for="g_exam">Exam</label><select id="g_exam">${S.exams.map(e => `<option value="${e.id}">${esc(e.name)} ${e.date ? '(' + P.fmtDate(e.date) + ')' : '(no date)'}</option>`).join('')}</select></div>
          <div class="fld"><label for="g_per">Max new topics per day</label><input id="g_per" type="number" min="1" max="6" value="2"></div>
          <button class="btn primary" type="button" data-a="genPlan">Generate plan</button></div></div>
          <div class="card glass"><div class="ch"><h2>${P.icon('reset', 18)} Revision schedule</h2></div><div class="list">${sched.length ? sched.map(x => `<div class="row"><span class="dot" style="background:${x.s.color}"></span><div class="grow"><b>${esc(x.t.name)}</b><small class="muted">${esc(x.s.name)}</small></div>${P.revChip(x.t)}</div>`).join('') : '<div class="empty small">Mark topics as revised to build a spaced revision schedule (1 → 3 → 7 → 14 → 30 days).</div>'}</div></div></div>`;
      } else if (tab === 'tt') {
        body = `<div class="dnav"><span class="grow"></span><button class="btn primary small" data-a="addTT">${P.icon('plus', 14)} Add entry</button></div><div class="grid g3">${[6, 0, 1, 2, 3, 4, 5].map(d => { const es = S.timetable.filter(e => +e.day === d).sort((a, b) => a.start.localeCompare(b.start)); return `<div class="card glass"><div class="ch"><h2>${DAYS[d]}</h2></div><div class="list">${es.length ? es.map(e => `<div class="row"><b>${e.start}–${e.end}</b><div class="grow">${esc(e.title)}<small class="muted">${e.kind === 'study' ? 'Study block' : 'Class'}${e.note ? ' · ' + esc(e.note) : ''}</small></div><button class="icon-btn" data-a="delTT" data-id="${e.id}" aria-label="Delete">${P.icon('trash', 15)}</button></div>`).join('') : '<small class="muted">Free</small>'}</div></div>`; }).join('')}</div>`;
      } else {
        const masters = S.tasks.filter(x => x.series);
        body = `<div class="grid g2"><div class="card glass"><div class="ch"><h2>Reusable templates</h2><button class="btn small" data-a="saveTpl">${P.icon('plus', 14)} Save selected day</button></div><div class="list">${S.templates.length ? S.templates.map(t => `<div class="row"><div class="grow"><b>${esc(t.name)}</b><small class="muted">${t.tasks.length} task${t.tasks.length === 1 ? '' : 's'}</small></div><button class="btn small" data-a="applyTpl" data-id="${t.id}">Apply to ${P.fmtDate(pd)}</button><button class="icon-btn" data-a="delTpl" data-id="${t.id}" aria-label="Delete">${P.icon('trash', 15)}</button></div>`).join('') : '<div class="empty small">Plan a good day, then save it as a template to reuse.</div>'}</div><small class="muted">“Save selected day” uses the date chosen in the Day tab (${P.fmtDate(pd)}).</small></div>
        <div class="card glass"><div class="ch"><h2>Recurring tasks</h2><button class="btn small" data-a="addTask" data-date="${td}" data-recur="1">${P.icon('plus', 14)} New recurring</button></div><div class="list">${masters.length ? masters.map(m => `<div class="row"><div class="grow"><b>${esc(m.title)}</b><small class="muted">${m.recur} · from ${P.fmtDate(m.date)} · ${esc(P.subjName(m.subjectId))}</small></div><button class="icon-btn" data-a="editTask" data-id="${m.id}">${P.icon('edit', 15)}</button><button class="icon-btn" data-a="delTask" data-id="${m.id}">${P.icon('trash', 15)}</button></div>`).join('') : '<div class="empty small">No recurring tasks. Create “Daily revision” once and it appears every day.</div>'}</div></div></div>`;
      }
      return `<header class="vh"><div><h1>Planner</h1><small class="muted">Tasks, homework, timetable and exam plans in one place.</small></div></header><div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button role="tab" class="tab ${tab === id ? 'on' : ''}" data-a="ptab" data-v="${id}">${l}</button>`).join('')}</div>${body}`;
    }
  };

  P.act.ptab = d => { P.S.ui.ptab = d.v; P.render(); };
  P.act.pshift = d => { P.S.ui.pdate = P.addDays(P.S.ui.pdate || P.today(), +d.n); P.render(); };
  P.act.ptoday = () => { P.S.ui.pdate = P.today(); P.render(); };
  P.chg.pdate = v => { if (v) { P.S.ui.pdate = v; P.render(); } };

  /* ---- tasks ---- */
  const taskFields = (isNew, recur) => [
    { k: 'title', label: 'Task', req: true, ph: 'e.g. Maths ch.3 – exercise 3.2' },
    { k: 'kind', label: 'Type', type: 'select', opts: KINDS, half: true },
    { k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts('— General —'), half: true },
    { k: 'date', label: 'Date', type: 'date', req: true, half: true },
    { k: 'time', label: 'Time (optional)', type: 'time', half: true },
    { k: 'prio', label: 'Priority', type: 'select', opts: [['high', 'High'], ['med', 'Medium'], ['low', 'Low']], half: true }
  ].concat(isNew ? [{ k: 'recur', label: 'Repeat', type: 'select', opts: [['', 'Does not repeat'], ['daily', 'Every day'], ['weekdays', 'Weekdays (Sat–Thu)'], ['weekly', 'Every week']], half: true, def: recur ? 'daily' : '' }] : [])
    .concat([{ k: 'notes', label: 'Notes', type: 'textarea', rows: 2 }]);

  P.act.addTask = d => P.form({
    title: d.recur ? 'New recurring task' : 'Add task', submit: 'Add', fields: taskFields(true, d.recur),
    values: { kind: d.kind || 'task', date: d.date || P.today(), prio: 'med', recur: d.recur ? 'daily' : '' },
    onSubmit: v => {
      const base = { id: P.uid(), title: v.title, kind: v.kind, subjectId: v.subjectId, date: v.date, time: v.time, prio: v.prio, notes: v.notes, done: false };
      if (v.recur) { P.S.tasks.push({ ...base, series: true, recur: v.recur, skip: [] }); P.ensureRecurring(); P.toast('Recurring task created'); }
      else P.S.tasks.push(base);
      P.render();
    }
  });
  P.act.editTask = d => {
    const x = P.S.tasks.find(t => t.id === d.id); if (!x) return;
    P.form({
      title: x.series ? 'Edit recurring task' : 'Edit task', values: x, fields: taskFields(false).concat(x.series ? [{ k: 'recur', label: 'Repeat', type: 'select', opts: [['daily', 'Every day'], ['weekdays', 'Weekdays (Sat–Thu)'], ['weekly', 'Every week']] }] : []),
      onSubmit: v => {
        Object.assign(x, { title: v.title, kind: v.kind, subjectId: v.subjectId, date: v.date, time: v.time, prio: v.prio, notes: v.notes });
        if (x.series) { x.recur = v.recur; const td = P.today(); P.S.tasks = P.S.tasks.filter(t => !(t.seriesId === x.id && !t.done && t.date >= td)); P.ensureRecurring(); }
        P.render();
      }
    });
  };
  P.act.toggleTask = d => {
    const x = P.S.tasks.find(t => t.id === d.id); if (!x) return;
    x.done = !x.done; x.doneAt = x.done ? P.today() : '';
    if (x.done) P.award('task:' + x.id, x.prio === 'high' ? 15 : 10, 'Task done: ' + x.title.slice(0, 28), { act: true, cap: ['task', 150] });
    P.render();
  };
  P.act.moveTask = d => { const x = P.S.tasks.find(t => t.id === d.id); x.date = P.addDays(x.date, 1); P.toast('Moved to ' + P.fmtDate(x.date)); P.render(); };
  P.act.delTask = d => {
    const x = P.S.tasks.find(t => t.id === d.id); if (!x) return;
    P.confirm(x.series ? 'Delete this recurring task and its upcoming unfinished copies?' : 'Delete this task?', () => {
      if (x.series) { const td = P.today(); P.S.tasks = P.S.tasks.filter(t => t.id !== x.id && !(t.seriesId === x.id && !t.done && t.date >= td)); }
      else { if (x.seriesId) { const m = P.S.tasks.find(t => t.id === x.seriesId); if (m) (m.skip = m.skip || []).push(x.date); } P.S.tasks = P.S.tasks.filter(t => t.id !== x.id); }
      P.render();
    });
  };

  /* ---- exam plan generator ---- */
  P.act.genPlan = () => {
    const S = P.S, ex = S.exams.find(e => e.id === document.getElementById('g_exam').value), per = Math.max(1, Math.min(6, +document.getElementById('g_per').value || 2));
    if (!ex || !ex.date) { P.toast('Set this exam\'s date in Settings first.', 'warn'); return; }
    const td = P.today(), last = P.addDays(ex.date, -2), days = P.diff(td, last) + 1;
    if (days < 1) { P.toast('The exam is too close for a new-topic plan — focus on revision.', 'warn'); return; }
    const planned = new Set(S.tasks.filter(t => t.planKey && !t.done).map(t => t.planKey));
    const bySub = S.subjects.map(s => s.chapters.flatMap(c => c.topics.filter(t => !P.covered(t) && (t.exam === 'both' || t.exam === ex.id) && !planned.has(t.id)).map(t => ({ s, c, t }))));
    const q = []; let more = true; // round-robin across subjects
    while (more) { more = false; bySub.forEach(a => { if (a.length) { q.push(a.shift()); more = true; } }); }
    if (!q.length) { P.toast('Nothing to schedule — every topic is covered or already planned.'); return; }
    const perDay = Math.min(per, Math.ceil(q.length / days)) || 1, cap = days * per;
    let n = 0;
    q.slice(0, cap).forEach((it, i) => {
      const d = P.addDays(td, Math.floor(i / perDay));
      S.tasks.push({ id: P.uid(), title: it.s.name + ': ' + it.t.name, kind: 'prep', subjectId: it.s.id, date: d, time: '', prio: it.t.diff >= 4 ? 'high' : 'med', notes: 'Chapter: ' + it.c.name, done: false, planKey: it.t.id });
      n++;
    });
    P.toast(n + ' topic tasks scheduled' + (q.length > cap ? ' (' + (q.length - cap) + ' more than fit — raise the per-day limit)' : ''));
    P.S.ui.ptab = 'week'; P.S.ui.pdate = td; P.render();
  };

  /* ---- timetable ---- */
  P.act.addTT = () => P.form({
    title: 'Timetable entry', fields: [
      { k: 'day', label: 'Day', type: 'select', opts: DAYS.map((d, i) => [i, d]), half: true }, { k: 'kind', label: 'Type', type: 'select', opts: [['class', 'Class'], ['study', 'Study block']], half: true },
      { k: 'start', label: 'Start', type: 'time', req: true, half: true }, { k: 'end', label: 'End', type: 'time', req: true, half: true },
      { k: 'title', label: 'Subject / activity', req: true }, { k: 'note', label: 'Room / note' }], values: { day: 6, kind: 'class' },
    onSubmit: v => { if (v.end <= v.start) { P.toast('End time must be after start time.', 'warn'); return false; } P.S.timetable.push({ id: P.uid(), ...v, day: +v.day }); P.render(); }
  });
  P.act.delTT = d => { P.S.timetable = P.S.timetable.filter(e => e.id !== d.id); P.render(); };

  /* ---- templates ---- */
  P.act.saveTpl = () => {
    const pd = P.S.ui.pdate || P.today(), ts = P.tasksOn(pd);
    if (!ts.length) { P.toast('The selected day has no tasks to save.', 'warn'); return; }
    P.form({ title: 'Save day as template', fields: [{ k: 'name', label: 'Template name', req: true, ph: 'e.g. Weekday study routine' }], onSubmit: v => { P.S.templates.push({ id: P.uid(), name: v.name, tasks: ts.map(t => ({ title: t.title, kind: t.kind, subjectId: t.subjectId, time: t.time, prio: t.prio, notes: t.notes })) }); P.render(); } });
  };
  P.act.applyTpl = d => { const t = P.S.templates.find(x => x.id === d.id), pd = P.S.ui.pdate || P.today(); t.tasks.forEach(x => P.S.tasks.push({ id: P.uid(), ...x, date: pd, done: false })); P.toast('Template applied to ' + P.fmtDate(pd)); P.render(); };
  P.act.delTpl = d => { P.S.templates = P.S.templates.filter(x => x.id !== d.id); P.render(); };
})();
