/* PROJUKTI — icons, achievement metadata, badge art, quotes.
   Works in the browser (window.P) and in Node (tools/generate-assets.js). */
(function (root) {
  const P = (root.P = root.P || {});

  P.I = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    book: 'M4 4h11a3 3 0 013 3v13H7a3 3 0 01-3-3V4zM4 17a3 3 0 013-3h11',
    timer: 'M12 8v5l3 2M9 2h6M12 4a8 8 0 100 16 8 8 0 000-16z',
    calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    brain: 'M9 4a3 3 0 00-3 3 3 3 0 00-2 3 3 3 0 002 3 3 3 0 003 4 3 3 0 003-2V6a2 2 0 00-3-2zM15 4a3 3 0 013 3 3 3 0 012 3 3 3 0 01-2 3 3 3 0 01-3 4 3 3 0 01-3-2',
    cards: 'M3 7h14v12H3zM7 3h14v12',
    heart: 'M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z',
    target: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8zM12 12h.01',
    trophy: 'M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 20h8',
    folder: 'M3 6h6l2 2h10v11H3z',
    chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3',
    cog: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',
    plus: 'M12 5v14M5 12h14',
    check: 'M5 12l5 5 9-10',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    edit: 'M4 20h4L19 9l-4-4L4 16v4z',
    play: 'M7 4l13 8-13 8z',
    pause: 'M7 4h4v16H7zM13 4h4v16h-4z',
    stop: 'M6 6h12v12H6z',
    reset: 'M4 12a8 8 0 108-8M4 4v5h5',
    search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',
    download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
    upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
    flame: 'M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
    moon: 'M20 14A8 8 0 019 3a8 8 0 1011 11z',
    sun: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
    link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
    compass: 'M12 3a9 9 0 100 18 9 9 0 000-18zM15.5 8.5l-2 5-5 2 2-5z',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    x: 'M6 6l12 12M18 6L6 18',
    music: 'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z',
    alert: 'M12 4l9 16H3zM12 10v4M12 17h.01',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    file: 'M6 3h8l4 4v14H6zM14 3v4h4',
    flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    rocket: 'M12 3c4 2 6 6 5 11l-3 3h-4l-3-3c-1-5 1-9 5-11zM9 17l-3 4 4-1M15 17l3 4-4-1M12 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
    medal: 'M8 3l4 7 4-7M12 10a5 5 0 100 10 5 5 0 000-10z',
    leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l8-8',
    pen: 'M14 4l6 6-9 9H5v-6z',
    globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
    flask: 'M9 3h6M10 3v6L4 19a1 1 0 001 1h14a1 1 0 001-1l-6-10V3',
    calc: 'M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01',
    chev: 'M9 6l6 6-6 6',
    up: 'M6 15l6-6 6 6',
    down: 'M6 9l6 6 6-6',
    pin: 'M12 21s-6-6-6-11a6 6 0 0112 0c0 5-6 11-6 11zM12 8a2 2 0 100 4 2 2 0 000-4z',
    smile: 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 14c1 2 3 3 4 3s3-1 4-3M9 9h.01M15 9h.01'
  };

  P.icon = (n, s = 20) =>
    `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P.I[n] || ''}"/></svg>`;

  /* id, name, description, icon, [colour A, colour B] */
  P.ACH = [
    { id: 'first-step', name: 'First Step', desc: 'Log your first study session.', icon: 'rocket', c: ['#22d3ee', '#0ea5e9'] },
    { id: 'hour-1', name: 'Warm-up', desc: 'Study 1 hour in total.', icon: 'timer', c: ['#34d399', '#059669'] },
    { id: 'hours-10', name: 'Ten Hour Club', desc: 'Study 10 hours in total.', icon: 'bolt', c: ['#fbbf24', '#f59e0b'] },
    { id: 'hours-50', name: 'Fifty Hour Mission', desc: 'Study 50 hours in total.', icon: 'shield', c: ['#a78bfa', '#7c3aed'] },
    { id: 'streak-3', name: 'Three-Day Rhythm', desc: 'Be active 3 days in a row.', icon: 'flame', c: ['#fb923c', '#ea580c'] },
    { id: 'streak-7', name: 'Week Warrior', desc: 'Be active 7 days in a row.', icon: 'flame', c: ['#f472b6', '#db2777'] },
    { id: 'streak-14', name: 'Fortnight Focus', desc: 'Be active 14 days in a row.', icon: 'flame', c: ['#f87171', '#dc2626'] },
    { id: 'streak-30', name: 'Unstoppable', desc: 'Be active 30 days in a row.', icon: 'trophy', c: ['#fde047', '#ca8a04'] },
    { id: 'deep-focus', name: 'Deep Focus', desc: 'Complete a 25+ minute session rated 5 for focus.', icon: 'target', c: ['#22d3ee', '#6366f1'] },
    { id: 'tasks-10', name: 'Task Crusher', desc: 'Complete 10 tasks.', icon: 'check', c: ['#4ade80', '#16a34a'] },
    { id: 'tasks-50', name: 'Mission Control', desc: 'Complete 50 tasks.', icon: 'flag', c: ['#38bdf8', '#0284c7'] },
    { id: 'topics-5', name: 'Explorer', desc: 'Cover 5 syllabus topics.', icon: 'compass', c: ['#2dd4bf', '#0d9488'] },
    { id: 'topics-25', name: 'Syllabus Climber', desc: 'Cover 25 syllabus topics.', icon: 'book', c: ['#60a5fa', '#2563eb'] },
    { id: 'mastery-5', name: 'Mastermind', desc: 'Reach Mastered level on 5 topics.', icon: 'brain', c: ['#c084fc', '#9333ea'] },
    { id: 'revisor-10', name: 'Revision Ranger', desc: 'Complete 10 topic revisions.', icon: 'reset', c: ['#f9a8d4', '#be185d'] },
    { id: 'recall-50', name: 'Active Recaller', desc: 'Review 50 flashcards.', icon: 'cards', c: ['#a3e635', '#65a30d'] },
    { id: 'mock-1', name: 'Test Pilot', desc: 'Record your first mock test.', icon: 'file', c: ['#67e8f9', '#0891b2'] },
    { id: 'mock-80', name: 'Ace', desc: 'Score 80%+ in a mock test.', icon: 'star', c: ['#fcd34d', '#d97706'] },
    { id: 'fixer-5', name: 'Mistake Fixer', desc: 'Resolve 5 entries in your error log.', icon: 'shield', c: ['#fb7185', '#e11d48'] },
    { id: 'rest-3', name: 'Well Rested', desc: 'Log 8+ hours of sleep on 3 days.', icon: 'moon', c: ['#818cf8', '#4338ca'] },
    { id: 'reflect-7', name: 'Reflective Mind', desc: 'Write 7 daily reflections.', icon: 'pen', c: ['#f0abfc', '#a21caf'] },
    { id: 'curious-3', name: 'Curious Mind', desc: 'Resolve 3 Explorer questions.', icon: 'globe', c: ['#5eead4', '#0f766e'] },
    { id: 'all-subjects', name: 'All-Rounder', desc: 'Study every subject within one week.', icon: 'medal', c: ['#fdba74', '#c2410c'] },
    { id: 'level-5', name: 'Level 5', desc: 'Reach level 5.', icon: 'trophy', c: ['#e879f9', '#7e22ce'] }
  ];

  P.badgeSVG = (a, locked, size = 96) => {
    const g = 'bg_' + a.id + (locked ? '_l' : '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="${size}" height="${size}" role="img" aria-label="${a.name}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${locked ? '#475569' : a.c[0]}"/><stop offset="1" stop-color="${locked ? '#1e293b' : a.c[1]}"/></linearGradient></defs><path d="M48 4l38 22v44L48 92 10 70V26z" fill="url(#${g})" stroke="rgba(255,255,255,.4)" stroke-width="2"/><path d="M48 12l31 18v36L48 84 17 66V30z" fill="none" stroke="rgba(255,255,255,.25)"/><g transform="translate(30 30) scale(1.5)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="${locked ? 0.4 : 1}"><path d="${P.I[a.icon]}"/></g></svg>`;
  };

  P.QUOTES = [
    'Small, honest effort every day beats a heroic effort once a month.',
    'Understand first. Memorise second. Practise always.',
    'Progress is quiet. Keep showing up.',
    'A focused 25 minutes is worth more than a distracted hour.',
    'Mistakes are the map to your next marks.',
    'Rest is part of the plan, not a break from it.',
    'If you can explain it simply, you understand it.',
    'Revise today so exam day feels familiar.',
    'One chapter at a time. One topic at a time.',
    'You are not behind; you are building momentum.',
    'Ask “why” until the answer makes sense to you.',
    'Hard topics get easier the moment you start them.',
    'Write it, say it, test it — that is how it sticks.',
    'Your streak is built from ordinary days.',
    'Sleep well tonight; your memory will thank you tomorrow.',
    'Do the difficult subject first while your mind is fresh.',
    'Practice questions turn knowing into scoring.',
    'Review your errors — they show exactly what to fix.',
    'Calm minds solve more problems.',
    'Consistency is the real talent.',
    'Aim for better than yesterday, not perfect.',
    'Every topic you finish is one less worry on exam day.'
  ];

  if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
