import { LESSONS } from './lessons.js';
import { isFilled, pointsOf, levelState, summarize, autoMax } from './core.js';
import { tower, EXPLAIN } from './figures.js';
import { createRunner, checkPart, runCode } from './checker.js';
import { storage, getStudent, load, save } from './store.js';
import { T, el, tx, tabLabel, indentAfter, makeId, startSync, tooLong } from './ui.js';

const UI = {
  predict: T('Output', 'Natija'), written: T('Your answer', 'Javobingiz'), code: T('Your code', 'Kodingiz'),
  check: T('Check', 'Tekshirish'), // the quiz intros name this button
  next: T('Next', 'Keyingisi'), finish: T('See my tower', "Minoramni ko'rish"), why: T('Show me why', "Sababini ko'rsating"),
  saved: T('Saved. Your teacher will read it.', "Saqlandi. O'qituvchingiz o'qiydi."), noted: T('Saved.', 'Saqlandi.'),
  complete: T('Tower complete', 'Minora tayyor'), missing: T('The faint blocks are still missing.', 'Xira bloklar hali yetishmayapti.'),
  all: T('Every block is in place.', 'Hamma bloklar joyida.'), back: T('Back to lessons', 'Darslarga qaytish'),
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
  const level = el('h2');
  $('app').append(tx(el('h1'), quiz.title), intro, level);

  const questions = quiz.parts.flatMap(part => part.items.map(q => ({ part, q })));
  const scored = questions.filter(({ part, q }) => part.id !== 'warmup' && q.type !== 'written' && pointsOf(q) > 0);
  // Full points at least once: the question's block is in the tower.
  const built = () => {
    const { subs } = load(id);
    return new Set(scored.filter(({ part, q }) => subs.some(s => s.part === part.id && s.results?.[q.id] === pointsOf(q)))
      .map(({ q }) => q.id));
  };

  const panels = questions.map(({ part, q }, index) => {
    const step = el('button', { type: 'button' });
    const name = tabLabel(part.title);
    step.setAttribute('aria-label', `${name.en} / ${name.uz}: ${part.items.indexOf(q) + 1}`);
    if (index && questions[index - 1].part !== part) step.className = 'gap';
    step.onclick = () => { location.hash = q.id; };
    steps.append(step);

    const task = el('div'), art = el('div', { className: 'art' });
    const section = el('section', { className: 'stage' }, task, art);
    if (q.prompt) task.append(tx(el('p', { className: 'prompt' }), q.prompt));
    if (q.code) task.append(el('pre', { textContent: q.code }));
    const prose = q.type === 'written';
    const field = q.type === 'predict'
      ? el('input', { id: q.id, className: 'code', maxLength: 200, autocomplete: 'off' })
      : el('textarea', { id: q.id, className: prose ? '' : 'code', rows: prose ? 4 : 9, maxLength: 5000 });
    field.spellcheck = prose;
    // Phone keyboards must not capitalise or "correct" code.
    if (!prose) for (const a of ['autocapitalize', 'autocorrect']) field.setAttribute(a, 'off');
    field.value = saved[q.id] ?? q.start ?? '';
    const feedback = el('p', { className: 'fb' });
    feedback.setAttribute('role', 'status');
    task.append(el('label', {}, tx(el('span'), UI[q.type]), field));

    const row = el('div', { className: 'row' });
    const check = tx(el('button', { type: 'button', className: 'go check' }), UI.check);
    const why = tx(el('button', { type: 'button', hidden: true }), UI.why);
    const next = tx(el('button', { type: 'button', className: 'next' }), index === questions.length - 1 ? UI.finish : UI.next);
    next.onclick = () => { location.hash = questions[index + 1]?.q.id ?? 'done'; };
    checks.push(check);

    const panel = { part, q, step, section, art, revealed: false };
    const explain = () => {
      panel.revealed = true;
      why.hidden = true;
      art.replaceChildren(EXPLAIN[q.show](), tx(el('p'), q.why));
    };
    why.onclick = explain;

    field.addEventListener('input', () => {
      if (!isMe()) return;
      keep(data => { data.answers[q.id] = field.value; });
      feedback.textContent = '';
    });
    // Enter keeps the indentation in code boxes; Tab stays free for keyboard navigation. In a one-line answer it checks.
    field.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || prose) return;
      e.preventDefault();
      if (q.type === 'predict') return void check.click();
      const line = field.value.slice(0, field.selectionStart).split('\n').pop();
      field.setRangeText('\n' + indentAfter(line), field.selectionStart, field.selectionEnd, 'end');
      field.dispatchEvent(new Event('input'));
    });

    if (q.type === 'code') {
      const out = el('pre', { className: 'out', hidden: true });
      out.setAttribute('role', 'status');
      const run = tx(el('button', { type: 'button', className: 'run' }), UI.run);
      checks.push(run);
      run.onclick = async () => {
        const source = field.value;
        out.hidden = false;
        if (!source.trim()) return void tx(out, UI.empty);
        checks.forEach(b => { b.disabled = true; });
        tx(out, UI.running);
        try { tx(out, await runCode(q, source, runner)); } finally { checks.forEach(b => { b.disabled = false; }); }
      };
      field.addEventListener('input', () => { out.hidden = true; });
      row.append(run);
      task.append(out);
    }
    row.append(check, why, next);

    // Each hint appears once the one before it has been opened.
    const hints = (q.hints || []).map((hint, i) => el('details', { hidden: i > 0 },
      tx(el('summary'), T(`Hint ${i + 1}`, `Maslahat ${i + 1}`)), tx(el('p'), hint)));
    hints.forEach((h, i) => h.addEventListener('toggle', () => { if (h.open && hints[i + 1]) hints[i + 1].hidden = false; }));
    task.append(row, feedback, ...hints);

    check.onclick = async () => {
      if (!isMe()) return;
      const answer = field.value;
      feedback.textContent = '';
      feedback.className = 'fb';
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
        if (field.value !== answer) return void (feedback.textContent = ''); // edited during the check
        const m = messages[q.id];
        if (!m) return void tx(feedback, pointsOf(q) ? UI.saved : UI.noted);
        const mark = m.ok ? '✓' : '✗';
        tx(feedback, T(`${mark} ${m.en}`, `${mark} ${m.uz}`));
        feedback.className = `fb ${m.ok ? 'ok' : 'no'}`;
        if (results[q.id] === pointsOf(q) && scored.some(x => x.q === q)) { // the block lands first, then the picture
          why.hidden = true;
          panel.revealed = false;
          art.replaceChildren(tower(quiz, built(), q.id));
          if (q.show) setTimeout(explain, 1400);
        } else if (q.show && results[q.id] != null) why.hidden = false;
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
  const finishScreen = () => {
    const done = built(), all = done.size === scored.length;
    const back = tx(el('button', { type: 'button', className: 'go' }), UI.back);
    back.onclick = () => { location.href = './'; };
    const best = summarize(quiz, load(id).subs).best, max = autoMax(quiz);
    finish.replaceChildren(tower(quiz, done),
      tx(el('h2'), all ? UI.complete : T(`${done.size} of ${scored.length} blocks`, `${scored.length} blokdan ${done.size} tasi`)),
      tx(el('p'), all ? UI.all : UI.missing),
      tx(el('p'), T(`Best score: ${best} of ${max}`, `Eng yaxshi natija: ${max} balldan ${best}`)), back);
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
    level.hidden = ended;
    intro.hidden = open !== panels[0];
    paint();
    if (ended) return finishScreen();
    tx(level, open.part.title);
    if (!open.revealed) open.art.replaceChildren(tower(quiz, built()));
  };
  show();
  addEventListener('hashchange', show);
  addEventListener('pageshow', e => { if (e.persisted) isMe(); });
  addEventListener('storage', e => { if (e.key === 'pz:student') isMe(); });
}
