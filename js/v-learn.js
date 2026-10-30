/* OLC Teaching & Note-Making Protocol workspace */
(function () {
  const P = window.P, esc = P.esc;
  const PRIO = { high: ['High priority', 'var(--bad)'], med: ['Medium priority', 'var(--warn)'], low: ['Low priority', 'var(--muted)'] };

  const sel = () => {
    const S = P.S, L = S.ui.learn = S.ui.learn || {};
    let s = P.subj(L.sid) || S.subjects[0]; L.sid = s ? s.id : '';
    let c = s && (s.chapters.find(x => x.id === L.cid) || s.chapters[0]); L.cid = c ? c.id : '';
    let t = c && (c.topics.find(x => x.id === L.tid) || c.topics[0]); L.tid = t ? t.id : '';
    return { s, c, t };
  };

  P.revSheet = (sid, cid) => {
    const s = P.subj(sid), chs = s.chapters.filter(c => !cid || c.id === cid);
    let h = `<h1>Quick revision sheet — ${esc(s.name)}</h1><p class="m">Generated ${P.fmtDate(P.today())} · PROJUKTI</p>`;
    let any = false;
    chs.forEach(c => {
      const ts = [...c.topics].sort((a, b) => (P.PRIO[a.intel.prio] - P.PRIO[b.intel.prio]) || (b.weak - a.weak));
      if (!ts.length) return; any = true;
      h += `<h2>${esc(c.name)}</h2>`;
      ts.forEach(t => {
        const i = t.intel, o = t.out, blocks = [['Definitions', i.defs], ['Formulas', i.formulas], ['Examples', i.examples], ['Diagram', i.diagram], ['Common mistakes', i.mistakes], ['Memory trick', i.mnemonic], ['Memorise', o.memo], ['Write in notebook', o.write]].filter(b => b[1]);
        h += `<p><b>${esc(t.name)}</b> <span class="m">· ${PRIO[i.prio][0]}${i.marks ? ' · ' + esc(i.marks) + ' marks' : ''}${i.prob ? ' · ' + esc(i.prob) + '% likely' : ''} · mastery ${P.MASTERY[t.mastery]}${t.weak ? ' · ⚠ weak' : ''}</span></p>` + (blocks.length ? `<ul>${blocks.map(b => `<li><b>${b[0]}:</b> ${P.nl(b[1])}</li>`).join('')}</ul>` : '<p class="m">No exam notes recorded yet.</p>');
      });
    });
    return any ? h : h + '<p>Add topics and exam notes first.</p>';
  };
  P.act.quickRevSheet = d => P.showReport('Revision sheet', P.revSheet(d.id));
  P.act.chapRevSheet = d => { const L = P.S.ui.learn; P.showReport('Revision sheet', P.revSheet(L.sid, L.cid)); };

  P.views.learn = {
    render() {
      const S = P.S, { s, c, t } = sel();
      const head = `<header class="vh"><div><h1>OLC Protocol</h1><small class="muted">Basics → explanation → textbook → school questions → board questions → higher level.</small></div></header>`;
      if (!s || !s.chapters.length) return head + `<div class="card glass empty"><img src="assets/illustrations/brain.svg" alt="" width="140"><p>Add chapters and topics to a subject first, then work through each topic here.</p><button class="btn primary" data-a="go" data-v="subjects">Go to Subjects</button></div>`;
      const selectors = `<div class="card glass sels"><div class="fld"><label for="l_s">Subject</label><select id="l_s" data-c="lsub">${S.subjects.map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
        <div class="fld"><label for="l_c">Chapter</label><select id="l_c" data-c="lchap">${s.chapters.map(x => `<option value="${x.id}" ${c && x.id === c.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
        <div class="fld"><label for="l_t">Topic</label><select id="l_t" data-c="ltop">${c && c.topics.length ? c.topics.map(x => `<option value="${x.id}" ${t && x.id === t.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('') : '<option>— no topics —</option>'}</select></div></div>`;
      if (!t) return head + selectors + `<div class="card glass empty"><p>This chapter has no topics yet.</p><button class="btn primary" data-a="go" data-v="subjects">Add topics</button></div>`;
      const i = t.intel, o = t.out;
      const check = c.topics.map(x => `<tr><td><button class="linkish" data-a="pickTopic" data-id="${x.id}">${esc(x.name)}</button></td>${x.stages.map((v, k) => `<td><button class="check sm ${v ? 'on' : ''}" data-a="stage" data-id="${x.id}" data-n="${k}" aria-label="${P.STAGES[k].n} for ${esc(x.name)}">${v ? P.icon('check', 11) : ''}</button></td>`).join('')}<td>${P.revChip(x)}</td></tr>`).join('');
      return head + selectors + `
      <section class="card glass"><div class="ch"><h2>${esc(t.name)}</h2><div class="acts">${P.chip(PRIO[i.prio][0], PRIO[i.prio][1])}${i.marks ? P.chip(i.marks + ' marks', 'var(--acc)') : ''}${i.prob ? P.chip(i.prob + '% exam probability', 'var(--acc2)') : ''}<button class="btn small" data-a="revise" data-id="${t.id}">${P.icon('reset', 14)} Mark revised</button></div></div>
        <div class="pipe">${P.STAGES.map((st, k) => `<button class="stage ${t.stages[k] ? 'done' : ''}" data-a="stage" data-id="${t.id}" data-n="${k}" aria-pressed="${!!t.stages[k]}"><span class="sn">${t.stages[k] ? P.icon('check', 16) : k + 1}</span><b>${st.n}</b><small>${st.d}</small></button>`).join('')}</div>
        <small class="muted">Stage 6 is optional. A topic counts as “covered” when stages 1–3 are done. XP is awarded once per stage.</small></section>

      <section class="grid g2w">
        <div class="card glass"><div class="ch"><h2>${P.icon('pen', 18)} Where does each part go?</h2></div>
          <div class="fld"><label for="o_write">✍️ WRITE in your notebook <small>(exam-ready answers, steps, diagrams)</small></label><textarea id="o_write" rows="4" data-c="out" data-k="write">${esc(o.write)}</textarea></div>
          <div class="fld"><label for="o_memo">🧠 MEMORISE <small>(definitions, formulas, dates — use “question :: answer” per line to make flashcards)</small></label><textarea id="o_memo" rows="4" data-c="out" data-k="memo" placeholder="Define speed :: distance ÷ time">${esc(o.memo)}</textarea></div>
          <div class="fld"><label for="o_read">📖 READ for understanding <small>(concepts, stories, background)</small></label><textarea id="o_read" rows="3" data-c="out" data-k="read">${esc(o.read)}</textarea></div>
          <div class="ca"><button class="btn small" data-a="makeCards">${P.icon('cards', 14)} Make flashcards from “Memorise”</button><button class="btn small ghost" data-a="makeFormulas">Add intel formulas to library</button></div></div>
        <div class="card glass"><div class="ch"><h2>${P.icon('target', 18)} Exam intelligence</h2><button class="btn small" data-a="editIntel" data-id="${t.id}">${P.icon('edit', 14)} Edit</button></div>
          ${[['Definitions', i.defs], ['Formulas', i.formulas], ['Examples', i.examples], ['Diagram idea', i.diagram], ['Common mistakes', i.mistakes], ['Memory technique', i.mnemonic]].map(([l, v]) => `<div class="intel"><small class="muted">${l}</small><div>${v ? P.nl(v) : '<span class="muted">—</span>'}</div></div>`).join('')}
        </div>
      </section>

      <section class="card glass"><div class="ch"><h2>${P.icon('check', 18)} Chapter completion checklist — ${esc(c.name)}</h2><button class="btn small" data-a="chapRevSheet">Quick revision sheet</button></div>
        <div class="tscroll"><table class="tbl"><thead><tr><th>Topic</th>${P.STAGES.map((st, k) => `<th title="${st.n}">${k + 1}</th>`).join('')}<th>Revision</th></tr></thead><tbody>${check}</tbody></table></div>
        <small class="muted">1 Basics · 2 Explanation · 3 Textbook · 4 School Qs · 5 Board Qs · 6 Higher level</small></section>`;
    }
  };

  P.chg.lsub = v => { P.S.ui.learn = { sid: v }; P.render(); };
  P.chg.lchap = v => { P.S.ui.learn.cid = v; P.S.ui.learn.tid = ''; P.render(); };
  P.chg.ltop = v => { P.S.ui.learn.tid = v; P.render(); };
  P.act.pickTopic = d => { P.S.ui.learn.tid = d.id; P.render(true); };
  P.chg.out = (v, el, d) => { const { t } = sel(); t.out[d.k] = v; P.save(); };
  P.act.stage = d => {
    const f = P.findTopic(d.id), t = f.t, k = +d.n;
    t.stages[k] = t.stages[k] ? 0 : 1;
    if (t.stages[k]) {
      P.award('stage:' + t.id + ':' + k, k === 5 ? 12 : 8, P.STAGES[k].n + ': ' + t.name.slice(0, 22), { act: true, cap: ['stage', 100] });
      if (P.covered(t) && !t.nextRev) t.nextRev = P.addDays(P.today(), 1);
    }
    P.render();
  };
  P.act.editIntel = d => {
    const t = P.findTopic(d.id).t;
    P.form({
      title: 'Exam intelligence — ' + t.name, wide: true, values: { ...t.intel, mark: t.intel.marks }, fields: [
        { k: 'prio', label: 'Importance', type: 'select', opts: [['high', 'High'], ['med', 'Medium'], ['low', 'Low']], half: true },
        { k: 'prob', label: 'Exam probability (%)', type: 'number', min: 0, max: 100, half: true },
        { k: 'marks', label: 'Marks typically asked', half: true, ph: 'e.g. 4 or 2+4' },
        { k: 'defs', label: 'Definitions', type: 'textarea', rows: 3 }, { k: 'formulas', label: 'Formulas (one per line)', type: 'textarea', rows: 3 },
        { k: 'examples', label: 'Examples', type: 'textarea', rows: 3 }, { k: 'diagram', label: 'Diagram to draw', type: 'textarea', rows: 2 },
        { k: 'mistakes', label: 'Common mistakes', type: 'textarea', rows: 3 }, { k: 'mnemonic', label: 'Memorisation technique / mnemonic', type: 'textarea', rows: 2 }],
      onSubmit: v => { delete v.mark; Object.assign(t.intel, v); P.render(); }
    });
  };
  P.act.makeCards = () => {
    const { s, t } = sel(); let n = 0;
    P.lines(t.out.memo).forEach(l => {
      const [q, a] = l.split('::').map(x => x && x.trim());
      if (q && a && !P.S.cards.some(c => c.front === q && c.subjectId === s.id)) { P.S.cards.push({ id: P.uid(), subjectId: s.id, topicId: t.id, front: q, back: a, box: 1, due: P.today() }); n++; }
    });
    P.toast(n ? n + ' flashcard' + (n > 1 ? 's' : '') + ' created' : 'No new “question :: answer” lines found.', n ? '' : 'warn'); P.render();
  };
  P.act.makeFormulas = () => {
    const { s, t } = sel(); let n = 0;
    P.lines(t.intel.formulas).forEach(l => { if (!P.S.formulas.some(f => f.text === l && f.subjectId === s.id)) { P.S.formulas.push({ id: P.uid(), subjectId: s.id, name: t.name, text: l }); n++; } });
    P.toast(n ? n + ' formula(s) added to the library' : 'No new formulas to add.', n ? '' : 'warn');
  };
})();
