/* Profile, settings and data */
(function () {
  const P = window.P, esc = P.esc;
  const PRESETS = [['Cyan / Violet', '#22d3ee', '#8b5cf6'], ['Emerald / Sky', '#34d399', '#38bdf8'], ['Amber / Rose', '#fbbf24', '#fb7185'], ['Pink / Indigo', '#f472b6', '#6366f1'], ['Lime / Teal', '#a3e635', '#2dd4bf']];

  P.views.settings = {
    render() {
      const S = P.S, p = S.profile, set = S.settings;
      const notifOk = 'Notification' in window ? Notification.permission : 'unsupported';
      return `<header class="vh"><div><h1>Settings</h1><small class="muted">Profile, exams, subjects, timer, theme and data.</small></div></header>
      <section class="grid g2">
        <div class="card glass"><div class="ch"><h2>${P.icon('smile', 18)} Student profile</h2></div>
          <div class="avatars" role="radiogroup" aria-label="Avatar">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<button class="av ${p.avatar === i ? 'on' : ''}" data-a="setAvatar" data-n="${i}" role="radio" aria-checked="${p.avatar === i}" aria-label="Avatar ${i}"><img src="assets/avatars/av${i}.svg" alt="" width="46" height="46"></button>`).join('')}</div>
          ${[['name', 'Name'], ['school', 'School'], ['grade', 'Class / grade'], ['goal', 'My academic goal']].map(([k, l]) => `<div class="fld"><label for="p_${k}">${l}</label><input id="p_${k}" value="${esc(p[k])}" data-c="prof" data-k="${k}" ${k === 'goal' ? 'placeholder="e.g. GPA 5 in the final and a Junior Scholarship"' : ''}></div>`).join('')}</div>
        <div class="card glass"><div class="ch"><h2>${P.icon('target', 18)} Exams</h2></div>
          ${S.exams.map(e => `<div class="grid g2 tight"><div class="fld"><label for="en_${e.id}">Name</label><input id="en_${e.id}" value="${esc(e.name)}" data-c="exname" data-id="${e.id}"></div><div class="fld"><label for="ed_${e.id}">Date</label><input id="ed_${e.id}" type="date" value="${e.date}" data-c="exdate" data-id="${e.id}"></div></div>`).join('')}
          <div class="fld"><label for="gl">Daily study goal (minutes)</label><input id="gl" type="number" min="20" max="360" value="${set.dailyGoal}" data-c="goalnum"><small>Realistic beats heroic — rest is part of the plan.</small></div></div>
      </section>
      <section class="card glass"><div class="ch"><h2>${P.icon('book', 18)} Subjects</h2><button class="btn small" data-a="addSubject">${P.icon('plus', 14)} Add subject</button></div>
        <div class="list">${S.subjects.map(s => `<div class="row"><input type="color" value="${s.color}" data-c="subcol" data-id="${s.id}" aria-label="Colour for ${esc(s.name)}"><input class="grow" value="${esc(s.name)}" data-c="subname" data-id="${s.id}" aria-label="Subject name"><small class="muted">${P.subjectStats(s).total} topics</small><button class="icon-btn" data-a="delSubject" data-id="${s.id}" aria-label="Delete subject">${P.icon('trash', 15)}</button></div>`).join('')}</div></section>
      <section class="grid g2">
        <div class="card glass"><div class="ch"><h2>${P.icon('timer', 18)} Timer</h2></div><div class="grid g3 tight">${[['focus', 'Focus', 5, 90], ['short', 'Short break', 1, 30], ['long', 'Long break', 5, 60]].map(([k, l, a, b]) => `<div class="fld"><label for="ts_${k}">${l} (min)</label><input id="ts_${k}" type="number" min="${a}" max="${b}" value="${set[k]}" data-c="setnum" data-k="${k}"></div>`).join('')}</div>
          <label class="chk"><input type="checkbox" ${set.sound ? 'checked' : ''} data-c="setbool" data-k="sound"> <span>Sound when a phase ends</span></label></div>
        <div class="card glass"><div class="ch"><h2>${P.icon('alert', 18)} Notifications</h2></div>
          <p class="muted">${notifOk === 'unsupported' ? 'This browser does not support notifications. In-app reminders still work.' : 'Browser notifications fire for finished timers and a daily nudge while PROJUKTI is open in a tab.'}</p>
          <label class="chk"><input type="checkbox" ${set.notify ? 'checked' : ''} data-c="notify" ${notifOk === 'unsupported' ? 'disabled' : ''}> <span>Enable notifications ${notifOk === 'denied' ? '(blocked in browser settings)' : ''}</span></label>
          <div class="fld"><label for="rem">Daily reminder time</label><input id="rem" type="time" value="${set.reminder}" data-c="remtime"></div></div>
      </section>
      <section class="card glass"><div class="ch"><h2>${P.icon('sun', 18)} Theme</h2></div>
        <div class="seg"><button class="${p.theme === 'dark' ? 'on' : ''}" data-a="theme" data-v="dark">${P.icon('moon', 14)} Dark</button><button class="${p.theme === 'light' ? 'on' : ''}" data-a="theme" data-v="light">${P.icon('sun', 14)} Light</button></div>
        <div class="chips">${PRESETS.map(([n, a, b]) => `<button class="swatch" data-a="preset" data-a1="${a}" data-b1="${b}" style="background:linear-gradient(135deg,${a},${b})" aria-label="${n}" title="${n}"></button>`).join('')}</div>
        <div class="grid g2 tight"><div class="fld"><label for="c1">Primary colour</label><input id="c1" type="color" value="${p.accent}" data-c="accent"></div><div class="fld"><label for="c2">Secondary colour</label><input id="c2" type="color" value="${p.accent2}" data-c="accent2"></div></div></section>
      <section class="card glass"><div class="ch"><h2>${P.icon('download', 18)} Data & backup</h2></div>
        <div class="notice">${P.icon('shield', 18)}<div><b>Your data lives only in this browser.</b> PROJUKTI saves everything in browser-local storage — it never leaves your device, needs no account or password, and <b>does not sync between devices</b>. Use Export to back up or move to another device, and Import to restore. Clearing browser data erases it, so export regularly.</div></div>
        <div class="chips"><button class="btn primary" data-a="exportAll">${P.icon('download', 16)} Export backup (.json)</button><label class="btn">${P.icon('upload', 16)} Import backup<input type="file" accept="application/json,.json" data-c="import" hidden></label><button class="btn danger" data-a="resetAll">Reset everything</button></div>
        <small class="muted">Approximate size used: ${(JSON.stringify(S).length / 1024).toFixed(1)} KB of ~5,000 KB.</small></section>`;
    }
  };

  P.act.setAvatar = d => { P.S.profile.avatar = +d.n; P.render(); };
  P.chg.prof = (v, el, d) => { P.S.profile[d.k] = v.trim(); P.render(); };
  P.chg.exname = (v, el, d) => { if (v.trim()) P.S.exams.find(e => e.id === d.id).name = v.trim(); P.render(); };
  P.chg.exdate = (v, el, d) => { P.S.exams.find(e => e.id === d.id).date = v; P.render(); };
  P.chg.goalnum = v => { P.S.settings.dailyGoal = Math.max(20, Math.min(360, Math.round(+v) || 120)); P.render(); };
  P.chg.subname = (v, el, d) => { if (v.trim()) P.subj(d.id).name = v.trim(); P.render(); };
  P.chg.subcol = (v, el, d) => { P.subj(d.id).color = v; P.render(); };
  P.act.delSubject = d => P.confirm('Delete this subject with all its chapters and topics? Logged sessions keep their time but lose the subject label.', () => { P.S.subjects = P.S.subjects.filter(s => s.id !== d.id); if (P.S.ui.subj === d.id) P.S.ui.subj = null; P.render(); });
  P.chg.remtime = v => { P.S.settings.reminder = v || '17:00'; P.save(); };
  P.chg.notify = v => {
    if (!v) { P.S.settings.notify = false; P.render(); return; }
    if (!('Notification' in window)) return;
    Notification.requestPermission().then(r => { P.S.settings.notify = r === 'granted'; if (r !== 'granted') P.toast('Notifications were not allowed.', 'warn'); else P.notify('PROJUKTI', 'Notifications are on.'); P.render(); });
  };
  P.act.theme = d => { P.S.profile.theme = d.v; P.applyTheme(); P.render(); };
  P.act.preset = (d, el) => { P.S.profile.accent = el.dataset.a1; P.S.profile.accent2 = el.dataset.b1; P.applyTheme(); P.render(); };
  P.chg.accent = v => { P.S.profile.accent = v; P.applyTheme(); P.save(); };
  P.chg.accent2 = v => { P.S.profile.accent2 = v; P.applyTheme(); P.save(); };
  P.chg.import = (v, el) => {
    const f = el.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => P.confirm('Importing replaces ALL current data with the backup. Continue?', () => { try { P.importData(r.result); P.applyTheme(); P.toast('Backup imported.'); P.render(true); } catch (e) { P.toast(e.message || 'Invalid backup file.', 'warn'); } }, 'Replace data');
    r.onerror = () => P.toast('Could not read that file.', 'warn');
    r.readAsText(f); el.value = '';
  };
  P.act.resetAll = () => P.confirm('This permanently erases ALL PROJUKTI data on this device (export a backup first!). Continue?', () => { P.S = P.defaults(); P.save(); P.applyTheme(); P.render(true); setTimeout(() => location.reload(), 150); }, 'Erase everything');
})();
