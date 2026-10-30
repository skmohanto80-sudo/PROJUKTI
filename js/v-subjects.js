/* Subjects — customisable subject pages, chapters, topics, mastery, weak lists */
(function () {
  const P = window.P, esc = P.esc;

  P.revChip = t => {
    const td = P.today();
    if (!P.covered(t)) return P.chip('Not covered yet', 'var(--muted)');
    if (!t.nextRev) return P.chip('Needs 1st revision', 'var(--warn)');
    if (t.nextRev < td) return P.chip('Overdue ' + P.diff(t.nextRev, td) + 'd', 'var(--bad)');
    if (t.nextRev === td) return P.chip('Revise today', 'var(--warn)');
    return P.chip('Next ' + P.fmtDate(t.nextRev), 'var(--ok)');
  };
  const stars = n => '★'.repeat(n) + '<span class="off">' + '★'.repeat(5 - n) + '</span>';

  P.topicRow = (s, c, t, compact) => `<div class="trow ${t.weak ? 'weak' : ''}">
    <div class="grow"><b>${esc(t.name)}</b>
      <div class="meta"><span class="stars" title="Difficulty ${t.diff}/5">${stars(t.diff)}</span>${P.revChip(t)}${t.weak ? P.chip('Weak', 'var(--bad)') : ''}${t.exam !== 'both' ? P.chip(t.exam === 'final' ? 'Final' : 'Scholarship', 'var(--acc2)') : ''}<small class="muted">${t.stages.filter(Boolean).length}/6 stages</small></div></div>
    <select class="mini" data-c="mastery" data-id="${t.id}" aria-label="Mastery of ${esc(t.name)}">${P.MASTERY.map((m, i) => `<option value="${i}" ${t.mastery === i ? 'selected' : ''}>${m}</option>`).join('')}</select>
    ${compact ? '' : `<button class="icon-btn" title="Mark revised" data-a="revise" data-id="${t.id}">${P.icon('reset', 16)}</button>
    <button class="icon-btn ${t.weak ? 'on' : ''}" title="Toggle weak topic" data-a="toggleWeak" data-id="${t.id}">${P.icon('flag', 16)}</button>
    <button class="icon-btn" title="Open in OLC Protocol" data-a="openLearn" data-s="${s.id}" data-c="${c.id}" data-id="${t.id}">${P.icon('brain', 16)}</button>
    <button class="icon-btn" title="Edit" data-a="editTopic" data-id="${t.id}">${P.icon('edit', 16)}</button>
    <button class="icon-btn" title="Delete" data-a="delTopic" data-id="${t.id}">${P.icon('trash', 16)}</button>`}</div>`;

  P.views.subjects = {
    render() {
      const S = P.S, sid = S.ui.subj, s = P.subj(sid);
      if (!s) {
        return `<header class="vh"><div><h1>Subjects</h1><small class="muted">Open a subject to manage chapters, topics, mastery and revision.</small></div><div class="vh-r"><button class="btn" data-a="addSubject">${P.icon('plus', 16)} New subject</button></div></header>
        <section class="grid g3">${S.subjects.map(s => { const x = P.subjectStats(s); return `<article class="card glass subj" data-a="selSubject" data-id="${s.id}" tabindex="0" style="--c:${s.color}">
          <div class="ch"><h2>${esc(s.name)}</h2></div>
          ${P.bar(x.covPct, s.color)}<div class="kv"><span>${x.cov}/${x.total} topics covered</span><b>${x.covPct}%</b></div>
          <div class="kv"><span>Avg mastery</span><b>${x.total ? P.MASTERY[Math.round(x.mastery)] : '—'}</b></div>
          <div class="kv"><span>Weak topics</span><b class="${x.weak ? 'bad' : ''}">${x.weak}</b></div>
          <div class="kv"><span>Overdue revisions</span><b class="${x.overdue ? 'bad' : ''}">${x.overdue}</b></div>
          <div class="kv"><span>Time studied</span><b>${P.fmtMin(x.mins)}</b></div></article>`; }).join('')}</section>`;
      }
      const tab = S.ui.stab || 'syllabus', x = P.subjectStats(s);
      const tabs = [['syllabus', 'Syllabus'], ['weak', 'Weak topics'], ['notes', 'Notes'], ['res', 'Resources']];
      let body = '';
      if (tab === 'syllabus') {
        body = (s.chapters.length ? s.chapters.map(c => {
          const cs = c.topics, cov = cs.filter(P.covered).length;
          return `<div class="card glass chap"><div class="ch"><h2>${esc(c.name)}</h2><div class="acts"><small class="muted">${cov}/${cs.length} covered</small>
            <button class="icon-btn" title="Add topic" data-a="addTopic" data-c="${c.id}">${P.icon('plus', 16)}</button>
            <button class="icon-btn" title="Add many topics" data-a="bulkTopics" data-c="${c.id}">${P.icon('file', 16)}</button>
            <button class="icon-btn" title="Rename chapter" data-a="editChapter" data-c="${c.id}">${P.icon('edit', 16)}</button>
            <button class="icon-btn" title="Delete chapter" data-a="delChapter" data-c="${c.id}">${P.icon('trash', 16)}</button></div></div>
            ${P.bar(P.pct(cov, cs.length), s.color)}
            <div class="list">${cs.length ? cs.map(t => P.topicRow(s, c, t)).join('') : '<div class="empty small">No topics yet — add the first one.</div>'}</div></div>`;
        }).join('') : `<div class="card glass empty"><img src="assets/illustrations/books.svg" alt="" width="140"><p>No chapters yet. Add chapters one by one, or paste a whole list (one per line).</p><div><button class="btn primary" data-a="bulkChapters">${P.icon('file', 16)} Paste chapter list</button> <button class="btn" data-a="addChapter">${P.icon('plus', 16)} Add chapter</button></div></div>`);
      } else if (tab === 'weak') {
        const items = s.chapters.flatMap(c => c.topics.filter(t => t.weak || (P.covered(t) && t.mastery <= 1) || (t.nextRev && t.nextRev < P.today() && P.covered(t))).map(t => ({ c, t })));
        body = `<div class="card glass"><div class="ch"><h2>${P.icon('flag', 18)} Weak & overdue topics</h2></div><small class="muted">Includes topics you flagged, low-mastery topics you have covered, and overdue revisions.</small><div class="list">${items.length ? items.map(i => P.topicRow(s, i.c, i.t)).join('') : '<div class="empty small">Nothing weak right now. Keep revising on schedule.</div>'}</div></div>`;
      } else if (tab === 'notes') {
        const ns = S.notes.filter(n => n.subjectId === s.id);
        body = `<div class="card glass"><div class="ch"><h2>${P.icon('pen', 18)} Notes</h2><button class="btn small" data-a="addNote" data-sid="${s.id}">${P.icon('plus', 14)} New note</button></div><div class="list">${ns.length ? ns.map(P.noteRow).join('') : '<div class="empty small">No notes for this subject yet.</div>'}</div></div>`;
      } else {
        body = `<div class="card glass"><div class="ch"><h2>${P.icon('link', 18)} Subject resources</h2><button class="btn small" data-a="addSubRes">${P.icon('plus', 14)} Add</button></div><div class="list">${s.resources.length ? s.resources.map(r => `<div class="row"><div class="grow"><b>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>` : esc(r.title)}</b><small class="muted">${esc(r.type || 'Resource')}${r.note ? ' · ' + esc(r.note) : ''}</small></div><button class="icon-btn" data-a="delSubRes" data-id="${r.id}">${P.icon('trash', 16)}</button></div>`).join('') : '<div class="empty small">Add textbook chapters, videos, guides or links for this subject.</div>'}</div></div>`;
      }
      return `<header class="vh" style="--c:${s.color}"><div><button class="btn small ghost" data-a="backSubjects">← All subjects</button><h1><i class="dot lg" style="background:${s.color}"></i> ${esc(s.name)}</h1>
        <small class="muted">${x.cov}/${x.total} topics covered · avg mastery ${x.total ? P.MASTERY[Math.round(x.mastery)] : '—'} · ${P.fmtMin(x.mins)} studied</small></div>
        <div class="vh-r"><button class="btn" data-a="addChapter">${P.icon('plus', 16)} Chapter</button><button class="btn ghost" data-a="bulkChapters">${P.icon('file', 16)} Paste list</button><button class="btn ghost" data-a="quickRevSheet" data-id="${s.id}">Revision sheet</button></div></header>
        <div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button role="tab" class="tab ${tab === id ? 'on' : ''}" data-a="stab" data-v="${id}">${l}</button>`).join('')}</div>${body}`;
    }
  };

  const cur = () => P.subj(P.S.ui.subj);
  const findChapter = id => cur().chapters.find(c => c.id === id);

  P.act.selSubject = d => { P.S.ui.subj = d.id; P.S.ui.stab = 'syllabus'; P.render(true); };
  P.act.backSubjects = () => { P.S.ui.subj = null; P.render(true); };
  P.act.stab = d => { P.S.ui.stab = d.v; P.render(); };
  P.act.addSubject = () => P.form({ title: 'New subject', fields: [{ k: 'name', label: 'Subject name', req: true }, { k: 'color', label: 'Colour', type: 'color', def: P.COLORS[P.S.subjects.length % 10] }], onSubmit: v => { P.S.subjects.push(P.mkSubject(v.name, v.color)); P.render(); } });
  P.act.addChapter = () => P.form({ title: 'Add chapter', fields: [{ k: 'name', label: 'Chapter name', req: true, ph: 'e.g. Chapter 3 – Algebraic Expressions' }], onSubmit: v => { cur().chapters.push({ id: P.uid(), name: v.name, topics: [] }); P.render(); } });
  P.act.bulkChapters = () => P.form({ title: 'Paste chapter list', submit: 'Add chapters', fields: [{ k: 'list', label: 'One chapter per line', type: 'textarea', rows: 8, req: true, ph: 'Chapter 1\nChapter 2\n…' }], onSubmit: v => { P.lines(v.list).forEach(n => cur().chapters.push({ id: P.uid(), name: n, topics: [] })); P.toast('Chapters added'); P.render(); } });
  P.act.editChapter = d => { const c = findChapter(d.c); P.form({ title: 'Rename chapter', values: c, fields: [{ k: 'name', label: 'Chapter name', req: true }], onSubmit: v => { c.name = v.name; P.render(); } }); };
  P.act.delChapter = d => P.confirm('Delete this chapter and all its topics?', () => { const s = cur(); s.chapters = s.chapters.filter(c => c.id !== d.c); P.render(); });

  const topicFields = () => [
    { k: 'name', label: 'Topic name', req: true },
    { k: 'diff', label: 'Difficulty', type: 'select', opts: [[1, '1 – Very easy'], [2, '2 – Easy'], [3, '3 – Medium'], [4, '4 – Hard'], [5, '5 – Very hard']], half: true },
    { k: 'exam', label: 'Counts for', type: 'select', opts: P.EXAMKIND, half: true }
  ];
  P.act.addTopic = d => P.form({ title: 'Add topic', values: { diff: 3, exam: 'both' }, fields: topicFields(), onSubmit: v => { const t = P.mkTopic(v.name); t.diff = +v.diff; t.exam = v.exam; findChapter(d.c).topics.push(t); P.render(); } });
  P.act.bulkTopics = d => P.form({ title: 'Paste topic list', submit: 'Add topics', fields: [{ k: 'list', label: 'One topic per line', type: 'textarea', rows: 8, req: true }], onSubmit: v => { P.lines(v.list).forEach(n => findChapter(d.c).topics.push(P.mkTopic(n))); P.toast('Topics added'); P.render(); } });
  P.act.editTopic = d => { const f = P.findTopic(d.id); P.form({ title: 'Edit topic', values: f.t, fields: topicFields(), onSubmit: v => { f.t.name = v.name; f.t.diff = +v.diff; f.t.exam = v.exam; P.render(); } }); };
  P.act.delTopic = d => P.confirm('Delete this topic?', () => { const f = P.findTopic(d.id); f.c.topics = f.c.topics.filter(t => t.id !== d.id); P.render(); });
  P.act.toggleWeak = d => { const t = P.findTopic(d.id).t; t.weak = !t.weak; P.render(); };
  P.act.openLearn = d => { P.S.ui.learn = { sid: d.s, cid: d.c, tid: d.id }; P.go('learn'); };
  P.chg.mastery = (v, el, d) => {
    const t = P.findTopic(d.id).t; t.mastery = +v;
    for (let i = 1; i <= t.mastery; i++) P.award('mastery:' + t.id + ':' + i, 4, 'Mastery: ' + t.name, { act: true, cap: ['mastery', 40] });
    P.render();
  };
  P.act.addSubRes = () => P.form({ title: 'Add resource', fields: [{ k: 'title', label: 'Title', req: true }, { k: 'type', label: 'Type', type: 'select', opts: ['Textbook', 'Video', 'Guide / PDF', 'Website', 'Teacher notes', 'Other'], half: true }, { k: 'url', label: 'Link (optional)', type: 'url', half: true }, { k: 'note', label: 'Note' }], onSubmit: v => { cur().resources.push({ id: P.uid(), ...v }); P.render(); } });
  P.act.delSubRes = d => { const s = cur(); s.resources = s.resources.filter(r => r.id !== d.id); P.render(); };
})();
