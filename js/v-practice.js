/* Practice — flashcards (spaced repetition), question bank, error log */
(function () {
  const P = window.P, esc = P.esc;
  const BOX_DAYS = [0, 1, 2, 4, 8, 16];
  const QT = [['mcq', 'MCQ'], ['short', 'Short question'], ['creative', 'Creative / structured']];

  P.views.practice = {
    render() {
      const S = P.S, tab = S.ui.prtab || 'cards', td = P.today(), flt = S.ui.pflt || '';
      const tabs = [['cards', 'Flashcards'], ['qs', 'Question bank'], ['err', 'Error log']];
      let body = '';
      if (tab === 'cards') {
        const rv = S.ui.rv, due = S.cards.filter(c => c.due <= td && (!flt || c.subjectId === flt));
        if (rv && rv.q.length) {
          const c = S.cards.find(x => x.id === rv.q[rv.i]);
          body = c ? `<div class="card glass review"><small class="muted">${rv.i + 1} / ${rv.q.length} · ${esc(P.subjName(c.subjectId))} · box ${c.box}</small>
            <div class="flash ${rv.flip ? 'flip' : ''}" data-a="flip" tabindex="0" role="button" aria-label="Flip card"><div class="ff">${P.nl(c.front)}</div>${rv.flip ? `<hr><div class="fb">${P.nl(c.back)}</div>` : '<small class="muted">Tap to reveal the answer — try to recall first</small>'}</div>
            <div class="tctl">${rv.flip ? `<button class="btn lg danger" data-a="grade" data-ok="0">Not yet</button><button class="btn lg primary" data-a="grade" data-ok="1">${P.icon('check', 18)} I knew it</button>` : `<button class="btn lg" data-a="flip">Show answer</button>`}<button class="btn ghost" data-a="endReview">End session</button></div></div>` : '';
        } else {
          body = `<div class="dnav"><select data-c="pflt" aria-label="Filter by subject"><option value="">All subjects</option>${P.subjOpts().map(([v, l]) => `<option value="${v}" ${flt === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><span class="grow"></span><button class="btn small" data-a="addCard">${P.icon('plus', 14)} New card</button><button class="btn primary small" data-a="startReview" ${due.length ? '' : 'disabled'}>${P.icon('play', 14)} Review ${due.length} due</button></div>
          <div class="grid g4 stats"><div class="stat glass"><small class="muted">Total cards</small><b>${S.cards.length}</b></div><div class="stat glass"><small class="muted">Due today</small><b>${due.length}</b></div><div class="stat glass"><small class="muted">Mastered (box 5)</small><b>${S.cards.filter(c => c.box >= 5).length}</b></div><div class="stat glass"><small class="muted">Spacing</small><b class="sm">1·2·4·8·16 d</b></div></div>
          <div class="card glass"><div class="list">${S.cards.filter(c => !flt || c.subjectId === flt).map(c => `<div class="row"><span class="dot" style="background:${P.subjColor(c.subjectId)}"></span><div class="grow"><b>${esc(c.front)}</b><small class="muted">${esc(c.back)}</small></div>${P.chip('box ' + c.box, 'var(--acc)')}<small class="muted">${c.due <= td ? 'due' : P.fmtDate(c.due)}</small><button class="icon-btn" data-a="editCard" data-id="${c.id}">${P.icon('edit', 15)}</button><button class="icon-btn" data-a="delCard" data-id="${c.id}">${P.icon('trash', 15)}</button></div>`).join('') || `<div class="empty"><img src="assets/illustrations/atom.svg" alt="" width="120"><p>No flashcards yet. Add one, or write “question :: answer” lines in the OLC Protocol workspace.</p></div>`}</div></div>`;
        }
      } else if (tab === 'qs') {
        const pr = S.ui.qp, qs = S.questions.filter(q => !flt || q.subjectId === flt);
        if (pr) {
          const q = S.questions.find(x => x.id === pr.id);
          body = q ? `<div class="card glass review"><div class="ch"><h2>${QT.find(x => x[0] === q.type)[1]}${q.marks ? ' · ' + q.marks + ' marks' : ''}</h2><small class="muted">${esc(P.subjName(q.subjectId))}</small></div><p class="qtext">${P.nl(q.text)}</p>
            ${q.type === 'mcq' ? `<div class="opts">${P.lines(q.options).map((o, i) => `<button class="opt ${pr.pick === i ? (i === +q.answerIdx ? 'ok' : 'bad') : (pr.pick != null && i === +q.answerIdx ? 'ok' : '')}" data-a="pickOpt" data-n="${i}" ${pr.pick != null ? 'disabled' : ''}>${String.fromCharCode(65 + i)}. ${esc(o)}</button>`).join('')}</div>` :
              (pr.show ? `<div class="notice">${P.icon('check', 18)}<div><b>Model answer</b><br>${P.nl(q.answer)}</div></div><div class="tctl"><button class="btn danger" data-a="selfGrade" data-ok="0">Missed it</button><button class="btn primary" data-a="selfGrade" data-ok="1">Got it</button></div>` : `<button class="btn" data-a="showAns">Reveal answer</button>`)}
            ${pr.pick != null ? `<div class="tctl"><button class="btn primary" data-a="nextQ">Next question</button></div>` : ''}<div class="tctl"><button class="btn ghost" data-a="endPractice">End practice</button></div></div>` : '';
        } else {
          body = `<div class="dnav"><select data-c="pflt" aria-label="Filter by subject"><option value="">All subjects</option>${P.subjOpts().map(([v, l]) => `<option value="${v}" ${flt === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><span class="grow"></span><button class="btn small" data-a="addQ">${P.icon('plus', 14)} Add question</button><button class="btn primary small" data-a="startPractice" ${qs.length ? '' : 'disabled'}>${P.icon('play', 14)} Practise ${qs.length}</button></div>
          <div class="card glass"><div class="list">${qs.map(q => { const a = q.hist || [], ok = a.filter(x => x.ok).length; return `<div class="row"><span class="dot" style="background:${P.subjColor(q.subjectId)}"></span><div class="grow"><b>${esc(q.text.slice(0, 110))}</b><small class="muted">${QT.find(x => x[0] === q.type)[1]} · ${a.length ? P.pct(ok, a.length) + '% correct (' + a.length + ' tries)' : 'not attempted'}</small></div><button class="icon-btn" data-a="editQ" data-id="${q.id}">${P.icon('edit', 15)}</button><button class="icon-btn" data-a="delQ" data-id="${q.id}">${P.icon('trash', 15)}</button></div>`; }).join('') || '<div class="empty"><p>Build your own bank of MCQs, short and creative questions from class tests and textbooks, then practise them here.</p></div>'}</div></div>`;
        }
      } else {
        const showAll = S.ui.errAll, es = S.errors.filter(e => (showAll || !e.resolved) && (!flt || e.subjectId === flt));
        const cats = {}; S.errors.forEach(e => cats[e.cause] = (cats[e.cause] || 0) + 1);
        body = `<div class="dnav"><select data-c="pflt" aria-label="Filter by subject"><option value="">All subjects</option>${P.subjOpts().map(([v, l]) => `<option value="${v}" ${flt === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><label class="chk"><input type="checkbox" ${showAll ? 'checked' : ''} data-c="errAll"> <span>Show resolved</span></label><span class="grow"></span><button class="btn primary small" data-a="addErr">${P.icon('plus', 14)} Log a mistake</button></div>
        ${S.errors.length ? `<div class="chips">${Object.entries(cats).map(([k, v]) => P.chip(k + ' · ' + v, 'var(--acc2)')).join('')}</div>` : ''}
        <div class="card glass"><div class="list">${es.map(e => `<div class="row ${e.resolved ? 'done' : ''}"><button class="check ${e.resolved ? 'on' : ''}" data-a="resolveErr" data-id="${e.id}" role="checkbox" aria-checked="${!!e.resolved}" aria-label="Mark resolved">${e.resolved ? P.icon('check', 14) : ''}</button><div class="grow"><b>${esc(e.what)}</b><small class="muted">${esc(P.subjName(e.subjectId))} · ${esc(e.cause)} · Fix: ${esc(e.fix || '—')}</small></div><button class="icon-btn" data-a="editErr" data-id="${e.id}">${P.icon('edit', 15)}</button><button class="icon-btn" data-a="delErr" data-id="${e.id}">${P.icon('trash', 15)}</button></div>`).join('') || '<div class="empty"><p>No mistakes logged. When you get something wrong, log what happened and how to fix it — that is where the marks are.</p></div>'}</div></div>`;
      }
      return `<header class="vh"><div><h1>Practice</h1><small class="muted">Active recall, question practice and learning from mistakes.</small></div></header><div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button role="tab" class="tab ${tab === id ? 'on' : ''}" data-a="prtab" data-v="${id}">${l}</button>`).join('')}</div>${body}`;
    }
  };
  P.act.prtab = d => { P.S.ui.prtab = d.v; P.S.ui.rv = null; P.S.ui.qp = null; P.render(); };
  P.chg.pflt = v => { P.S.ui.pflt = v; P.render(); };
  P.chg.errAll = v => { P.S.ui.errAll = v; P.render(); };

  /* flashcards */
  const cardFields = () => [{ k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }, { k: 'front', label: 'Question / prompt', type: 'textarea', rows: 2, req: true }, { k: 'back', label: 'Answer', type: 'textarea', rows: 3, req: true }];
  P.act.addCard = () => P.form({ title: 'New flashcard', fields: cardFields(), values: { subjectId: P.S.ui.pflt || P.S.subjects[0]?.id }, onSubmit: v => { P.S.cards.push({ id: P.uid(), ...v, box: 1, due: P.today() }); P.render(); } });
  P.act.editCard = d => { const c = P.S.cards.find(x => x.id === d.id); P.form({ title: 'Edit flashcard', fields: cardFields(), values: c, onSubmit: v => { Object.assign(c, v); P.render(); } }); };
  P.act.delCard = d => { P.S.cards = P.S.cards.filter(x => x.id !== d.id); P.render(); };
  P.act.startReview = () => { const f = P.S.ui.pflt, q = P.S.cards.filter(c => c.due <= P.today() && (!f || c.subjectId === f)).map(c => c.id).sort(() => Math.random() - 0.5); P.S.ui.rv = { q, i: 0, flip: false }; P.render(); };
  P.act.flip = () => { P.S.ui.rv.flip = true; P.render(); };
  P.act.endReview = () => { P.S.ui.rv = null; P.render(); };
  P.act.grade = d => {
    const rv = P.S.ui.rv, c = P.S.cards.find(x => x.id === rv.q[rv.i]), td = P.today();
    if (+d.ok) { c.box = Math.min(5, c.box + 1); P.award('fc:' + c.id + ':' + td, 2, 'Flashcard recalled', { act: true, cap: ['fc', 60] }); } else c.box = 1;
    c.due = P.addDays(td, BOX_DAYS[c.box]);
    rv.i++; rv.flip = false;
    if (rv.i >= rv.q.length) { P.S.ui.rv = null; P.toast('Review complete — nice recall work!'); }
    P.render();
  };

  /* question bank */
  const qFields = () => [{ k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }, { k: 'type', label: 'Type', type: 'select', opts: QT, half: true },
    { k: 'text', label: 'Question', type: 'textarea', rows: 3, req: true }, { k: 'options', label: 'MCQ options (one per line; MCQ only)', type: 'textarea', rows: 4 },
    { k: 'answerIdx', label: 'Correct option number (MCQ: 1 = first line)', type: 'number', min: 1, max: 8, half: true }, { k: 'marks', label: 'Marks', type: 'number', min: 0, max: 100, half: true },
    { k: 'answer', label: 'Model answer / explanation', type: 'textarea', rows: 3 }];
  const qSave = (q, v) => {
    if (v.type === 'mcq') { const n = P.lines(v.options).length; if (n < 2) { P.toast('MCQ needs at least 2 options.', 'warn'); return false; } if (!v.answerIdx || v.answerIdx > n) { P.toast('Choose which option number is correct.', 'warn'); return false; } }
    Object.assign(q, v, { answerIdx: v.type === 'mcq' ? v.answerIdx - 1 : 0 }); return true;
  };
  P.act.addQ = () => P.form({ title: 'Add question', wide: true, fields: qFields(), values: { subjectId: P.S.ui.pflt || P.S.subjects[0]?.id, type: 'mcq' }, onSubmit: v => { const q = { id: P.uid(), hist: [] }; if (qSave(q, v) === false) return false; P.S.questions.push(q); P.render(); } });
  P.act.editQ = d => { const q = P.S.questions.find(x => x.id === d.id); P.form({ title: 'Edit question', wide: true, fields: qFields(), values: { ...q, answerIdx: q.type === 'mcq' ? q.answerIdx + 1 : '' }, onSubmit: v => { const c = { ...q }; if (qSave(c, v) === false) return false; Object.assign(q, c); P.render(); } }); };
  P.act.delQ = d => { P.S.questions = P.S.questions.filter(x => x.id !== d.id); P.render(); };
  const nextId = () => { const f = P.S.ui.pflt, pool = P.S.questions.filter(q => !f || q.subjectId === f); return pool.length ? pool[Math.floor(Math.random() * pool.length)].id : null; };
  P.act.startPractice = () => { const id = nextId(); if (id) { P.S.ui.qp = { id }; P.render(); } };
  P.act.endPractice = () => { P.S.ui.qp = null; P.render(); };
  P.act.nextQ = () => { P.S.ui.qp = { id: nextId() }; P.render(); };
  P.act.showAns = () => { P.S.ui.qp.show = true; P.render(); };
  const record = ok => { const pr = P.S.ui.qp, q = P.S.questions.find(x => x.id === pr.id); (q.hist = q.hist || []).push({ date: P.today(), ok }); if (ok) P.award('q:' + q.id + ':' + P.today(), 2, 'Question practised', { act: true, cap: ['q', 40] }); };
  P.act.pickOpt = d => { const pr = P.S.ui.qp, q = P.S.questions.find(x => x.id === pr.id); pr.pick = +d.n; record(+d.n === +q.answerIdx); P.render(); };
  P.act.selfGrade = d => { record(!!+d.ok); P.act.nextQ(); };

  /* error log */
  const eFields = () => [{ k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }, { k: 'cause', label: 'Why did it happen?', type: 'select', opts: ['Concept gap', 'Careless slip', 'Forgot / memory', 'Ran out of time', 'Misread question', 'Other'], half: true },
    { k: 'what', label: 'What went wrong?', type: 'textarea', rows: 3, req: true }, { k: 'fix', label: 'Correct method / how to avoid it', type: 'textarea', rows: 3 }];
  P.act.addErr = () => P.form({ title: 'Log a mistake', fields: eFields(), values: { subjectId: P.S.ui.pflt || P.S.subjects[0]?.id }, onSubmit: v => { P.S.errors.push({ id: P.uid(), ...v, resolved: false, date: P.today() }); P.render(); } });
  P.act.editErr = d => { const e = P.S.errors.find(x => x.id === d.id); P.form({ title: 'Edit entry', fields: eFields(), values: e, onSubmit: v => { Object.assign(e, v); P.render(); } }); };
  P.act.delErr = d => { P.S.errors = P.S.errors.filter(x => x.id !== d.id); P.render(); };
  P.act.resolveErr = d => { const e = P.S.errors.find(x => x.id === d.id); e.resolved = !e.resolved; if (e.resolved) P.award('err:' + e.id, 8, 'Mistake fixed', { act: true, cap: ['err', 40] }); P.render(); };
})();
