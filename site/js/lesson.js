import { LESSONS, loadQuizzes } from './lessons.js';
import { isFilled, pointsOf, levelState, summarize, autoMax, earned } from './core.js';
import { tower, EXPLAIN } from './figures.js';
import { createRunner, checkPart, runCode } from './checker.js';
import { storage, getStudent, load, save, progressRows, continueTarget } from './store.js';
import { T, el, tx, tabLabel, indentAfter, makeId, startSync, tooLong, heading, panelState, panelText, towersBuilt, fill, CODE_KEYS, typeKey } from './ui.js';

const UI = {
  predict: T('Output', 'Natija'), written: T('Your answer', 'Javobingiz'), code: T('Your code', 'Kodingiz'),
  check: T('Check', 'Tekshirish'), // the quiz intros name this button
  next: T('Next', 'Keyingisi'), finish: T('See my tower', "Minoramni ko'rish"), why: T('Show me why', "Sababini ko'rsating"),
  again: T('Try again', 'Qayta urinish'), more: T('Show hint', "Maslahatni ko'rsatish"),
  complete: T('Tower complete', 'Minora tayyor'), missing: T('The faint blocks are still missing.', 'Xira bloklar hali yetishmayapti.'),
  all: T('Every block is in place.', 'Hamma bloklar joyida.'), back: T('Back to lessons', 'Darslarga qaytish'),
  lessons: T('All lessons', 'Barcha darslar'),
  run: T('Run', 'Ishga tushirish'),
  running: T('Running… Python takes a few seconds to load the first time.', 'Ishlamoqda… Birinchi marta Python yuklanishi bir necha soniya oladi.'),
  checking: T('Checking… Code needs Python, which takes a few seconds to load the first time.',
    'Tekshirilmoqda… Kod uchun Python kerak, birinchi marta yuklanishi bir necha soniya oladi.'),
  empty: T('Write an answer first', 'Avval javob yozing'),
  tooLong: T('Your answer is too long, so nothing was sent. Shorten it and check again.',
    "Javobingiz juda uzun, shuning uchun hech narsa yuborilmadi. Uni qisqartirib, qayta tekshiring."),
  keepOpen: T('Your answers are not saved in this browser. Keep this page open until it says Sent.',
    "Javoblaringiz bu brauzerda saqlanmadi. \"Yuborildi\" yozuvi chiqmaguncha sahifani yopmang."),
  noSave: T('Your typing cannot be saved in this browser.', "Yozganlaringizni bu brauzerda saqlab bo'lmayapti."),
  noLoad: T('This lesson could not load. Check the internet connection and reload the page.',
    "Dars yuklanmadi. Internetni tekshirib, sahifani qayta yuklang."),
};
const $ = id => document.getElementById(id);
const id = new URLSearchParams(location.search).get('q');
const student = getStudent();
const home = () => location.replace('./');

// Only ids from the lesson list are loaded.
if (!student || !LESSONS.some(l => l.quiz && l.quiz === id)) home();
else start();

// False (and back to the home page) once someone else is signed in, so work is never saved under the wrong name.
function isMe() {
  const now = getStudent();
  if (now?.code === student.code && now.name === student.name) return true;
  home();
  return false;
}

