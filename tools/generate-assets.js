/* Generates all SVG assets (logos, badges, avatars, backgrounds, illustrations).
   Run:  node tools/generate-assets.js        (seeded, so output is reproducible) */
const fs = require('fs'), path = require('path');
const P = require('../js/assets.js');
const out = (p, s) => { const f = path.join(__dirname, '..', 'assets', p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

let seed = 20260;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const NS = 'xmlns="http://www.w3.org/2000/svg"';

/* ---------- logos ---------- */
const mark = (id = 'm', mono = false) => `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mono ? '#fff' : '#22d3ee'}"/><stop offset="1" stop-color="${mono ? '#fff' : '#8b5cf6'}"/></linearGradient></defs>
<path d="M64 6l50 29v58l-50 29-50-29V35z" fill="${mono ? 'none' : '#0a1228'}" stroke="url(#${id}g)" stroke-width="5" stroke-linejoin="round"/>
<path d="M44 92V38h24c13 0 21 8 21 19s-8 19-21 19H44" fill="none" stroke="url(#${id}g)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="89" cy="38" r="5.5" fill="${mono ? '#fff' : '#fbbf24'}"/><path d="M89 38l16-12" stroke="${mono ? '#fff' : '#fbbf24'}" stroke-width="3" stroke-linecap="round"/>`;
out('logo/logo-mark.svg', `<svg ${NS} viewBox="0 0 128 128" width="256" height="256">${mark()}</svg>`);
out('logo/favicon.svg', `<svg ${NS} viewBox="0 0 128 128">${mark('f')}</svg>`);
out('logo/logo-mono.svg', `<svg ${NS} viewBox="0 0 128 128" width="256" height="256" style="background:#0a1228">${mark('o', true)}</svg>`);
out('logo/logo-full.svg', `<svg ${NS} viewBox="0 0 520 128" width="520" height="128"><g>${mark('a')}</g><text x="148" y="70" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="54" font-weight="800" letter-spacing="6" fill="#e6f1ff">PROJUKTI</text><text x="150" y="102" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="17" letter-spacing="5" fill="#22d3ee">STUDY COMMAND CENTER</text></svg>`);
out('logo/logo-stacked.svg', `<svg ${NS} viewBox="0 0 320 250" width="320" height="250"><g transform="translate(96 0)">${mark('s')}</g><text x="160" y="190" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="40" font-weight="800" letter-spacing="5" fill="#e6f1ff">PROJUKTI</text><text x="160" y="220" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="13" letter-spacing="4" fill="#22d3ee">ACADEMIC MISSION 2026</text></svg>`);

/* ---------- badges ---------- */
P.ACH.forEach(a => { out(`badges/${a.id}.svg`, P.badgeSVG(a, false, 128)); });
out('badges/_locked.svg', P.badgeSVG(P.ACH[0], true, 128));

/* ---------- avatars (seeded random geometric) ---------- */
const PAL = [['#22d3ee', '#8b5cf6'], ['#f472b6', '#fbbf24'], ['#34d399', '#22d3ee'], ['#fb7185', '#a78bfa'], ['#60a5fa', '#34d399'], ['#fbbf24', '#f97316'], ['#a3e635', '#2dd4bf'], ['#c084fc', '#f472b6']];
for (let i = 1; i <= 8; i++) {
  const [c1, c2] = PAL[i - 1]; let s = '';
  for (let k = 0; k < 7; k++) {
    const x = 10 + rnd() * 80, y = 10 + rnd() * 80, r = 6 + rnd() * 22, c = pick([c1, c2, '#ffffff']);
    s += pick([`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${c}" opacity=".${3 + Math.floor(rnd() * 5)}"/>`,
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(r * 1.4).toFixed(1)}" height="${(r * 1.4).toFixed(1)}" rx="4" fill="${c}" opacity=".${3 + Math.floor(rnd() * 5)}" transform="rotate(${Math.floor(rnd() * 90)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`]);
  }
  out(`avatars/av${i}.svg`, `<svg ${NS} viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="a${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1228"/><stop offset="1" stop-color="#1b1f4a"/></linearGradient><clipPath id="c${i}"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#c${i})"><rect width="100" height="100" fill="url(#a${i})"/>${s}<circle cx="50" cy="40" r="15" fill="${c1}"/><path d="M20 100c2-24 14-36 30-36s28 12 30 36z" fill="${c2}"/></g></svg>`);
}

/* ---------- backgrounds ---------- */
out('bg/grid.svg', `<svg ${NS} width="48" height="48"><path d="M48 0H0v48" fill="none" stroke="#7dd3fc" stroke-opacity=".07" stroke-width="1"/></svg>`);
out('bg/hex.svg', `<svg ${NS} width="56" height="97" viewBox="0 0 56 97"><path d="M28 2l26 15v30L28 62 2 47V17zM28 62v35M2 47l-2 1M54 47l2 1" fill="none" stroke="#a78bfa" stroke-opacity=".12"/></svg>`);
let stars = '';
for (let i = 0; i < 160; i++) stars += `<circle cx="${(rnd() * 1200).toFixed(0)}" cy="${(rnd() * 800).toFixed(0)}" r="${(0.4 + rnd() * 1.6).toFixed(1)}" fill="${pick(['#22d3ee', '#a78bfa', '#ffffff'])}" opacity="${(0.2 + rnd() * 0.7).toFixed(2)}"/>`;
let lines = '';
for (let i = 0; i < 18; i++) lines += `<line x1="${(rnd() * 1200).toFixed(0)}" y1="${(rnd() * 800).toFixed(0)}" x2="${(rnd() * 1200).toFixed(0)}" y2="${(rnd() * 800).toFixed(0)}" stroke="#22d3ee" stroke-opacity=".08"/>`;
out('bg/constellation.svg', `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><rect width="1200" height="800" fill="#050a18"/>${lines}${stars}</svg>`);
let waves = '';
for (let i = 0; i < 6; i++) { const y = 420 + i * 55; waves += `<path d="M0 ${y} C 200 ${y - 60 - i * 6}, 400 ${y + 60}, 600 ${y} S 1000 ${y - 50}, 1200 ${y} V800 H0Z" fill="${i % 2 ? '#8b5cf6' : '#22d3ee'}" opacity=".0${3 + i}"/>`; }
out('bg/waves.svg', `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><rect width="1200" height="800" fill="#060b1c"/>${waves}</svg>`);

/* ---------- illustrations (used in empty states) ---------- */
const ill = (name, body) => out(`illustrations/${name}.svg`, `<svg ${NS} viewBox="0 0 200 160" width="200" height="160"><defs><linearGradient id="i${name}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><ellipse cx="100" cy="146" rx="62" ry="8" fill="#22d3ee" opacity=".12"/>${body.replace(/GRAD/g, `url(#i${name})`)}</svg>`);
ill('rocket', `<path d="M100 14c22 14 32 44 26 76H74c-6-32 4-62 26-76z" fill="GRAD"/><circle cx="100" cy="58" r="11" fill="#0a1228" stroke="#fff" stroke-width="3"/><path d="M74 90l-22 24 26-4zM126 90l22 24-26-4z" fill="#f472b6"/><path d="M90 96h20l-10 34z" fill="#fbbf24"/>`);
ill('books', `<rect x="40" y="96" width="120" height="22" rx="4" fill="GRAD"/><rect x="52" y="72" width="100" height="22" rx="4" fill="#f472b6"/><rect x="36" y="48" width="112" height="22" rx="4" fill="#34d399"/><path d="M52 107h96M64 83h72M48 59h88" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`);
ill('atom', `<ellipse cx="100" cy="80" rx="64" ry="24" fill="none" stroke="GRAD" stroke-width="4"/><ellipse cx="100" cy="80" rx="64" ry="24" fill="none" stroke="#f472b6" stroke-width="4" transform="rotate(60 100 80)"/><ellipse cx="100" cy="80" rx="64" ry="24" fill="none" stroke="#fbbf24" stroke-width="4" transform="rotate(120 100 80)"/><circle cx="100" cy="80" r="10" fill="#fff"/>`);
ill('trophy', `<path d="M70 28h60v36a30 30 0 01-60 0z" fill="GRAD"/><path d="M70 36H48v10a22 22 0 0022 22M130 36h22v10a22 22 0 01-22 22" fill="none" stroke="#fbbf24" stroke-width="6"/><rect x="92" y="94" width="16" height="22" fill="#fbbf24"/><rect x="72" y="116" width="56" height="12" rx="4" fill="#f472b6"/>`);
ill('planet', `<circle cx="100" cy="80" r="40" fill="GRAD"/><ellipse cx="100" cy="86" rx="72" ry="14" fill="none" stroke="#fbbf24" stroke-width="5" transform="rotate(-18 100 86)"/><circle cx="84" cy="66" r="8" fill="#fff" opacity=".25"/><circle cx="30" cy="30" r="3" fill="#fff"/><circle cx="170" cy="40" r="2" fill="#fff"/>`);
ill('brain', `<path d="M78 40a22 22 0 00-30 20 20 20 0 000 34 22 22 0 0030 22 22 22 0 0044 0 22 22 0 0030-22 20 20 0 000-34 22 22 0 00-30-20 22 22 0 00-44 0z" fill="GRAD" opacity=".9"/><path d="M100 28v100M76 62c10 0 14 8 24 8M124 62c-10 0-14 8-24 8M76 100c10 0 14-8 24-8M124 100c-10 0-14-8-24-8" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>`);
console.log('PROJUKTI assets generated.');
