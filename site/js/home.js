import { LESSONS, loadQuizzes } from './lessons.js';
import { checkGroup } from './api.js';
import { storage, getStudent, setStudent, clearStudent, load, progressRows, continueTarget } from './store.js';
import { cover, tower, connector } from './figures.js';
import { T, el, tx, configured, NOT_CONFIGURED, startSync, towersBuilt } from './ui.js';

const app = document.getElementById('app');
const STATES = {
  new: T('Not started', 'Boshlanmagan'),
  started: T('Started', 'Boshlangan'),
  done: T('Done', 'Bajarildi'),
  soon: T('Soon', 'Tez orada'),
  unknown: T('Score not available', "Natija ko'rinmayapti"),
};

// How far right each stop on the path sits, as a share of the width set in CSS; repeats.
const OFFSETS = [0, 1, .35, .9, .2];

startSync(document.getElementById('status'), storage);

const quizzes = loadQuizzes();

function signIn() {
  const code = el('input', { id: 'code', required: true, maxLength: 20, autocomplete: 'off', spellcheck: false });
  code.setAttribute('autocapitalize', 'characters');
  const name = el('input', { id: 'name', required: true, maxLength: 60, autocomplete: 'off', spellcheck: false });
  const button = tx(el('button', { type: 'submit', className: 'go' }), T('Sign in', 'Kirish'));
  const message = el('p', { className: 'msg no' });
  message.setAttribute('role', 'alert');
  const form = el('form', {},
    el('label', {}, tx(el('span'), T('Group code', 'Guruh kodi')), code),
    el('label', {}, tx(el('span'), T('Your name', 'Ismingiz')), name),
    tx(el('p', { className: 'note' }), T('If two students have the same name, add an initial.',
      "Ikki talabaning ismi bir xil bo'lsa, familiyaning bosh harfini qo'shing.")),
    button, message);
  if (!configured) {
    button.disabled = true;
    tx(message, NOT_CONFIGURED);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const student = { code: code.value.trim(), name: name.value.trim() };
    if (!student.code || !student.name) return void tx(message, T('Write the group code and your name.', 'Guruh kodi va ismingizni yozing.'));
    button.disabled = true;
    message.textContent = '';
    let open;
    try { open = await checkGroup(student.code); } catch {
      return void tx(message, T('Cannot connect. Check the internet connection and try again.',
        "Ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring."));
    } finally { button.disabled = false; }
    if (!open) return void tx(message, T('This group code is unknown or closed.', "Bu guruh kodi noma'lum yoki yopilgan."));
    if (!setStudent(student)) return void tx(message, T('This browser does not allow saving. Leave private mode or allow site data.',
      "Bu brauzer saqlashga ruxsat bermayapti. Maxfiy rejimdan chiqing yoki sayt ma'lumotlariga ruxsat bering."));
    render();
  });
  return form;
}

function lessonList(student, loaded, heading) {
  const { rows, done, total } = progressRows(LESSONS, loaded, load);
  const target = continueTarget(rows, load);
  const out = tx(el('button', { type: 'button', className: 'link' }), T('Not you?', 'Bu siz emasmisiz?'));
  out.onclick = () => { clearStudent(); render(); };
  const title = row => T(row.no ? `${row.no}. ${row.title.en}` : row.title.en, row.no ? `${row.no}. ${row.title.uz}` : row.title.uz);
  const href = row => `lesson.html?q=${row.quiz}`;
  // Puzzles that are ready are stops on the path; the rest wait in a short list. Both keep the teaching order.
  const ready = rows.filter(r => r.quiz), offset = i => OFFSETS[i % OFFSETS.length];
  const path = el('ol', { className: 'path' }, ...ready.map((row, i) => {
    const info = el('span', { className: 'info' }, tx(el('span'), STATES[row.state]));
    if (row.max != null) info.append(tx(el('span', { className: 'best' }), T(`Best ${row.best}/${row.max}`, `Eng yaxshi: ${row.best}/${row.max}`)));
    // A finished stop's drawing turns green and gets a tick; its "Done" text tells screen readers.
    const art = [cover(row.quiz)];
    if (row.state === 'done') {
      const badge = el('span', { className: 'badge', textContent: '✓' });
      badge.setAttribute('aria-hidden', 'true');
      art.push(badge);
    }
    const stop = el('li', { className: 'stop' }, ...(i < ready.length - 1 ? [connector(offset(i), offset(i + 1))] : []),
      el('a', { href: href(row) }, el('span', { className: 'disc' }, ...art),
        el('span', { className: 'text' }, tx(el('span', { className: 'title' }), title(row)), info)));
    stop.style.setProperty('--o', offset(i));
    if (row.state === 'done') stop.classList.add('done');
    if (row === target?.row) stop.classList.add('now');
    return stop;
  }));
  let next = null;
  if (target) {
    const { row, label } = target;
    // Not '.next': the lesson page's Next button has that class.
    const go = tx(el('a', { className: 'go', href: href(row) }), label === 'start' ? T('Start', 'Boshlash') : T('Continue', 'Davom etish'));
    // On a phone the title above is hidden, so a screen reader gets it from the link itself.
    const named = title(row);
    go.append(tx(el('span', { className: 'vh' }), T(`: ${named.en}`, `: ${named.uz}`)));
    next = el('div', { className: 'upnext' }, cover(row.quiz),
      tx(el('p', { className: 'crumb' }), T(`Lesson ${row.no} · ${row.best} of ${row.max} points`, `${row.no}-dars · ${row.max} balldan ${row.best} ball`)),
      tx(el('h2'), row.title), go);
    next.setAttribute('data-ink-live', ''); // stays above the theme animation's snapshot
  }
  const soon = el('ol', { className: 'lessons' }, ...rows.filter(r => !r.quiz).map(row =>
    el('li', {}, el('div', { className: 'soon' }, tx(el('span'), title(row)), tx(el('span', { className: 'info' }), STATES.soon)))));
  const bar = el('progress', { max: total, value: done });
  bar.setAttribute('aria-label', 'Progress / Natija');
  return el('div', {},
    el('p', { className: 'who' }, el('strong', { textContent: student.name }), ` · ${student.code} `, out),
    el('div', { className: 'cols' },
      el('div', {}, heading, ...(next ? [next] : []),
        tx(el('p', { className: 'progress' }), towersBuilt(done, total)),
        bar),
      el('div', {}, path, ...(soon.childElementCount ? [tx(el('h2'), T('Coming soon', 'Tez orada')), soon] : []))));
}

async function render() {
  const loaded = await quizzes, student = getStudent();
  app.textContent = '';
  const heading = tx(el('h1'), T('Python puzzles', 'Python boshqotirmalari'));
  app.append(student ? lessonList(student, loaded, heading) : welcome(loaded, heading));
}

// The first screen: a finished tower, what students will do, and the sign-in form.
function welcome(loaded, heading) {
  const quiz = loaded['lesson-01'], count = LESSONS.filter(l => l.quiz).length;
  const art = quiz ? tower(quiz, new Set(quiz.parts.flatMap(p => p.items.map(q => q.id)))) : cover('lesson-01');
  return el('div', { className: 'welcome' }, art, heading,
    tx(el('p', { className: 'lead' }), T(`${count} lessons. Predict, fix and write code.`,
      `${count} ta dars. Natijani taxmin qiling, kodni tuzating va yozing.`)),
    signIn());
}

render();
// Coming back with the Back button, or signing in or out in another tab.
addEventListener('pageshow', e => { if (e.persisted) render(); });
addEventListener('storage', e => { if (e.key === 'pz:student') render(); });