async function start() {
  const sync = startSync($('status'), storage);
  let quiz;
  try { quiz = (await import(`../quizzes/${id}.js`)).default; } catch { return void tx($('app'), UI.noLoad); }
  const runner = createRunner(), saved = load(id).answers, checks = [];
  const keep = change => {
    const data = load(id);
    change(data);
    $('notice').textContent = '';
    if (!save(id, data)) tx($('notice'), UI.noSave);
  };

  document.title = quiz.title.en;
  $('who').textContent = `${student.name} · ${student.code}`;
  const steps = el('nav', { className: 'steps' });
  steps.setAttribute('aria-label', 'Questions / Savollar');
  $('steps-bar').append(steps);
  const intro = tx(el('p', { className: 'intro' }), quiz.intro);
  const crumb = el('h1', { className: 'crumb' });
  $('app').append(crumb, intro);

  const questions = quiz.parts.flatMap(part => part.items.map(q => ({ part, q })));
  const scored = questions.filter(({ part, q }) => part.id !== 'warmup' && q.type !== 'written' && pointsOf(q) > 0);
  const built = () => earned(quiz, load(id).subs);

  const panels = questions.map(({ part, q }, index) => {
    const step = el('button', { type: 'button' });
    const name = tabLabel(part.title);
    step.setAttribute('aria-label', `${name.en} / ${name.uz}: ${part.items.indexOf(q) + 1}`);
    if (index && questions[index - 1].part !== part) step.className = 'gap';
    step.onclick = () => { location.hash = q.id; };
    steps.append(step);

    const task = el('div', { className: 'task' }, tx(el('h2'), heading(q.type))), art = el('div', { className: 'art' });
    const section = el('section', { className: 'stage' }, task, art);
    if (q.prompt) task.append(tx(el('p', { className: 'prompt' }), q.prompt));
    if (q.code) task.append(el('pre', { textContent: q.code }));
    const prose = q.type === 'written';
    // No id: the address holds #<question>, and the browser would scroll to a field with that id.
    const field = q.type === 'predict'
      ? el('input', { name: q.id, className: 'code', maxLength: 200, autocomplete: 'off' })
      : el('textarea', { name: q.id, className: prose ? '' : 'code', rows: prose ? 4 : 9, maxLength: 5000 });
    field.spellcheck = prose;
    // Phone keyboards must not capitalise or "correct" code.
    if (!prose) for (const a of ['autocapitalize', 'autocorrect']) field.setAttribute(a, 'off');
    field.value = saved[q.id] ?? q.start ?? '';
    const feedback = el('p', { className: 'fb' });
    feedback.setAttribute('role', 'status');
    task.append(el('label', {}, tx(el('span'), UI[q.type]), field));

    const row = el('div', { className: 'row' });
    // The feedback line and the buttons: tinted after a result, stuck to the bottom of a phone screen.
    const box = el('div', { className: 'panel' }, feedback, row);
    box.setAttribute('data-ink-live', ''); // stays above the theme animation's snapshot
    const again = tx(el('button', { type: 'button', hidden: true }), UI.again);
    const more = tx(el('button', { type: 'button', hidden: true }), UI.more);
    let run;
    const check = tx(el('button', { type: 'button', className: 'go check' }), UI.check);
    const why = tx(el('button', { type: 'button', hidden: true }), UI.why);
    const next = tx(el('button', { type: 'button', className: 'next' }), index === questions.length - 1 ? UI.finish : UI.next);
    next.onclick = () => { location.hash = questions[index + 1]?.q.id ?? 'done'; };
    checks.push(check);
    // The one green button: Check while answering, then Next or Try again.
    const main = button => [check, next, again].forEach(b => b.classList.toggle('go', b === button));
    // Back to answering: no result, Check and Run in their places.
    const close = () => {
      box.className = 'panel';
      feedback.textContent = '';
      again.hidden = more.hidden = true;
      check.hidden = false;
      if (run) run.hidden = false;
      main(check);
    };
    const solved = () => { close(); main(next); };
    const openResult = (state, message) => {
      const { title, body } = panelText(q, state, message);
      const done = state === 'right' || state === 'saved';
      box.className = `panel ${state}`;
      feedback.textContent = '';
      if (title) feedback.append(tx(el('strong', { className: done ? 'ok' : 'no' }), title));
      if (body) feedback.append(tx(el('span'), body));
      check.hidden = true;
      if (run) run.hidden = true;
      again.hidden = done;
      more.hidden = state !== 'wrong' || hints.every(h => h.open);
      main(done ? next : again);
    };
    // On a phone the sticky buttons and the screen edge can hide what just changed.
    // Text goes to the centre: before Safari 14.1 'nearest' leaves it behind the sticky buttons.
    const reveal = (node, block = 'center') => { if (innerWidth < 900) node.scrollIntoView({ block }); };

    const panel = { part, q, step, section, art, box, solved, revealed: false };
    const explain = () => {
      panel.revealed = true;
      why.hidden = true;
      fill(art, EXPLAIN[q.show](), tx(el('p'), q.why));
      reveal(art, 'nearest');
    };
    why.onclick = explain;

    field.addEventListener('input', () => {
      if (!isMe()) return;
      keep(data => { data.answers[q.id] = field.value; });
      close();
    });
    again.onclick = () => { close(); field.focus(); reveal(field, 'nearest'); };
    // Enter keeps the indentation in code boxes; Tab stays free for keyboard navigation. In a one-line answer it checks.
    field.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || prose) return;
      e.preventDefault();
      if (q.type === 'predict') return void (check.hidden || check.click());
      const line = field.value.slice(0, field.selectionStart).split('\n').pop();
      field.setRangeText('\n' + indentAfter(line), field.selectionStart, field.selectionEnd, 'end');
      field.dispatchEvent(new Event('input'));
    });

    if (q.type === 'code') {
      const out = el('pre', { className: 'out', hidden: true });
      out.setAttribute('role', 'status');
      run = tx(el('button', { type: 'button', className: 'run' }), UI.run);
      checks.push(run);
      run.onclick = async () => {
        const source = field.value;
        out.hidden = false;
        if (!source.trim()) return void reveal(tx(out, UI.empty));
        checks.forEach(b => { b.disabled = true; });
        tx(out, UI.running);
        try {
          const shown = await runCode(q, source, runner);
          tx(out, shown);
          if (shown.image) out.append(el('img', { src: `data:image/png;base64,${shown.image}`, alt: 'Your chart / Diagrammangiz', className: 'chart' }));
          reveal(out);
        } finally { checks.forEach(b => { b.disabled = false; }); }
      };
      field.addEventListener('input', () => { out.hidden = true; });
      const keys = el('div', { className: 'keys' }, ...CODE_KEYS.map(text => {
        const indent = !text.trim();
        const key = el('button', { type: 'button', textContent: indent ? '⇥' : text });
        if (indent) key.setAttribute('aria-label', 'indent / chekinish');
        key.onmousedown = e => e.preventDefault(); // the field keeps the focus, so the phone keyboard stays open
        key.onclick = () => {
          field.focus();
          if (typeKey(field, text)) field.dispatchEvent(new Event('input'));
        };
        return key;
      }));
      task.append(keys, out); // outside the label, which would pass taps on to the field
    }
    // One fixed order that puts the green button first in every result.
    row.append(again, more, ...(run ? [run] : []), check, next, why);

    // Each hint appears once the one before it has been opened.
    const hints = (q.hints || []).map((hint, i) => el('details', { hidden: i > 0 },
      tx(el('summary'), T(`Hint ${i + 1}`, `Maslahat ${i + 1}`)), tx(el('p'), hint)));
    hints.forEach((h, i) => h.addEventListener('toggle', () => {
      if (h.open && hints[i + 1]) hints[i + 1].hidden = false;
      if (hints.every(x => x.open)) more.hidden = true;
    }));
    more.onclick = () => {
      const hint = hints.find(h => !h.open);
      hint.hidden = false;
      hint.open = true;
      if (hints.every(h => h.open)) { more.hidden = true; hint.firstChild.focus(); } // focus would be lost with the button
      reveal(hint);
    };
    task.append(box, ...hints);

    check.onclick = async () => {
      if (!isMe()) return;
      const answer = field.value, pressed = document.activeElement === check;
      close();
      if (!isFilled(q, answer)) return void tx(feedback, UI.empty);
      const checked_at = new Date().toISOString();
      checks.forEach(b => { b.disabled = true; });
      tx(feedback, UI.checking);
      try {
        const { results, messages } = await checkPart({ items: [q] }, { [q.id]: answer }, runner);
        const state = levelState(load(id).subs, part.id, q.id, answer, results[q.id]);
        if (tooLong(state.answers)) return void tx(feedback, UI.tooLong);
        const sub = { id: makeId(), group_code: student.code, name: student.name, quiz: quiz.id, part: part.id, ...state, checked_at };
        // Queued first, under the student who pressed Check, whatever happens to this page next.
        const queued = sync.add(sub);
        if (!isMe()) return;
        keep(data => { data.subs.push(sub); });
        if (!queued) tx($('notice'), UI.keepOpen); // after keep, which resets the notice
        sync.flush(true);
        paint();
        if (field.value !== answer) return close(); // edited during the check
        openResult(panelState(results[q.id], messages[q.id]), messages[q.id]);
        // The hidden Check button takes the keyboard focus with it.
        if (pressed && [check, document.body].includes(document.activeElement)) (again.hidden ? next : again).focus();
        if (results[q.id] === pointsOf(q) && scored.some(x => x.q === q)) { // the block lands first, then the picture
          why.hidden = true;
          panel.revealed = false;
          fill(art, tower(quiz, built(), q.id));
          reveal(art, 'nearest');
          if (q.show) setTimeout(explain, 1400);
        } else {
          if (q.show && results[q.id] != null) why.hidden = false;
          reveal(field, 'nearest'); // the panel may have grown over the answer
        }
      } finally { checks.forEach(b => { b.disabled = false; }); }
    };
    $('app').append(section);
    return panel;
  });

  const finish = el('section', { className: 'finish' });
  $('app').append(finish);

  function paint() {
    const done = built();
    panels.forEach(p => p.step.classList.toggle('done', done.has(p.q.id)));
  }
  const finishScreen = async () => {
    const done = built(), all = done.size === scored.length;
    const { best, finished } = summarize(quiz, load(id).subs), max = autoMax(quiz);
    const button = (text, href, className = '') => {
      const node = tx(el('button', { type: 'button', className }), text);
      node.onclick = () => { location.href = href; };
      return node;
    };
    const art = tower(quiz, done);
    const title = tx(el('h2'), all ? UI.complete : T(`${done.size} of ${scored.length} blocks`, `${scored.length} blokdan ${done.size} tasi`));
    const score = tx(el('p'), T(`Best score: ${best} of ${max}`, `Eng yaxshi natija: ${max} balldan ${best}`));
    if (!finished) return fill(finish, art, title, tx(el('p'), all ? UI.all : UI.missing), score, button(UI.back, './', 'go'));
    const lessons = button(UI.lessons, './', 'go'), choices = el('div', { className: 'choices' }, lessons);
    fill(finish, art, title, score, choices);
    // The rest needs every quiz file. It is added around these nodes, so a focused button keeps the focus.
    const quizzes = await loadQuizzes();
    if (location.hash !== '#done' || !choices.isConnected) return; // left, or drawn again meanwhile
    const { rows, done: towers, total } = progressRows(LESSONS, quizzes, load);
    choices.before(tx(el('p', { className: 'msg ok' }), towersBuilt(towers, total)));
    const row = continueTarget(rows, load)?.row;
    if (!row) return;
    lessons.className = '';
    choices.prepend(button(T(`Next lesson: ${row.title.en}`, `Keyingi dars: ${row.title.uz}`), `lesson.html?q=${row.quiz}`, 'go'));
  };

  // The open question is kept in the address, so a reload stays on it.
  const show = () => {
    const ended = location.hash === '#done';
    const open = ended ? null : panels.find(p => `#${p.q.id}` === location.hash) ?? panels[0];
    for (const p of panels) {
      p.section.hidden = p !== open;
      if (p === open) p.step.setAttribute('aria-current', 'step');
      else p.step.removeAttribute('aria-current');
    }
    finish.hidden = !ended;
    intro.hidden = open !== panels[0];
    paint();
    if (ended) {
      tx(crumb, quiz.title);
      return finishScreen();
    }
    const { part } = open;
    tx(crumb, T(`${quiz.title.en} · ${part.title.en}`, `${quiz.title.uz} · ${part.title.uz}`));
    if (built().has(open.q.id) || open.box.matches('.right, .saved')) open.solved();
    if (!open.revealed) fill(open.art, tower(quiz, built()));
  };
  show();
  // A new question starts at its top: checking may have scrolled the last one down.
  addEventListener('hashchange', () => { show(); scrollTo(0, 0); });
  addEventListener('pageshow', e => { if (e.persisted) isMe(); });
  addEventListener('storage', e => { if (e.key === 'pz:student') isMe(); });
}
