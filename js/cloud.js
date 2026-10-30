/* PROJUKTI cloud — OLC account login, latest-wins sync (never loses input), shared XP */
(function () {
  const P = window.P, esc = P.esc, CK = 'projukti.cloud';
  P.cloud = (() => { try { return JSON.parse(localStorage.getItem(CK)) || {}; } catch (e) { return {}; } })();
  const saveC = () => { try { localStorage.setItem(CK, JSON.stringify(P.cloud)); } catch (e) { /* ignore */ } };
  P.cloudApi = () => (P.cloud.api || window.PROJUKTI_API || '').replace(/\/+$/, '');
  P.cloudOn = () => !!(P.cloud.token && P.cloudApi());
  let status = 'idle', statusMsg = '', busy = false, timer = null, applying = false;
  const setStatus = (s, m) => { status = s; statusMsg = m || ''; const el = document.getElementById('cchip'); if (el) el.outerHTML = P.cloudChip(); };

  const COLL = ['subjects', 'sessions', 'tasks', 'templates', 'notes', 'cards', 'formulas', 'links', 'reading', 'refs', 'timetable', 'explorer', 'questions', 'mocks', 'errors', 'habits', 'medals', 'exams'];
  const strip = (S, withT) => { const o = { ...S }; delete o.ui; delete o.timer; if (!withT) delete o._t; return o; };
  const str = () => JSON.stringify(strip(P.S));

  /* ---- merge: union by id, honour deletions on either side, newer side wins conflicts ---- */
  P.mergeState = (remote, local) => {
    const rNewer = (remote._t || 0) > (local._t || 0), newer = rNewer ? remote : local, older = rNewer ? local : remote, out = { ...older, ...newer };
    COLL.forEach(c => {
      const R = new Map((remote[c] || []).map(x => [x.id, x])), L = new Map((local[c] || []).map(x => [x.id, x])), base = new Set((P.cloud.base || {})[c] || []);
      const res = [], seen = new Set();
      [...(rNewer ? R : L).keys(), ...(rNewer ? L : R).keys()].forEach(id => {
        if (seen.has(id)) return; seen.add(id);
        const inR = R.has(id), inL = L.has(id);
        if (inR && inL) res.push((rNewer ? R : L).get(id));
        else if (inR) { if (!base.has(id)) res.push(R.get(id)); }      // known before => deleted locally
        else if (!base.has(id)) res.push(L.get(id));                    // known before => deleted elsewhere
      });
      out[c] = res;
    });
    ['well', 'hlog'].forEach(k => { const o = {}; new Set([...Object.keys(remote[k] || {}), ...Object.keys(local[k] || {})]).forEach(d => { o[d] = Object.assign({}, (older[k] || {})[d], (newer[k] || {})[d]); }); out[k] = o; });
    out.ledger = Object.assign({}, remote.ledger, local.ledger);
    out.profile = Object.assign({}, older.profile, newer.profile); out.settings = Object.assign({}, older.settings, newer.settings);
    out.ui = local.ui; out.timer = local.timer; out._t = Math.max(remote._t || 0, local._t || 0);
    return out;
  };
  const apply = m => { applying = true; P.S = m; P.load2(); P.save(); P.applyTheme(); applying = false; };
  const recordBase = () => { P.cloud.base = {}; COLL.forEach(c => { P.cloud.base[c] = (P.S[c] || []).map(x => x.id); }); };

  /* ---- http ---- */
  const api = async (method, path, body, auth = true) => {
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 25000);
    try {
      const r = await fetch(P.cloudApi() + path, { method, signal: ac.signal, headers: { 'Content-Type': 'application/json', ...(auth && P.cloud.token ? { Authorization: 'Bearer ' + P.cloud.token } : {}) }, body: body ? JSON.stringify(body) : undefined });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { const e = new Error(j.error || 'Server error (' + r.status + ')'); e.status = r.status; e.data = j; if (r.status === 401 && auth) { P.cloud.token = ''; saveC(); } throw e; }
      return j;
    } catch (e) { if (e.status === undefined) { e.status = 0; e.message = e.name === 'AbortError' ? 'Server timed out' : 'Cannot reach the server'; } throw e; }
    finally { clearTimeout(to); }
  };

  /* ---- sync ---- */
  P.cloudSchedule = () => {
    if (!P.cloudOn() || applying) return;
    const s = str(); if (s === P.cloud.lastLocal) return;
    P.cloud.lastLocal = s; P.S._t = Date.now(); saveC();
    setStatus('pending'); clearTimeout(timer); timer = setTimeout(() => P.cloudSync(), 2500);
  };
  const pushXP = async () => {
    const sent = P.cloud.xpSent = P.cloud.xpSent || {};
    const todo = Object.entries(P.S.ledger).filter(([k, e]) => !sent[k] && e.xp > 0).map(([key, e]) => ({ key, xp: e.xp, label: e.label, day: e.day, ts: e.ts }));
    for (let i = 0; i < todo.length; i += 500) { const part = todo.slice(i, i + 500); await api('POST', '/api/xp', { entries: part }); part.forEach(e => { sent[e.key] = 1; }); }
    const x = await api('GET', '/api/xp');
    P.cloud.otherXP = Math.max(0, (x.total || 0) - ((x.bySource || {}).projukti || 0));
  };
  P.cloudSync = async () => {
    if (!P.cloudOn() || busy) return; busy = true; setStatus('syncing');
    try {
      let r = await api('GET', '/api/sync');
      if (r.data && r.rev !== P.cloud.rev) apply(P.mergeState(r.data, P.S));
      for (let i = 0; i < 4; i++) {
        P.S._t = P.S._t || Date.now();
        try { const w = await api('PUT', '/api/sync', { data: strip(P.S, true), baseRev: r.rev }); P.cloud.rev = w.rev; break; }
        catch (e) { if (e.status !== 409 || i === 3) throw e; r = await api('GET', '/api/sync'); apply(P.mergeState(r.data, P.S)); }
      }
      recordBase(); P.cloud.lastLocal = str();
      await pushXP(); P.cloud.lastSync = Date.now(); setStatus('ok'); saveC(); P.render();
    } catch (e) { setStatus(e.status === 0 ? 'offline' : 'error', e.message); }
    finally { busy = false; saveC(); }
  };
  P.cloudAvatar = d => { if (P.cloudOn()) api('PUT', '/api/me', { avatar: d }).catch(() => { }); };

  /* ---- UI bits ---- */
  const LBL = { idle: ['Local only', 'muted'], ok: ['Synced', 'ok'], syncing: ['Syncing…', 'muted'], pending: ['Changes pending…', 'muted'], offline: ['Offline — saved locally', 'bad'], error: ['Sync problem', 'bad'] };
  P.cloudChip = () => {
    const on = P.cloudOn(), l = LBL[status] || LBL.idle;
    return `<button class="cloudchip" id="cchip" data-a="cloudOpen" title="${esc(statusMsg || (on ? 'Signed in as ' + P.cloud.user : 'Sign in to sync'))}">${P.icon('globe', 14)} <span class="${on ? l[1] : 'muted'}">${on ? l[0] : P.cloudApi() ? 'Sign in to sync' : 'Local only'}</span></button>`;
  };
  P.cloudCard = () => {
    const on = P.cloudOn();
    return `<section class="card glass"><div class="ch"><h2>${P.icon('globe', 18)} Cloud account (OLC)</h2></div>
      ${on ? `<div class="kv"><span>Signed in as</span><b>${esc(P.cloud.user)}</b></div><div class="kv"><span>Status</span><b>${(LBL[status] || LBL.idle)[0]}</b></div><div class="kv"><span>Last sync</span><b>${P.cloud.lastSync ? new Date(P.cloud.lastSync).toLocaleTimeString() : '—'}</b></div><div class="kv"><span>XP earned in OLC (counted here)</span><b>${P.cloud.otherXP || 0}</b></div>${statusMsg && status === 'error' ? `<p class="bad">${esc(statusMsg)}</p>` : ''}
        <div class="chips" style="margin-top:10px"><button class="btn primary" data-a="cloudNow">Sync now</button><button class="btn" data-a="cloudLogout">Sign out</button></div>` :
        `<p class="muted">Sign in with your OLC account to sync PROJUKTI across all your devices. Your XP is shared with OLC — the same account, the same XP.</p><div class="chips"><button class="btn primary" data-a="cloudOpen">Sign in / create account</button></div>`}
      <hr><div class="fld"><label for="apiurl">Server URL (your deployed PROJUKTI backend)</label><input id="apiurl" type="url" placeholder="https://your-backend.vercel.app" value="${esc(P.cloud.api || window.PROJUKTI_API || '')}" data-c="apiurl"><small>Set once after deploying the backend. Without it the app works local-only.</small></div></section>`;
  };
  P.chg.apiurl = v => { P.cloud.api = v.trim().replace(/\/+$/, ''); saveC(); P.toast(P.cloud.api ? 'Server URL saved' : 'Server URL cleared'); P.render(); };
  P.act.cloudNow = () => P.cloudSync();
  P.act.cloudLogout = () => P.confirm('Sign out? Your data stays on this device; sync pauses until you sign in again.', () => { P.cloud.token = ''; saveC(); setStatus('idle'); P.render(); }, 'Sign out');
  P.act.cloudOpen = () => { if (P.cloudOn()) { P.go('settings'); } else authForm('login'); };

  /* ---- auth forms ---- */
  const RX = /^(?=[A-Za-z0-9]*[A-Z])(?=[A-Za-z0-9]*[a-z])(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{8}@olc\.com$/;
  const norm = u => { u = String(u || '').trim(); return u.includes('@') ? u : u + '@olc.com'; };
  const badUser = u => RX.test(u) ? '' : 'Username must be 8 letters/numbers with 1 capital, 1 small letter and 1 number (the @olc.com ending is added for you).';
  const nameF = { k: 'username', label: 'OLC username', req: true, ac: 'username', ph: 'e.g. Agent7Xk  (→ Agent7Xk@olc.com)' };

  function done(res, onDone) {
    const prev = P.cloud.lastUser, go = () => {
      P.cloud.token = res.token; P.cloud.user = res.username; P.cloud.lastUser = res.username; P.cloud.rev = 0; P.cloud.base = {}; P.cloud.xpSent = {}; P.cloud.lastLocal = ''; P.cloud.guest = false; saveC();
      P.toast('Signed in as ' + res.username);
      api('GET', '/api/me').then(m => { if (m.avatar && !P.S.profile.photo) { P.S.profile.photo = m.avatar; } if (m.displayName && !P.S.profile.name) P.S.profile.name = m.displayName; }).catch(() => { }).finally(() => P.cloudSync().then(() => onDone && onDone()));
    };
    if (prev && prev !== res.username) P.confirm('This device last used ' + prev + '. Switching replaces the local data with ' + res.username + '\'s cloud data. Continue?', () => { const ui = P.S.ui; P.S = P.defaults(); P.S.ui = ui; P.save(); go(); }, 'Switch account');
    else go();
  }
  function authForm(mode, onDone, extra) {
    const guest = onDone ? { label: 'Continue as guest', onClick: () => { P.cloud.guest = true; saveC(); onDone(); } } : null;
    const tabs = `<div class="seg authseg"><button type="button" data-m="login" class="${mode === 'login' ? 'on' : ''}">Sign in</button><button type="button" data-m="register" class="${mode === 'register' ? 'on' : ''}">Create</button><button type="button" data-m="recover" class="${mode === 'recover' ? 'on' : ''}">Forgot</button></div>`;
    let dlg;
    const swap = m => { dlg.close(); authForm(m, onDone); };
    const fail = e => { P.toast(e.message, 'warn'); };
    if (!P.cloudApi()) { P.form({ title: 'Cloud server not set', submit: 'Save URL', fields: [{ k: 'url', label: 'Backend URL', type: 'url', req: true, ph: 'https://your-backend.vercel.app', hint: 'Deploy the backend first (see README), then paste its URL here.' }], onSubmit: v => { P.cloud.api = v.url.replace(/\/+$/, ''); saveC(); setTimeout(() => authForm('login', onDone), 50); } }); return; }
    if (mode === 'login') dlg = P.form({ title: 'Sign in to PROJUKTI', submit: 'Sign in', extra: guest, fields: [nameF, { k: 'password', label: 'Password (8 characters)', type: 'password', req: true, ac: 'current-password', maxlen: 8 }], onSubmit: v => { const u = norm(v.username); api('POST', '/api/auth/login', { username: u, password: v.password }, false).then(r => done(r, onDone)).catch(fail); } });
    else if (mode === 'register') dlg = P.form({ title: 'Create your OLC account', submit: 'Create account', extra: guest, fields: [nameF, { k: 'password', label: 'Password (exactly 8 characters)', type: 'password', req: true, ac: 'new-password', maxlen: 8 }, { k: 'display', label: 'Display name (optional)' }, { k: 'q', label: 'Recovery question', type: 'select', opts: ['What is the name of your first school?', 'What is your best friend\'s nickname?', 'What was your first pet\'s name?', 'What is your favourite book?'], req: true }, { k: 'a', label: 'Recovery answer', req: true, hint: 'Used to reset your password. Remember it exactly.' }], onSubmit: v => { const u = norm(v.username), e = badUser(u) || (v.password.length !== 8 ? 'Password must be exactly 8 characters.' : ''); if (e) { P.toast(e, 'warn'); return false; } api('POST', '/api/auth/register', { username: u, password: v.password, displayName: v.display, recoveryQuestion: v.q, recoveryAnswer: v.a }, false).then(r => done(r, onDone)).catch(fail); } });
    else dlg = P.form({ title: 'Recover password', submit: 'Find my account', fields: [nameF], onSubmit: v => { const u = norm(v.username); api('GET', '/api/auth/question?username=' + encodeURIComponent(u), null, false).then(q => P.form({ title: 'Answer to reset', submit: 'Reset password', fields: [{ k: 'a', label: q.question, req: true }, { k: 'p', label: 'New password (8 characters)', type: 'password', req: true, ac: 'new-password', maxlen: 8 }], onSubmit: w => { if (w.p.length !== 8) { P.toast('Password must be exactly 8 characters.', 'warn'); return false; } api('POST', '/api/auth/recover', { username: u, answer: w.a, newPassword: w.p }, false).then(r => done(r, onDone)).catch(fail); } })).catch(fail); } });
    dlg.querySelector('.fields').insertAdjacentHTML('beforebegin', tabs);
    dlg.querySelectorAll('.authseg button').forEach(b => b.addEventListener('click', () => swap(b.dataset.m)));
  }

  /* ---- boot / background sync ---- */
  P.cloudBoot = cont => {
    if (P.cloudOn()) { P.cloudSync().finally(cont); }
    else if (P.cloudApi() && !P.cloud.guest) authForm('login', cont);
    else cont();
  };
  setInterval(() => { if (P.cloudOn() && !document.hidden && !busy) P.cloudSync(); }, 45000);
  window.addEventListener('focus', () => { if (P.cloudOn() && !busy) P.cloudSync(); });
  window.addEventListener('online', () => { if (P.cloudOn()) P.cloudSync(); });
})();
