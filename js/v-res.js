/* Resources workspace — notepad, reading list, formulas, links, file references, ambient sound, Explorer */
(function () {
  const P = window.P, esc = P.esc;
  const NK = { write: '✍️ Write in notebook', memorize: '🧠 Memorise', understand: '📖 Read to understand', revision: '⚡ Quick revision', general: '📝 General' };
  const READ = { todo: 'To read', doing: 'Reading', done: 'Finished' };

  P.noteRow = n => `<div class="row note" data-search="${esc((n.title + ' ' + n.body + ' ' + (n.chapter || '')).toLowerCase())}"><span class="dot" style="background:${P.subjColor(n.subjectId)}"></span><div class="grow"><b>${esc(n.title)}</b><small class="muted">${NK[n.kind] || NK.general} · ${esc(P.subjName(n.subjectId))}${n.chapter ? ' · ' + esc(n.chapter) : ''}</small><div class="prev">${P.nl(n.body.slice(0, 180))}${n.body.length > 180 ? '…' : ''}</div></div><button class="icon-btn" data-a="editNote" data-id="${n.id}" aria-label="Edit">${P.icon('edit', 15)}</button><button class="icon-btn" data-a="delNote" data-id="${n.id}" aria-label="Delete">${P.icon('trash', 15)}</button></div>`;

  const search = ph => `<div class="searchbox">${P.icon('search', 16)}<input type="search" placeholder="${ph}" data-i="rsearch" aria-label="Search"></div>`;

  P.views.resources = {
    render() {
      const S = P.S, tab = S.ui.rtab || 'notes', f = S.ui.rflt || '';
      const tabs = [['notes', 'Notepad'], ['read', 'Reading list'], ['formulas', 'Formulas'], ['links', 'Links & bookmarks'], ['refs', 'File references'], ['music', 'Study sound'], ['explore', 'Explorer']];
      const fs = `<select data-c="rflt" aria-label="Filter by subject"><option value="">All subjects</option>${P.subjOpts().map(([v, l]) => `<option value="${v}" ${f === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      let body = '';
      if (tab === 'notes') {
        const ns = S.notes.filter(n => !f || n.subjectId === f).sort((a, b) => b.upd - a.upd);
        body = `<div class="dnav">${search('Search notes…')}${fs}<select data-c="rnk" aria-label="Note type"><option value="">All types</option>${Object.entries(NK).map(([k, v]) => `<option value="${k}" ${S.ui.rnk === k ? 'selected' : ''}>${v}</option>`).join('')}</select><span class="grow"></span><button class="btn primary small" data-a="addNote">${P.icon('plus', 14)} New note</button></div><div class="card glass"><div class="list" id="rlist">${ns.filter(n => !S.ui.rnk || n.kind === S.ui.rnk).map(P.noteRow).join('') || '<div class="empty"><img src="assets/illustrations/books.svg" alt="" width="120"><p>No notes yet. Write exam-ready notes, memorisation lists and understanding notes here.</p></div>'}</div></div>`;
      } else if (tab === 'read') {
        const rs = S.reading.filter(r => !f || r.subjectId === f);
        body = `<div class="dnav">${fs}<span class="grow"></span><button class="btn primary small" data-a="addRead">${P.icon('plus', 14)} Add book / chapter</button></div><div class="card glass"><div class="list">${rs.map(r => `<div class="row ${r.status === 'done' ? 'done' : ''}"><div class="grow"><b>${esc(r.title)}</b><small class="muted">${esc(r.author || '—')} · ${esc(P.subjName(r.subjectId))}</small></div><button class="btn small" data-a="cycleRead" data-id="${r.id}">${READ[r.status]}</button><button class="icon-btn" data-a="delRead" data-id="${r.id}" aria-label="Delete">${P.icon('trash', 15)}</button></div>`).join('') || '<div class="empty small">Your reading list is empty.</div>'}</div></div>`;
      } else if (tab === 'formulas') {
        const fl = S.formulas.filter(x => !f || x.subjectId === f);
        body = `<div class="dnav">${search('Search formulas…')}${fs}<span class="grow"></span><button class="btn primary small" data-a="addFormula">${P.icon('plus', 14)} Add formula</button></div><div class="grid g3" id="rlist">${fl.map(x => `<div class="card glass formula" data-search="${esc((x.name + ' ' + x.text).toLowerCase())}"><small class="muted">${esc(P.subjName(x.subjectId))} · ${esc(x.name)}</small><code>${esc(x.text)}</code><div class="acts"><button class="icon-btn" data-a="copyF" data-id="${x.id}" aria-label="Copy">${P.icon('file', 15)}</button><button class="icon-btn" data-a="delFormula" data-id="${x.id}" aria-label="Delete">${P.icon('trash', 15)}</button></div></div>`).join('') || '<div class="card glass empty"><p>Build your formula library. Formulas typed into a topic\'s Exam Intelligence can be sent here in one click.</p></div>'}</div>`;
      } else if (tab === 'links') {
        const ls = [...S.links].sort((a, b) => (b.star || 0) - (a.star || 0));
        body = `<div class="dnav">${search('Search links…')}<span class="grow"></span><button class="btn primary small" data-a="addLink">${P.icon('plus', 14)} Add link</button></div><div class="card glass"><div class="list" id="rlist">${ls.map(l => `<div class="row" data-search="${esc((l.title + ' ' + l.cat).toLowerCase())}"><button class="icon-btn ${l.star ? 'on' : ''}" data-a="starLink" data-id="${l.id}" aria-label="Bookmark">${P.icon('star', 16)}</button><div class="grow"><b><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.title)}</a></b><small class="muted">${esc(l.cat)} · ${esc(l.url)}</small></div><button class="icon-btn" data-a="delLink" data-id="${l.id}" aria-label="Delete">${P.icon('trash', 15)}</button></div>`).join('') || '<div class="empty small">Save useful websites, videos and playlists.</div>'}</div></div>`;
      } else if (tab === 'refs') {
        body = `<div class="dnav"><span class="grow"></span><button class="btn primary small" data-a="addRef">${P.icon('plus', 14)} Add reference</button></div><div class="card glass"><small class="muted">Track where your PDFs, photos of notes and handouts live (a folder, Google Drive, a shelf…). PROJUKTI stores the reference only — not the file itself — so it stays fast and private.</small><div class="list">${S.refs.map(r => `<div class="row"><div class="grow"><b>${esc(r.title)}</b><small class="muted">${esc(r.type)} · ${esc(P.subjName(r.subjectId))} · 📍 ${esc(r.where)}</small></div><button class="icon-btn" data-a="delRef" data-id="${r.id}" aria-label="Delete">${P.icon('trash', 15)}</button></div>`).join('') || '<div class="empty small">No references yet.</div>'}</div></div>`;
      } else if (tab === 'music') {
        const a = P.ambient;
        body = `<div class="grid g2"><div class="card glass"><div class="ch"><h2>${P.icon('music', 18)} Focus sound generator</h2></div><p class="muted">Steady background sound masks distractions. Generated on your device — works offline.</p><div class="chips">${[['brown', 'Brown noise'], ['pink', 'Pink noise'], ['white', 'White noise'], ['rain', 'Rain-like']].map(([k, l]) => `<button class="btn ${a.kind === k ? 'primary' : ''}" data-a="ambient" data-k="${k}">${l}</button>`).join('')}<button class="btn ghost" data-a="ambient" data-k="">${P.icon('stop', 14)} Stop</button></div><div class="fld"><label for="avol">Volume</label><input id="avol" type="range" min="0.02" max="0.6" step="0.02" value="${S.ui.avol || 0.2}" data-c="avol"></div><small class="muted">Tip: keep volume low. Sound stops if you reload the page.</small></div>
        <div class="card glass"><div class="ch"><h2>Music links</h2><button class="btn small" data-a="addLink" data-cat="Music">${P.icon('plus', 14)} Add</button></div><div class="list">${S.links.filter(l => l.cat === 'Music').map(l => `<div class="row"><div class="grow"><b><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.title)}</a></b></div><button class="icon-btn" data-a="delLink" data-id="${l.id}">${P.icon('trash', 15)}</button></div>`).join('') || '<div class="empty small">Add your favourite study playlists (instrumental works best).</div>'}</div></div></div>`;
      } else {
        const es = S.explorer.filter(q => !f || q.subjectId === f);
        body = `<div class="dnav">${search('Search questions…')}${fs}<span class="grow"></span><button class="btn primary small" data-a="addExp">${P.icon('plus', 14)} New question</button></div><div class="card glass"><small class="muted">Curiosity lab: record things you wonder about, link them to syllabus topics, and mark them resolved when you find the answer.</small><div class="list" id="rlist">${es.map(q => { const rt = q.topicId && P.findTopic(q.topicId); return `<div class="row ${q.status === 'resolved' ? 'done' : ''}" data-search="${esc((q.q + ' ' + (q.answer || '')).toLowerCase())}"><button class="check ${q.status === 'resolved' ? 'on' : ''}" data-a="resolveExp" data-id="${q.id}" role="checkbox" aria-checked="${q.status === 'resolved'}" aria-label="Resolved">${q.status === 'resolved' ? P.icon('check', 14) : ''}</button><div class="grow"><b>${esc(q.q)}</b><small class="muted">${esc(P.subjName(q.subjectId))}${rt ? ' · connects to <a href="#" data-a="openLearn" data-s="' + rt.s.id + '" data-c="' + rt.c.id + '" data-id="' + rt.t.id + '">' + esc(rt.t.name) + '</a>' : ''}</small>${q.answer ? `<div class="prev">${P.nl(q.answer)}</div>` : ''}</div><button class="icon-btn" data-a="editExp" data-id="${q.id}">${P.icon('edit', 15)}</button><button class="icon-btn" data-a="delExp" data-id="${q.id}">${P.icon('trash', 15)}</button></div>`; }).join('') || '<div class="empty small">Nothing to investigate yet. What are you curious about today?</div>'}</div></div>`;
      }
      return `<header class="vh"><div><h1>Resources</h1><small class="muted">Notes, formulas, links and ideas — all searchable.</small></div></header><div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button role="tab" class="tab ${tab === id ? 'on' : ''}" data-a="rtab" data-v="${id}">${l}</button>`).join('')}</div>${body}`;
    }
  };

  P.act.rtab = d => { P.S.ui.rtab = d.v; P.render(); };
  P.chg.rflt = v => { P.S.ui.rflt = v; P.render(); };
  P.chg.rnk = v => { P.S.ui.rnk = v; P.render(); };
  P.inp.rsearch = v => { const q = v.toLowerCase().trim(); document.querySelectorAll('[data-search]').forEach(el => { el.style.display = !q || el.dataset.search.includes(q) ? '' : 'none'; }); };

  /* notes */
  const nFields = () => [{ k: 'title', label: 'Title', req: true }, { k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }, { k: 'kind', label: 'Note type', type: 'select', opts: Object.entries(NK), half: true }, { k: 'chapter', label: 'Chapter / topic (optional)' }, { k: 'body', label: 'Note', type: 'textarea', rows: 10, req: true }];
  P.act.addNote = d => P.form({ title: 'New note', wide: true, fields: nFields(), values: { subjectId: d.sid || P.S.ui.rflt || P.S.subjects[0]?.id, kind: 'general' }, onSubmit: v => { P.S.notes.push({ id: P.uid(), ...v, upd: Date.now() }); P.render(); } });
  P.act.editNote = d => { const n = P.S.notes.find(x => x.id === d.id); P.form({ title: 'Edit note', wide: true, fields: nFields(), values: n, onSubmit: v => { Object.assign(n, v, { upd: Date.now() }); P.render(); } }); };
  P.act.delNote = d => P.confirm('Delete this note?', () => { P.S.notes = P.S.notes.filter(x => x.id !== d.id); P.render(); });

  /* reading */
  P.act.addRead = () => P.form({ title: 'Add to reading list', fields: [{ k: 'title', label: 'Title', req: true }, { k: 'author', label: 'Author / source', half: true }, { k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }], onSubmit: v => { P.S.reading.push({ id: P.uid(), ...v, status: 'todo' }); P.render(); } });
  P.act.cycleRead = d => { const r = P.S.reading.find(x => x.id === d.id); r.status = { todo: 'doing', doing: 'done', done: 'todo' }[r.status]; if (r.status === 'done') P.award('read:' + r.id, 5, 'Finished reading', { act: true }); P.render(); };
  P.act.delRead = d => { P.S.reading = P.S.reading.filter(x => x.id !== d.id); P.render(); };

  /* formulas */
  P.act.addFormula = () => P.form({ title: 'Add formula', fields: [{ k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }, { k: 'name', label: 'Name', req: true, half: true }, { k: 'text', label: 'Formula', req: true, ph: 'e.g. Area of a circle = πr²' }], onSubmit: v => { P.S.formulas.push({ id: P.uid(), ...v }); P.render(); } });
  P.act.delFormula = d => { P.S.formulas = P.S.formulas.filter(x => x.id !== d.id); P.render(); };
  P.act.copyF = d => { const f = P.S.formulas.find(x => x.id === d.id); (navigator.clipboard ? navigator.clipboard.writeText(f.text) : Promise.reject()).then(() => P.toast('Copied'), () => P.toast('Copy not available here', 'warn')); };

  /* links */
  P.act.addLink = d => P.form({ title: 'Add link', fields: [{ k: 'title', label: 'Title', req: true }, { k: 'url', label: 'URL', type: 'url', req: true, ph: 'https://' }, { k: 'cat', label: 'Category', type: 'select', opts: ['Study', 'Video', 'Music', 'Tool', 'Other'] }], values: { cat: d.cat || 'Study' }, onSubmit: v => { P.S.links.push({ id: P.uid(), ...v, star: 0 }); P.render(); } });
  P.act.starLink = d => { const l = P.S.links.find(x => x.id === d.id); l.star = l.star ? 0 : 1; P.render(); };
  P.act.delLink = d => { P.S.links = P.S.links.filter(x => x.id !== d.id); P.render(); };

  /* file references */
  P.act.addRef = () => P.form({ title: 'Add file reference', fields: [{ k: 'title', label: 'Name', req: true, ph: 'e.g. Maths guide PDF' }, { k: 'type', label: 'Type', type: 'select', opts: ['PDF', 'Photo of notes', 'Handout', 'Past paper', 'Other'], half: true }, { k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }, { k: 'where', label: 'Where is it?', req: true, ph: 'e.g. Google Drive › Class 8 › Maths' }], onSubmit: v => { P.S.refs.push({ id: P.uid(), ...v }); P.render(); } });
  P.act.delRef = d => { P.S.refs = P.S.refs.filter(x => x.id !== d.id); P.render(); };

  /* sound */
  P.act.ambient = d => { if (d.k) { try { P.ambient.start(d.k, P.S.ui.avol || 0.2); } catch (e) { P.toast('Audio not available in this browser.', 'warn'); } } else P.ambient.stop(); P.render(); };
  P.chg.avol = v => { P.S.ui.avol = +v; P.ambient.vol(+v); P.save(); };

  /* explorer */
  const eOpts = () => [['', '— none —']].concat(P.topics().map(x => [x.t.id, x.s.name + ' → ' + x.t.name]));
  const xFields = () => [{ k: 'q', label: 'Question to investigate', type: 'textarea', rows: 2, req: true }, { k: 'subjectId', label: 'Subject', type: 'select', opts: P.subjOpts(), half: true }, { k: 'topicId', label: 'Connects to topic', type: 'select', opts: eOpts(), half: true }, { k: 'answer', label: 'What I found out', type: 'textarea', rows: 4 }];
  P.act.addExp = () => P.form({ title: 'New question', fields: xFields(), values: { subjectId: P.S.ui.rflt || P.S.subjects[0]?.id }, onSubmit: v => { P.S.explorer.push({ id: P.uid(), ...v, status: 'open' }); P.render(); } });
  P.act.editExp = d => { const q = P.S.explorer.find(x => x.id === d.id); P.form({ title: 'Edit question', fields: xFields(), values: q, onSubmit: v => { Object.assign(q, v); P.render(); } }); };
  P.act.delExp = d => { P.S.explorer = P.S.explorer.filter(x => x.id !== d.id); P.render(); };
  P.act.resolveExp = d => {
    const q = P.S.explorer.find(x => x.id === d.id);
    if (q.status !== 'resolved' && (q.answer || '').length < 15) { P.toast('Write what you found out (a sentence or two) before marking it resolved.', 'warn'); P.act.editExp(d); return; }
    q.status = q.status === 'resolved' ? 'open' : 'resolved';
    if (q.status === 'resolved') P.award('exp:' + q.id, 10, 'Question explored', { act: true }); P.render();
  };
})();
