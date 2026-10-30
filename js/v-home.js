/* Home — Command Center */
(function () {
  const P = window.P, esc = P.esc;

  P.countdown = ex => {
    const t = P.today();
    const ts = P.topics().filter(x => x.t.exam === 'both' || x.t.exam === ex.id);
    const cov = P.pct(ts.filter(x => P.covered(x.t)).length, ts.length);
    if (!ex.date) return `<div class="cd glass"><small class="muted">${esc(ex.name)}</small><span class="big">—</span><button class="btn small" data-a="go" data-v="settings">Set exam date</button></div>`;
    const d = P.diff(t, ex.date);
    return `<div class="cd glass"><small class="muted">${esc(ex.name)}</small><span class="big">${d > 0 ? d : d === 0 ? 'Today' : 'Done'}</span><small>${d > 0 ? 'days left · ' + P.fmtDate(ex.date) : d === 0 ? 'Good luck — you are ready.' : 'Exam date passed'}</small>${ts.length ? `<div class="cdbar">${P.bar(cov)}<small class="muted">${cov}% syllabus covered</small></div>` : ''}</div>`;
  };

  P.views.home = {
    render() {
      const S = P.S, t = P.today(), p = S.profile, set = S.settings;
      const mins = P.minsOn(t), goal = set.dailyGoal, sess = P.sessionsOn(t);
      const tasks = P.tasksOn(t), done = tasks.filter(x => x.done).length;
      const over = P.overdueTasks(), due = P.dueRevisions();
      const lv = P.level(), st = P.streak(), w = S.well[t] || {};
      const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
      const quote = P.QUOTES[(new Date(t + 'T12:00:00').getTime() / 864e5 | 0) % P.QUOTES.length];
      const upcoming = S.tasks.filter(x => !x.series && !x.done && x.date > t && x.date <= P.addDays(t, 7)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
      const pending = tasks.filter(x => !x.done);
      const focusAvg = sess.length ? P.avg(sess.map(x => x.focus)).toFixed(1) : '—';
      let note = '';
      if (mins >= 480) note = `<div class="notice warn">${P.icon('alert', 18)}<div>You have studied ${P.fmtMin(mins)} today — that is plenty. Rest, eat, move around and sleep well. Your brain stores what you learned while resting.</div></div>`;
      else if (!st.cur && S.sessions.length) note = `<div class="notice">${P.icon('smile', 18)}<div>Welcome back! Your streak resets gently — pick <b>one small task</b> and you are rolling again.</div></div>`;
      else if (!mins && hr >= parseInt(set.reminder || '17', 10)) note = `<div class="notice">${P.icon('timer', 18)}<div>No study logged yet today. A single 25-minute focus session keeps your momentum.</div></div>`;

      const mission = [
        ...over.slice(0, 3).map(x => P.taskRow(x, true)),
        ...pending.map(x => P.taskRow(x))
      ];
      const revs = due.slice(0, 4).map(x => `<div class="row"><span class="dot" style="background:${x.s.color}"></span><div class="grow"><b>Revise: ${esc(x.t.name)}</b><small class="muted">${esc(x.s.name)} · ${esc(x.c.name)}</small></div><button class="btn small" data-a="revise" data-id="${x.t.id}">Mark revised</button></div>`);

      return `
      <header class="vh"><div><small class="muted">${P.fmtDate(t, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</small><h1>${greet}${p.name ? ', ' + esc(p.name) : ''}</h1></div>
        <div class="vh-r"><button class="btn primary" data-a="go" data-v="timer">${P.icon('play', 16)} Start focus</button></div></header>
      ${note}
      <section class="grid g2">${S.exams.map(P.countdown).join('')}</section>

      <section class="grid g4 stats">
        <div class="stat glass"><small class="muted">Study today</small><b>${P.fmtMin(mins)}</b>${P.bar(P.pct(mins, goal))}<small class="muted">goal ${P.fmtMin(goal)}${mins >= goal ? ' ✓' : ''}</small></div>
        <div class="stat glass"><small class="muted">Focus sessions</small><b>${sess.length}</b><small class="muted">avg focus ${focusAvg}/5</small></div>
        <div class="stat glass"><small class="muted">Level ${lv.lv}</small><b>${P.totalXP()} XP</b>${P.bar(lv.pct, 'var(--acc2)')}<small class="muted">${lv.need - lv.cur} XP to next level</small></div>
        <div class="stat glass"><small class="muted">Streak</small><b>${P.icon('flame', 20)} ${st.cur} day${st.cur === 1 ? '' : 's'}</b><small class="muted">best ${st.best} · 1 rest day/week is free</small></div>
      </section>

      <section class="grid g2w">
        <div class="card glass"><div class="ch"><h2>${P.icon('target', 18)} Today's mission</h2><span class="muted">${done}/${tasks.length} done</span></div>
          ${tasks.length ? P.bar(P.pct(done, tasks.length), 'var(--ok)') : ''}
          <div class="list">${mission.length || revs.length ? mission.join('') + revs.join('') : `<div class="empty"><img src="assets/illustrations/rocket.svg" alt="" width="120"><p>${tasks.length ? 'All of today\'s tasks are done. Great work!' : 'Nothing planned for today yet.'}</p></div>`}</div>
          <div class="ca"><button class="btn small" data-a="addTask" data-date="${t}">${P.icon('plus', 14)} Add task</button><button class="btn small ghost" data-a="go" data-v="planner">Open planner</button></div>
        </div>
        <div class="card glass"><div class="ch"><h2>${P.icon('book', 18)} Subject progress</h2></div>
          <div class="list">${S.subjects.map(s => { const x = P.subjectStats(s); return `<div class="sp" data-a="openSubject" data-id="${s.id}"><div class="row"><span class="dot" style="background:${s.color}"></span><b class="grow">${esc(s.name)}</b><small class="muted">${x.total ? x.cov + '/' + x.total + ' topics' : 'no topics yet'}</small></div>${P.bar(x.covPct, s.color)}</div>`; }).join('') || '<div class="empty">No subjects. Add some in Settings.</div>'}</div>
        </div>
      </section>

      <section class="grid g3">
        <div class="card glass"><div class="ch"><h2>${P.icon('calendar', 18)} Upcoming deadlines</h2></div>
          <div class="list">${upcoming.length ? upcoming.map(x => `<div class="row"><div class="grow"><b>${esc(x.title)}</b><small class="muted">${P.fmtDate(x.date)}${x.subjectId ? ' · ' + esc(P.subjName(x.subjectId)) : ''}</small></div>${P.chip(x.prio === 'high' ? 'High' : x.prio === 'low' ? 'Low' : 'Medium', x.prio === 'high' ? 'var(--bad)' : x.prio === 'low' ? 'var(--muted)' : 'var(--warn)')}</div>`).join('') : '<div class="empty small">No deadlines in the next 7 days.</div>'}</div>
        </div>
        <div class="card glass"><div class="ch"><h2>${P.icon('heart', 18)} Mood & energy</h2></div>
          <small class="muted">How are you feeling right now?</small>
          <div class="moods" role="group" aria-label="Mood">${['😞', '🙁', '😐', '🙂', '😄'].map((m, i) => `<button class="mood ${w.mood === i + 1 ? 'on' : ''}" data-a="setMood" data-k="mood" data-v="${i + 1}" aria-label="Mood ${i + 1} of 5">${m}</button>`).join('')}</div>
          <small class="muted">Energy level</small>
          <div class="moods" role="group" aria-label="Energy">${[1, 2, 3, 4, 5].map(i => `<button class="mood ${w.energy === i ? 'on' : ''}" data-a="setMood" data-k="energy" data-v="${i}" aria-label="Energy ${i} of 5">${P.icon('bolt', 16)}<small>${i}</small></button>`).join('')}</div>
        </div>
        <div class="card glass quote"><div class="ch"><h2>${P.icon('star', 18)} Daily motivation</h2></div><p>“${esc(quote)}”</p>
          <small class="muted">Revisions due: <b>${due.length}</b> · Overdue tasks: <b>${over.length}</b></small></div>
      </section>`;
    }
  };

  P.act.setMood = d => {
    const t = P.today(), w = P.S.well[t] = P.S.well[t] || {};
    w[d.k] = +d.v; P.render();
  };
  P.act.openSubject = d => { P.S.ui.subj = d.id; P.S.ui.stab = 'syllabus'; P.go('subjects'); };
  P.act.revise = d => {
    const f = P.findTopic(d.id); if (!f) return;
    const t = f.t, td = P.today();
    t.lastRev = td; t.revN = (t.revN || 0) + 1;
    t.nextRev = P.addDays(td, [1, 3, 7, 14, 30][Math.min(t.revN - 1, 4)]);
    P.award('rev:' + t.id + ':' + td, 6, 'Revised ' + t.name, { act: true, cap: ['rev', 60] });
    P.render();
  };
})();
