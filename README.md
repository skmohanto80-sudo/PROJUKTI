# PROJUKTI — Study Command Center (Academic Mission 2026)

A complete, offline study tracker for Class 8 finals and the Junior Scholarship Examination 2026.

## Run it
Double-click `index.html` (works from a file) or serve the folder: `npx serve .` / `python3 -m http.server`.
No build step, no dependencies, no accounts, no secrets.

## What is inside
- Command Center home, exam countdowns, XP / level / streak
- Subjects → chapters → topics (difficulty, mastery, weak flags, revision schedule)
- Focus: Pomodoro, stopwatch, subject timers, session history, manual logging
- Planner: day/week (drag & drop), homework, exam-plan generator, timetable, templates, recurring tasks
- OLC Protocol workspace: 6-stage pipeline, exam intelligence, write/memorise/read split, flashcards, revision sheets
- Practice: spaced-repetition flashcards, question bank, error log
- Well-being: mood, sleep, screen time, habits, reflection, streak calendar (no XP for overworking)
- Exams & grades (Bangladesh GPA scale), mock tests, accuracy, weak subjects, reports
- Achievements: 24 badges, once-only XP with daily caps
- Resources: notepad, reading list, formulas, links, file references, focus sound generator, Explorer
- Analytics with charts, CSV / JSON / printable report export
- Settings: profile, exam dates, subjects, timer, notifications, themes, import/export

## Data
Everything is saved in this browser's local storage. It does NOT sync between devices.
Use Settings → Export backup / Import backup to move or protect your data.

## Assets
`node tools/generate-assets.js` regenerates all logos, badges, avatars, backgrounds and illustrations (seeded).
