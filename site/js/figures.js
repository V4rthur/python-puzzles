// Isometric line drawings: lesson covers, the progress tower and pictures of what code does.
// `data-ink-live` keeps them out of the theme animation's snapshot, which cannot draw CSS-styled SVG.
import { pointsOf } from './core.js';

const S = (tag, attrs = {}, ...kids) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...kids);
  return node;
};
const later = (ms, fn) => setTimeout(fn, ms);
const iso = (x, y, z) => [(x - y) * .866, (x + y) * .5 - z];
const move = (node, x, y, z) => { const [X, Y] = iso(x, y, z); node.style.transform = `translate(${X}px, ${Y}px)`; return node; };
const face = (cls, points) => S('polygon', { class: `f ${cls}`, points: points.map(p => iso(...p).join(',')).join(' ') });
const box = (w, d, h) => S('g', {},
  face('s', [[0, d, 0], [w, d, 0], [w, d, h], [0, d, h]]),
  face('s', [[w, 0, 0], [w, d, 0], [w, d, h], [w, 0, h]]),
  face('t', [[0, 0, h], [w, 0, h], [w, d, h], [0, d, h]]));
const canvas = (viewBox, ...kids) => S('svg', { viewBox, class: 'figure', 'aria-hidden': 'true', 'data-ink-live': '' }, ...kids);
const label = (x, y, text) => { const t = S('text', { x, y }); t.textContent = text; return t; };
const lit = node => { node.classList.add('lit'); return node; };
const range = n => Array.from({ length: n }, (_, i) => i);

// Shapes in a cover rise one after another while a green edge light travels with them.
const wave = (node, i) => S('g', { class: 'wave', style: `--d:${(i * .18 - 3.6).toFixed(2)}s` }, node);
const COVERS = {
  'lesson-01': () => canvas('-110 -150 220 240', ...range(5).map(i => wave(move(box(100, 100, 9), -50, -50, i * 13 + (i === 4 ? 22 : 0)), i))),
  'review-1-6': () => canvas('-120 -175 240 270', ...range(8).map(i => wave(move(box(7, 80, 100 - i * 12), -70 + i * 19, -40, 0), i))),
};
// Lessons without their own drawing yet get a row of cubes.
const chain = () => canvas('-120 -90 240 170', ...range(6).map(i => wave(move(box(24, 24, 24), -90 + i * 31, -12, 0), i)));
export const cover = quizId => (COVERS[quizId] ?? chain)();

// The tower: one layer per level, one block per auto-scored question. `done`: ids with full points.
export function tower(quiz, done, drop) {
  const layers = quiz.parts.filter(p => p.id !== 'warmup')
    .map(p => p.items.filter(q => q.type !== 'written' && pointsOf(q) > 0)).filter(items => items.length);
  let ring;
  const blocks = layers.flatMap((items, level) => {
    const cols = Math.ceil(Math.sqrt(items.length)), rows = Math.ceil(items.length / cols);
    const w = 100 / cols, d = 100 / rows;
    return items.map((q, i) => {
      const x = (i % cols) * (w + 2) - 51, y = Math.floor(i / cols) * (d + 2) - 51, z = level * 30;
      const node = box(w, d, 24);
      node.style.setProperty('--d', `${(level * .5 + i * .15 - 4).toFixed(2)}s`);
      if (!done.has(q.id)) { node.classList.add('ghost'); return move(node, x, y, z); }
      lit(node);
      if (q.id !== drop) return move(node, x, y, z);
      move(node, x, y, z + 90);
      // A shock wave spreads from the spot where the block lands.
      ring = face('ring', [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]);
      later(60, () => move(node, x, y, z));
      return node;
    });
  });
  const top = layers.length * 30 + 130;
  return canvas(`-110 -${top} 220 ${top + 70}`, ...blocks, ...(ring ? [ring] : []));
}

// Each picture uses the values shown in its question, so it is only revealed after an answer.
export const EXPLAIN = {
  divide() { // 17 // 5, 17 % 5
    const cubes = range(17).map(i => move(box(15, 15, 15), -170 + i * 20, 0, 0));
    later(500, () => cubes.forEach((c, i) => {
      const group = Math.floor(i / 5);
      move(c, -100 + (i % 5) * 19, -90 + group * 62, 0);
      if (group === 3) lit(c);
    }));
    return canvas('-190 -150 340 270', ...cubes);
  },
  floor() { // -7 // 2
    const name = label(0, 45, '-3.5');
    const dot = S('g', { style: 'transform:translate(220px,0)' }, S('circle', { r: 9, cy: 70, class: 'dot' }), name);
    later(700, () => { dot.style.transform = 'translate(170px,0)'; name.textContent = '-4'; });
    return canvas('0 0 340 140', S('rect', { x: 20, y: 69, width: 300, height: 2, class: 'axis' }),
      ...[-5, -4, -3].map((v, i) => label(70 + i * 100, 105, v)), dot);
  },
  names() { // x = 5; y = x; x = x + 2
    const value = text => S('g', {}, S('g', {}, move(box(44, 44, 30), -22, -22, 0)), label(0, -22, text));
    const place = (g, x, y) => { g.style.transform = `translate(${x}px,${y}px)`; return g; };
    const stem = x => S('rect', { x, y: 40, width: 2, height: 40, class: 'axis' });
    const five = place(value('5'), 80, 120), seven = place(value('7'), 80, 230);
    lit(seven.firstChild);
    seven.style.opacity = 0;
    const y = S('g', { style: 'opacity:0' }, label(220, 30, 'y'), stem(219));
    later(600, () => { y.style.opacity = 1; place(five, 150, 120); });
    later(1700, () => { place(five, 220, 120); place(seven, 80, 120); seven.style.opacity = 1; });
    return canvas('0 0 300 180', label(80, 30, 'x'), stem(79), y, five, seven);
  },
  rounding() { // int(7.9), round(7.9), 6 / 3
    const column = (x, height, name, to, result) => {
      const bar = S('g', {}, move(box(36, 36, height), x, -x, 0));
      const [X, Y] = iso(x + 18, -x + 18, 0);
      const out = label(X, Y + 46, name);
      later(700, () => { bar.replaceChildren(move(box(36, 36, to), x, -x, 0)); lit(bar); out.textContent = result; });
      return [bar, out];
    };
    return canvas('-170 -150 340 220', ...column(-65, 95, 'int(7.9)', 84, '7'), ...column(0, 95, 'round(7.9)', 96, '8'), ...column(65, 72, '6 / 3', 24, '2.0'));
  },
  share() { // 49.5 shared by 4 with / instead of //
    const parts = range(4).map(i => move(box(48, 48, 26), -100 + i * 49, 0, 0));
    later(500, () => parts.forEach((p, i) => { move(p, -125 + i * 68, 0, 0); lit(p); }));
    return canvas('-150 -110 320 220', ...parts, label(0, 95, '49.5 / 4 = 12.375'));
  },
  pizzas() { // 33 slices, 8 per pizza
    const slices = range(40).map(n => {
      const p = Math.floor(n / 8), cx = 60 + (p % 3) * 110, cy = 60 + Math.floor(p / 3) * 105, a = (n % 8) * Math.PI / 4;
      const point = angle => `${cx + 46 * Math.cos(angle)},${cy + 46 * Math.sin(angle)}`;
      return S('polygon', { class: 'f t', points: `${cx},${cy} ${point(a)} ${point(a + Math.PI / 4)}` });
    });
    slices.slice(0, 33).forEach((s, i) => later(300 + i * 45, () => s.classList.add('full')));
    return canvas('0 0 340 220', ...slices);
  },
};
