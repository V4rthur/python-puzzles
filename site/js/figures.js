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
// A square block with a character on top; strings are rows of them.
const tile = (char, x, y) => {
  const node = S('g', {}, S('g', {}, move(box(24, 24, 16), -12, -12, 0)), label(0, -11, char));
  node.style.transform = `translate(${x}px, ${y}px)`;
  return node;
};
const place = (node, x, y) => { node.style.transform = `translate(${x}px, ${y}px)`; };
const word = (text, y, left = 40) => [...text].map((char, i) => tile(char, left + i * 46, y));
// Blocks in a grid, rising in turn. `cells`: [x, y, height] on a 34-unit floor.
const blocks = (view, cells) => canvas(view, ...cells.map(([x, y, h], i) => wave(move(box(26, 26, h), x * 34, y * 34, 0), i)));
const COVERS = {
  'review-8-11': () => blocks('-120 -100 240 210', [0, 1, 2].flatMap(x => [0, 1, 2].map(y => [x, y, x === y ? 44 : 10]))),
  'review-13-20': () => blocks('-130 -110 250 220', [[0, 0, 18], [1, 0, 32], [2, 0, 46], [3, 0, 60], [0, 2, 60], [1, 2, 46], [2, 2, 32], [3, 2, 18]]),
  'review-all': () => canvas('-110 -150 220 240', ...[0, 1, 2, 3].map(i => { const w = 100 - i * 22; return wave(move(box(w, w, 24), -w / 2, -w / 2, i * 28), i); })),
  'lesson-23': () => blocks('-120 -120 240 230', [[0, 1, 22], [1, 1, 48], [2, 1, 34], [3, 1, 74], [4, 1, 56]]),
  'lesson-14': () => blocks('-130 -100 250 210', [[0, 0, 56], [0, 1, 40], [2, 0, 8], [3, 0, 8], [5, 0, 40], [5, 1, 56]]),
  'lesson-15': () => blocks('-120 -100 240 210', [[1, 0, 58], [0, 1, 34], [2, 1, 34], [0, 3, 12], [1, 3, 12], [2, 3, 12], [3, 3, 12]]),
  'lesson-16': () => canvas('-110 -120 220 200', ...[0, 1, 2].map(i => wave(move(box(80, 80, 22), -40, -40, i * 34), i))),
  'lesson-17': () => blocks('-110 -100 240 210', [0, 1, 2, 3].flatMap(x => [0, 1, 2].map(y => [x, y, 16]))),
  'lesson-18': () => blocks('-120 -90 240 200', [0, 1, 2, 3].flatMap(x => [0, 1, 2].map(y => [x, y, y ? 8 : 30]))),
  'lesson-19': () => blocks('-120 -100 240 210', [0, 1, 2, 3].flatMap(x => [0, 1, 2].map(y => [x, y, (x + y) % 3 ? 6 : 40]))),
  'lesson-20': () => blocks('-130 -110 250 220', [[0, 0, 50], [0, 1, 40], [2, 0, 24], [2, 1, 18], [4, 0, 62], [4, 1, 54]]),
  'lesson-22': () => blocks('-130 -90 250 200', [[0, 0, 20], [0, 1, 20], [1, 0, 20], [1, 1, 20], [3, 0, 34], [3, 1, 34], [4, 0, 34], [4, 1, 34]]),
  'lesson-08': () => blocks('-110 -90 240 200', [[0, 1, 12], [1, 1, 28], [2, 1, 52], [3, 1, 28], [4, 1, 12]]),
  'lesson-09': () => blocks('-110 -80 240 190', [[0, 0, 30], [1, 0, 30], [2, 0, 6], [3, 0, 30], [0, 1, 30], [1, 1, 6], [2, 1, 30], [3, 1, 30]]),
  'lesson-10': () => blocks('-120 -90 240 200', [0, 2, 4].flatMap(x => [[x, 0, 18], [x, 1, 34]])),
  'lesson-11': () => blocks('-110 -100 240 210', [[0, 0, 20], [2, 0, 20], [0, 2, 20], [2, 2, 20], [1, 1, 56]]),
  'lesson-13': () => blocks('-110 -90 240 200', [0, 1, 2, 3].flatMap(x => [0, 1, 2].map(y => [x, y, 8 + (x + y) * 5]))),
  'lesson-03': () => blocks('-90 -80 240 190', [0, 1, 2, 3, 4].map(i => [i, 0, 22])),
  'lesson-04': () => blocks('-130 -80 240 190', [0, 1, 2, 3].flatMap(i => [[i, 0, 14], [i, 2, 34]])),
  'lesson-05': () => blocks('-110 -80 240 190', [[0, 1, 16], [1, 1, 16], [2, 0, 30], [3, 0, 30], [2, 2, 8], [3, 2, 8]]),
  'lesson-06': () => blocks('-120 -100 240 210', [[0, 0, 8], [1, 0, 16], [2, 0, 24], [2, 1, 32], [2, 2, 40], [1, 2, 48], [0, 2, 56], [0, 1, 64]]),
  'lesson-02': () => canvas('0 0 300 140', ...word('PYTHON', 85, 35).map((node, i) => wave(S('g', {}, node), i))),
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
  bars() { // ax.bar(["a", "b", "c"], [3, 5, 2])
    const columns = [3, 5, 2].map((value, i) => {
      const x = i * 56 - 56, bar = S('g', {}, move(box(34, 34, 4), x, -x, 0));
      const [X, Y] = iso(x + 17, -x + 17, 0);
      later(500 + i * 300, () => { bar.replaceChildren(move(box(34, 34, value * 18), x, -x, 0)); lit(bar); });
      return [bar, label(X, Y + 44, `${'abc'[i]} = ${value}`)];
    });
    return canvas('-180 -150 360 230', ...columns.flat());
  },
  nested() { // data["users"][1]["name"]
    const steps = ['{}', '[1]', 'Lola'].map((text, i) => tile(text, 60 + i * 90, 50 + i * 40));
    steps.forEach((t, i) => later(500 + i * 700, () => lit(t)));
    return canvas('0 0 300 190', ...steps, label(60, 100, 'users'), label(150, 140, 'item'), label(240, 180, 'name'));
  },
  select() { // find_all("li", class_="book")
    const items = word(['A', 'B', 'C'], 60, 90).map((t, i) => { place(t, 70 + i * 80, 70); return t; });
    later(600, () => { [0, 1].forEach(i => { lit(items[i]); place(items[i], 70 + i * 80, 50); }); items[2].style.opacity = .35; });
    return canvas('0 0 300 150', ...items, label(70, 120, 'book'), label(150, 120, 'book new'), label(230, 120, 'li'));
  },
  query() { // WHERE year > 2000
    const tiles = word(['2001', '1999', '2010'], 70, 70).map((t, i) => { place(t, 70 + i * 80, 70); return t; });
    later(700, () => { lit(tiles[0]); lit(tiles[2]); tiles[1].style.opacity = .3; place(tiles[1], 150, 110); });
    return canvas('0 0 300 150', ...tiles);
  },
  mask() { // a[a > 6]
    const tiles = word(['5', '12', '7'], 55, 100);
    const flags = ['F', 'T', 'T'].map((f, i) => label(100 + i * 46, 105, f));
    flags.forEach(f => { f.style.opacity = 0; });
    later(600, () => flags.forEach(f => { f.style.opacity = 1; }));
    later(1500, () => { [1, 2].forEach(i => { lit(tiles[i]); place(tiles[i], 100 + (i - 1) * 46, 150); }); tiles[0].style.opacity = .35; });
    return canvas('0 0 280 185', ...tiles, ...flags);
  },
  newcolumn() { // df["passed"] = df["score"] >= 65
    const scores = [70, 95, 60].map((v, i) => tile(String(v), 80, 40 + i * 48));
    const passed = ['T', 'T', 'F'].map((v, i) => tile(v, 200, 40 + i * 48));
    passed.forEach((t, i) => { t.style.opacity = 0; later(500 + i * 500, () => { t.style.opacity = 1; if (i < 2) lit(t); }); });
    return canvas('0 0 280 180', ...scores, ...passed);
  },
  slices() { // loc[0:1] and iloc[0:1]
    const loc = word(['0', '1', '2'], 55, 130), iloc = word(['0', '1', '2'], 130, 130);
    later(700, () => { lit(loc[0]); lit(loc[1]); });
    later(1500, () => lit(iloc[0]));
    return canvas('0 0 290 170', ...loc, ...iloc, label(55, 60, 'loc'), label(55, 135, 'iloc'));
  },
  groups() { // shop B: 2 + 4 + 1
    const values = ['3', '5', '2', '4', '1'], tiles = word(values, 55, 50);
    later(700, () => tiles.forEach((t, i) => { place(t, i < 2 ? 40 + i * 46 : 170 + (i - 2) * 46, 90); if (i > 1) lit(t); }));
    return canvas('0 0 300 170', ...tiles, label(63, 140, 'A'), label(216, 140, 'B = 7'));
  },
  merge() { // inner merge on id
    const a = word(['1', '2'], 45, 70), b = word(['2', '3'], 140, 140);
    later(800, () => { place(a[1], 128, 92); place(b[0], 128, 92); lit(a[1]); lit(b[0]); a[0].style.opacity = .3; b[1].style.opacity = .3; });
    return canvas('0 0 260 180', ...a, ...b, label(200, 50, 'a'), label(80, 145, 'b'));
  },
  scope() { // a local x lives only inside the function
    const outer = tile('5', 80, 80), inner = tile('10', 200, 80);
    inner.style.opacity = 0;
    later(600, () => { inner.style.opacity = 1; lit(inner); });
    later(2000, () => { inner.style.opacity = 0; place(inner, 200, 30); lit(outer); });
    return canvas('0 0 280 160', outer, inner, label(80, 130, 'x'), label(200, 130, 'inside'));
  },
  flow() { // try, except, finally
    const steps = ['A', 'B'].map((c, i) => tile(c, 150 + i * 100, 70)), start = tile('/0', 50, 70);
    later(500, () => { start.style.opacity = .35; lit(steps[0]); });
    later(1400, () => lit(steps[1]));
    return canvas('0 0 300 150', start, ...steps, label(50, 120, 'try'), label(150, 120, 'except'), label(250, 120, 'finally'));
  },
  shared() { // one class list, two objects
    const list = tile('[ ]', 150, 110), a = tile('a', 70, 40), b = tile('b', 230, 40);
    later(700, () => { list.lastChild.textContent = '[1]'; lit(list); });
    later(1500, () => { lit(a); lit(b); });
    return canvas('0 0 300 165', a, b, list, label(150, 155, 'items'));
  },
  between() { // floor(-2.5) and ceil(-2.5)
    const down = S('g', { style: 'transform:translate(170px,0)' }, S('circle', { r: 8, cy: 70, class: 'dot' }));
    const up = S('g', { style: 'transform:translate(170px,0)' }, S('circle', { r: 8, cy: 70, class: 'dot' }));
    later(700, () => { down.style.transform = 'translate(70px,0)'; up.style.transform = 'translate(270px,0)'; });
    return canvas('0 0 340 140', S('rect', { x: 20, y: 69, width: 300, height: 2, class: 'axis' }),
      ...[-3, -2.5, -2].map((v, i) => label(70 + i * 100, 105, String(v))), label(70, 45, 'floor'), label(270, 45, 'ceil'), down, up);
  },
  february() { // 28 days, four weeks
    const days = range(28).map(i => move(box(18, 18, 8), (i % 7) * 22 - 80, Math.floor(i / 7) * 22 - 40, 0));
    days.forEach((d, i) => later(300 + i * 60, () => lit(d)));
    return canvas('-170 -80 320 170', ...days, label(0, 80, '28'));
  },
  append() { // songs.append("d")
    const tiles = word(['a', 'b', 'c', 'd'], 90);
    const last = tiles[3];
    place(last, 178, 20);
    later(700, () => { lit(last); place(last, 178, 90); });
    return canvas('0 0 270 150', ...tiles);
  },
  copy() { // b = a, c = a.copy()
    const one = word(['1', '2', '3'], 55, 110), two = word(['1', '2'], 140, 110);
    place(one[2], 202, 0); one[2].style.opacity = 0;
    later(800, () => { one[2].style.opacity = 1; lit(one[2]); place(one[2], 202, 55); });
    return canvas('0 0 260 180', ...one, ...two, label(45, 60, 'a, b'), label(45, 145, 'c'));
  },
  sort() { // sorted(scores, reverse=True)[:2]
    const old = word(['70', '90', '80'], 45, 110), made = word(['70', '90', '80'], 45, 110);
    later(600, () => [2, 0, 1].forEach((to, i) => place(made[i], 110 + to * 46, 135)));
    later(1500, () => [made[1], made[2]].forEach(lit));
    return canvas('0 0 270 180', ...old, ...made, label(45, 50, 'scores'), label(45, 140, 'top'));
  },
  update() { // d["tea"] = 6; d["bun"] = 3
    const tea = tile('5', 60, 90), pie = tile('12', 130, 90), bun = tile('3', 200, 25);
    bun.style.opacity = 0;
    later(600, () => { tea.lastChild.textContent = '6'; lit(tea); });
    later(1300, () => { bun.style.opacity = 1; lit(bun); place(bun, 200, 90); });
    return canvas('0 0 260 160', tea, pie, bun, label(60, 135, 'tea'), label(130, 135, 'pie'), label(200, 135, 'bun'));
  },
  overlap() { // {1, 2, 3} & {3, 4}
    const a = word(['1', '2', '3'], 45), b = word(['3', '4'], 140, 160);
    later(700, () => { place(a[2], 140, 92); place(b[0], 186, 92); lit(a[2]); b[0].style.opacity = 0; place(b[0], 140, 92); });
    return canvas('0 0 260 180', ...a, ...b, label(220, 50, 'a'), label(100, 145, 'b'));
  },
  branch() { // if / elif / else with x = 7
    const tiles = ['A', 'B', 'C'].map((c, i) => tile(c, 50 + i * 100, 80));
    later(600, () => { lit(tiles[0]); place(tiles[0], 50, 55); tiles[1].style.opacity = .35; tiles[2].style.opacity = .35; });
    return canvas('0 0 300 150', ...tiles, label(50, 130, 'x > 5'), label(150, 130, 'x > 3'), label(250, 130, 'else'));
  },
  ages() { // boundaries of the price list
    const ages = ['6', '7', '17', '18', '64', '65'], prices = ['0', '5', '5', '10', '10', '6'];
    const tiles = word(ages, 60);
    const costs = prices.map((p, i) => label(40 + i * 46, 125, p));
    costs.forEach(c => { c.style.opacity = 0; });
    tiles.forEach((t, i) => later(400 + i * 350, () => { lit(t); costs[i].style.opacity = 1; }));
    return canvas('0 0 310 150', ...tiles, ...costs);
  },
  total() { // 1, 3, 6, 10
    const columns = [1, 3, 6, 10].map((sum, i) => {
      const node = S('g', { style: 'opacity:0' }, move(box(26, 26, sum * 9), i * 40 - 70, 40 - i * 40, 0), label(i * 69 - 95, 45, String(sum)));
      later(400 + i * 600, () => { node.style.opacity = 1; lit(node); });
      return node;
    });
    return canvas('-150 -110 300 180', ...columns);
  },
  halve() { // 20, 10, 5, 2, 1
    const tiles = word(['20', '10', '5', '2', '1'], 70);
    tiles.forEach((t, i) => { if (i) { t.style.opacity = 0; later(i * 550, () => { t.style.opacity = 1; lit(t); }); } });
    return canvas('0 0 270 120', ...tiles);
  },
  ends() { // s[0], s[-1]
    const tiles = word('Python', 90);
    later(600, () => [0, 5].forEach(i => { lit(tiles[i]); place(tiles[i], 40 + i * 46, 65); }));
    return canvas('0 0 310 150', ...tiles, label(40, 135, '0'), label(270, 135, '-1'));
  },
  slice() { // s[1:4], s[::-1]
    const tiles = word('Python', 50), back = word('Python', 50);
    later(500, () => [1, 2, 3].forEach(i => lit(tiles[i])));
    later(1300, () => back.forEach((node, i) => place(node, 40 + (5 - i) * 46, 140)));
    return canvas('0 0 310 180', ...back, ...tiles, ...[0, 1, 2, 3, 4, 5].map(i => label(40 + i * 46, 85, String(i))));
  },
  count() { // banana: count("a"), find("n")
    const tiles = word('banana', 70);
    [1, 3, 5].forEach((i, n) => later(500 + n * 400, () => lit(tiles[i])));
    later(1900, () => place(tiles[2], 132, 40));
    return canvas('0 0 310 150', ...tiles, ...[0, 1, 2, 3, 4, 5].map(i => label(40 + i * 46, 115, String(i))));
  },
  frozen() { // name.upper() leaves name as it is
    const old = word('ali', 50, 100), made = word('ali', 50, 100), fresh = word('Ali', 140, 100);
    fresh.forEach(node => { node.style.opacity = 0; });
    later(700, () => fresh.forEach((node, i) => { node.style.opacity = 1; lit(node); made[i].style.transform = `translate(${100 + i * 46}px, 140px)`; made[i].style.opacity = 0; }));
    return canvas('0 0 300 180', ...old, ...made, ...fresh, label(40, 50, 'name'), label(40, 140, 'new'));
  },
  clean() { // strip the spaces, then capitalise
    const tiles = word('  aLI  ', 70, 20);
    later(600, () => [0, 1, 5, 6].forEach(i => { place(tiles[i], 20 + i * 46, 130); tiles[i].style.opacity = 0; }));
    later(1500, () => ['A', 'l', 'i'].forEach((char, n) => { const node = tiles[n + 2]; node.lastChild.textContent = char; lit(node); }));
    return canvas('0 0 320 160', ...tiles);
  },
  decode() { // reverse "olleH"
    const tiles = word('olleH', 70, 60);
    later(700, () => tiles.forEach((node, i) => { place(node, 60 + (4 - i) * 46, 70); lit(node); }));
    return canvas('0 0 310 150', ...tiles, label(152, 125, 's[::-1]'));
  },
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
